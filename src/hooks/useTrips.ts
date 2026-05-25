import { useState, useEffect } from 'react';
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc,
  onSnapshot, query, where,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Trip, WishlistItem, TripPhoto } from '../types';

const genId = () => Math.random().toString(36).slice(2, 9);

// ── TRIPS ──────────────────────────────────────────────────────────────────
export function useUserTrips(uid: string) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'trips'), where('ownerId', '==', uid));
    return onSnapshot(q, snap => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Trip))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTrips(sorted);
      setLoading(false);
    });
  }, [uid]);

  return { trips, loading };
}

export async function createTrip(uid: string, email: string, displayName: string, data: Partial<Trip>): Promise<string> {
  const isPublic = (data as any).isPublicItinerary || (data as any).isPublicBudget || (data as any).isPublicPacking;
  const ref = await addDoc(collection(db, 'trips'), {
    ...data,
    ownerId: uid,
    members: [{ uid, email, displayName, role: 'owner' }],
    days: [],
    budget: [],
    expenses: [],
    isPublic: isPublic || false,
    isPublicItinerary: (data as any).isPublicItinerary ?? false,
    isPublicBudget: (data as any).isPublicBudget ?? false,
    isPublicPacking: (data as any).isPublicPacking ?? false,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateTrip(tripId: string, data: Partial<Trip>) {
  const updateData = { ...data } as any;
  // Auto-update isPublic if any section is changed to public
  if ('isPublicItinerary' in updateData || 'isPublicBudget' in updateData || 'isPublicPacking' in updateData) {
    // Get current values from the doc
    const docSnap = await getDoc(doc(db, 'trips', tripId));
    if (docSnap.exists()) {
      const current = docSnap.data();
      const newIsPublic = 
        (updateData.isPublicItinerary ?? current.isPublicItinerary) ||
        (updateData.isPublicBudget ?? current.isPublicBudget) ||
        (updateData.isPublicPacking ?? current.isPublicPacking);
      updateData.isPublic = newIsPublic;
    }
  }
  await updateDoc(doc(db, 'trips', tripId), updateData as any);
}

export async function deleteTrip(tripId: string) {
  await deleteDoc(doc(db, 'trips', tripId));
}

export function usePublicTrips(excludeUid?: string) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'trips'), where('isPublic', '==', true));
    const unsubscribe = onSnapshot(
      q,
      snap => {
        try {
          const visible = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Trip))
            .filter(t => !excludeUid || t.ownerId !== excludeUid)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTrips(visible);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing public trips:', err);
          setError('Gagal memuat rekomendasi');
          setLoading(false);
        }
      },
      err => {
        console.error('Firestore snapshot error:', err);
        setError('Permission denied - tidak bisa membaca rekomendasi');
        setTrips([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [excludeUid]);

  return { trips, loading, error };
}

// ── WISHLIST ───────────────────────────────────────────────────────────────
export function useWishlist(uid: string) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'wishlist'), where('uid', '==', uid));
    return onSnapshot(q, snap => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as WishlistItem))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(sorted);
    });
  }, [uid]);

  return items;
}

export async function addWishlist(uid: string, item: Omit<WishlistItem, 'id' | 'uid' | 'createdAt'>) {
  await addDoc(collection(db, 'wishlist'), { ...item, uid, createdAt: new Date().toISOString() });
}

export async function deleteWishlist(id: string) {
  await deleteDoc(doc(db, 'wishlist', id));
}

// ── PHOTOS ─────────────────────────────────────────────────────────────────
export function useTripPhotos(tripId: string) {
  const [photos, setPhotos] = useState<TripPhoto[]>([]);

  useEffect(() => {
    if (!tripId) return;
    const q = query(collection(db, 'photos'), where('tripId', '==', tripId));
    return onSnapshot(q, snap => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as TripPhoto))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPhotos(sorted);
    });
  }, [tripId]);

  return photos;
}

export async function uploadTripPhoto(
  tripId: string, uid: string, file: File, caption: string,
  onProgress: (p: number) => void
): Promise<void> {
  const storageRef = ref(storage, `photos/${tripId}/${Date.now()}_${file.name}`);
  const task = uploadBytesResumable(storageRef, file);
  return new Promise((resolve, reject) => {
    task.on('state_changed',
      s => onProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await addDoc(collection(db, 'photos'), { tripId, uid, url, caption, createdAt: new Date().toISOString() });
        resolve();
      }
    );
  });
}

export async function deleteTripPhoto(id: string) {
  await deleteDoc(doc(db, 'photos', id));
}

export { genId };

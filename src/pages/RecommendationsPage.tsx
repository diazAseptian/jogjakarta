import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trip } from '../types';
import ReadOnlyTripModal from '../components/ReadOnlyTripModal';

export default function RecommendationsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Trip | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'trips'), where('isPublic', '==', true));
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip));
      setTrips(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-3">Rekomendasi Trip Publik</h2>
      {loading && <p className="text-sm text-gray-500">Memuat...</p>}
      {!loading && trips.length === 0 && <p className="text-sm text-gray-400">Belum ada trip publik</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {trips.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-4 border shadow-sm flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-gray-500">{t.location}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={() => { setSelected(t); setOpen(true); }} className="px-3 py-1 rounded-xl bg-teal-500 text-white text-xs">Lihat</button>
              <p className="text-xs text-gray-500">{(t.budget || []).length} RAB · {(t.days || []).length} hari · {((t as any).packing || []).length} barang</p>
            </div>
          </div>
        ))}
      </div>

      <ReadOnlyTripModal open={open} trip={selected} onClose={() => setOpen(false)} />
    </div>
  );
}

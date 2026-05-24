import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            // Dokumen belum ada di Firestore (akun buat manual di Authentication)
            // Buat profile default sebagai user
            setProfile({
              uid: u.uid,
              email: u.email ?? '',
              displayName: u.displayName ?? u.email ?? 'User',
              role: 'user',
              createdAt: new Date().toISOString(),
              isActive: true,
            });
          }
        } catch {
          // Firestore rules blokir atau error jaringan — buat profile default
          setProfile({
            uid: u.uid,
            email: u.email ?? '',
            displayName: u.displayName ?? u.email ?? 'User',
            role: 'user',
            createdAt: new Date().toISOString(),
            isActive: true,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

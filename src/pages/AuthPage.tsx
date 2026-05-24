import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { MapPin, LogIn, UserPlus } from 'lucide-react';

type Mode = 'login' | 'register' | 'forgot';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as Mode) || 'login';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setError(''); setInfo(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email,
          displayName: name,
          role: 'user',
          createdAt: new Date().toISOString(),
          isActive: true,
        });
        navigate('/dashboard');
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        await sendPasswordResetEmail(auth, email);
        setInfo('Link reset password telah dikirim ke email kamu.');
      }
    } catch (err: any) {
      const msg: Record<string, string> = {
        'auth/email-already-in-use': 'Email sudah terdaftar.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/wrong-password': 'Password salah.',
        'auth/invalid-credential': 'Email atau password salah.',
        'auth/user-not-found': 'Akun tidak ditemukan.',
        'auth/weak-password': 'Password minimal 6 karakter.',
      };
      setError(msg[err.code] || 'Terjadi kesalahan, coba lagi.');
    }
    setLoading(false);
  };

  const switchMode = (m: Mode) => { setMode(m); reset(); setName(''); setEmail(''); setPassword(''); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

        {/* Tab Login / Daftar */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${mode === 'login' ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LogIn className="w-4 h-4" /> Login
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${mode === 'register' ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <UserPlus className="w-4 h-4" /> Daftar
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Logo */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-2">
              <div className={`p-3 rounded-2xl ${mode === 'register' ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-teal-500'}`}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-lg font-bold text-gray-800">
              {mode === 'login' ? 'Selamat Datang Kembali' : mode === 'register' ? 'Buat Akun Baru' : 'Reset Password'}
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              {mode === 'register' ? 'Daftar untuk kelola itinerary kamu' : 'Road To Jogjakarta'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Nama lengkap" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 transition-colors"
              />
            )}
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
            />
            {mode !== 'forgot' && (
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            )}

            {error && <p className="text-red-500 text-xs text-center bg-red-50 py-2 rounded-lg">{error}</p>}
            {info && <p className="text-green-600 text-xs text-center bg-green-50 py-2 rounded-lg">{info}</p>}

            <button
              type="submit" disabled={loading}
              className={`w-full text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 ${mode === 'register' ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-teal-500'}`}
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : mode === 'register' ? 'Buat Akun' : 'Kirim Link Reset'}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            {mode === 'login' && (
              <button onClick={() => switchMode('forgot')} className="text-blue-500 text-xs hover:underline">
                Lupa password?
              </button>
            )}
            {mode === 'forgot' && (
              <button onClick={() => switchMode('login')} className="text-blue-500 text-xs hover:underline">
                ← Kembali ke login
              </button>
            )}
            <button onClick={() => navigate('/')} className="text-gray-400 text-xs hover:text-gray-600 block w-full">
              ← Kembali ke beranda
            </button>
          </div>
        </div>

        {/* Info Admin */}
        {mode === 'login' && (
          <div className="mx-6 mb-6 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">🔑 Akun Admin</p>
            <p className="text-xs text-blue-600">Hubungi pengelola untuk mendapatkan akses admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

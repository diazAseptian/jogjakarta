import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, ChevronDown, ChevronUp, Save, LogOut, Check,
  LayoutDashboard, CalendarDays, Lightbulb, KeyRound, Menu, Eye, Users, Shield, ShieldOff, Activity as ActivityIcon, Globe
} from 'lucide-react';
import { saveItinerary, generateId, DayPlan, Activity, TipItem, LandingFeature } from '../data/itinerary';
import { useItinerary } from '../hooks/useItinerary';
import { storage, auth, db } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';

const emptyActivity = (): Activity => ({
  id: generateId(), name: '', time: '', duration: '', cost: '', description: '', address: '', mapsUrl: '',
});

type Tab = 'dashboard' | 'itinerary' | 'tips' | 'password' | 'users' | 'monitoring' | 'landing';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data, setData, loading } = useItinerary();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [trips, setTrips] = useState<{ id: string; name: string; location: string; startDate: string; endDate: string; ownerId: string; members: { uid: string; displayName: string }[]; createdAt: string }[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'trips'),
      snap => {
        setTotalTrips(snap.size);
        setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      },
      err => console.error('trips snapshot error:', err?.code, err?.message)
    );
    return unsub;
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  const toggleUserRole = async (u: UserProfile) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    await updateDoc(doc(db, 'users', u.uid), { role: newRole });
  };

  const toggleUserActive = async (u: UserProfile) => {
    await updateDoc(doc(db, 'users', u.uid), { isActive: !u.isActive });
  };

  const deleteUser = async (uid: string) => {
    if (!confirm('Hapus user ini?')) return;
    await deleteDoc(doc(db, 'users', uid));
  };

  const handleSave = async () => {
    await saveItinerary(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addDay = () => {
    const newDay: DayPlan = { id: generateId(), theme: '', activities: [] };
    setData(d => ({ ...d, days: [...d.days, newDay] }));
    setExpandedDay(newDay.id);
  };

  const removeDay = (dayId: string) => setData(d => ({ ...d, days: d.days.filter(day => day.id !== dayId) }));

  const updateDay = (dayId: string, field: keyof DayPlan, value: string) =>
    setData(d => ({ ...d, days: d.days.map(day => day.id === dayId ? { ...day, [field]: value } : day) }));

  const addActivity = (dayId: string) => {
    const act = emptyActivity();
    setData(d => ({ ...d, days: d.days.map(day => day.id === dayId ? { ...day, activities: [...day.activities, act] } : day) }));
    setExpandedActivity(act.id);
  };

  const removeActivity = (dayId: string, actId: string) =>
    setData(d => ({ ...d, days: d.days.map(day => day.id === dayId ? { ...day, activities: day.activities.filter(a => a.id !== actId) } : day) }));

  const updateActivity = (dayId: string, actId: string, field: keyof Activity, value: string) =>
    setData(d => ({
      ...d,
      days: d.days.map(day => day.id === dayId ? {
        ...day,
        activities: day.activities.map(a => a.id === actId ? { ...a, [field]: value } : a),
      } : day),
    }));

  const addTip = () => {
    const tip: TipItem = { id: generateId(), icon: '💡', title: '', desc: '' };
    setData(d => ({ ...d, tips: [...d.tips, tip] }));
  };

  const removeTip = (id: string) => setData(d => ({ ...d, tips: d.tips.filter(t => t.id !== id) }));

  const updateTip = (id: string, field: keyof TipItem, value: string) =>
    setData(d => ({ ...d, tips: d.tips.map(t => t.id === id ? { ...t, [field]: value } : t) }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const doUpload = (blob: Blob, filename: string) => {
      const storageRef = ref(storage, `headers/${Date.now()}_${filename}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);
      uploadTask.on('state_changed',
        (snapshot) => {
          setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        },
        () => { setUploadProgress(null); },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setData(d => ({ ...d, settings: { ...d.settings, headerImage: url } }));
          setUploadProgress(null);
        }
      );
    };

    // GIF, SVG, WEBP animasi — langsung upload tanpa kompresi
    const skipCompress = ['image/gif', 'image/svg+xml', 'image/webp'];
    if (skipCompress.includes(file.type)) {
      doUpload(file, file.name);
      return;
    }

    // JPG, PNG, dll — compress dulu via Canvas
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1280;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return;
          doUpload(blob, file.name);
        }, 'image/jpeg', 0.82);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const changePassword = async () => {
    if (!newPw || newPw.length < 4) { setPwMsg({ type: 'err', text: 'Password minimal 4 karakter' }); return; }
    if (newPw !== confirmPw) { setPwMsg({ type: 'err', text: 'Password tidak cocok' }); return; }
    const updated = { ...data, settings: { ...data.settings, adminPassword: newPw } };
    setData(updated);
    await saveItinerary(updated);
    setNewPw(''); setConfirmPw('');
    setPwMsg({ type: 'ok', text: 'Password berhasil diubah!' });
    setTimeout(() => setPwMsg(null), 3000);
  };

  const totalActivities = data.days.reduce((s, d) => s + d.activities.length, 0);

  const navItems: { tab: Tab; icon: React.ReactNode; label: string }[] = [
    { tab: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { tab: 'landing', icon: <Globe className="w-5 h-5" />, label: 'Landing Page' },
    { tab: 'itinerary', icon: <CalendarDays className="w-5 h-5" />, label: 'Trip Management' },
    { tab: 'users', icon: <Users className="w-5 h-5" />, label: 'Kelola User' },
    { tab: 'monitoring', icon: <ActivityIcon className="w-5 h-5" />, label: 'Monitoring' },
    { tab: 'tips', icon: <Lightbulb className="w-5 h-5" />, label: 'Tips' },
    { tab: 'password', icon: <KeyRound className="w-5 h-5" />, label: 'Ganti Password' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-700 to-teal-600 text-white z-30 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto`}>
        <div className="p-5 border-b border-white/20">
          <h1 className="font-bold text-lg">✨ Admin Panel</h1>
          <p className="text-blue-200 text-xs mt-0.5">Road To Jogjakarta</p>
          <p className="text-blue-200 text-xs mt-1">Halo, {profile?.displayName || user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.tab}
              onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.tab ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/20 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 transition-all"
          >
            <Eye className="w-5 h-5" /> Lihat Landing Page
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-bold text-gray-800 capitalize">
              {navItems.find(n => n.tab === activeTab)?.label}
            </h2>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            {saved ? <><Check className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> Simpan</>}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">

          {/* LANDING PAGE */}
          {activeTab === 'landing' && (() => {
            const lp = data.landing;
            const updateLp = (field: string, value: unknown) =>
              setData(d => ({ ...d, landing: { ...d.landing, [field]: value } }));
            const updateFeature = (id: string, field: keyof LandingFeature, value: string) =>
              setData(d => ({ ...d, landing: { ...d.landing, features: d.landing.features.map(f => f.id === id ? { ...f, [field]: value } : f) } }));
            const addFeature = () =>
              setData(d => ({ ...d, landing: { ...d.landing, features: [...d.landing.features, { id: generateId(), icon: '⭐', title: '', desc: '' }] } }));
            const removeFeature = (id: string) =>
              setData(d => ({ ...d, landing: { ...d.landing, features: d.landing.features.filter(f => f.id !== id) } }));
            return (
              <div className="max-w-2xl mx-auto space-y-5">
                {/* Toggle Tampilkan */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">Tampilkan Section Branding</p>
                      <p className="text-xs text-gray-400 mt-0.5">Hero, fitur, about, dan CTA di landing page</p>
                    </div>
                    <button
                      onClick={() => updateLp('showLanding', !lp.showLanding)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${lp.showLanding ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${lp.showLanding ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>

                {/* Branding */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                  <h3 className="font-bold text-gray-800">🏷️ Branding</h3>
                  {[{ label: 'Nama Brand', field: 'brandName' as const, placeholder: 'Road To Jogjakarta' },
                    { label: 'Tagline', field: 'tagline' as const, placeholder: '✨ Platform Perencanaan Wisata Terbaik' }].map(item => (
                    <div key={item.field}>
                      <label className="text-xs text-gray-500 mb-1 block">{item.label}</label>
                      <input value={lp[item.field]} onChange={e => updateLp(item.field, e.target.value)}
                        placeholder={item.placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">URL Foto Logo Navbar (opsional)</label>
                    <input value={lp.navLogo} onChange={e => updateLp('navLogo', e.target.value)}
                      placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                    {lp.navLogo && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={lp.navLogo} alt="logo preview" className="h-10 w-10 rounded-full object-cover border border-gray-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <span className="text-xs text-gray-400">Preview logo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hero */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                  <h3 className="font-bold text-gray-800">🦸 Hero Section</h3>
                  {[{ label: 'Judul Hero', field: 'heroTitle' as const, placeholder: 'Rencanakan Perjalanan Jogja Impianmu' },
                    { label: 'Subjudul Hero', field: 'heroSubtitle' as const, placeholder: 'Deskripsi singkat...' },
                    { label: 'URL Gambar Hero (opsional)', field: 'heroImage' as const, placeholder: 'https://...' }].map(item => (
                    <div key={item.field}>
                      <label className="text-xs text-gray-500 mb-1 block">{item.label}</label>
                      <input value={lp[item.field]} onChange={e => updateLp(item.field, e.target.value)}
                        placeholder={item.placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                    </div>
                  ))}
                </div>

                {/* About */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                  <h3 className="font-bold text-gray-800">ℹ️ About Section</h3>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Judul About</label>
                    <input value={lp.aboutTitle} onChange={e => updateLp('aboutTitle', e.target.value)}
                      placeholder="Tentang Road To Jogjakarta" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Deskripsi About</label>
                    <textarea value={lp.aboutDesc} onChange={e => updateLp('aboutDesc', e.target.value)}
                      rows={3} placeholder="Deskripsi tentang website..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">URL Gambar About (opsional)</label>
                    <input value={lp.aboutImage} onChange={e => updateLp('aboutImage', e.target.value)}
                      placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                  </div>
                </div>

                {/* Fitur */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">⭐ Fitur Unggulan</h3>
                    <button onClick={addFeature} className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                  </div>
                  {lp.features.map(f => (
                    <div key={f.id} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                      <input value={f.icon} onChange={e => updateFeature(f.id, 'icon', e.target.value)}
                        className="w-12 text-center text-xl border border-gray-200 rounded-lg py-1.5 outline-none focus:border-blue-400 bg-white" />
                      <div className="flex-1 space-y-1.5">
                        <input value={f.title} onChange={e => updateFeature(f.id, 'title', e.target.value)}
                          placeholder="Judul fitur" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:border-blue-400 bg-white" />
                        <input value={f.desc} onChange={e => updateFeature(f.id, 'desc', e.target.value)}
                          placeholder="Deskripsi fitur" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 bg-white" />
                      </div>
                      <button onClick={() => removeFeature(f.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                  <h3 className="font-bold text-gray-800">📣 CTA Section</h3>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Teks CTA Utama</label>
                    <input value={lp.ctaText} onChange={e => updateLp('ctaText', e.target.value)}
                      placeholder="Mulai Rencanakan Tripmu Sekarang!" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Sub Teks CTA</label>
                    <input value={lp.ctaSubText} onChange={e => updateLp('ctaSubText', e.target.value)}
                      placeholder="Gratis untuk semua pengguna..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Hari', value: data.days.length, emoji: '📅' },
                  { label: 'Total Aktivitas', value: totalActivities, emoji: '🎯' },
                  { label: 'Total Tips', value: data.tips.length, emoji: '💡' },
                  { label: 'Peserta', value: data.tripInfo.totalPeople, emoji: '👥' },
                  { label: 'Total User', value: users.length, emoji: '🧑‍💻' },
                  { label: 'Total Trip', value: totalTrips, emoji: '🗺️' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                    <div className="text-3xl mb-1">{stat.emoji}</div>
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ITINERARY - trip user */}
          {activeTab === 'itinerary' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{trips.length} trip terdaftar</p>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-xl font-medium">👁️ Mode Lihat Saja</span>
              </div>
              {trips.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
                  <p className="text-4xl mb-3">🗺️</p>
                  <p className="font-medium">Belum ada trip dari user</p>
                </div>
              )}
              {trips.map(trip => {
                const owner = users.find(u => u.uid === trip.ownerId);
                return (
                  <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl shrink-0">🗺️</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{trip.name}</p>
                        <p className="text-xs text-gray-400">📍 {trip.location}</p>
                      </div>
                      <button onClick={() => setExpandedDay(expandedDay === trip.id ? null : trip.id)} className="p-1.5 text-gray-400 hover:text-blue-500">
                        {expandedDay === trip.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    {expandedDay === trip.id && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-xs text-gray-400">Pemilik</p>
                            <p className="font-medium text-gray-700">{owner?.displayName || owner?.email || trip.ownerId}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-xs text-gray-400">Anggota</p>
                            <p className="font-medium text-gray-700">{(trip as any).memberCount ?? trip.members?.length ?? 1} orang</p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-xs text-gray-400">Tanggal Mulai</p>
                            <p className="font-medium text-gray-700">{trip.startDate || '—'}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-xs text-gray-400">Tanggal Selesai</p>
                            <p className="font-medium text-gray-700">{trip.endDate || '—'}</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Anggota</p>
                          <div className="flex flex-wrap gap-1">
                            {trip.members?.map(m => (
                              <span key={m.uid} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{m.displayName}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Dibuat: {new Date(trip.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TIPS */}
          {activeTab === 'tips' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{data.tips.length} tips terdaftar</p>
                <button onClick={addTip} className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Tambah Tips
                </button>
              </div>
              {data.tips.map(tip => (
                <div key={tip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start gap-3">
                    <input
                      value={tip.icon}
                      onChange={e => updateTip(tip.id, 'icon', e.target.value)}
                      className="w-14 text-center text-2xl border border-gray-200 rounded-lg py-1 outline-none focus:border-yellow-400"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        value={tip.title}
                        onChange={e => updateTip(tip.id, 'title', e.target.value)}
                        placeholder="Judul tips"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-yellow-400"
                      />
                      <textarea
                        value={tip.desc}
                        onChange={e => updateTip(tip.id, 'desc', e.target.value)}
                        placeholder="Deskripsi tips"
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 resize-none"
                      />
                    </div>
                    <button onClick={() => removeTip(tip.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS: removed (use Landing tab instead) */}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{users.length} user terdaftar</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Nama</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Email</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Role</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{u.displayName}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {u.role === 'admin' ? '🛡️' : '👤'} {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {u.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {u.uid !== user?.uid && (
                              <>
                                <button onClick={() => toggleUserRole(u)}
                                  title={u.role === 'admin' ? 'Jadikan User' : 'Jadikan Admin'}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                                  {u.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                </button>
                                <button onClick={() => toggleUserActive(u)}
                                  title={u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                  className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-500 transition-colors">
                                  {u.isActive ? '✅' : '❌'}
                                </button>
                                <button onClick={() => deleteUser(u.uid)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {u.uid === user?.uid && (
                              <span className="text-xs text-gray-400 italic">Anda</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MONITORING */}
          {activeTab === 'monitoring' && (() => {
            const maxAct = Math.max(...data.days.map(d => d.activities.length), 1);
            const activeUsers = users.filter(u => u.isActive).length;
            const adminCount = users.filter(u => u.role === 'admin').length;
            // Trip per bulan (6 bulan terakhir)
            const now = new Date();
            const months = Array.from({ length: 6 }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
              return { label: d.toLocaleString('id-ID', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() };
            });
            const tripPerMonth = months.map(m =>
              trips.filter(t => {
                const d = new Date(t.createdAt);
                return d.getFullYear() === m.year && d.getMonth() === m.month;
              }).length
            );
            const maxTrip = Math.max(...tripPerMonth, 1);
            return (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Grafik Aktivitas per Hari */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4">📊 Grafik Aktivitas per Hari</h3>
                  {data.days.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-6">Belum ada data itinerary</p>
                  ) : (
                    <div className="flex items-end gap-2 h-40">
                      {data.days.map((day, i) => (
                        <div key={day.id} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-blue-600">{day.activities.length}</span>
                          <div
                            className="w-full bg-blue-500 rounded-t-lg transition-all"
                            style={{ height: `${(day.activities.length / maxAct) * 120}px`, minHeight: '4px' }}
                          />
                          <span className="text-xs text-gray-400 truncate w-full text-center">H{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grafik Trip per Bulan */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4">📈 Trip Dibuat per Bulan</h3>
                  <div className="flex items-end gap-2 h-40">
                    {months.map((m, i) => (
                      <div key={m.label + m.year} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-teal-600">{tripPerMonth[i]}</span>
                        <div
                          className="w-full bg-teal-500 rounded-t-lg transition-all"
                          style={{ height: `${(tripPerMonth[i] / maxTrip) * 120}px`, minHeight: '4px' }}
                        />
                        <span className="text-xs text-gray-400">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monitoring Aplikasi */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4">🖥️ Monitoring Aplikasi</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'User Aktif', value: activeUsers, total: users.length, color: 'bg-green-500' },
                      { label: 'User Nonaktif', value: users.length - activeUsers, total: users.length, color: 'bg-red-400' },
                      { label: 'Admin', value: adminCount, total: users.length, color: 'bg-blue-500' },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{item.label}</span>
                          <span className="text-lg font-bold text-gray-800">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full transition-all`}
                            style={{ width: `${item.total ? (item.value / item.total) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{item.total ? Math.round((item.value / item.total) * 100) : 0}% dari total user</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Total Hari Itinerary</p>
                      <p className="text-2xl font-bold text-gray-800">{data.days.length}</p>
                      <p className="text-xs text-gray-400">{totalActivities} total aktivitas</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Rata-rata Aktivitas/Hari</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {data.days.length ? (totalActivities / data.days.length).toFixed(1) : '0'}
                      </p>
                      <p className="text-xs text-gray-400">dari {data.days.length} hari</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* PASSWORD */}
          {activeTab === 'password' && (
            <div className="max-w-sm mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h3 className="font-bold text-gray-800">🔑 Ganti Password Admin</h3>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Password Baru</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                {pwMsg && (
                  <p className={`text-sm text-center font-medium ${pwMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                    {pwMsg.type === 'ok' ? '✓' : '✖'} {pwMsg.text}
                  </p>
                )}
                <button onClick={changePassword} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                  Simpan Password
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}


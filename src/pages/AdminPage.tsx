import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, ChevronDown, ChevronUp, Save, LogOut, Check,
  LayoutDashboard, CalendarDays, Lightbulb, Settings, KeyRound, Menu, Eye, Upload, Link
} from 'lucide-react';
import { saveItinerary, generateId, DayPlan, Activity, TipItem } from '../data/itinerary';
import { useItinerary } from '../hooks/useItinerary';
import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const emptyActivity = (): Activity => ({
  id: generateId(), name: '', time: '', duration: '', cost: '', description: '', address: '', mapsUrl: '',
});

type Tab = 'dashboard' | 'itinerary' | 'tips' | 'settings' | 'password';

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const { data, setData, loading } = useItinerary();
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
    const ok = sessionStorage.getItem('rtj_admin');
    if (ok === '1') setAuthed(true);
  }, []);

  const login = () => {
    const currentPw = data.settings?.adminPassword || 'jogja2025';
    if (pwInput === currentPw) {
      sessionStorage.setItem('rtj_admin', '1');
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('rtj_admin');
    setAuthed(false);
    setPwInput('');
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
    { tab: 'itinerary', icon: <CalendarDays className="w-5 h-5" />, label: 'Itinerary' },
    { tab: 'tips', icon: <Lightbulb className="w-5 h-5" />, label: 'Tips' },
    { tab: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Pengaturan' },
    { tab: 'password', icon: <KeyRound className="w-5 h-5" />, label: 'Ganti Password' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">🔐 Admin Panel</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Road To Jogjakarta</p>
          <input
            type="password"
            placeholder="Masukkan password"
            value={pwInput}
            onChange={e => setPwInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none mb-3 transition-colors ${pwError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
          />
          {pwError && <p className="text-red-500 text-xs mb-3 text-center">Password salah!</p>}
          <button onClick={login} className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Masuk
          </button>
          <button onClick={() => navigate('/')} className="w-full mt-3 text-gray-400 text-sm hover:text-gray-600 transition-colors">
            ← Kembali ke halaman utama
          </button>
        </div>
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
          <h1 className="font-bold text-lg">⚙️ Admin Panel</h1>
          <p className="text-blue-200 text-xs mt-0.5">Road To Jogjakarta</p>
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
            onClick={() => { handleSave(); navigate('/'); }}
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

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Hari', value: data.days.length, emoji: '📅' },
                  { label: 'Total Aktivitas', value: totalActivities, emoji: '🎯' },
                  { label: 'Total Tips', value: data.tips.length, emoji: '💡' },
                  { label: 'Peserta', value: data.tripInfo.totalPeople, emoji: '👥' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                    <div className="text-3xl mb-1">{stat.emoji}</div>
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Trip Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4">📋 Info Trip</h3>
                <div className="space-y-3">
                  {([
                    { key: 'title', label: 'Judul' },
                    { key: 'subtitle', label: 'Subjudul' },
                    { key: 'totalPeople', label: 'Jumlah Orang' },
                    { key: 'estimateBudget', label: 'Estimasi Budget' },
                    { key: 'startDate', label: 'Tanggal Mulai' },
                  ] as { key: keyof typeof data.tripInfo; label: string }[]).map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                      <input
                        value={data.tripInfo[f.key]}
                        onChange={e => setData(d => ({ ...d, tripInfo: { ...d.tripInfo, [f.key]: e.target.value } }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ITINERARY */}
          {activeTab === 'itinerary' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{data.days.length} hari terdaftar</p>
                <button onClick={addDay} className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Tambah Hari
                </button>
              </div>

              {data.days.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="font-medium">Belum ada hari</p>
                </div>
              )}

              {data.days.map((day, dayIdx) => (
                <div key={day.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className="bg-blue-100 text-blue-700 rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm shrink-0">
                      {dayIdx + 1}
                    </div>
                    <input
                      value={day.theme}
                      onChange={e => updateDay(day.id, 'theme', e.target.value)}
                      placeholder="Tema hari ini"
                      className="flex-1 text-sm font-semibold text-gray-800 outline-none border-b border-transparent focus:border-blue-300 py-1"
                    />
                    <button onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)} className="p-1.5 text-gray-400 hover:text-blue-500">
                      {expandedDay === day.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => removeDay(day.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {expandedDay === day.id && (
                    <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                      {day.activities.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Belum ada aktivitas</p>}
                      {day.activities.map((act, actIdx) => (
                        <div key={act.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                          <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpandedActivity(expandedActivity === act.id ? null : act.id)}>
                            <span className="text-xs font-bold text-gray-400 w-5 text-center">{actIdx + 1}</span>
                            <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                              {act.name || <span className="text-gray-400 italic">Aktivitas baru</span>}
                            </span>
                            <span className="text-xs text-gray-400">{act.time}</span>
                            <button onClick={e => { e.stopPropagation(); removeActivity(day.id, act.id); }} className="p-1 text-gray-300 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {expandedActivity === act.id ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                          </div>
                          {expandedActivity === act.id && (
                            <div className="border-t border-gray-100 p-3 grid grid-cols-2 gap-3">
                              {([
                                { key: 'name', label: 'Nama Aktivitas', col: 2 },
                                { key: 'time', label: 'Jam', col: 1 },
                                { key: 'duration', label: 'Durasi', col: 1 },
                                { key: 'cost', label: 'Biaya', col: 2 },
                                { key: 'address', label: 'Alamat', col: 2 },
                                { key: 'mapsUrl', label: 'Link Google Maps', col: 2 },
                                { key: 'description', label: 'Deskripsi', col: 2, textarea: true },
                              ] as { key: keyof Activity; label: string; col: number; textarea?: boolean }[]).map(f => (
                                <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                                  {f.textarea ? (
                                    <textarea value={act[f.key]} onChange={e => updateActivity(day.id, act.id, f.key, e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
                                  ) : (
                                    <input value={act[f.key]} onChange={e => updateActivity(day.id, act.id, f.key, e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addActivity(day.id)} className="w-full flex items-center justify-center gap-2 border border-dashed border-blue-300 text-blue-500 hover:bg-blue-50 rounded-xl py-2.5 text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Tambah Aktivitas
                      </button>
                    </div>
                  )}
                </div>
              ))}
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

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h3 className="font-bold text-gray-800">🎨 Tampilan Situs</h3>

                {/* Header Image */}
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Foto Background Header</label>

                  {/* Toggle URL / Upload */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setUploadMode('url')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        uploadMode === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Link className="w-3.5 h-3.5" /> Pakai URL
                    </button>
                    <button
                      onClick={() => setUploadMode('file')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        uploadMode === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload dari Perangkat
                    </button>
                  </div>

                  {uploadMode === 'url' ? (
                    <input
                      value={data.settings.headerImage}
                      onChange={e => setData(d => ({ ...d, settings: { ...d.settings, headerImage: e.target.value } }))}
                      placeholder="https://contoh.com/foto.jpg"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                  ) : (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,image/gif,image/webp,image/avif,image/svg+xml"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadProgress !== null}
                        className="w-full border-2 border-dashed border-blue-300 rounded-lg py-6 flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-6 h-6 text-blue-400" />
                        <span className="text-sm text-blue-500 font-medium">Klik untuk pilih foto</span>
                        <span className="text-xs text-gray-400">JPG, PNG, GIF, WEBP, AVIF, SVG, BMP, TIFF</span>
                      </button>
                      {uploadProgress !== null && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Mengupload...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {data.settings.headerImage && (
                    <div className="mt-3 rounded-xl overflow-hidden h-36 relative">
                      <img
                        src={data.settings.headerImage}
                        alt="Preview header"
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <button
                        onClick={() => setData(d => ({ ...d, settings: { ...d.settings, headerImage: '' } }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ✕
                      </button>
                      <span className="absolute bottom-2 left-2 text-white text-xs bg-black/40 px-2 py-0.5 rounded-full">Preview</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Teks Footer Utama</label>
                  <input
                    value={data.settings.footerText}
                    onChange={e => setData(d => ({ ...d, settings: { ...d.settings, footerText: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Teks Footer Sub</label>
                  <input
                    value={data.settings.footerSub}
                    onChange={e => setData(d => ({ ...d, settings: { ...d.settings, footerSub: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tampilkan Tips</p>
                    <p className="text-xs text-gray-400">Tampilkan section tips di landing page</p>
                  </div>
                  <button
                    onClick={() => setData(d => ({ ...d, settings: { ...d.settings, showTips: !d.settings.showTips } }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${data.settings.showTips ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.settings.showTips ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    {pwMsg.type === 'ok' ? '✅' : '❌'} {pwMsg.text}
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

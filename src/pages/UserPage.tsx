import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, LayoutDashboard, MapPin, Wallet, ChevronDown, ChevronUp, CalendarDays, ShoppingBag, Sparkles } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useUserTrips, usePublicTrips, createTrip, updateTrip, deleteTrip } from '../hooks/useTrips';
import DashboardTab from './user/DashboardTab';
import TripFormModal from './user/TripFormModal';
import BudgetTab from './user/BudgetTab';
import ItineraryTab from './user/ItineraryTab';
import PackingTab from './user/PackingTab';
import ReadOnlyTripModal from '../components/ReadOnlyTripModal';
import { Trip } from '../types';

type Tab = 'dashboard' | 'trips' | 'recommendations' | 'itinerary' | 'budget' | 'packing';
type TripSubTab = 'detail' | 'itinerary' | 'budget' | 'packing';

export default function UserPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { trips, loading } = useUserTrips(user?.uid ?? '');
  const { trips: publicTrips, loading: publicLoading, error: publicError } = usePublicTrips(user?.uid ?? '');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedPublicTrip, setSelectedPublicTrip] = useState<Trip | null>(null);
  const [publicModalOpen, setPublicModalOpen] = useState(false);
  const [tripSubTab, setTripSubTab] = useState<TripSubTab>('detail');

  const logout = async () => { await signOut(auth); navigate('/auth'); };

  const handleCreate = async (data: Partial<Trip>) => {
    if (!user || !profile) return;
    try {
      await createTrip(user.uid, user.email ?? '', profile.displayName, data);
      setShowForm(false);
    } catch (err: any) {
      console.error('createTrip error:', err?.code, err?.message);
      alert('Gagal membuat trip: ' + (err?.message ?? err));
    }
  };

  const handleUpdate = async (data: Partial<Trip>) => {
    if (!editTrip) return;
    await updateTrip(editTrip.id, data);
    setEditTrip(null);
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('Hapus trip ini?')) return;
    await deleteTrip(tripId);
    if (selectedTrip?.id === tripId) setSelectedTrip(null);
  };

  const selectTrip = (trip: Trip) => {
    setSelectedTrip(selectedTrip?.id === trip.id ? null : trip);
    setTripSubTab('detail');
  };

  const navItems: { tab: Tab; icon: React.ReactNode; label: string }[] = [
    { tab: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { tab: 'trips', icon: <MapPin className="w-5 h-5" />, label: 'Trip Saya' },
    { tab: 'recommendations', icon: <Sparkles className="w-5 h-5" />, label: 'Rekomendasi' },
    { tab: 'itinerary', icon: <CalendarDays className="w-5 h-5" />, label: 'Itinerary' },
    { tab: 'budget', icon: <Wallet className="w-5 h-5" />, label: 'Budget' },
    { tab: 'packing', icon: <ShoppingBag className="w-5 h-5" />, label: 'Packing List' },
  ];

  const SUB_TABS: { key: TripSubTab; label: string }[] = [
    { key: 'detail', label: '📋 Detail' },
    { key: 'itinerary', label: '📅 Itinerary' },
    { key: 'budget', label: '💰 Budget' },
    { key: 'packing', label: '🎒 Packing' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TripCard = ({ trip }: { trip: Trip }) => {
    const isOpen = selectedTrip?.id === trip.id;
    // Sync live data dari trips array (bukan selectedTrip yang stale)
    const liveTrip = trips.find(t => t.id === trip.id) ?? trip;
    return (
      <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${isOpen ? 'border-teal-300' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50" onClick={() => selectTrip(trip)}>
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-xl shrink-0">🗺️</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 truncate">{trip.name}</p>
            <p className="text-xs text-gray-400">📍 {trip.location} · {trip.startDate || '—'}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={e => { e.stopPropagation(); setEditTrip(trip); }}
              className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-teal-50 text-gray-600 hover:text-teal-600 transition-colors">
              Edit
            </button>
            <button onClick={e => { e.stopPropagation(); handleDelete(trip.id); }}
              className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors">
              Hapus
            </button>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
        </div>

        {isOpen && (
          <div className="border-t border-gray-100">
            {/* Sub tabs */}
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {SUB_TABS.map(t => (
                <button key={t.key} onClick={() => setTripSubTab(t.key)}
                  className={`shrink-0 flex-1 py-2.5 px-2 text-xs font-semibold transition-all whitespace-nowrap ${tripSubTab === t.key ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-gray-50">
              {tripSubTab === 'detail' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Tanggal Mulai', value: liveTrip.startDate || '—' },
                      { label: 'Tanggal Selesai', value: liveTrip.endDate || '—' },
                      { label: 'Anggota', value: `${liveTrip.memberCount ?? liveTrip.members?.length ?? 1} orang` },
                      { label: 'Total RAB', value: `Rp ${liveTrip.budget?.reduce((s, b) => s + b.amount, 0).toLocaleString('id') || '0'}` },
                    ].map(item => (
                      <div key={item.label} className="bg-white rounded-xl p-3">
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="font-medium text-gray-700 mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${liveTrip.isPublicItinerary ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{liveTrip.isPublicItinerary ? 'Itinerary Publik' : 'Itinerary Private'}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${liveTrip.isPublicBudget ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{liveTrip.isPublicBudget ? 'Budget Publik' : 'Budget Private'}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${liveTrip.isPublicPacking ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{liveTrip.isPublicPacking ? 'Packing Publik' : 'Packing Private'}</span>
                  </div>
                  {liveTrip.description && (
                    <div className="bg-white rounded-xl p-3 text-sm text-gray-600">{liveTrip.description}</div>
                  )}
                </div>
              )}
              {tripSubTab === 'itinerary' && <ItineraryTab trip={liveTrip} />}
              {tripSubTab === 'budget' && <BudgetTab trip={liveTrip} />}
              {tripSubTab === 'packing' && <PackingTab trip={liveTrip} />}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-teal-600 to-blue-600 text-white z-30 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto`}>
        <div className="p-5 border-b border-white/20">
          <h1 className="font-bold text-lg">🗺️ Trip Planner</h1>
          <p className="text-teal-200 text-xs mt-0.5">Road To Jogjakarta</p>
          <p className="text-teal-200 text-xs mt-1">Halo, {profile?.displayName || user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button key={item.tab}
              onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.tab ? 'bg-white/20 text-white' : 'text-teal-100 hover:bg-white/10'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/20">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-teal-100 hover:bg-white/10 transition-all">
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-800">{navItems.find(n => n.tab === activeTab)?.label}</h2>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-3xl mx-auto">
              <DashboardTab
                trips={trips}
                onSelectTrip={t => { setSelectedTrip(t); setActiveTab('trips'); setTripSubTab('detail'); }}
                onCreateTrip={() => setShowForm(true)}
              />
            </div>
          )}

          {/* TRIPS */}
          {activeTab === 'trips' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{trips.length} trip</p>
                <button onClick={() => setShowForm(true)}
                  className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors">
                  + Buat Trip
                </button>
              </div>
              {trips.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
                  <p className="text-4xl mb-3">✈️</p>
                  <p className="font-medium">Belum ada trip</p>
                  <button onClick={() => setShowForm(true)} className="mt-3 text-teal-500 text-sm font-medium hover:underline">
                    Buat trip pertamamu →
                  </button>
                </div>
              ) : (
                trips.map(trip => <TripCard key={trip.id} trip={trip} />)
              )}
            </div>
          )}

          {/* RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Trip publik dari user lain</p>
                <span className="text-xs text-gray-400">{publicLoading ? 'Memuat...' : `${publicTrips.length} rekomendasi`}</span>
              </div>

              {publicLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                  <div className="w-10 h-10 mx-auto border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <p className="mt-4">Memuat rekomendasi...</p>
                </div>
              ) : publicError ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
                  ⚠️ {publicError}
                </div>
              ) : publicTrips.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
                  <p className="text-4xl mb-3">✨</p>
                  <p className="font-medium">Belum ada trip publik dari user lain</p>
                  <p className="text-sm text-gray-500 mt-2">Minta temanmu untuk bagikan itinerary, budget, atau packing publik.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {publicTrips.map(trip => (
                    <div key={trip.id} className="bg-white rounded-2xl p-4 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">{trip.name}</p>
                        <p className="text-xs text-gray-500">{trip.location}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {trip.isPublicItinerary && <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Itinerary Publik</span>}
                          {trip.isPublicBudget && <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Budget Publik</span>}
                          {trip.isPublicPacking && <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Packing Publik</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => { setSelectedPublicTrip(trip); setPublicModalOpen(true); }}
                          className="px-3 py-1 rounded-xl bg-teal-500 text-white text-xs font-semibold">
                          Lihat
                        </button>
                        <p className="text-xs text-gray-500">{(trip.budget || []).length} RAB · {(trip.days || []).length} hari · {((trip as any).packing || []).length} barang</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ITINERARY */}
          {activeTab === 'itinerary' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {trips.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="text-sm">Buat trip dulu untuk mengelola itinerary</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Pilih trip untuk kelola itinerary:</p>
                  {trips.map(trip => {
                    const isOpen = selectedTrip?.id === trip.id;
                    return (
                      <div key={trip.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${isOpen ? 'border-teal-300' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedTrip(isOpen ? null : trip)}>
                          <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center text-lg shrink-0">🗺️</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 truncate">{trip.name}</p>
                            <p className="text-xs text-gray-400">📍 {trip.location} · {trip.days?.length ?? 0} hari</p>
                          </div>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                        </div>
                        {isOpen && (
                          <div className="border-t border-gray-100 p-4 bg-gray-50">
                            <ItineraryTab trip={trip} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* PACKING */}
          {activeTab === 'packing' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {trips.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">🎒</p>
                  <p className="text-sm">Buat trip dulu untuk mengelola packing list</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Pilih trip untuk kelola packing list:</p>
                  {trips.map(trip => {
                    const isOpen = selectedTrip?.id === trip.id;
                    const packingItems = (trip as any).packing ?? [];
                    const doneCount = packingItems.filter((i: any) => i.done).length;
                    return (
                      <div key={trip.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${isOpen ? 'border-teal-300' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedTrip(isOpen ? null : trip)}>
                          <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center text-lg shrink-0">🎒</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 truncate">{trip.name}</p>
                            <p className="text-xs text-gray-400">📍 {trip.location}</p>
                          </div>
                          <span className="text-xs font-medium text-teal-600 shrink-0">{doneCount}/{packingItems.length} packed</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                        </div>
                        {isOpen && (
                          <div className="border-t border-gray-100 p-4 bg-gray-50">
                            <PackingTab trip={trip} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* BUDGET */}
          {activeTab === 'budget' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {trips.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">💰</p>
                  <p className="text-sm">Buat trip dulu untuk mengelola budget</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Pilih trip untuk kelola budget:</p>
                  {trips.map(trip => {
                    const isOpen = selectedTrip?.id === trip.id;
                    return (
                      <div key={trip.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${isOpen ? 'border-teal-300' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedTrip(isOpen ? null : trip)}>
                          <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center text-lg shrink-0">🗺️</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 truncate">{trip.name}</p>
                            <p className="text-xs text-gray-400">📍 {trip.location}</p>
                          </div>
                          <div className="text-right shrink-0 mr-1">
                            <p className="text-xs font-semibold text-teal-600">RAB: Rp {trip.budget?.reduce((s, b) => s + b.amount, 0).toLocaleString('id') || '0'}</p>
                            <p className="text-xs text-orange-500">Keluar: Rp {trip.expenses?.reduce((s, e) => s + e.amount, 0).toLocaleString('id') || '0'}</p>
                          </div>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                        </div>
                        {isOpen && (
                          <div className="border-t border-gray-100 p-4 bg-gray-50">
                            <BudgetTab trip={trip} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

        </main>
      </div>

      {(showForm || editTrip) && (
        <TripFormModal
          initial={editTrip ?? undefined}
          onClose={() => { setShowForm(false); setEditTrip(null); }}
          onSave={editTrip ? handleUpdate : handleCreate}
        />
      )}

      {publicModalOpen && selectedPublicTrip && (
        <ReadOnlyTripModal trip={selectedPublicTrip} onClose={() => { setPublicModalOpen(false); setSelectedPublicTrip(null); }} />
      )}
    </div>
  );
}

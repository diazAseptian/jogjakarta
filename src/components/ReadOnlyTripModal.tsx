import React, { useState } from 'react';
import { Trip } from '../types';
import { X, MapPin, Calendar, Users, Clock, Banknote, Package, Map } from 'lucide-react';

interface Props { trip?: Trip | null; onClose: () => void; }

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-blue-100 text-blue-700',
  hotel: 'bg-purple-100 text-purple-700',
  tiket: 'bg-orange-100 text-orange-700',
  makan: 'bg-yellow-100 text-yellow-700',
  darurat: 'bg-red-100 text-red-700',
  lainnya: 'bg-gray-100 text-gray-600',
};

export default function ReadOnlyTripModal({ trip, onClose }: Props) {
  const [tab, setTab] = useState<'itinerary' | 'budget' | 'packing'>('itinerary');

  const showItinerary = !!trip?.isPublicItinerary;
  const showBudget    = !!trip?.isPublicBudget;
  const showPacking   = !!trip?.isPublicPacking;

  React.useEffect(() => {
    if (!trip) return;
    if (showItinerary) setTab('itinerary');
    else if (showBudget) setTab('budget');
    else setTab('packing');
  }, [trip?.id]);

  if (!trip) return null;

  const packingItems = (trip as any).packing ?? [];
  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
  const totalBudget = (trip.budget || []).reduce((s, b) => s + b.amount, 0);

  const tabs = [
    showItinerary && { key: 'itinerary' as const, label: 'Itinerary', icon: Map,      count: (trip.days || []).length },
    showBudget    && { key: 'budget'    as const, label: 'Budget',    icon: Banknote,  count: (trip.budget || []).length },
    showPacking   && { key: 'packing'   as const, label: 'Packing',   icon: Package,   count: packingItems.length },
  ].filter(Boolean) as { key: 'itinerary' | 'budget' | 'packing'; label: string; icon: any; count: number }[];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:w-[95%] sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-800 truncate">{trip.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{trip.location}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors shrink-0">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
            {trip.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {fmt(trip.startDate)}{trip.endDate ? ` – ${fmt(trip.endDate)}` : ''}
              </span>
            )}
            {trip.memberCount > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {trip.memberCount} orang
              </span>
            )}
            {(trip.days || []).length > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {trip.days.length} hari
              </span>
            )}
          </div>

          {trip.description && (
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{trip.description}</p>
          )}
        </div>

        {/* Tabs — hanya tampil jika ada minimal 1 tab */}
        {tabs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-sm font-medium text-gray-500">Semua konten disembunyikan</p>
            <p className="text-xs text-gray-400 mt-1">Pemilik tidak membagikan bagian apapun</p>
          </div>
        ) : (
          <>
            <div className="flex border-b border-gray-100 px-5">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors mr-1 ${
                    tab === t.key
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  {t.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-5">

              {/* ITINERARY */}
              {tab === 'itinerary' && (
                trip.days?.length ? (
                  <div className="space-y-3">
                    {trip.days.map(d => (
                      <div key={d.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                          <span className="text-sm font-semibold text-gray-700">Hari {d.day}</span>
                          {d.date && <span className="text-xs text-gray-400">{fmt(d.date)}</span>}
                        </div>
                        {d.activities.length ? (
                          <div className="divide-y divide-gray-50">
                            {d.activities.map((a, i) => (
                              <div key={a.id} className="px-4 py-3 flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                                    {i + 1}
                                  </div>
                                  {i < d.activities.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                                </div>
                                <div className="min-w-0 pb-1">
                                  <p className="text-sm font-medium text-gray-800">{a.place}</p>
                                  <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-gray-400">
                                    {a.time && <span>{a.time}</span>}
                                    {a.transport && <span>· {a.transport}</span>}
                                  </div>
                                  {a.notes && <p className="text-xs text-gray-500 mt-1">{a.notes}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="px-4 py-3 text-xs text-gray-400">Tidak ada aktivitas</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="🗓️" text="Belum ada itinerary" />
                )
              )}

              {/* BUDGET */}
              {tab === 'budget' && (
                trip.budget?.length ? (
                  <div className="space-y-2">
                    <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 flex justify-between items-center mb-4">
                      <span className="text-sm text-teal-700 font-medium">Total Anggaran</span>
                      <span className="text-base font-bold text-teal-700">Rp {totalBudget.toLocaleString('id')}</span>
                    </div>
                    {trip.budget.map(b => (
                      <div key={b.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{b.label}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[b.category] ?? CATEGORY_COLORS.lainnya}`}>
                              {b.category}
                            </span>
                            {b.source && <span className="text-xs text-gray-400">{b.source}</span>}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 shrink-0 ml-3">
                          Rp {b.amount.toLocaleString('id')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="💰" text="Belum ada anggaran" />
                )
              )}

              {/* PACKING */}
              {tab === 'packing' && (
                packingItems.length ? (
                  <div className="grid grid-cols-2 gap-2">
                    {packingItems.map((p: any) => (
                      <div key={p.id} className="border border-gray-100 rounded-xl p-3 bg-white">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          {p.qty && <span className="text-xs text-gray-400">x{p.qty}</span>}
                          {p.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{p.category}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="🎒" text="Belum ada packing list" />
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

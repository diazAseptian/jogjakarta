import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trip } from '../types';
import ReadOnlyTripModal from '../components/ReadOnlyTripModal';
import { MapPin, Calendar, Users, Eye } from 'lucide-react';

export default function RecommendationsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Trip | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'trips'), where('isPublic', '==', true));
    return onSnapshot(
      q,
      snap => {
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Trip))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTrips(data);
        setError(null);
        setLoading(false);
      },
      err => {
        console.error('Firestore error:', err);
        setError('Tidak bisa memuat rekomendasi.');
        setLoading(false);
      }
    );
  }, []);

  const badges = (t: Trip) => [
    { label: t.isPublicItinerary ? 'Itinerary Publik' : 'Itinerary Private', color: t.isPublicItinerary ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400' },
    { label: t.isPublicBudget ? 'Budget Publik' : 'Budget Private', color: t.isPublicBudget ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400' },
    { label: t.isPublicPacking ? 'Packing Publik' : 'Packing Private', color: t.isPublicPacking ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Rekomendasi Trip</h2>
        <p className="text-sm text-gray-500 mt-1">Trip publik dari komunitas</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm">Belum ada trip publik</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trips.map(t => {
          const bs = badges(t);
          const dayCount = (t.days || []).length;
          const fmt = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Header strip */}
              <div className="h-1.5 bg-gradient-to-r from-teal-400 to-blue-400" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{t.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{t.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(t)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium rounded-xl transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Lihat
                  </button>
                </div>

                {t.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{t.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                  {fmt(t.startDate) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {fmt(t.startDate)}
                    </span>
                  )}
                  {t.memberCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {t.memberCount} orang
                    </span>
                  )}
                  {dayCount > 0 && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">{dayCount} hari</span>
                  )}
                </div>

                                <div className="flex flex-wrap gap-1.5 mt-3">
                    {bs.map(b => (
                      <span key={b.label} className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.color}`}>
                        {b.label}
                      </span>
                    ))}
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      <ReadOnlyTripModal trip={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

import React from 'react';
import { Trip } from '../../types';
import { MapPin, Wallet, Clock } from 'lucide-react';

interface Props {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onCreateTrip: () => void;
}

function getCountdown(dateStr: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  return Math.floor(diff / 86400000);
}

export default function DashboardTab({ trips, onSelectTrip, onCreateTrip }: Props) {
  const totalBudget = trips.reduce((s, t) => s + (t.budget ?? []).reduce((b, i) => b + i.amount, 0), 0);
  const totalExpenses = trips.reduce((s, t) => s + (t.expenses ?? []).reduce((e, i) => e + i.amount, 0), 0);
  const totalIncome = trips.reduce((s, t) => s + ((t as any).incomeItems ?? []).reduce((a: number, i: any) => a + i.amount, 0), 0);
  const upcoming = trips.filter(t => t.startDate && new Date(t.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const nextTrip = upcoming[0];
  const countdown = nextTrip ? getCountdown(nextTrip.startDate) : null;
  const totalDays = trips.reduce((s, t) => s + (t.days ?? []).length, 0);
  const saldo = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Stats 3x2 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Trip', value: trips.length, icon: '🗺️' },
          { label: 'Total Hari', value: totalDays, icon: '📅' },
          { label: 'Trip Mendatang', value: upcoming.length, icon: '✈️' },
          { label: 'Total RAB', value: `Rp ${totalBudget.toLocaleString('id')}`, icon: '💰' },
          { label: 'Pengeluaran', value: `Rp ${totalExpenses.toLocaleString('id')}`, icon: '🧾' },
          { label: 'Saldo', value: `Rp ${saldo.toLocaleString('id')}`, icon: saldo >= 0 ? '✅' : '⚠️' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="font-bold text-gray-800 text-xs sm:text-sm truncate">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Countdown */}
      {nextTrip && countdown !== null && (
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium opacity-90">Trip Berikutnya</span>
          </div>
          <h3 className="text-xl font-bold">{nextTrip.name}</h3>
          <p className="text-teal-100 text-sm flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" /> {nextTrip.location}
          </p>
          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2 inline-block">
            <span className="text-3xl font-bold">{countdown}</span>
            <span className="text-sm ml-1 opacity-90">hari lagi</span>
          </div>
        </div>
      )}

      {/* Trip List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Trip Saya</h3>
        </div>
        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
            <p className="text-4xl mb-2">✈️</p>
            <p className="font-medium text-sm">Belum ada trip</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map(trip => (
              <button key={trip.id} onClick={() => onSelectTrip(trip)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:border-teal-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-xl shrink-0">🗺️</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{trip.name}</h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {trip.location}
                      {trip.startDate && <span className="ml-1">· {trip.startDate}</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-teal-600">
                      Rp {(trip.budget ?? []).reduce((s, b) => s + b.amount, 0).toLocaleString('id')}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                      <Wallet className="w-3 h-3" /> RAB
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

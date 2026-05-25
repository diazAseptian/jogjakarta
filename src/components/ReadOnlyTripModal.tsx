import React from 'react';
import { Trip } from '../types';
import { X } from 'lucide-react';

interface Props { open: boolean; trip?: Trip | null; onClose: () => void; }

export default function ReadOnlyTripModal({ open, trip, onClose }: Props) {
  if (!open || !trip) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-[95%] max-w-4xl rounded-2xl shadow-lg overflow-auto max-h-[80vh] p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{trip.name}</h3>
            <p className="text-sm text-gray-500">{trip.location}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>

        <section className="mt-4 space-y-3">
          <h4 className="text-sm font-semibold">Itinerary</h4>
          {trip.days?.length ? trip.days.map(d => (
            <div key={d.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between text-xs text-gray-500"><div>Hari {d.day}</div><div>{d.date}</div></div>
              <div className="mt-2 space-y-2">
                {d.activities.map(a => (
                  <div key={a.id} className="text-sm">
                    <div className="font-medium">{a.place} <span className="text-xs text-gray-400">{a.time} {a.transport ? `· ${a.transport}` : ''}</span></div>
                    {a.notes && <div className="text-xs text-gray-500">{a.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )) : <p className="text-xs text-gray-400">Tidak ada itinerary</p>}
        </section>

        <section className="mt-4 space-y-3">
          <h4 className="text-sm font-semibold">Budget (RAB)</h4>
          {trip.budget?.length ? (
            <div className="space-y-2">
              {trip.budget.map(b => (
                <div key={b.id} className="flex justify-between text-sm bg-white border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{b.label}</div>
                    <div className="text-xs text-gray-400">{b.source ?? ''}</div>
                  </div>
                  <div className="text-sm font-semibold">Rp {b.amount.toLocaleString('id')}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-gray-400">Tidak ada anggaran</p>}
        </section>

        <section className="mt-4 space-y-3">
          <h4 className="text-sm font-semibold">Packing</h4>
          {((trip as any).packing ?? []).length ? (
            <div className="grid grid-cols-2 gap-2">
              {((trip as any).packing ?? []).map((p: any) => (
                <div key={p.id} className="border rounded-lg p-2 text-sm flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    {p.qty && <div className="text-xs text-gray-400">{p.qty}</div>}
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600`}>{p.category}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-gray-400">Tidak ada packing list</p>}
        </section>
      </div>
    </div>
  );
}

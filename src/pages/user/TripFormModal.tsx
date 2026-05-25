import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Trip } from '../../types';

interface Props {
  onClose: () => void;
  onSave: (data: Partial<Trip>) => void;
  initial?: Partial<Trip>;
}

export default function TripFormModal({ onClose, onSave, initial }: Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    location: initial?.location ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    memberCount: initial?.memberCount ?? 1,
    description: initial?.description ?? '',
    isPublicItinerary: initial?.isPublicItinerary ?? false,
    isPublicBudget: initial?.isPublicBudget ?? false,
    isPublicPacking: initial?.isPublicPacking ?? false,
  });

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (form.name && form.location) {
      const dataToSave = {
        ...form,
        isPublic: (form as any).isPublicItinerary || (form as any).isPublicBudget || (form as any).isPublicPacking,
      };
      onSave(dataToSave);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">{initial ? 'Edit Trip' : 'Buat Trip Baru'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          {[
            { key: 'name', label: 'Nama Trip', placeholder: 'Contoh: Liburan Jogja 2025' },
            { key: 'location', label: 'Lokasi', placeholder: 'Contoh: Yogyakarta' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tanggal Mulai</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tanggal Selesai</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Jumlah Anggota</label>
            <input type="number" min={1} value={form.memberCount} onChange={e => set('memberCount', +e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Deskripsi</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Ceritakan sedikit tentang trip ini..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none" />
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Privasi Bagian Trip</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'isPublicItinerary', label: 'Itinerary publik' },
                { key: 'isPublicBudget', label: 'Budget publik' },
                { key: 'isPublicPacking', label: 'Packing publik' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={(form as any)[item.key]}
                    onChange={e => set(item.key, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 pt-0 flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm hover:bg-gray-50">
            Batal
          </button>
          <button onClick={handleSave}
            disabled={!form.name || !form.location}
            className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {initial ? 'Simpan' : 'Buat Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}

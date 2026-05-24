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
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

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
        </div>
        <div className="p-5 pt-0 flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
            Batal
          </button>
          <button onClick={() => { if (form.name && form.location) onSave(form); }}
            disabled={!form.name || !form.location}
            className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {initial ? 'Simpan' : 'Buat Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { updateTrip } from '../../hooks/useTrips';
import { Trip } from '../../types';
import ConfirmModal from '../../components/ConfirmModal';

const genId = () => Math.random().toString(36).slice(2, 9);

interface PackingItem {
  id: string;
  name: string;
  category: string;
  done: boolean;
  qty: string;
}

const PACKING_CATEGORIES = [
  { value: 'dokumen', label: 'Dokumen', emoji: '📄' },
  { value: 'pakaian', label: 'Pakaian', emoji: '👕' },
  { value: 'elektronik', label: 'Elektronik', emoji: '🔌' },
  { value: 'obat', label: 'Obat-obatan', emoji: '💊' },
  { value: 'toiletries', label: 'Toiletries', emoji: '🧴' },
  { value: 'makanan', label: 'Makanan & Minuman', emoji: '🍱' },
  { value: 'lainnya', label: 'Lainnya', emoji: '🎒' },
];

interface Props { trip: Trip; }

export default function PackingTab({ trip }: Props) {
  const items: PackingItem[] = (trip as any).packing ?? [];
  const [form, setForm] = useState({ name: '', category: 'pakaian', qty: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: 'pakaian', qty: '' });
  const [filter, setFilter] = useState<string>('semua');

  const save = (newItems: PackingItem[]) => updateTrip(trip.id, { packing: newItems } as any);

  const addItem = () => {
    if (!form.name.trim()) return;
    const item: PackingItem = { id: genId(), name: form.name.trim(), category: form.category, qty: form.qty, done: false };
    save([...items, item]);
    setForm({ name: '', category: 'pakaian', qty: '' });
    setShowForm(false);
  };

  const startEdit = (it: PackingItem) => {
    setEditingId(it.id);
    setEditForm({ name: it.name, category: it.category, qty: it.qty });
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!editForm.name.trim()) return;
    save(items.map(i => i.id === editingId ? { ...i, name: editForm.name.trim(), category: editForm.category, qty: editForm.qty } : i));
    setEditingId(null);
    setEditForm({ name: '', category: 'pakaian', qty: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', category: 'pakaian', qty: '' });
  };

  const toggle = (id: string) => save(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id: string) => {
    setConfirm({ open: true, title: 'Hapus Barang', message: 'Yakin ingin menghapus barang ini?', onConfirm: () => { save(items.filter(i => i.id !== id)); setConfirm(s => ({ ...s, open: false })); } });
  };

  const [confirm, setConfirm] = useState<{ open: boolean; title?: string; message: string; onConfirm?: () => void }>({ open: false, message: '' });
  const resetAll = () => save(items.map(i => ({ ...i, done: false })));

  const doneCount = items.filter(i => i.done).length;
  const filtered = filter === 'semua' ? items : items.filter(i => i.category === filter);

  const grouped = PACKING_CATEGORIES.map(cat => ({
    ...cat,
    items: filtered.filter(i => i.category === cat.value),
  })).filter(g => g.items.length > 0);

  return (
    <>
      <div className="space-y-3">
      {/* Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">🎒 Progress Packing</p>
          <span className="text-sm font-bold text-teal-600">{doneCount}/{items.length}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${doneCount === items.length && items.length > 0 ? 'bg-green-500' : 'bg-teal-500'}`}
            style={{ width: items.length ? `${(doneCount / items.length) * 100}%` : '0%' }}
          />
        </div>
        {doneCount === items.length && items.length > 0 && (
          <p className="text-xs text-green-600 font-medium mt-2 text-center">✅ Semua barang sudah dipacking!</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" /> Tambah Barang
        </button>
        {doneCount > 0 && (
          <button onClick={resetAll} className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            Reset Semua
          </button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-teal-200 p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-600">Tambah Barang Bawaan</p>
          <input
            placeholder="Nama barang *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400">
              {PACKING_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
            <input placeholder="Jumlah (opsional)" value={form.qty}
              onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-50">Batal</button>
            <button onClick={addItem} className="flex-1 bg-teal-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-teal-600">Simpan</button>
          </div>
        </div>
      )}

      {/* Filter kategori */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setFilter('semua')}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === 'semua' ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
            Semua ({items.length})
          </button>
          {PACKING_CATEGORIES.filter(c => items.some(i => i.category === c.value)).map(c => (
            <button key={c.value} onClick={() => setFilter(c.value)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === c.value ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty */}
      {items.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">🎒</p>
          <p className="text-sm">Belum ada daftar barang bawaan</p>
        </div>
      )}

      {/* List grouped by category */}
      {grouped.map(cat => (
        <div key={cat.value} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-600">{cat.emoji} {cat.label}</span>
            <span className="text-xs text-gray-400">{cat.items.filter(i => i.done).length}/{cat.items.length}</span>
          </div>
          {cat.items.map(item => (
            editingId === item.id ? (
              <div key={item.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="bg-white rounded-xl p-3">
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400 mb-2" />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400">
                      {PACKING_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                    </select>
                    <input value={editForm.qty} onChange={e => setEditForm(f => ({ ...f, qty: e.target.value }))}
                      placeholder="Jumlah (opsional)"
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={cancelEdit} className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-50">Batal</button>
                    <button onClick={saveEdit} className="flex-1 bg-teal-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-teal-600">Simpan</button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                <button
                  onClick={() => toggle(item.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${item.done ? 'bg-teal-500 border-teal-500' : 'border-gray-300 hover:border-teal-400'}`}
                >
                  {item.done && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className={`flex-1 text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {item.name}
                  {item.qty && <span className="text-xs text-gray-400 ml-1">({item.qty})</span>}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(item)} className="text-xs text-teal-500 hover:underline px-2 py-1 rounded">Edit</button>
                  <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      ))}
      </div>
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={() => confirm.onConfirm?.()}
        onCancel={() => setConfirm(s => ({ ...s, open: false }))}
      />
    </>
  );
}

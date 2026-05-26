import React, { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Trip, BudgetItem, Expense } from '../../types';
import { updateTrip } from '../../hooks/useTrips';
import ConfirmModal from '../../components/ConfirmModal';

const CATEGORIES: { value: BudgetItem['category']; label: string; emoji: string }[] = [
  { value: 'transport', label: 'Transport', emoji: '🚗' },
  { value: 'hotel', label: 'Hotel/Penginapan', emoji: '🏨' },
  { value: 'tiket', label: 'Tiket Wisata', emoji: '🎟️' },
  { value: 'makan', label: 'Makan & Minum', emoji: '🍜' },
  { value: 'darurat', label: 'Dana Darurat', emoji: '🚨' },
  { value: 'lainnya', label: 'Lainnya', emoji: '📦' },
];

interface IncomeItem { id: string; label: string; amount: number; createdAt: string; source?: string; storage?: 'cash' | 'saldo'; }
const genId = () => Math.random().toString(36).slice(2, 9);
const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

interface Props { trip: Trip; }

export default function BudgetTab({ trip }: Props) {
  const [activeSection, setActiveSection] = useState<'rab' | 'pemasukan' | 'pengeluaran'>('rab');

  // RAB
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editBudgetId, setEditBudgetId] = useState<string | null>(null);
  const [budgetForm, setBudgetForm] = useState<Partial<BudgetItem>>({ category: 'transport', label: '', amount: 0, source: '', storage: 'cash' });

  // Pemasukan
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editIncomeId, setEditIncomeId] = useState<string | null>(null);
  const [incomeForm, setIncomeForm] = useState<{ label: string; amount: number; source?: string; storage?: 'cash' | 'saldo' }>({ label: '', amount: 0, source: '', storage: 'cash' });

  // Pengeluaran
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState<Partial<Expense>>({ label: '', amount: 0, category: 'lainnya', source: '', storage: 'cash' });

  const budget: BudgetItem[] = trip.budget ?? [];
  const expenses: Expense[] = trip.expenses ?? [];
  // income disimpan sebagai field terpisah `incomeItems` di Firestore
  const incomeItems: IncomeItem[] = (trip as any).incomeItems ?? [];

  const totalRAB = budget.reduce((s, b) => s + b.amount, 0);
  const totalIncome = incomeItems.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const saldo = totalIncome - totalExpenses;

  const saveBudget = (v: BudgetItem[]) => updateTrip(trip.id, { budget: v });
  const saveExpenses = (v: Expense[]) => updateTrip(trip.id, { expenses: v });
  const saveIncome = (v: IncomeItem[]) => updateTrip(trip.id, { incomeItems: v } as any);

  // ── RAB ──
  const openAddBudget = () => { setEditBudgetId(null); setBudgetForm({ category: 'transport', label: '', amount: 0, source: '', storage: 'cash' }); setShowBudgetForm(true); };
  const openEditBudget = (item: BudgetItem) => { setEditBudgetId(item.id); setBudgetForm({ category: item.category, label: item.label, amount: item.amount, source: item.source || '', storage: item.storage || 'cash' }); setShowBudgetForm(true); };
  const saveBudgetItem = async () => {
    if (!budgetForm.label || !budgetForm.amount) return;
    if (editBudgetId) {
      await saveBudget(budget.map(b => b.id === editBudgetId ? { ...b, category: budgetForm.category as BudgetItem['category'], label: budgetForm.label!, amount: Number(budgetForm.amount) } : b));
    } else {
      await saveBudget([...budget, { id: genId(), category: budgetForm.category as BudgetItem['category'], label: budgetForm.label!, amount: Number(budgetForm.amount), paidBy: '', splitWith: [], source: budgetForm.source || '', storage: (budgetForm.storage as any) || 'cash' }]);
    }
    setShowBudgetForm(false); setEditBudgetId(null); setBudgetForm({ category: 'transport', label: '', amount: 0, source: '', storage: 'cash' });
  };
  const removeBudgetItem = (id: string) => {
    setConfirm({ open: true, title: 'Hapus RAB', message: 'Yakin ingin menghapus item RAB ini?', onConfirm: () => { saveBudget(budget.filter(b => b.id !== id)); setConfirm(c => ({ ...c, open: false })); } });
  };

  // ── PEMASUKAN ──
  const openAddIncome = () => { setEditIncomeId(null); setIncomeForm({ label: '', amount: 0, source: '', storage: 'cash' }); setShowIncomeForm(true); };
  const openEditIncome = (item: IncomeItem) => { setEditIncomeId(item.id); setIncomeForm({ label: item.label, amount: item.amount, source: item.source || '', storage: item.storage || 'cash' }); setShowIncomeForm(true); };
  const saveIncomeItem = async () => {
    if (!incomeForm.amount) return;
    if (editIncomeId) {
      await saveIncome(incomeItems.map(i => i.id === editIncomeId ? { ...i, label: incomeForm.label, amount: Number(incomeForm.amount), source: incomeForm.source || '', storage: incomeForm.storage || 'cash' } : i));
    } else {
      await saveIncome([...incomeItems, { id: genId(), label: incomeForm.label || 'Pemasukan', amount: Number(incomeForm.amount), createdAt: new Date().toISOString(), source: incomeForm.source || '', storage: incomeForm.storage || 'cash' }]);
    }
    setShowIncomeForm(false); setEditIncomeId(null); setIncomeForm({ label: '', amount: 0, source: '', storage: 'cash' });
  };
  const removeIncome = (id: string) => {
    setConfirm({ open: true, title: 'Hapus Pemasukan', message: 'Yakin ingin menghapus pemasukan ini?', onConfirm: () => { saveIncome(incomeItems.filter(i => i.id !== id)); setConfirm(c => ({ ...c, open: false })); } });
  };

  // ── PENGELUARAN ──
  const openAddExpense = () => { setEditExpenseId(null); setExpenseForm({ label: '', amount: 0, category: 'lainnya', source: '', storage: 'cash' }); setShowExpenseForm(true); };
  const openEditExpense = (exp: Expense) => { setEditExpenseId(exp.id); setExpenseForm({ label: exp.label, amount: exp.amount, category: exp.category, source: exp.source || '', storage: exp.storage || 'cash' }); setShowExpenseForm(true); };
  const saveExpenseItem = async () => {
    if (!expenseForm.label || !expenseForm.amount) return;
    if (editExpenseId) {
      await saveExpenses(expenses.map(e => e.id === editExpenseId ? { ...e, label: expenseForm.label!, amount: Number(expenseForm.amount), category: expenseForm.category ?? 'lainnya', source: expenseForm.source || '', storage: expenseForm.storage || 'cash' } : e));
    } else {
      await saveExpenses([...expenses, { id: genId(), label: expenseForm.label!, amount: Number(expenseForm.amount), category: expenseForm.category ?? 'lainnya', paidBy: '', createdAt: new Date().toISOString(), source: expenseForm.source || '', storage: expenseForm.storage || 'cash' }]);
    }
    setShowExpenseForm(false); setEditExpenseId(null); setExpenseForm({ label: '', amount: 0, category: 'lainnya', source: '', storage: 'cash' });
  };
  const removeExpense = (id: string) => {
    setConfirm({ open: true, title: 'Hapus Pengeluaran', message: 'Yakin ingin menghapus pengeluaran ini?', onConfirm: () => { saveExpenses(expenses.filter(e => e.id !== id)); setConfirm(c => ({ ...c, open: false })); } });
  };

  const [confirm, setConfirm] = useState<{ open: boolean; title?: string; message: string; onConfirm?: () => void }>({ open: false, message: '' });

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: budget.filter(b => b.category === cat.value),
    total: budget.filter(b => b.category === cat.value).reduce((s, b) => s + b.amount, 0),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-1">Total RAB</p>
          <p className="font-bold text-blue-600 text-xs sm:text-sm truncate">{fmt(totalRAB)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-green-100 text-center">
          <p className="text-xs text-gray-400 mb-1">Pemasukan</p>
          <p className="font-bold text-green-600 text-xs sm:text-sm truncate">{fmt(totalIncome)}</p>
        </div>
        <div className={`bg-white rounded-2xl p-3 shadow-sm border text-center ${saldo >= 0 ? 'border-blue-100' : 'border-red-100'}`}>
          <p className="text-xs text-gray-400 mb-1">Saldo</p>
          <p className={`font-bold text-xs sm:text-sm truncate ${saldo >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{fmt(saldo)}</p>
        </div>
      </div>

      {totalIncome > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Pengeluaran: {fmt(totalExpenses)}</span>
            <span>{Math.round((totalExpenses / totalIncome) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full transition-all ${totalExpenses > totalIncome ? 'bg-red-500' : 'bg-teal-500'}`}
              style={{ width: `${Math.min((totalExpenses / totalIncome) * 100, 100)}%` }} />
          </div>
          <ConfirmModal
            open={confirm.open}
            title={confirm.title}
            message={confirm.message}
            onConfirm={() => confirm.onConfirm?.()}
            onCancel={() => setConfirm(c => ({ ...c, open: false }))}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
        {([{ key: 'rab', label: '📋 RAB' }, { key: 'pemasukan', label: '💰 Pemasukan' }, { key: 'pengeluaran', label: '🧾 Pengeluaran' }] as const).map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${activeSection === s.key ? 'bg-teal-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* RAB */}
      {activeSection === 'rab' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{budget.length} item</p>
            <button onClick={openAddBudget} className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>

          {showBudgetForm && (
            <div className="bg-white rounded-2xl border border-teal-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">{editBudgetId ? 'Edit' : 'Tambah'} Rencana Biaya</p>
              <select value={budgetForm.category} onChange={e => setBudgetForm(f => ({ ...f, category: e.target.value as BudgetItem['category'] }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
              <input placeholder="Keterangan" value={budgetForm.label} onChange={e => setBudgetForm(f => ({ ...f, label: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
              <input type="number" placeholder="Estimasi biaya (Rp)" value={budgetForm.amount || ''}
                onChange={e => setBudgetForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
              <input placeholder="Sumber dana (contoh: Tabungan, Iuran)" value={budgetForm.source}
                onChange={e => setBudgetForm(f => ({ ...f, source: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
              <select value={budgetForm.storage} onChange={e => setBudgetForm(f => ({ ...f, storage: e.target.value as any }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400">
                <option value="cash">Cash</option>
                <option value="saldo">Saldo</option>
              </select>
              <div className="flex gap-2">
                    <button onClick={() => { setShowBudgetForm(false); setEditBudgetId(null); setBudgetForm({ category: 'transport', label: '', amount: 0, source: '', storage: 'cash' }); }} className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-50">Batal</button>
                <button onClick={saveBudgetItem} className="flex-1 bg-teal-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-teal-600">Simpan</button>
              </div>
            </div>
          )}

          {budget.length === 0 && !showBudgetForm && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📋</p><p className="text-sm">Belum ada rencana anggaran</p>
            </div>
          )}

          {grouped.map(cat => (
            <div key={cat.value} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700">{cat.emoji} {cat.label}</span>
                <span className="text-sm font-bold text-teal-600">{fmt(cat.total)}</span>
              </div>
              {cat.items.map(item => (
                <div key={item.id} className="flex items-center px-4 py-3 border-b border-gray-50 last:border-0 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{item.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">{item.source ?? ''}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{item.storage ?? 'cash'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-gray-800">{fmt(item.amount)}</span>
                    <button onClick={() => openEditBudget(item)} className="p-1 text-gray-300 hover:text-teal-500"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeBudgetItem(item.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {budget.length > 0 && (
            <div className="bg-teal-50 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-teal-700">Total RAB</span>
              <span className="text-lg font-bold text-teal-700">{fmt(totalRAB)}</span>
            </div>
          )}
        </div>
      )}

      {/* PEMASUKAN */}
      {activeSection === 'pemasukan' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{incomeItems.length} pemasukan · {fmt(totalIncome)}</p>
            <button onClick={openAddIncome} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>

          {showIncomeForm && (
            <div className="bg-white rounded-2xl border border-green-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">{editIncomeId ? 'Edit' : 'Tambah'} Pemasukan</p>
              <input placeholder="Keterangan (contoh: Iuran anggota)" value={incomeForm.label}
                onChange={e => setIncomeForm(f => ({ ...f, label: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
              <input type="number" placeholder="Jumlah (Rp)" value={incomeForm.amount || ''}
                onChange={e => setIncomeForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
              <input placeholder="Sumber dana (contoh: Tabungan, Sponsor)" value={incomeForm.source}
                onChange={e => setIncomeForm(f => ({ ...f, source: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
              <select value={incomeForm.storage} onChange={e => setIncomeForm(f => ({ ...f, storage: e.target.value as any }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400">
                <option value="cash">Cash</option>
                <option value="saldo">Saldo</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => { setShowIncomeForm(false); setEditIncomeId(null); setIncomeForm({ label: '', amount: 0, source: '', storage: 'cash' }); }} className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-50">Batal</button>
                <button onClick={saveIncomeItem} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-600">Simpan</button>
              </div>
            </div>
          )}

          {incomeItems.length === 0 && !showIncomeForm && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">💰</p><p className="text-sm">Belum ada pemasukan tercatat</p>
            </div>
          )}

          {incomeItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 p-4">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-lg shrink-0">💰</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                  <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} · {item.source ?? ''} · <span className="uppercase">{item.storage ?? 'cash'}</span></p>
              </div>
              <p className="text-sm font-bold text-green-600 shrink-0">{fmt(item.amount)}</p>
              <button onClick={() => openEditIncome(item)} className="p-1 text-gray-300 hover:text-teal-500"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => removeIncome(item.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}

          {incomeItems.length > 0 && (
            <>
              <div className="bg-green-50 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-green-700">Total Pemasukan</span>
                <span className="text-lg font-bold text-green-700">{fmt(totalIncome)}</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Perbandingan Anggaran</p>
                {[{ label: 'Total RAB', value: totalRAB, color: 'bg-blue-500' }, { label: 'Pemasukan', value: totalIncome, color: 'bg-green-500' }, { label: 'Pengeluaran', value: totalExpenses, color: 'bg-orange-500' }].map(item => {
                  const max = Math.max(totalRAB, totalIncome, totalExpenses, 1);
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{item.label}</span><span className="font-medium text-gray-700">{fmt(item.value)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.value / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* PENGELUARAN */}
      {activeSection === 'pengeluaran' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{expenses.length} transaksi · {fmt(totalExpenses)}</p>
            <button onClick={openAddExpense} className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" /> Catat
            </button>
          </div>

          {showExpenseForm && (
            <div className="bg-white rounded-2xl border border-orange-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">{editExpenseId ? 'Edit' : 'Catat'} Pengeluaran</p>
              <input placeholder="Keterangan" value={expenseForm.label} onChange={e => setExpenseForm(f => ({ ...f, label: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
              <input type="number" placeholder="Jumlah (Rp)" value={expenseForm.amount || ''}
                onChange={e => setExpenseForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
              <select value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
              <input placeholder="Sumber pengeluaran (contoh: Kas, Kartu)" value={expenseForm.source}
                onChange={e => setExpenseForm(f => ({ ...f, source: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
              <select value={expenseForm.storage} onChange={e => setExpenseForm(f => ({ ...f, storage: e.target.value as any }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400">
                <option value="cash">Cash</option>
                <option value="saldo">Saldo</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => { setShowExpenseForm(false); setEditExpenseId(null); setExpenseForm({ label: '', amount: 0, category: 'lainnya', source: '', storage: 'cash' }); }} className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-50">Batal</button>
                <button onClick={saveExpenseItem} className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-orange-600">Simpan</button>
              </div>
            </div>
          )}

          {expenses.length === 0 && !showExpenseForm && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">🧾</p><p className="text-sm">Belum ada pengeluaran tercatat</p>
            </div>
          )}

          {expenses.map(exp => {
            const cat = CATEGORIES.find(c => c.value === exp.category);
            return (
              <div key={exp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 p-4">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-lg shrink-0">{cat?.emoji ?? '📦'}</div>
                  <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{exp.label}</p>
                  <p className="text-xs text-gray-400">{cat?.label ?? exp.category} · {new Date(exp.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {exp.source ?? ''} · <span className="uppercase">{exp.storage ?? 'cash'}</span></p>
                </div>
                <p className="text-sm font-bold text-orange-600 shrink-0">{fmt(exp.amount)}</p>
                <button onClick={() => openEditExpense(exp)} className="p-1 text-gray-300 hover:text-teal-500"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeExpense(exp.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}

          {expenses.length > 0 && (
            <div className="bg-orange-50 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-orange-700">Total Pengeluaran</span>
              <span className="text-lg font-bold text-orange-700">{fmt(totalExpenses)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

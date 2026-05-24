import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Trip, TripDay, TripActivity, ChecklistItem } from '../../types';
import { updateTrip } from '../../hooks/useTrips';

const genId = () => Math.random().toString(36).slice(2, 9);

interface Props { trip: Trip; }

export default function ItineraryTab({ trip }: Props) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedAct, setExpandedAct] = useState<string | null>(null);
  const [showActForm, setShowActForm] = useState<string | null>(null); // dayId
  const [actForm, setActForm] = useState({ time: '', place: '', transport: '', notes: '' });
  const [newCheckText, setNewCheckText] = useState<Record<string, string>>({});

  const days: TripDay[] = trip.days ?? [];

  const save = (newDays: TripDay[]) => updateTrip(trip.id, { days: newDays });

  const addDay = () => {
    const day: TripDay = {
      id: genId(), day: days.length + 1, date: '', activities: [],
    };
    save([...days, day]);
    setExpandedDay(day.id);
  };

  const removeDay = (id: string) => save(days.filter(d => d.id !== id));

  const updateDayDate = (id: string, date: string) =>
    save(days.map(d => d.id === id ? { ...d, date } : d));

  const addActivity = (dayId: string) => {
    if (!actForm.place) return;
    const act: TripActivity = {
      id: genId(), ...actForm, checklist: [],
    };
    save(days.map(d => d.id === dayId ? { ...d, activities: [...d.activities, act] } : d));
    setActForm({ time: '', place: '', transport: '', notes: '' });
    setShowActForm(null);
    setExpandedAct(act.id);
  };

  const removeActivity = (dayId: string, actId: string) =>
    save(days.map(d => d.id === dayId ? { ...d, activities: d.activities.filter(a => a.id !== actId) } : d));

  const addChecklist = (dayId: string, actId: string) => {
    const text = newCheckText[actId]?.trim();
    if (!text) return;
    const item: ChecklistItem = { id: genId(), text, done: false };
    save(days.map(d => d.id === dayId ? {
      ...d,
      activities: d.activities.map(a => a.id === actId ? { ...a, checklist: [...a.checklist, item] } : a),
    } : d));
    setNewCheckText(p => ({ ...p, [actId]: '' }));
  };

  const toggleChecklist = (dayId: string, actId: string, itemId: string) =>
    save(days.map(d => d.id === dayId ? {
      ...d,
      activities: d.activities.map(a => a.id === actId ? {
        ...a,
        checklist: a.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c),
      } : a),
    } : d));

  const removeChecklist = (dayId: string, actId: string, itemId: string) =>
    save(days.map(d => d.id === dayId ? {
      ...d,
      activities: d.activities.map(a => a.id === actId ? {
        ...a, checklist: a.checklist.filter(c => c.id !== itemId),
      } : a),
    } : d));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{days.length} hari</p>
        <button onClick={addDay} className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" /> Tambah Hari
        </button>
      </div>

      {days.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-sm">Belum ada jadwal perjalanan</p>
        </div>
      )}

      {days.map((day, idx) => (
        <div key={day.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Day Header */}
          <div className="flex items-center gap-3 p-4">
            <div className="bg-teal-500 text-white rounded-xl w-9 h-9 flex items-center justify-center font-bold text-sm shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">Hari {idx + 1}</p>
              <input
                type="date"
                value={day.date}
                onChange={e => updateDayDate(day.id, e.target.value)}
                className="text-xs text-gray-400 outline-none bg-transparent"
              />
            </div>
            <span className="text-xs text-gray-400">{day.activities.length} aktivitas</span>
            <button onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)} className="p-1.5 text-gray-400 hover:text-teal-500">
              {expandedDay === day.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button onClick={() => removeDay(day.id)} className="p-1.5 text-gray-300 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {expandedDay === day.id && (
            <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-2">
              {day.activities.length === 0 && (
                <p className="text-center text-gray-400 text-xs py-3">Belum ada aktivitas</p>
              )}

              {day.activities.map((act, aIdx) => {
                const doneCount = act.checklist.filter(c => c.done).length;
                return (
                  <div key={act.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onClick={() => setExpandedAct(expandedAct === act.id ? null : act.id)}
                    >
                      <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">{aIdx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{act.place}</p>
                        <p className="text-xs text-gray-400">{act.time}{act.transport ? ` · ${act.transport}` : ''}</p>
                      </div>
                      {act.checklist.length > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doneCount === act.checklist.length ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {doneCount}/{act.checklist.length}
                        </span>
                      )}
                      <button onClick={e => { e.stopPropagation(); removeActivity(day.id, act.id); }} className="p-1 text-gray-300 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedAct === act.id ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                    </div>

                    {expandedAct === act.id && (
                      <div className="border-t border-gray-100 p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {act.time && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">⏰ Jam</span><p className="font-medium text-gray-700 mt-0.5">{act.time}</p></div>}
                          {act.transport && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">🚗 Transport</span><p className="font-medium text-gray-700 mt-0.5">{act.transport}</p></div>}
                          {act.notes && <div className="bg-gray-50 rounded-lg p-2 col-span-2"><span className="text-gray-400">📝 Catatan</span><p className="font-medium text-gray-700 mt-0.5">{act.notes}</p></div>}
                        </div>

                        {/* Checklist */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">✅ Checklist</p>
                          {act.checklist.map(item => (
                            <div key={item.id} className="flex items-center gap-2 py-1.5">
                              <button
                                onClick={() => toggleChecklist(day.id, act.id, item.id)}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${item.done ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}
                              >
                                {item.done && <Check className="w-3 h-3 text-white" />}
                              </button>
                              <span className={`text-sm flex-1 ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.text}</span>
                              <button onClick={() => removeChecklist(day.id, act.id, item.id)} className="text-gray-300 hover:text-red-400">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-2">
                            <input
                              value={newCheckText[act.id] ?? ''}
                              onChange={e => setNewCheckText(p => ({ ...p, [act.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && addChecklist(day.id, act.id)}
                              placeholder="Tambah checklist..."
                              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-teal-400"
                            />
                            <button onClick={() => addChecklist(day.id, act.id)} className="bg-teal-500 text-white px-2 py-1.5 rounded-lg text-xs hover:bg-teal-600">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Activity Form */}
              {showActForm === day.id ? (
                <div className="bg-white rounded-xl border border-teal-200 p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Tambah Aktivitas</p>
                  <input placeholder="Tempat / Destinasi *" value={actForm.place}
                    onChange={e => setActForm(f => ({ ...f, place: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400" />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Jam (contoh: 08:00)" value={actForm.time}
                      onChange={e => setActForm(f => ({ ...f, time: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400" />
                    <input placeholder="Transport" value={actForm.transport}
                      onChange={e => setActForm(f => ({ ...f, transport: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400" />
                  </div>
                  <textarea placeholder="Catatan" value={actForm.notes} rows={2}
                    onChange={e => setActForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setShowActForm(null)} className="flex-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:bg-gray-50">Batal</button>
                    <button onClick={() => addActivity(day.id)} className="flex-1 bg-teal-500 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-teal-600">Simpan</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setShowActForm(day.id); setActForm({ time: '', place: '', transport: '', notes: '' }); }}
                  className="w-full flex items-center justify-center gap-1.5 border border-dashed border-teal-300 text-teal-500 hover:bg-teal-50 rounded-xl py-2 text-xs font-medium transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Tambah Aktivitas
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

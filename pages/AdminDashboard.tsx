
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Wallet, Settings, LogOut,
  Plus, Trash2, Edit2, Save, X, Database, RefreshCw, Upload, Camera,
  TrendingUp, TrendingDown, ChevronRight, Server, CheckCircle, Search
} from 'lucide-react';
import { store } from '../store';
import { EventStatus, Member, IncomeEntry, ExpenseEntry, Budget } from '../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'members' | 'events' | 'budget'>('stats');
  const [appState, setAppState] = useState(store.getState());
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showBudgetEventSelect, setShowBudgetEventSelect] = useState(true);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Editing State
  const [editingItem, setEditingItem] = useState<{ id: string, type: 'member' | 'event' | 'income' | 'expense', data: any } | null>(null);

  // Member Form State
  const [memberForm, setMemberForm] = useState({
    name: '',
    phone: '',
    instagram: '',
    imageUrl: ''
  });

  // Event Form State
  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    description: '',
    venue: '',
    status: EventStatus.UPCOMING
  });

  // Budget entry form (common for income/expense)
  const [showBudgetEntryModal, setShowBudgetEntryModal] = useState(false);
  const [budgetEntryType, setBudgetEntryType] = useState<'income' | 'expense'>('income');
  const [budgetEntryForm, setBudgetEntryForm] = useState({
    name: '', // contributor or description
    amount: '',
    date: ''
  });

  const [incomeForm, setIncomeForm] = useState({ contributor: '', amount: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('is_admin');
    if (!isAdmin) {
      navigate('/login');
    } else {
      refreshState();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('is_admin');
    navigate('/');
  };

  const refreshState = async () => {
    setIsSyncing(true);
    await store.fetchState();
    setAppState({ ...store.getState() });
    setIsSyncing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemberForm({ ...memberForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    if (editingItem && editingItem.type === 'member') {
      await store.updateMember({ ...editingItem.data, ...memberForm, id: editingItem.id });
    } else {
      if (!memberForm.imageUrl) {
        alert('Please upload an image');
        setIsSyncing(false);
        return;
      }
      await store.addMember(memberForm);
    }
    setMemberForm({ name: '', phone: '', instagram: '', imageUrl: '' });
    setShowMemberModal(false);
    setEditingItem(null);
    refreshState();
  };

  const deleteMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      await store.deleteMember(id);
      refreshState();
    }
  };

  const deleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to delete this session and its history?')) {
      await store.deleteEvent(id);
      if (selectedBudgetId === id) {
        setSelectedBudgetId(null);
        setShowBudgetEventSelect(true);
      }
      refreshState();
    }
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    if (editingItem && editingItem.type === 'event') {
      await store.updateEvent({ ...editingItem.data, ...eventForm, id: editingItem.id });
    } else {
      await store.addEvent(eventForm);
    }
    setEventForm({ name: '', date: '', description: '', venue: '', status: EventStatus.UPCOMING });
    setShowEventModal(false);
    setEditingItem(null);
    refreshState();
  };

  const toggleEventStatus = async (event: any) => {
    setIsSyncing(true);
    const newStatus = event.status === EventStatus.UPCOMING ? EventStatus.COMPLETED : EventStatus.UPCOMING;
    await store.updateEvent({ ...event, status: newStatus });
    refreshState();
  };

  const addIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetId) return;
    setIsSyncing(true);
    await store.addIncome(selectedBudgetId, {
      contributor: incomeForm.contributor,
      amount: parseFloat(incomeForm.amount),
      date: new Date().toISOString().split('T')[0]
    });
    setIncomeForm({ contributor: '', amount: '' });
    refreshState();
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetId) return;
    setIsSyncing(true);
    await store.addExpense(selectedBudgetId, {
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      date: new Date().toISOString().split('T')[0]
    });
    setExpenseForm({ description: '', amount: '' });
    refreshState();
  };

  const saveBudgetEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetId || !editingItem) return;
    setIsSyncing(true);

    const budget = await store.fetchBudget(selectedBudgetId);
    if (editingItem.type === 'income') {
      const idx = budget.income.findIndex((i: any) => (i.id === editingItem.id || i._id === editingItem.id));
      if (idx >= 0) {
        budget.income[idx] = {
          ...budget.income[idx],
          contributor: budgetEntryForm.name,
          amount: parseFloat(budgetEntryForm.amount),
          date: budgetEntryForm.date
        };
      }
    } else if (editingItem.type === 'expense') {
      const idx = budget.expenses.findIndex((e: any) => (e.id === editingItem.id || e._id === editingItem.id));
      if (idx >= 0) {
        budget.expenses[idx] = {
          ...budget.expenses[idx],
          description: budgetEntryForm.name,
          amount: parseFloat(budgetEntryForm.amount),
          date: budgetEntryForm.date
        };
      }
    }

    await store.updateBudget(budget);
    setShowBudgetEntryModal(false);
    setEditingItem(null);
    refreshState();
  };

  const deleteIncomeItem = async (incomeId: string) => {
    if (selectedBudgetId && confirm('Remove this credit entry?')) {
      setIsSyncing(true);
      await store.deleteIncome(selectedBudgetId, incomeId);
      refreshState();
    }
  };

  const deleteExpenseItem = async (expenseId: string) => {
    if (selectedBudgetId && confirm('Remove this debit entry?')) {
      setIsSyncing(true);
      await store.deleteExpense(selectedBudgetId, expenseId);
      refreshState();
    }
  };

  const clearBudgetSection = async (type: 'income' | 'expenses') => {
    if (selectedBudgetId && confirm(`Are you sure you want to clear all ${type}?`)) {
      setIsSyncing(true);
      const budget = await store.fetchBudget(selectedBudgetId);
      budget[type] = [];
      await store.updateBudget(budget);
      refreshState();
    }
  };

  const currentBudget = selectedBudgetId ? store.getBudgetByEvent(selectedBudgetId) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-1.5 rounded-lg font-black tracking-tighter text-sm">RB</div>
            <span className="text-lg font-bold tracking-tight">RED <span className="text-red-500 uppercase text-xs">Admin</span></span>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {[
            { id: 'stats', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'members', label: 'Manage Members', icon: <Users size={20} /> },
            { id: 'events', label: 'Manage Events', icon: <Calendar size={20} /> },
            { id: 'budget', label: 'Budget History', icon: <Wallet size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (item.id === 'budget') setShowBudgetEventSelect(true);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="px-4 py-2 bg-slate-800 rounded-lg flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500 flex items-center gap-1"><Server size={10} /> DB Status</span>
            <span className="text-emerald-500 flex items-center gap-1">Online <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div></span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all font-bold"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
              <p className="text-slate-500 text-sm">Real-time Cloud Sync Enabled</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (confirm('Sync all data from server?')) refreshState();
              }}
              className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
            >
              <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                if (confirm('Reset to initial data? This will clear all your cloud changes!')) store.resetData();
              }}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 bg-white hover:bg-slate-50"
            >
              <Database size={16} /> Hard Reset
            </button>
          </div>
        </header>

        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -translate-y-4 translate-x-4 transition-transform group-hover:scale-110"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Total Members</p>
                <p className="text-5xl font-black text-slate-900">{appState.members.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -translate-y-4 translate-x-4 transition-transform group-hover:scale-110"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Total Events</p>
                <p className="text-5xl font-black text-slate-900">{appState.events.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -translate-y-4 translate-x-4 transition-transform group-hover:scale-110"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Database</p>
                <p className="text-lg font-black text-emerald-600 flex items-center gap-2">
                  <CheckCircle size={24} /> RedBoys_DB v1.0
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150"><LayoutDashboard size={200} /></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-600/40">
                  <Server size={32} />
                </div>
                <div>
                  <h4 className="text-3xl font-black mb-2 tracking-tight">System Performance</h4>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                    Your administration panel is connected to MongoDB Atlas. Changes made here will reflect globally across all devices within milliseconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Member Tab Rendering */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-xl font-black text-slate-900">Member Directory</h3>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setMemberForm({ name: '', phone: '', instagram: '', imageUrl: '' });
                    setShowMemberModal(true);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  <Plus size={18} /> New Member
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Identity</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Contact</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Social</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appState.members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                              <img src={m.imageUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <span className="font-black text-slate-900 group-hover:text-red-600 transition-colors">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-bold">{m.phone}</td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-bold text-xs ring-1 ring-slate-200">@{m.instagram}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => {
                                setEditingItem({ id: m.id, type: 'member', data: m });
                                setMemberForm({ name: m.name, phone: m.phone, instagram: m.instagram, imageUrl: m.imageUrl });
                                setShowMemberModal(true);
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteMember(m.id)}
                              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {showMemberModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="p-10 bg-gradient-to-br from-red-600 to-red-800 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">{editingItem ? 'Edit Member' : 'New Member'}</h3>
                      <p className="text-red-100 text-sm opacity-80 mt-1">Fill in the member details below</p>
                    </div>
                    <button onClick={() => setShowMemberModal(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all"><X size={24} /></button>
                  </div>
                  <form onSubmit={saveMember} className="p-10 space-y-6">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                          {memberForm.imageUrl ? (
                            <img src={memberForm.imageUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Camera className="text-slate-200" size={40} />
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 border-4 border-white text-white rounded-2xl cursor-pointer shadow-xl flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all">
                          <Upload size={20} />
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-2">Full Name</label>
                        <input
                          type="text" placeholder="e.g. Dineshkumar M" required
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none transition-all font-bold"
                          value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-slate-400 ml-2">Mobile Number</label>
                          <input
                            type="tel" placeholder="9876543210" required
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none transition-all font-bold"
                            value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-slate-400 ml-2">Instagram ID</label>
                          <input
                            type="text" placeholder="dinesh_offl" required
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none transition-all font-bold"
                            value={memberForm.instagram} onChange={e => setMemberForm({ ...memberForm, instagram: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={isSyncing} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:bg-red-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                      {isSyncing ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
                      {editingItem ? 'Update Changes' : 'Confirm Registration'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event Tab Rendering */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Event Portfolio</h3>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setEventForm({ name: '', date: '', description: '', venue: '', status: EventStatus.UPCOMING });
                    setShowEventModal(true);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  <Plus size={18} /> Plan Event
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Occasion</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Life Cycle</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appState.events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-5">
                          <span className="font-black text-slate-900 block group-hover:text-red-600 transition-colors">{evt.name}</span>
                          <span className="text-xs text-slate-400 mt-1 block uppercase font-bold">{evt.venue}</span>
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-bold">{evt.date}</td>
                        <td className="px-8 py-5">
                          <button
                            onClick={() => toggleEventStatus(evt)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 transition-all ${evt.status === EventStatus.UPCOMING ? 'bg-amber-50 text-amber-600 ring-amber-100 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 ring-emerald-100 hover:bg-emerald-600 hover:text-white'
                              }`}
                          >
                            {evt.status}
                          </button>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => {
                                setEditingItem({ id: evt.id, type: 'event', data: evt });
                                setEventForm({ name: evt.name, date: evt.date, description: evt.description, venue: evt.venue, status: evt.status });
                                setShowEventModal(true);
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteEvent(evt.id)}
                              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {showEventModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="p-10 bg-gradient-to-br from-slate-800 to-slate-950 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">{editingItem ? 'Revise Event' : 'New Occasion'}</h3>
                      <p className="text-slate-400 text-sm mt-1">Status: {eventForm.status}</p>
                    </div>
                    <button onClick={() => setShowEventModal(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all"><X size={24} /></button>
                  </div>
                  <form onSubmit={saveEvent} className="p-10 space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-slate-400 ml-2">Event Name</label>
                          <input
                            type="text" placeholder="e.g. Pongal Celebration" required
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-bold focus:border-red-600 transition-all"
                            value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-slate-400 ml-2">Event Date</label>
                          <input
                            type="date" required
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-bold focus:border-red-600 transition-all"
                            value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-2">Venue Location</label>
                        <input
                          type="text" placeholder="Village Temple Ground" required
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-bold focus:border-red-600 transition-all"
                          value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-2">Short Brief</label>
                        <textarea
                          placeholder="What is this event about?" required
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-bold min-h-[120px] focus:border-red-600 transition-all"
                          value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={isSyncing} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-red-600/30 hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                      {isSyncing ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
                      {editingItem ? 'Commit Changes' : 'Initialize Event'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget Tab Rendering */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            {showBudgetEventSelect ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900">Budget Records</h3>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setEventForm({ name: '', date: '', description: 'Budget record', venue: 'Madurai', status: EventStatus.COMPLETED });
                      setShowEventModal(true);
                    }}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg"
                  >
                    <Plus size={18} /> New Budget Record
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {appState.events.map(evt => (
                    <div key={evt.id} className="relative group">
                      <button
                        onClick={() => {
                          setSelectedBudgetId(evt.id);
                          setShowBudgetEventSelect(false);
                        }}
                        className="w-full p-10 bg-white border border-slate-100 rounded-[3rem] text-left hover:border-red-600 hover:ring-8 hover:ring-red-50 transition-all shadow-sm premium-card"
                      >
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                          <Wallet size={24} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2 truncate pr-16">{evt.name}</h4>
                        <p className="text-xs text-slate-400 font-black mb-6 uppercase tracking-widest">{evt.date}</p>
                        <div className="flex items-center gap-2 text-red-600 text-xs font-black uppercase tracking-tighter">
                          View History <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                      </button>
                      <div className="absolute top-6 right-6 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({ id: evt.id, type: 'event', data: evt });
                            setEventForm({ name: evt.name, date: evt.date, description: evt.description, venue: evt.venue, status: evt.status });
                            setShowEventModal(true);
                          }}
                          className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEvent(evt.id);
                          }}
                          className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {appState.events.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 font-bold">No budget records found. Create one to begin tracking.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowBudgetEventSelect(true)}
                      className="w-12 h-12 bg-white border border-slate-100 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        {appState.events.find(e => e.id === selectedBudgetId)?.name}
                        <button
                          onClick={() => {
                            const evt = appState.events.find(e => e.id === selectedBudgetId);
                            if (evt) {
                              setEditingItem({ id: evt.id, type: 'event', data: evt });
                              setEventForm({ name: evt.name, date: evt.date, description: evt.description, venue: evt.venue, status: evt.status });
                              setShowEventModal(true);
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </h3>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Full Transaction History & Statements</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Income Management */}
                  <div className="bg-emerald-50/30 rounded-[3.5rem] border border-emerald-100/50 p-10">
                    <div className="flex justify-between items-center mb-10">
                      <h4 className="flex items-center gap-3 font-black text-emerald-800 text-xl tracking-tight">
                        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20"><TrendingUp size={24} /></div>
                        Credit Statements
                      </h4>
                      <button
                        onClick={() => clearBudgetSection('income')}
                        className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-red-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Wipe Credits
                      </button>
                    </div>

                    <form onSubmit={addIncome} className="mb-10 grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <input
                        className="sm:col-span-2 px-6 py-4 bg-white border border-emerald-100 rounded-[1.25rem] text-sm font-bold shadow-sm outline-none focus:border-emerald-600"
                        placeholder="Who gave money?" required
                        value={incomeForm.contributor} onChange={e => setIncomeForm({ ...incomeForm, contributor: e.target.value })}
                      />
                      <input
                        className="sm:col-span-2 px-6 py-4 bg-white border border-emerald-100 rounded-[1.25rem] text-sm font-bold shadow-sm outline-none focus:border-emerald-600"
                        placeholder="Amount (₹)" type="number" required
                        value={incomeForm.amount} onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                      />
                      <button type="submit" disabled={isSyncing} className="bg-emerald-600 text-white rounded-[1.25rem] flex items-center justify-center py-4 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20">
                        {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={24} />}
                      </button>
                    </form>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {currentBudget?.income.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-6 rounded-[1.75rem] shadow-sm border border-emerald-100/50 group">
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase text-sm tracking-tight">{item.contributor}</p>
                            <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-tighter">{item.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-600 font-black text-lg mr-4">₹{item.amount.toLocaleString()}</span>
                            <button
                              onClick={() => {
                                setEditingItem({ id: item.id, type: 'income', data: item });
                                setBudgetEntryType('income');
                                setBudgetEntryForm({ name: item.contributor, amount: item.amount.toString(), date: item.date });
                                setShowBudgetEntryModal(true);
                              }}
                              className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-red-600 bg-slate-50 rounded-xl transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => deleteIncomeItem(item.id)} className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-red-600 bg-slate-50 rounded-xl transition-all"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expense Management */}
                  <div className="bg-red-50/30 rounded-[3.5rem] border border-red-100/50 p-10">
                    <div className="flex justify-between items-center mb-10">
                      <h4 className="flex items-center gap-3 font-black text-red-800 text-xl tracking-tight">
                        <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20"><TrendingDown size={24} /></div>
                        Debit Statements
                      </h4>
                      <button
                        onClick={() => clearBudgetSection('expenses')}
                        className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Wipe Debits
                      </button>
                    </div>

                    <form onSubmit={addExpense} className="mb-10 grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <input
                        className="sm:col-span-2 px-6 py-4 bg-white border border-red-100 rounded-[1.25rem] text-sm font-bold shadow-sm outline-none focus:border-red-600"
                        placeholder="Expense Detail / Item" required
                        value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      />
                      <input
                        className="sm:col-span-2 px-6 py-4 bg-white border border-red-100 rounded-[1.25rem] text-sm font-bold shadow-sm outline-none focus:border-red-600"
                        placeholder="Amount (₹)" type="number" required
                        value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      />
                      <button type="submit" disabled={isSyncing} className="bg-red-600 text-white rounded-[1.25rem] flex items-center justify-center py-4 hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-600/20">
                        {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={24} />}
                      </button>
                    </form>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {currentBudget?.expenses.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-6 rounded-[1.75rem] shadow-sm border border-red-100/50 group">
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-red-600 transition-colors uppercase text-sm tracking-tight">{item.description}</p>
                            <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-tighter">{item.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-red-600 font-black text-lg mr-4">₹{item.amount.toLocaleString()}</span>
                            <button
                              onClick={() => {
                                setEditingItem({ id: item.id, type: 'expense', data: item });
                                setBudgetEntryType('expense');
                                setBudgetEntryForm({ name: item.description, amount: item.amount.toString(), date: item.date });
                                setShowBudgetEntryModal(true);
                              }}
                              className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-red-600 bg-slate-50 rounded-xl transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => deleteExpenseItem(item.id)} className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-red-600 bg-slate-50 rounded-xl transition-all"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Editing Modal for Budget Entries */}
            {showBudgetEntryModal && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className={`p-8 ${budgetEntryType === 'income' ? 'bg-emerald-600' : 'bg-red-600'} text-white flex justify-between items-center`}>
                    <div>
                      <h3 className="text-xl font-black">Edit Statement</h3>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{budgetEntryType === 'income' ? 'Credit' : 'Debit'}</p>
                    </div>
                    <button onClick={() => setShowBudgetEntryModal(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={20} /></button>
                  </div>
                  <form onSubmit={saveBudgetEntry} className="p-8 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{budgetEntryType === 'income' ? 'Contributor' : 'Description'}</label>
                      <input
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-300"
                        value={budgetEntryForm.name} onChange={e => setBudgetEntryForm({ ...budgetEntryForm, name: e.target.value })} required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Amount (₹)</label>
                      <input
                        type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-300"
                        value={budgetEntryForm.amount} onChange={e => setBudgetEntryForm({ ...budgetEntryForm, amount: e.target.value })} required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date</label>
                      <input
                        type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-300"
                        value={budgetEntryForm.date} onChange={e => setBudgetEntryForm({ ...budgetEntryForm, date: e.target.value })} required
                      />
                    </div>
                    <button type="submit" disabled={isSyncing} className={`w-full py-4 ${budgetEntryType === 'income' ? 'bg-emerald-600' : 'bg-red-600'} text-white rounded-2xl font-black shadow-lg hover:brightness-90 transition-all active:scale-95`}>
                      {isSyncing ? <RefreshCw className="animate-spin" /> : 'Save Statement'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

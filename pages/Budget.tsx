
import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, ChevronDown, ChevronUp, AlertCircle, PieChart as PieIcon, ShoppingBag, User } from 'lucide-react';
import { store } from '../store';

export const Budget: React.FC = () => {
  const [appState, setAppState] = useState(store.getState());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  React.useEffect(() => {
    store.fetchState().then(state => setAppState({ ...state }));
  }, []);

  const { events, budgets } = appState;

  const calculateBudget = (eventId: string) => {
    const budget = budgets.find(b => b.eventId === eventId);
    if (!budget) return { income: 0, expense: 0, balance: 0 };
    const incomeTotal = budget.income.reduce((sum, item) => sum + item.amount, 0);
    const expenseTotal = budget.expenses.reduce((sum, item) => sum + item.amount, 0);
    return { income: incomeTotal, expense: expenseTotal, balance: incomeTotal - expenseTotal };
  };

  const activeBudget = selectedEventId ? budgets.find(b => b.eventId === selectedEventId) : null;
  const stats = selectedEventId ? calculateBudget(selectedEventId) : { income: 0, expense: 0, balance: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-20">
        <span className="inline-block px-4 py-1.5 mb-4 glass text-emerald-600 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-100">Financial Audit</span>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Public <span className="text-red-600">Ledger</span></h1>
        <div className="h-2 w-24 bg-red-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">Select Event</h3>
          {events.map((evt) => {
            const { balance } = calculateBudget(evt.id);
            const isSelected = selectedEventId === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className={`w-full p-6 rounded-3xl text-left transition-all border ${isSelected
                  ? 'bg-white border-red-600 ring-4 ring-red-50 shadow-xl'
                  : 'bg-white border-slate-100 hover:border-red-200 shadow-sm'
                  }`}
              >
                <h4 className="font-bold text-slate-900 mb-2">{evt.name}</h4>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-400 font-bold uppercase">{new Date(evt.date).getFullYear()}</span>
                  <span className={`text-sm font-black ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {balance >= 0 ? '+' : ''}₹{balance.toLocaleString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Details View */}
        <div className="lg:col-span-2">
          {selectedEventId ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Income</p>
                  <p className="text-2xl font-black text-emerald-600">₹{stats.income.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Expenses</p>
                  <p className="text-2xl font-black text-red-600">₹{stats.expense.toLocaleString()}</p>
                </div>
                <div className="bg-red-600 p-6 rounded-3xl shadow-lg shadow-red-200">
                  <p className="text-xs font-bold text-red-200 uppercase tracking-widest mb-1">Balance</p>
                  <p className="text-2xl font-black text-white">₹{stats.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Section */}
                <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100">
                  <h4 className="flex items-center gap-2 font-bold text-emerald-800 mb-6">
                    <TrendingUp size={20} /> Income Source (Who gave)
                  </h4>
                  <div className="space-y-3">
                    {activeBudget?.income.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-100/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.contributor}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{item.date}</p>
                          </div>
                        </div>
                        <span className="text-emerald-600 font-black">₹{item.amount}</span>
                      </div>
                    ))}
                    {(!activeBudget || activeBudget.income.length === 0) && (
                      <p className="text-emerald-600/50 text-center py-4 text-sm font-medium italic">No income recorded</p>
                    )}
                  </div>
                </div>

                {/* Expense Section */}
                <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100">
                  <h4 className="flex items-center gap-2 font-bold text-red-800 mb-6">
                    <TrendingDown size={20} /> Expenses (Where it went)
                  </h4>
                  <div className="space-y-3">
                    {activeBudget?.expenses.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-red-100/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <ShoppingBag size={14} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.description}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{item.date}</p>
                          </div>
                        </div>
                        <span className="text-red-600 font-black">₹{item.amount}</span>
                      </div>
                    ))}
                    {(!activeBudget || activeBudget.expenses.length === 0) && (
                      <p className="text-red-600/50 text-center py-4 text-sm font-medium italic">No expenses recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-100/50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                <Wallet className="text-slate-300" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Select an event</h3>
              <p className="text-slate-400 max-w-xs">Pick an event from the left to see exactly who donated and where the money was spent.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

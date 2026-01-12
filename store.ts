
import { Member, Event, Budget, AdminUser, AppState, EventStatus, IncomeEntry, ExpenseEntry } from './types';
import { INITIAL_MEMBERS, INITIAL_EVENTS, INITIAL_BUDGETS } from './constants';

import { API_URL as BASE_URL } from './config';
const API_URL = `${BASE_URL}/api`;


let state: AppState = {
  members: [],
  events: [],
  budgets: [],
  admins: [{ id: 'admin-1', username: 'admin', role: 'SUPER_ADMIN' }]
};

export const store = {
  getState: () => state,

  fetchState: async () => {
    try {
      const [members, events, budgets] = await Promise.all([
        fetch(`${API_URL}/members`).then(r => r.json()),
        fetch(`${API_URL}/events`).then(r => r.json()),
        fetch(`${API_URL}/budgets`).then(r => r.json())
      ]);

      // If database is empty, seed it with initial data
      if (members.length === 0 && events.length === 0) {
        console.log('Database empty, seeding...');
        await store.seedData();
        return store.fetchState();
      }

      state = {
        ...state,
        members: members.map((m: any) => ({ ...m, id: m._id })),
        events: events.map((e: any) => ({ ...e, id: e._id })),
        budgets: budgets.map((b: any) => ({
          ...b,
          id: b._id,
          income: b.income.map((i: any) => ({ ...i, id: i.id || i._id })),
          expenses: b.expenses.map((e: any) => ({ ...e, id: e.id || e._id }))
        }))
      };
      return state;
    } catch (error) {
      console.error('Error fetching state:', error);
      return state;
    }
  },

  seedData: async () => {
    for (const member of INITIAL_MEMBERS) {
      const { id, ...data } = member;
      await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    for (const event of INITIAL_EVENTS) {
      const { id, ...data } = event;
      await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    for (const budget of INITIAL_BUDGETS) {
      await fetch(`${API_URL}/budgets/${budget.eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget)
      });
    }
  },

  // Members
  addMember: async (member: Omit<Member, 'id'>) => {
    const res = await fetch(`${API_URL}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    const newMember = await res.json();
    return { ...newMember, id: newMember._id };
  },
  updateMember: async (member: Member) => {
    await fetch(`${API_URL}/members/${member.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
  },
  deleteMember: async (id: string) => {
    await fetch(`${API_URL}/members/${id}`, { method: 'DELETE' });
  },

  // Events
  addEvent: async (evt: Omit<Event, 'id'>) => {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evt)
    });
    const newEvent = await res.json();
    return { ...newEvent, id: newEvent._id };
  },
  updateEvent: async (evt: Event) => {
    await fetch(`${API_URL}/events/${evt.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evt)
    });
  },
  deleteEvent: async (id: string) => {
    await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
  },

  // Budget
  getBudgetByEvent: (eventId: string): Budget => {
    const b = state.budgets.find(b => b.eventId === eventId);
    if (!b) {
      return { eventId, income: [], expenses: [] };
    }
    return b;
  },
  fetchBudget: async (eventId: string) => {
    const res = await fetch(`${API_URL}/budgets/${eventId}`);
    const budget = await res.json();
    const normalizedBudget = {
      ...budget,
      id: budget._id,
      income: budget.income.map((i: any) => ({ ...i, id: i.id || i._id })),
      expenses: budget.expenses.map((e: any) => ({ ...e, id: e.id || e._id }))
    };
    // Update local state for this budget
    const idx = state.budgets.findIndex(b => b.eventId === eventId);
    if (idx >= 0) {
      state.budgets[idx] = normalizedBudget;
    } else {
      state.budgets.push(normalizedBudget);
    }
    return normalizedBudget;
  },
  updateBudget: async (budget: Budget) => {
    await fetch(`${API_URL}/budgets/${budget.eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
  },
  addIncome: async (eventId: string, entry: Omit<IncomeEntry, 'id'>) => {
    const budget = await store.fetchBudget(eventId);
    budget.income.push({ ...entry, id: 'temp-' + Date.now() });
    await store.updateBudget(budget);
    return entry;
  },
  addExpense: async (eventId: string, entry: Omit<ExpenseEntry, 'id'>) => {
    const budget = await store.fetchBudget(eventId);
    budget.expenses.push({ ...entry, id: 'temp-' + Date.now() });
    await store.updateBudget(budget);
    return entry;
  },
  deleteIncome: async (eventId: string, incomeId: string) => {
    const budget = await store.fetchBudget(eventId);
    budget.income = budget.income.filter((i: any) => i.id !== incomeId && i._id !== incomeId);
    await store.updateBudget(budget);
  },
  deleteExpense: async (eventId: string, expenseId: string) => {
    const budget = await store.fetchBudget(eventId);
    budget.expenses = budget.expenses.filter((e: any) => e.id !== expenseId && e._id !== expenseId);
    await store.updateBudget(budget);
  },

  // Persistence helpers
  resetData: async () => {
    // This would need a specific backend route to drop collections
    // For now, we just reload
    window.location.reload();
  }
};

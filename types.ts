
export interface Member {
  id: string;
  name: string;
  phone: string;
  instagram: string;
  imageUrl: string;
}

export enum EventStatus {
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED'
}

export interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  venue: string;
  status: EventStatus;
}

export interface IncomeEntry {
  id: string;
  contributor: string;
  amount: number;
  date: string;
}

export interface ExpenseEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Budget {
  eventId: string;
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface AppState {
  members: Member[];
  events: Event[];
  budgets: Budget[];
  admins: AdminUser[];
}

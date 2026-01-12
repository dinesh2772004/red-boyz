
import React from 'react';
// Import EventStatus and other types to fix type assignment errors in store.ts
import { EventStatus, Member, Event, Budget } from './types';

export const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Arun Kumar', phone: '9876543210', instagram: 'arun_redboys', imageUrl: 'https://picsum.photos/seed/arun/400' },
  { id: '2', name: 'Vijay S.', phone: '9876543211', instagram: 'vijay_redboys', imageUrl: 'https://picsum.photos/seed/vijay/400' },
  { id: '3', name: 'Manoj R.', phone: '9876543212', instagram: 'manoj_redboys', imageUrl: 'https://picsum.photos/seed/manoj/400' },
  { id: '4', name: 'Suresh Raina', phone: '9876543213', instagram: 'suresh_redboys', imageUrl: 'https://picsum.photos/seed/suresh/400' },
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    name: 'Pongal Celebration 2025',
    date: '2025-01-14',
    description: 'Annual village pongal feast and games for the youth.',
    venue: 'Village Ground, Madurai',
    status: EventStatus.UPCOMING
  },
  {
    id: 'e2',
    name: 'Kabaddi Tournament',
    date: '2024-12-15',
    description: 'Friendly inter-village kabaddi tournament sponsored by Red Boys.',
    venue: 'Community Park',
    status: EventStatus.COMPLETED
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    eventId: 'e2',
    income: [
      { id: 'i1', contributor: 'Member Fund', amount: 5000, date: '2024-12-10' },
      { id: 'i2', contributor: 'Village Elder Donation', amount: 2000, date: '2024-12-12' },
    ],
    expenses: [
      { id: 'ex1', description: 'Trophy Purchase', amount: 1500, date: '2024-12-14' },
      { id: 'ex2', description: 'Snacks & Drinks', amount: 3000, date: '2024-12-15' },
    ]
  }
];

export const TAMIL_ORNAMENT = (
  <svg className="w-8 h-8 opacity-20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM4 12C2.9 12 2 12.9 2 14C2 15.1 2.9 16 4 16C5.1 16 6 15.1 6 14C6 12.9 5.1 12 4 12ZM20 12C18.9 12 18 12.9 18 14C18 15.1 18.9 16 20 16C21.1 16 22 15.1 22 14C22 12.9 21.1 12 20 12ZM12 18C10.9 18 10 18.9 10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20C14 18.9 13.1 18 12 18Z" />
  </svg>
);

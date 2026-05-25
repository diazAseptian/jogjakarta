export type UserRole = 'admin' | 'user';
export type TripRole = 'owner' | 'editor' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}

export interface TripMember {
  uid: string;
  email: string;
  displayName: string;
  role: TripRole;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TripActivity {
  id: string;
  time: string;
  place: string;
  transport: string;
  notes: string;
  checklist: ChecklistItem[];
}

export interface TripDay {
  id: string;
  day: number;
  date: string;
  activities: TripActivity[];
}

export interface BudgetItem {
  id: string;
  category: 'transport' | 'hotel' | 'tiket' | 'makan' | 'darurat' | 'lainnya';
  label: string;
  amount: number;
  paidBy: string;
  splitWith: string[];
  source?: string; // sumber/asal dana
  storage?: 'cash' | 'saldo'; // disimpan di mana: cash atau saldo
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  category: string;
  paidBy: string;
  proofUrl?: string;
  createdAt: string;
  source?: string;
  storage?: 'cash' | 'saldo';
}

export interface Trip {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  description: string;
  ownerId: string;
  members: TripMember[];
  days: TripDay[];
  budget: BudgetItem[];
  expenses: Expense[];
  isPublic: boolean;
  isFeatured: boolean;
  coverImage?: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  uid: string;
  name: string;
  location: string;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface TripPhoto {
  id: string;
  tripId: string;
  uid: string;
  url: string;
  caption?: string;
  createdAt: string;
}

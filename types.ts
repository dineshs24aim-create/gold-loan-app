
export interface User {
  id: string;
  username: string;
  role: 'appraiser' | 'admin';
}

export interface Bank {
  id: string;
  name: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  bankId: string;
  bankName?: string;
  date: string;
  amount: number | null;
  customerName: string | null;
  notes: string | null;
  createdAt: string;
}

export interface DashboardStats {
  todayCount: number;
  monthCount: number;
  overallCount: number;
  bankWise: { bankName: string; count: number }[];
}

export type TimeRange = 'daily' | 'monthly' | 'overall';

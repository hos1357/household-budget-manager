export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string; // ISO date string
  jalaliDate: string; // Jalali date string
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  date: string;
  jalaliDate: string;
  description?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  monthlyTarget: number;
  currentBalance: number;
  month: string; // Jalali month string (e.g., "1403/09")
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  searchQuery?: string;
}

export interface DashboardStats {
  totalExpenses: number;
  todayExpenses: number;
  weeklyExpenses: number;
  monthlyExpenses: number;
  categoryBreakdown: { categoryId: string; amount: number; percentage: number }[];
  dailyTrend: { date: string; amount: number }[];
}

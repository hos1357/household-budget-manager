import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Category, Expense, Income, Budget, ExpenseFilter, DashboardStats } from '@/types/expense';
import * as storage from '@/lib/storage';
import { isToday, isThisWeek, isThisMonth, getJalaliMonth } from '@/lib/jalali';

interface AppContextType {
  // Data
  categories: Category[];
  expenses: Expense[];
  incomes: Income[];
  currentBudget: Budget | null;
  
  // Stats
  dashboardStats: DashboardStats;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'order'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'jalaliDate'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Income actions
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'jalaliDate'>) => void;
  deleteIncome: (id: string) => void;
  
  // Budget actions
  setMonthlyBudget: (amount: number) => void;
  
  // Filter
  filterExpenses: (filter: ExpenseFilter) => Expense[];
  
  // Refresh
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalExpenses: 0,
    todayExpenses: 0,
    weeklyExpenses: 0,
    monthlyExpenses: 0,
    categoryBreakdown: [],
    dailyTrend: [],
  });

  const refreshData = useCallback(() => {
    setCategories(storage.getCategories());
    setExpenses(storage.getExpenses());
    setIncomes(storage.getIncomes());
    setCurrentBudget(storage.getCurrentBudget());
  }, []);

  const calculateStats = useCallback(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const todayExpenses = expenses
      .filter(e => isToday(new Date(e.date)))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const weeklyExpenses = expenses
      .filter(e => isThisWeek(new Date(e.date)))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const monthlyExpenses = expenses
      .filter(e => isThisMonth(new Date(e.date)))
      .reduce((sum, e) => sum + e.amount, 0);
    
    // Category breakdown
    const categoryTotals = new Map<string, number>();
    expenses.forEach(e => {
      const current = categoryTotals.get(e.categoryId) || 0;
      categoryTotals.set(e.categoryId, current + e.amount);
    });
    
    const categoryBreakdown = Array.from(categoryTotals.entries()).map(([categoryId, amount]) => ({
      categoryId,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
    
    // Daily trend (last 7 days)
    const dailyTrend: { date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const amount = expenses
        .filter(e => e.date.startsWith(dateStr))
        .reduce((sum, e) => sum + e.amount, 0);
      dailyTrend.push({ date: dateStr, amount });
    }
    
    setDashboardStats({
      totalExpenses,
      todayExpenses,
      weeklyExpenses,
      monthlyExpenses,
      categoryBreakdown,
      dailyTrend,
    });
  }, [expenses]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Category actions
  const addCategory = (category: Omit<Category, 'id' | 'order'>) => {
    storage.addCategory(category);
    refreshData();
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    storage.updateCategory(id, updates);
    refreshData();
  };

  const deleteCategory = (id: string) => {
    storage.deleteCategory(id);
    refreshData();
  };

  const reorderCategories = (newCategories: Category[]) => {
    const reordered = newCategories.map((c, index) => ({ ...c, order: index }));
    storage.saveCategories(reordered);
    refreshData();
  };

  // Expense actions
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'jalaliDate'>) => {
    storage.addExpense(expense);
    refreshData();
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    storage.updateExpense(id, updates);
    refreshData();
  };

  const deleteExpense = (id: string) => {
    storage.deleteExpense(id);
    refreshData();
  };

  // Income actions
  const addIncome = (income: Omit<Income, 'id' | 'createdAt' | 'jalaliDate'>) => {
    storage.addIncome(income);
    refreshData();
  };

  const deleteIncome = (id: string) => {
    storage.deleteIncome(id);
    refreshData();
  };

  // Budget actions
  const setMonthlyBudgetAction = (amount: number) => {
    storage.setMonthlyBudget(amount);
    refreshData();
  };

  // Filter expenses
  const filterExpenses = (filter: ExpenseFilter): Expense[] => {
    let filtered = [...expenses];
    
    if (filter.startDate) {
      filtered = filtered.filter(e => e.date >= filter.startDate!);
    }
    
    if (filter.endDate) {
      filtered = filtered.filter(e => e.date <= filter.endDate!);
    }
    
    if (filter.categoryIds && filter.categoryIds.length > 0) {
      filtered = filtered.filter(e => filter.categoryIds!.includes(e.categoryId));
    }
    
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  return (
    <AppContext.Provider
      value={{
        categories,
        expenses,
        incomes,
        currentBudget,
        dashboardStats,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        deleteIncome,
        setMonthlyBudget: setMonthlyBudgetAction,
        filterExpenses,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import type { Category, Expense, Income, Budget } from '@/types/expense';
import { generateId } from './format';
import { formatJalaliDate, getJalaliMonth } from './jalali';

const STORAGE_KEYS = {
  EXPENSES: 'tankhah_expenses',
  CATEGORIES: 'tankhah_categories',
  INCOMES: 'tankhah_incomes',
  BUDGETS: 'tankhah_budgets',
};

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'خوراک', icon: 'UtensilsCrossed', color: '#D4A574', order: 0 },
  { id: '2', name: 'حمل‌ونقل', icon: 'Car', color: '#1B5E4F', order: 1 },
  { id: '3', name: 'قبض‌ها', icon: 'Receipt', color: '#C65D3B', order: 2 },
  { id: '4', name: 'تعمیرات', icon: 'Wrench', color: '#6366F1', order: 3 },
  { id: '5', name: 'خرید خانه', icon: 'ShoppingBag', color: '#EC4899', order: 4 },
  { id: '6', name: 'بهداشت و درمان', icon: 'Heart', color: '#EF4444', order: 5 },
  { id: '7', name: 'تفریح', icon: 'Gamepad2', color: '#8B5CF6', order: 6 },
  { id: '8', name: 'سایر', icon: 'MoreHorizontal', color: '#6B7280', order: 7 },
];

// Categories
export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  return defaultCategories;
};

export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const addCategory = (category: Omit<Category, 'id' | 'order'>): Category => {
  const categories = getCategories();
  const newCategory: Category = {
    ...category,
    id: generateId(),
    order: categories.length,
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
};

export const updateCategory = (id: string, updates: Partial<Category>): Category | null => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;
  categories[index] = { ...categories[index], ...updates };
  saveCategories(categories);
  return categories[index];
};

export const deleteCategory = (id: string): boolean => {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  if (filtered.length === categories.length) return false;
  saveCategories(filtered);
  return true;
};

// Expenses
export const getExpenses = (): Expense[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return stored ? JSON.parse(stored) : [];
};

export const saveExpenses = (expenses: Expense[]): void => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'jalaliDate'>): Expense => {
  const expenses = getExpenses();
  const now = new Date().toISOString();
  const newExpense: Expense = {
    ...expense,
    id: generateId(),
    jalaliDate: formatJalaliDate(new Date(expense.date)),
    createdAt: now,
    updatedAt: now,
  };
  expenses.unshift(newExpense);
  saveExpenses(expenses);
  return newExpense;
};

export const updateExpense = (id: string, updates: Partial<Expense>): Expense | null => {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  const updatedExpense = {
    ...expenses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  if (updates.date) {
    updatedExpense.jalaliDate = formatJalaliDate(new Date(updates.date));
  }
  
  expenses[index] = updatedExpense;
  saveExpenses(expenses);
  return updatedExpense;
};

export const deleteExpense = (id: string): boolean => {
  const expenses = getExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  if (filtered.length === expenses.length) return false;
  saveExpenses(filtered);
  return true;
};

// Incomes
export const getIncomes = (): Income[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.INCOMES);
  return stored ? JSON.parse(stored) : [];
};

export const saveIncomes = (incomes: Income[]): void => {
  localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
};

export const addIncome = (income: Omit<Income, 'id' | 'createdAt' | 'jalaliDate'>): Income => {
  const incomes = getIncomes();
  const newIncome: Income = {
    ...income,
    id: generateId(),
    jalaliDate: formatJalaliDate(new Date(income.date)),
    createdAt: new Date().toISOString(),
  };
  incomes.unshift(newIncome);
  saveIncomes(incomes);
  return newIncome;
};

export const deleteIncome = (id: string): boolean => {
  const incomes = getIncomes();
  const filtered = incomes.filter(i => i.id !== id);
  if (filtered.length === incomes.length) return false;
  saveIncomes(filtered);
  return true;
};

// Budgets
export const getBudgets = (): Budget[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  return stored ? JSON.parse(stored) : [];
};

export const saveBudgets = (budgets: Budget[]): void => {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};

export const getCurrentBudget = (): Budget | null => {
  const budgets = getBudgets();
  const currentMonth = getJalaliMonth(new Date());
  return budgets.find(b => b.month === currentMonth) || null;
};

export const setMonthlyBudget = (monthlyTarget: number): Budget => {
  const budgets = getBudgets();
  const currentMonth = getJalaliMonth(new Date());
  const existingIndex = budgets.findIndex(b => b.month === currentMonth);
  
  const budget: Budget = {
    id: existingIndex >= 0 ? budgets[existingIndex].id : generateId(),
    monthlyTarget,
    currentBalance: calculateCurrentBalance(),
    month: currentMonth,
  };
  
  if (existingIndex >= 0) {
    budgets[existingIndex] = budget;
  } else {
    budgets.push(budget);
  }
  
  saveBudgets(budgets);
  return budget;
};

export const calculateCurrentBalance = (): number => {
  const incomes = getIncomes();
  const expenses = getExpenses();
  
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return totalIncome - totalExpense;
};

export const calculateMonthlyExpenses = (): number => {
  const expenses = getExpenses();
  const currentMonth = getJalaliMonth(new Date());
  
  return expenses
    .filter(e => e.jalaliDate.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);
};

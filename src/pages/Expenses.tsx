import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Edit2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/format';
import { formatJalaliDateFull } from '@/lib/jalali';
import { ExpenseModal } from '@/components/expense/ExpenseModal';
import { CategoryIcon } from '@/components/expense/CategoryIcon';
import { useToast } from '@/components/ui/use-toast';
import type { Expense } from '@/types/expense';

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export const Expenses: React.FC = () => {
  const { expenses, categories, deleteExpense } = useApp();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(e => e.categoryId === selectedCategory);
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
    
    return result;
  }, [expenses, searchQuery, selectedCategory, sortBy]);

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      toast({
        title: 'حذف شد',
        description: 'هزینه با موفقیت حذف شد',
      });
    }
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  const handleModalClose = (open: boolean) => {
    setExpenseModalOpen(open);
    if (!open) {
      setEditingExpense(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            هزینه‌ها
          </h1>
          <p className="text-base text-muted-foreground">
            مدیریت و مشاهده تمام هزینه‌ها
          </p>
        </div>
        <Button 
          onClick={() => setExpenseModalOpen(true)}
          className="h-12 px-6 shadow-card hover:shadow-card-hover transition-all"
        >
          <Plus className="w-5 h-5 ml-2" />
          ثبت هزینه جدید
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="جستجو در هزینه‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-12 text-base"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-56 h-12">
                <SelectValue placeholder="دسته‌بندی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دسته‌ها</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-56 h-12">
                <SelectValue placeholder="مرتب‌سازی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">جدیدترین</SelectItem>
                <SelectItem value="date-asc">قدیمی‌ترین</SelectItem>
                <SelectItem value="amount-desc">بیشترین مبلغ</SelectItem>
                <SelectItem value="amount-asc">کمترین مبلغ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          {filteredExpenses.length} هزینه
        </p>
        <p className="text-sm font-medium">
          مجموع: {formatCurrency(totalFiltered)}
        </p>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground text-base">
                {searchQuery || selectedCategory !== 'all'
                  ? 'هزینه‌ای با این فیلترها یافت نشد'
                  : 'هنوز هزینه‌ای ثبت نشده است'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => {
            const category = categoryMap.get(expense.categoryId);
            
            return (
              <Card
                key={expense.id}
                className="shadow-card hover:shadow-card-hover transition-all duration-300 border-0"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: category ? `${category.color}20` : '#e5e7eb' }}
                    >
                      {category && (
                        <CategoryIcon
                          icon={category.icon}
                          className="w-7 h-7"
                          style={{ color: category.color }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg text-foreground truncate">
                        {expense.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category?.name} • {formatJalaliDateFull(new Date(expense.date))}
                      </p>
                      {expense.description && (
                        <p className="text-sm text-muted-foreground mt-2 truncate">
                          {expense.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-extrabold text-xl text-foreground whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                          className="h-10 w-10 hover:bg-secondary"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(expense)}
                          className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        open={expenseModalOpen}
        onOpenChange={handleModalClose}
        expense={editingExpense}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف هزینه</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این هزینه اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Action Button (Mobile) */}
      <Button
        onClick={() => setExpenseModalOpen(true)}
        className="lg:hidden fixed bottom-24 left-4 w-14 h-14 rounded-full shadow-float z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

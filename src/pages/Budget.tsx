import React, { useState } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, formatNumber, parseNumber, formatInputNumber } from '@/lib/format';
import { formatJalaliDateFull, getJalaliMonthName, toJalali } from '@/lib/jalali';
import { JalaliDatePicker } from '@/components/ui/jalali-date-picker';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Income } from '@/types/expense';

export const Budget: React.FC = () => {
  const { 
    incomes, 
    currentBudget, 
    dashboardStats,
    addIncome, 
    deleteIncome,
    setMonthlyBudget 
  } = useApp();
  const { toast } = useToast();
  
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  
  // Income form
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState<Date>(new Date());
  const [incomeDescription, setIncomeDescription] = useState('');
  
  // Budget form
  const [budgetAmount, setBudgetAmount] = useState('');

  const today = new Date();
  const { jm, jy } = toJalali(today);
  
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = dashboardStats.totalExpenses;
  const balance = totalIncome - totalExpense;
  
  const monthlyTarget = currentBudget?.monthlyTarget || 0;
  const monthlyExpense = dashboardStats.monthlyExpenses;
  const budgetProgress = monthlyTarget > 0 ? (monthlyExpense / monthlyTarget) * 100 : 0;
  const isOverBudget = budgetProgress > 100;
  const isNearLimit = budgetProgress >= 80 && budgetProgress <= 100;

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseNumber(incomeAmount);
    if (!incomeTitle.trim() || amount <= 0) {
      toast({
        title: 'خطا',
        description: 'لطفاً عنوان و مبلغ معتبر وارد کنید',
        variant: 'destructive',
      });
      return;
    }
    
    addIncome({
      title: incomeTitle.trim(),
      amount,
      date: incomeDate.toISOString(),
      description: incomeDescription.trim() || undefined,
    });
    
    toast({
      title: 'موفق',
      description: 'درآمد با موفقیت ثبت شد',
    });
    
    setIncomeModalOpen(false);
    setIncomeTitle('');
    setIncomeAmount('');
    setIncomeDate(new Date());
    setIncomeDescription('');
  };

  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseNumber(budgetAmount);
    if (amount <= 0) {
      toast({
        title: 'خطا',
        description: 'لطفاً مبلغ معتبر وارد کنید',
        variant: 'destructive',
      });
      return;
    }
    
    setMonthlyBudget(amount);
    
    toast({
      title: 'موفق',
      description: 'بودجه ماهانه تنظیم شد',
    });
    
    setBudgetModalOpen(false);
    setBudgetAmount('');
  };

  const handleDeleteClick = (income: Income) => {
    setIncomeToDelete(income);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (incomeToDelete) {
      deleteIncome(incomeToDelete.id);
      toast({
        title: 'حذف شد',
        description: 'درآمد با موفقیت حذف شد',
      });
    }
    setDeleteDialogOpen(false);
    setIncomeToDelete(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            مدیریت تنخواه
          </h1>
          <p className="text-base text-muted-foreground">
            {getJalaliMonthName(jm)} {jy}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setBudgetModalOpen(true)}
            className="h-12 px-6"
          >
            تنظیم بودجه
          </Button>
          <Button 
            onClick={() => setIncomeModalOpen(true)}
            className="h-12 px-6 shadow-card hover:shadow-card-hover transition-all"
          >
            <Plus className="w-5 h-5 ml-2" />
            ثبت درآمد
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card className="shadow-card border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-emerald/10">
                <TrendingUp className="w-7 h-7 text-emerald" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">کل درآمد</p>
                <p className="text-2xl lg:text-3xl font-extrabold text-emerald">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-terracotta/10">
                <TrendingDown className="w-7 h-7 text-terracotta" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">کل هزینه</p>
                <p className="text-2xl lg:text-3xl font-extrabold text-terracotta">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-4 rounded-2xl',
                balance >= 0 ? 'bg-emerald/10' : 'bg-terracotta/10'
              )}>
                <Wallet className={cn(
                  'w-7 h-7',
                  balance >= 0 ? 'text-emerald' : 'text-terracotta'
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">موجودی</p>
                <p className={cn(
                  'text-2xl lg:text-3xl font-extrabold',
                  balance >= 0 ? 'text-emerald' : 'text-terracotta'
                )}>
                  {formatCurrency(Math.abs(balance))}
                  {balance < 0 && ' -'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Budget Progress */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            بودجه ماهانه
            {isOverBudget && (
              <AlertTriangle className="w-5 h-5 text-terracotta" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {monthlyTarget > 0 ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  هزینه شده: {formatCurrency(monthlyExpense)}
                </span>
                <span className="text-muted-foreground">
                  بودجه: {formatCurrency(monthlyTarget)}
                </span>
              </div>
              <Progress
                value={Math.min(budgetProgress, 100)}
                className={cn(
                  'h-3',
                  isOverBudget && '[&>div]:bg-terracotta',
                  isNearLimit && '[&>div]:bg-warning'
                )}
              />
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-sm font-medium',
                  isOverBudget ? 'text-terracotta' : isNearLimit ? 'text-warning' : 'text-emerald'
                )}>
                  {isOverBudget
                    ? `${formatCurrency(monthlyExpense - monthlyTarget)} بیشتر از بودجه`
                    : `${formatCurrency(monthlyTarget - monthlyExpense)} باقی‌مانده`}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(budgetProgress)}%
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                هنوز بودجه ماهانه تنظیم نشده است
              </p>
              <Button variant="outline" onClick={() => setBudgetModalOpen(true)}>
                تنظیم بودجه
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>تاریخچه درآمدها</CardTitle>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              هنوز درآمدی ثبت نشده است
            </p>
          ) : (
            <div className="space-y-3">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30"
                >
                  <div className="p-2 rounded-lg bg-emerald/10">
                    <TrendingUp className="w-5 h-5 text-emerald" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {income.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatJalaliDateFull(new Date(income.date))}
                    </p>
                  </div>
                  <p className="font-bold text-emerald whitespace-nowrap">
                    +{formatCurrency(income.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(income)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Income Modal */}
      <Dialog open={incomeModalOpen} onOpenChange={setIncomeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ثبت درآمد جدید</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddIncome} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="income-title">عنوان</Label>
              <Input
                id="income-title"
                value={incomeTitle}
                onChange={(e) => setIncomeTitle(e.target.value)}
                placeholder="مثال: حقوق ماهانه"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-amount">مبلغ (تومان)</Label>
              <Input
                id="income-amount"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(formatInputNumber(e.target.value))}
                placeholder="۰"
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label>تاریخ</Label>
              <JalaliDatePicker
                selected={incomeDate}
                onSelect={setIncomeDate}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                ثبت درآمد
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIncomeModalOpen(false)}
              >
                انصراف
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Budget Modal */}
      <Dialog open={budgetModalOpen} onOpenChange={setBudgetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تنظیم بودجه ماهانه</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetBudget} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget-amount">بودجه ماهانه (تومان)</Label>
              <Input
                id="budget-amount"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(formatInputNumber(e.target.value))}
                placeholder={currentBudget ? formatNumber(currentBudget.monthlyTarget) : '۰'}
                dir="ltr"
                className="text-left"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              این مبلغ به عنوان سقف هزینه‌های ماهانه شما در نظر گرفته می‌شود.
            </p>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                ذخیره
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBudgetModalOpen(false)}
              >
                انصراف
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف درآمد</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این درآمد اطمینان دارید؟ این عمل قابل بازگشت نیست.
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
    </div>
  );
};

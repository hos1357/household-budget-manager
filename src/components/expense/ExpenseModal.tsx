import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { JalaliDatePicker } from '@/components/ui/jalali-date-picker';
import { CategorySelector } from './CategorySelector';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/use-toast';
import { parseNumber, formatNumber, formatInputNumber } from '@/lib/format';
import type { Expense } from '@/types/expense';

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  open,
  onOpenChange,
  expense,
}) => {
  const { addExpense, updateExpense, categories } = useApp();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(formatNumber(expense.amount));
      setCategoryId(expense.categoryId);
      setDate(new Date(expense.date));
      setDescription(expense.description || '');
    } else {
      setTitle('');
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setDate(new Date());
      setDescription('');
    }
  }, [expense, categories, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseNumber(amount);
    
    if (!title.trim()) {
      toast({
        title: 'خطا',
        description: 'لطفاً عنوان هزینه را وارد کنید',
        variant: 'destructive',
      });
      return;
    }
    
    if (parsedAmount <= 0) {
      toast({
        title: 'خطا',
        description: 'لطفاً مبلغ معتبر وارد کنید',
        variant: 'destructive',
      });
      return;
    }
    
    if (!categoryId) {
      toast({
        title: 'خطا',
        description: 'لطفاً دسته‌بندی را انتخاب کنید',
        variant: 'destructive',
      });
      return;
    }

    if (expense) {
      updateExpense(expense.id, {
        title: title.trim(),
        amount: parsedAmount,
        categoryId,
        date: date.toISOString(),
        description: description.trim() || undefined,
      });
      toast({
        title: 'موفق',
        description: 'هزینه با موفقیت ویرایش شد',
      });
    } else {
      addExpense({
        title: title.trim(),
        amount: parsedAmount,
        categoryId,
        date: date.toISOString(),
        description: description.trim() || undefined,
      });
      toast({
        title: 'موفق',
        description: 'هزینه با موفقیت ثبت شد',
      });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-0 shadow-float">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-right text-2xl font-bold">
            {expense ? 'ویرایش هزینه' : 'ثبت هزینه جدید'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-semibold">عنوان</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: خرید میوه"
              className="text-right h-12 text-base"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-base font-semibold">مبلغ (تومان)</Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(formatInputNumber(e.target.value))}
              placeholder="۰"
              className="text-left font-mono h-12 text-lg"
              dir="ltr"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-semibold">دسته‌بندی</Label>
            <CategorySelector
              selected={categoryId}
              onSelect={setCategoryId}
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-semibold">تاریخ</Label>
            <JalaliDatePicker
              selected={date}
              onSelect={setDate}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-semibold">توضیحات (اختیاری)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات اضافی..."
              className="text-right resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 h-12 text-base font-semibold shadow-card hover:shadow-card-hover transition-all">
              {expense ? 'ذخیره تغییرات' : 'ثبت هزینه'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 px-6"
            >
              انصراف
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

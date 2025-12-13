import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/format';
import { formatJalaliDateFull } from '@/lib/jalali';
import { CategoryIcon } from '@/components/expense/CategoryIcon';

export const RecentExpenses: React.FC = () => {
  const { expenses, categories } = useApp();
  const navigate = useNavigate();
  
  const recentExpenses = expenses.slice(0, 5);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">آخرین هزینه‌ها</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/expenses')}
          className="text-muted-foreground hover:text-foreground"
        >
          مشاهده همه
          <ArrowLeft className="w-4 h-4 mr-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {recentExpenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            هنوز هزینه‌ای ثبت نشده است
          </p>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => {
              const category = categoryMap.get(expense.categoryId);
              
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: category ? `${category.color}20` : '#e5e7eb' }}
                  >
                    {category && (
                      <CategoryIcon
                        icon={category.icon}
                        className="w-5 h-5"
                        style={{ color: category.color }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {expense.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {category?.name} • {formatJalaliDateFull(new Date(expense.date))}
                    </p>
                  </div>
                  <p className="font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

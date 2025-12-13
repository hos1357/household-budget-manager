import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, formatCompactCurrency } from '@/lib/format';
import { formatJalaliDateFull, getJalaliMonthName, toJalali } from '@/lib/jalali';
import { ExpenseModal } from '@/components/expense/ExpenseModal';
import { CategoryIcon } from '@/components/expense/CategoryIcon';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { RecentExpenses } from '@/components/dashboard/RecentExpenses';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const { dashboardStats, categories, currentBudget, expenses } = useApp();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  
  const today = new Date();
  const { jm, jy } = toJalali(today);
  
  const balance = currentBudget?.currentBalance ?? 
    (expenses.length > 0 ? -dashboardStats.totalExpenses : 0);

  const stats = [
    {
      title: 'هزینه امروز',
      value: dashboardStats.todayExpenses,
      icon: Calendar,
      color: 'text-saffron',
      bgColor: 'bg-saffron/10',
    },
    {
      title: 'هزینه این هفته',
      value: dashboardStats.weeklyExpenses,
      icon: TrendingUp,
      color: 'text-emerald',
      bgColor: 'bg-emerald/10',
    },
    {
      title: 'هزینه این ماه',
      value: dashboardStats.monthlyExpenses,
      icon: TrendingDown,
      color: 'text-terracotta',
      bgColor: 'bg-terracotta/10',
    },
    {
      title: 'موجودی',
      value: balance,
      icon: Wallet,
      color: balance >= 0 ? 'text-emerald' : 'text-terracotta',
      bgColor: balance >= 0 ? 'bg-emerald/10' : 'bg-terracotta/10',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            داشبورد
          </h1>
          <p className="text-base text-muted-foreground">
            {formatJalaliDateFull(today)} - {getJalaliMonthName(jm)} {jy}
          </p>
        </div>
        <Button
          onClick={() => setExpenseModalOpen(true)}
          className="bg-primary hover:bg-primary/90 shadow-card hover:shadow-card-hover transition-all duration-300 animate-pulse-gentle h-12 px-6"
        >
          <Plus className="w-5 h-5 ml-2" />
          ثبت هزینه جدید
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className={cn(
              'animate-slide-up shadow-card hover:shadow-card-hover transition-all duration-300 border-0',
              `stagger-${index + 1}`
            )}
          >
            <CardContent className="p-6 lg:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className={cn('p-3 rounded-2xl', stat.bgColor)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                <p className={cn(
                  'text-2xl lg:text-3xl font-extrabold',
                  stat.title === 'موجودی' ? stat.color : 'text-foreground'
                )}>
                  {formatCompactCurrency(Math.abs(stat.value))}
                  {stat.title === 'موجودی' && stat.value < 0 && ' -'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-8 shadow-card animate-fade-in border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold">روند هزینه‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart data={dashboardStats.dailyTrend} />
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-4 shadow-card animate-fade-in border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold">دسته‌بندی هزینه‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {dashboardStats.categoryBreakdown.slice(0, 5).map((item) => {
                const category = categories.find(c => c.id === item.categoryId);
                if (!category) return null;
                
                return (
                  <div key={item.categoryId} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <CategoryIcon
                            icon={category.icon}
                            className="w-5 h-5"
                            style={{ color: category.color }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {formatCompactCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {dashboardStats.categoryBreakdown.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  هنوز هزینه‌ای ثبت نشده است
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <RecentExpenses />

      {/* Expense Modal */}
      <ExpenseModal
        open={expenseModalOpen}
        onOpenChange={setExpenseModalOpen}
      />

      {/* Floating Action Button (Mobile) */}
      <Button
        onClick={() => setExpenseModalOpen(true)}
        className="lg:hidden fixed bottom-24 left-4 w-14 h-14 rounded-full shadow-float animate-pulse-gentle z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

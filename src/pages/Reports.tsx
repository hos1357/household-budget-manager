import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, FileText, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/format';
import { formatJalaliDateFull, formatJalaliDate } from '@/lib/jalali';
import { JalaliCalendar } from '@/components/ui/jalali-calendar';
import { CategoryIcon } from '@/components/expense/CategoryIcon';
import { exportToExcel, exportToPDF } from '@/lib/export';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Reports: React.FC = () => {
  const { expenses, categories } = useApp();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    
    if (startDate) {
      result = result.filter(e => new Date(e.date) >= startDate);
    }
    
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(e => new Date(e.date) <= endOfDay);
    }
    
    if (selectedCategories.length > 0) {
      result = result.filter(e => selectedCategories.includes(e.categoryId));
    }
    
    return result;
  }, [expenses, startDate, endDate, selectedCategories]);

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown for pie chart
  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    filteredExpenses.forEach(e => {
      const current = totals.get(e.categoryId) || 0;
      totals.set(e.categoryId, current + e.amount);
    });
    
    return Array.from(totals.entries())
      .map(([categoryId, amount]) => {
        const category = categoryMap.get(categoryId);
        return {
          name: category?.name || 'نامشخص',
          value: amount,
          color: category?.color || '#6B7280',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categoryMap]);

  // Daily breakdown for bar chart
  const dailyBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    filteredExpenses.forEach(e => {
      const dateKey = e.date.split('T')[0];
      const current = totals.get(dateKey) || 0;
      totals.set(dateKey, current + e.amount);
    });
    
    return Array.from(totals.entries())
      .map(([date, amount]) => ({
        date,
        label: formatJalaliDate(new Date(date)).split('/').slice(1).join('/'),
        amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  }, [filteredExpenses]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExportExcel = () => {
    if (filteredExpenses.length === 0) {
      toast({
        title: 'خطا',
        description: 'داده‌ای برای خروجی وجود ندارد',
        variant: 'destructive',
      });
      return;
    }
    
    exportToExcel(filteredExpenses, categories);
    toast({
      title: 'موفق',
      description: 'فایل Excel با موفقیت دانلود شد',
    });
  };

  const handleExportPDF = () => {
    if (filteredExpenses.length === 0) {
      toast({
        title: 'خطا',
        description: 'داده‌ای برای خروجی وجود ندارد',
        variant: 'destructive',
      });
      return;
    }
    
    exportToPDF(filteredExpenses, categories);
    toast({
      title: 'موفق',
      description: 'فایل PDF با موفقیت دانلود شد',
    });
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedCategories([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            گزارش‌ها
          </h1>
          <p className="text-base text-muted-foreground">
            تحلیل و خروجی هزینه‌ها
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            className="h-12 px-6"
          >
            <FileSpreadsheet className="w-5 h-5 ml-2" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="h-12 px-6"
          >
            <FileText className="w-5 h-5 ml-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            فیلترها
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label>از تاریخ</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 ml-2" />
                    {startDate ? formatJalaliDateFull(startDate) : 'انتخاب کنید'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <JalaliCalendar
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 space-y-2">
              <Label>تا تاریخ</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 ml-2" />
                    {endDate ? formatJalaliDateFull(endDate) : 'انتخاب کنید'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <JalaliCalendar
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>دسته‌بندی‌ها</Label>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(startDate || endDate || selectedCategories.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              پاک کردن فیلترها
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">تعداد هزینه‌ها</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {filteredExpenses.length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">مجموع هزینه‌ها</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">روند روزانه</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyBreakdown.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-card">
                              <p className="text-lg font-bold text-primary">
                                {formatCurrency(payload[0].value as number)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#D4A574"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                داده‌ای برای نمایش وجود ندارد
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">سهم دسته‌بندی‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-card">
                              <p className="text-sm font-medium">{data.name}</p>
                              <p className="text-lg font-bold" style={{ color: data.color }}>
                                {formatCurrency(data.value)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {categoryBreakdown.slice(0, 5).map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                داده‌ای برای نمایش وجود ندارد
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">لیست هزینه‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              هزینه‌ای با این فیلترها یافت نشد
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredExpenses.map((expense) => {
                const category = categoryMap.get(expense.categoryId);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: category ? `${category.color}20` : '#e5e7eb' }}
                    >
                      {category && (
                        <CategoryIcon
                          icon={category.icon}
                          className="w-4 h-4"
                          style={{ color: category.color }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{expense.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatJalaliDateFull(new Date(expense.date))}
                      </p>
                    </div>
                    <p className="font-bold text-sm whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

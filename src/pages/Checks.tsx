import React, { useState, useEffect } from 'react';
import { Plus, FileText, AlertCircle, CheckCircle, XCircle, Clock, AlertTriangle, Bell, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { formatJalaliDateFull } from '@/lib/jalali';
import { CheckModal } from '@/components/check/CheckModal';
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
import { useToast } from '@/components/ui/use-toast';
import type { Check } from '@/types/check';

// Helper function to calculate days until due date
const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get warning level based on days until due
const getWarningLevel = (daysUntilDue: number): 'critical' | 'warning' | 'info' | 'none' => {
  if (daysUntilDue < 0) return 'critical'; // Overdue
  if (daysUntilDue <= 1) return 'critical'; // 1 day or less
  if (daysUntilDue <= 3) return 'warning'; // 2-3 days
  if (daysUntilDue <= 7) return 'info'; // 4-7 days
  return 'none';
};

export const Checks: React.FC = () => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upcomingChecks, setUpcomingChecks] = useState<Check[]>([]);
  const [editingCheck, setEditingCheck] = useState<Check | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checkToDelete, setCheckToDelete] = useState<Check | null>(null);
  const { toast } = useToast();

  // Filter checks that are due within 7 days
  useEffect(() => {
    const upcoming = checks.filter(check => {
      if (check.status !== 'pending') return false;
      const daysUntilDue = getDaysUntilDue(check.dueDate);
      return daysUntilDue <= 7;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    setUpcomingChecks(upcoming);
  }, [checks]);

  const handleSaveCheck = (checkData: Omit<Check, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCheck) {
      // Update existing check
      setChecks(checks.map(c => 
        c.id === editingCheck.id 
          ? { ...c, ...checkData, updatedAt: new Date().toISOString() }
          : c
      ));
      toast({
        title: 'موفق',
        description: 'چک با موفقیت ویرایش شد',
      });
    } else {
      // Add new check
      const newCheck: Check = {
        ...checkData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setChecks([...checks, newCheck]);
      toast({
        title: 'موفق',
        description: 'چک با موفقیت ثبت شد',
      });
    }
    setEditingCheck(null);
  };

  const handleEdit = (check: Check) => {
    setEditingCheck(check);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (check: Check) => {
    setCheckToDelete(check);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (checkToDelete) {
      setChecks(checks.filter(c => c.id !== checkToDelete.id));
      toast({
        title: 'حذف شد',
        description: 'چک با موفقیت حذف شد',
      });
    }
    setDeleteDialogOpen(false);
    setCheckToDelete(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCheck(null);
  };

  const stats = [
    { title: 'چک‌های دریافتنی', count: checks.filter(c => c.type === 'received').length, amount: checks.filter(c => c.type === 'received').reduce((sum, c) => sum + c.amount, 0), icon: FileText, color: 'text-emerald-600' },
    { title: 'چک‌های پرداختنی', count: checks.filter(c => c.type === 'issued').length, amount: checks.filter(c => c.type === 'issued').reduce((sum, c) => sum + c.amount, 0), icon: FileText, color: 'text-terracotta' },
    { title: 'در انتظار وصول', count: checks.filter(c => c.status === 'pending').length, amount: checks.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0), icon: Clock, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            مدیریت چک
          </h1>
          <p className="text-muted-foreground mt-1">
            مدیریت چک‌های دریافتنی و پرداختنی
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          ثبت چک جدید
        </Button>
      </div>

      {/* Due Date Warnings */}
      {upcomingChecks.length > 0 && (
        <Card className="shadow-card border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Bell className="w-5 h-5 animate-pulse" />
              اخطار سررسید چک‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingChecks.map((check) => {
              const daysUntilDue = getDaysUntilDue(check.dueDate);
              const warningLevel = getWarningLevel(daysUntilDue);
              
              return (
                <div
                  key={check.id}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    warningLevel === 'critical' ? 'bg-red-100 border border-red-300' :
                    warningLevel === 'warning' ? 'bg-orange-100 border border-orange-300' :
                    'bg-yellow-100 border border-yellow-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {warningLevel === 'critical' ? (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    ) : warningLevel === 'warning' ? (
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-bold text-gray-900">
                        چک شماره {check.checkNumber} - {check.bank}
                      </p>
                      <p className="text-sm text-gray-600">
                        {check.type === 'received' ? 'دریافتنی از' : 'پرداختنی به'}: {check.type === 'received' ? check.issuer : check.receiver}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{formatCurrency(check.amount)}</p>
                    <Badge 
                      variant={warningLevel === 'critical' ? 'destructive' : 'secondary'}
                      className={
                        warningLevel === 'critical' ? 'bg-red-600' :
                        warningLevel === 'warning' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }
                    >
                      {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} روز گذشته!` :
                       daysUntilDue === 0 ? 'امروز!' :
                       daysUntilDue === 1 ? 'فردا!' :
                       `${daysUntilDue} روز مانده`}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gray-100`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold text-foreground">{stat.count} عدد</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(stat.amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>لیست چک‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {checks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              هنوز چکی ثبت نشده است
            </p>
          ) : (
            <div className="space-y-3">
              {checks.map((check) => {
                const daysUntilDue = getDaysUntilDue(check.dueDate);
                const warningLevel = check.status === 'pending' ? getWarningLevel(daysUntilDue) : 'none';
                
                return (
                  <div
                    key={check.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      warningLevel === 'critical' ? 'border-red-300 bg-red-50' :
                      warningLevel === 'warning' ? 'border-orange-300 bg-orange-50' :
                      warningLevel === 'info' ? 'border-yellow-300 bg-yellow-50' :
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        check.status === 'cashed' ? 'bg-green-100' :
                        check.status === 'bounced' ? 'bg-red-100' :
                        check.status === 'cancelled' ? 'bg-gray-100' :
                        'bg-amber-100'
                      }`}>
                        {check.status === 'cashed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         check.status === 'bounced' ? <XCircle className="w-5 h-5 text-red-600" /> :
                         check.status === 'cancelled' ? <XCircle className="w-5 h-5 text-gray-600" /> :
                         <Clock className="w-5 h-5 text-amber-600" />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          چک شماره {check.checkNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {check.bank} | {check.type === 'received' ? 'دریافتنی' : 'پرداختنی'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left flex items-center gap-2">
                      <div>
                        <p className="font-bold text-foreground">{formatCurrency(check.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          سررسید: {check.jalaliDueDate || formatJalaliDateFull(new Date(check.dueDate))}
                        </p>
                        {warningLevel !== 'none' && check.status === 'pending' && (
                          <Badge 
                            variant="secondary"
                            className={`mt-1 ${
                              warningLevel === 'critical' ? 'bg-red-500 text-white' :
                              warningLevel === 'warning' ? 'bg-orange-500 text-white' :
                              'bg-yellow-500 text-white'
                            }`}
                          >
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} روز گذشته` :
                             daysUntilDue === 0 ? 'امروز' :
                             `${daysUntilDue} روز مانده`}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 mr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(check)}
                          className="h-8 w-8 hover:bg-secondary"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(check)}
                          className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CheckModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveCheck}
        editingCheck={editingCheck}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف چک</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف چک شماره {checkToDelete?.checkNumber} اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

import React, { useState } from 'react';
import { Plus, Calendar, TrendingUp, TrendingDown, Percent, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { InstallmentModal } from '@/components/installment/InstallmentModal';
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
import type { Installment } from '@/types/installment';

export const Installments: React.FC = () => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [installmentToDelete, setInstallmentToDelete] = useState<Installment | null>(null);
  const { toast } = useToast();

  const handleSaveInstallment = (installmentData: Omit<Installment, 'id' | 'paidAmount' | 'paidCount' | 'createdAt' | 'updatedAt'>) => {
    if (editingInstallment) {
      // Update existing installment
      setInstallments(installments.map(i => 
        i.id === editingInstallment.id 
          ? { ...i, ...installmentData, updatedAt: new Date().toISOString() }
          : i
      ));
      toast({
        title: 'موفق',
        description: 'قسط با موفقیت ویرایش شد',
      });
    } else {
      // Add new installment
      const newInstallment: Installment = {
        ...installmentData,
        id: crypto.randomUUID(),
        paidAmount: 0,
        paidCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setInstallments([...installments, newInstallment]);
      toast({
        title: 'موفق',
        description: 'قسط با موفقیت ثبت شد',
      });
    }
    setEditingInstallment(null);
  };

  const handleEdit = (installment: Installment) => {
    setEditingInstallment(installment);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (installment: Installment) => {
    setInstallmentToDelete(installment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (installmentToDelete) {
      setInstallments(installments.filter(i => i.id !== installmentToDelete.id));
      toast({
        title: 'حذف شد',
        description: 'قسط با موفقیت حذف شد',
      });
    }
    setDeleteDialogOpen(false);
    setInstallmentToDelete(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingInstallment(null);
  };

  const receivableTotal = installments.filter(i => i.type === 'receivable').reduce((sum, i) => sum + i.totalAmount, 0);
  const payableTotal = installments.filter(i => i.type === 'payable').reduce((sum, i) => sum + i.totalAmount, 0);

  const stats = [
    { title: 'اقساط دریافتنی', amount: receivableTotal, icon: TrendingUp, color: 'text-emerald-600' },
    { title: 'اقساط پرداختنی', amount: payableTotal, icon: TrendingDown, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            مدیریت اقساط
          </h1>
          <p className="text-muted-foreground mt-1">
            پیگیری اقساط دریافتنی و پرداختنی
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          قسط جدید
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gray-100`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stat.amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>لیست اقساط</CardTitle>
        </CardHeader>
        <CardContent>
          {installments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              هنوز قسطی ثبت نشده است
            </p>
          ) : (
            <div className="space-y-4">
              {installments.map((installment) => {
                const progress = (installment.paidAmount / installment.totalAmount) * 100;
                
                return (
                  <div
                    key={installment.id}
                    className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          installment.type === 'receivable' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          {installment.type === 'receivable' ? (
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{installment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {installment.type === 'receivable' ? 'دریافتنی از' : 'پرداختنی به'}: {installment.type === 'receivable' ? installment.debtor : installment.creditor}
                          </p>
                        </div>
                      </div>
                      <Badge variant={installment.type === 'receivable' ? 'default' : 'destructive'}>
                        {installment.type === 'receivable' ? 'دریافتنی' : 'پرداختنی'}
                      </Badge>
                      <div className="flex gap-1 mr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(installment)}
                          className="h-8 w-8 hover:bg-secondary"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(installment)}
                          className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">مبلغ اصل</p>
                        <p className="font-bold">{formatCurrency(installment.principalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          کارمزد ({installment.interestRate}%)
                        </p>
                        <p className="font-bold">{formatCurrency(installment.interestAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">مبلغ کل</p>
                        <p className="font-bold">{formatCurrency(installment.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">هر قسط</p>
                        <p className="font-bold">{formatCurrency(installment.installmentAmount)}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          پرداخت شده: {installment.paidCount} از {installment.installmentCount} قسط
                        </span>
                        <span className="font-bold">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <InstallmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveInstallment}
        editingInstallment={editingInstallment}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف قسط</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف قسط "{installmentToDelete?.title}" اطمینان دارید؟ این عمل قابل بازگشت نیست.
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

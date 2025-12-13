import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, parseNumber, formatInputNumber } from '@/lib/format';
import type { Installment, InstallmentType } from '@/types/installment';

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (installment: Omit<Installment, 'id' | 'paidAmount' | 'paidCount' | 'createdAt' | 'updatedAt'>) => void;
  editingInstallment?: Installment | null;
}

export const InstallmentModal: React.FC<InstallmentModalProps> = ({ isOpen, onClose, onSave, editingInstallment }) => {
  const [formData, setFormData] = useState({
    type: 'payable' as InstallmentType,
    title: '',
    principalAmount: '', // مبلغ اصل
    interestRate: '', // نرخ کارمزد (درصد)
    durationMonths: '', // مدت بازپرداخت (ماه)
    startDate: new Date(),
    creditor: '',
    debtor: '',
    description: '',
  });

  // Reset form when modal opens or editingInstallment changes
  useEffect(() => {
    if (editingInstallment) {
      setFormData({
        type: editingInstallment.type,
        title: editingInstallment.title,
        principalAmount: formatInputNumber(String(editingInstallment.principalAmount)),
        interestRate: String(editingInstallment.interestRate),
        durationMonths: String(editingInstallment.installmentCount),
        startDate: new Date(editingInstallment.startDate),
        creditor: editingInstallment.creditor || '',
        debtor: editingInstallment.debtor || '',
        description: editingInstallment.description || '',
      });
    } else if (isOpen) {
      setFormData({
        type: 'payable',
        title: '',
        principalAmount: '',
        interestRate: '',
        durationMonths: '',
        startDate: new Date(),
        creditor: '',
        debtor: '',
        description: '',
      });
    }
  }, [editingInstallment, isOpen]);

  // محاسبات خودکار
  const [calculations, setCalculations] = useState({
    interestAmount: 0,
    totalAmount: 0,
    installmentCount: 0,
    installmentAmount: 0,
  });

  // محاسبه خودکار هنگام تغییر مقادیر
  useEffect(() => {
    const principal = parseNumber(formData.principalAmount) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const months = parseInt(formData.durationMonths) || 0;

    if (principal > 0 && months > 0) {
      const interestAmount = (principal * rate * months) / 100;
      const totalAmount = principal + interestAmount;
      const installmentAmount = totalAmount / months;

      setCalculations({
        interestAmount,
        totalAmount,
        installmentCount: months,
        installmentAmount,
      });
    } else {
      setCalculations({
        interestAmount: 0,
        totalAmount: 0,
        installmentCount: 0,
        installmentAmount: 0,
      });
    }
  }, [formData.principalAmount, formData.interestRate, formData.durationMonths]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      principalAmount: parseNumber(formData.principalAmount),
      interestRate: parseFloat(formData.interestRate) || 0,
      interestAmount: calculations.interestAmount,
      totalAmount: calculations.totalAmount,
      remainingAmount: calculations.totalAmount,
      installmentCount: calculations.installmentCount,
      installmentAmount: calculations.installmentAmount,
      durationMonths: parseInt(formData.durationMonths),
      startDate: formData.startDate.toISOString(),
      jalaliStartDate: '', // TODO: Convert to Jalali
    });
    onClose();
    // Reset form
    setFormData({
      type: 'payable',
      title: '',
      principalAmount: '',
      interestRate: '',
      durationMonths: '',
      startDate: new Date(),
      creditor: '',
      debtor: '',
      description: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{editingInstallment ? 'ویرایش قسط' : 'ثبت قسط جدید'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع قسط</Label>
              <Select value={formData.type} onValueChange={(value: InstallmentType) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payable">پرداختنی</SelectItem>
                  <SelectItem value="receivable">دریافتنی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>عنوان</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان قسط"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>مبلغ اصل (تومان)</Label>
              <Input
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: formatInputNumber(e.target.value) })}
                placeholder="۰"
                dir="ltr"
                className="text-left"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>نرخ کارمزد (درصد ماهانه)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="مثال: 2.5"
              />
            </div>

            <div className="space-y-2">
              <Label>مدت بازپرداخت (ماه)</Label>
              <Input
                type="number"
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                placeholder="مثال: 12"
                min="1"
                required
              />
            </div>

            {formData.type === 'payable' && (
              <div className="space-y-2">
                <Label>طلبکار</Label>
                <Input
                  value={formData.creditor}
                  onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                  placeholder="نام طلبکار"
                />
              </div>
            )}

            {formData.type === 'receivable' && (
              <div className="space-y-2">
                <Label>بدهکار</Label>
                <Input
                  value={formData.debtor}
                  onChange={(e) => setFormData({ ...formData, debtor: e.target.value })}
                  placeholder="نام بدهکار"
                />
              </div>
            )}
          </div>

          {/* Calculation Summary */}
          {calculations.totalAmount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Calculator className="w-5 h-5" />
                محاسبات خودکار
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-700">مبلغ اصل:</span>
                  <span className="font-bold text-emerald-900">{formatCurrency(parseNumber(formData.principalAmount) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">کارمزد ({formData.interestRate || 0}% × {formData.durationMonths || 0} ماه):</span>
                  <span className="font-bold text-emerald-900">{formatCurrency(calculations.interestAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-emerald-200 pt-2">
                  <span className="text-emerald-700">مبلغ کل:</span>
                  <span className="font-bold text-emerald-900">{formatCurrency(calculations.totalAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-emerald-200 pt-2">
                  <span className="text-emerald-700">مبلغ هر قسط:</span>
                  <span className="font-bold text-emerald-900">{formatCurrency(calculations.installmentAmount)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>توضیحات (اختیاری)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیحات اضافی..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              ثبت قسط
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              انصراف
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

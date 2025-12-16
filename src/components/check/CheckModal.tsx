import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JalaliDatePicker } from '@/components/ui/jalali-date-picker';
import { formatCurrency, parseNumber, formatInputNumber } from '@/lib/format';
import type { Check, CheckType, CheckStatus } from '@/types/check';

interface CheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (check: Omit<Check, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingCheck?: Check | null;
}

export const CheckModal: React.FC<CheckModalProps> = ({ isOpen, onClose, onSave, editingCheck }) => {
  const [formData, setFormData] = useState({
    type: 'received' as CheckType,
    checkNumber: '',
    amount: '',
    issuer: '',
    receiver: '',
    bank: '',
    accountNumber: '',
    dueDate: new Date(),
    issueDate: new Date(),
    status: 'pending' as CheckStatus,
    description: '',
  });

  // Reset form when modal opens or editingCheck changes
  React.useEffect(() => {
    if (editingCheck) {
      setFormData({
        type: editingCheck.type,
        checkNumber: editingCheck.checkNumber,
        amount: formatInputNumber(String(editingCheck.amount)),
        issuer: editingCheck.issuer,
        receiver: editingCheck.receiver,
        bank: editingCheck.bank,
        accountNumber: editingCheck.accountNumber || '',
        dueDate: new Date(editingCheck.dueDate),
        issueDate: new Date(editingCheck.issueDate),
        status: editingCheck.status,
        description: editingCheck.description || '',
      });
    } else if (isOpen) {
      setFormData({
        type: 'received',
        checkNumber: '',
        amount: '',
        issuer: '',
        receiver: '',
        bank: '',
        accountNumber: '',
        dueDate: new Date(),
        issueDate: new Date(),
        status: 'pending',
        description: '',
      });
    }
  }, [editingCheck, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseNumber(formData.amount),
      dueDate: formData.dueDate.toISOString(),
      jalaliDueDate: '', // TODO: Convert to Jalali
      issueDate: formData.issueDate.toISOString(),
      jalaliIssueDate: '', // TODO: Convert to Jalali
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{editingCheck ? 'ویرایش چک' : 'ثبت چک جدید'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع چک</Label>
              <Select value={formData.type} onValueChange={(value: CheckType) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">دریافتنی</SelectItem>
                  <SelectItem value="issued">پرداختنی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>شماره چک</Label>
              <Input
                value={formData.checkNumber}
                onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
                placeholder="شماره چک"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>مبلغ (تومان)</Label>
              <Input
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: formatInputNumber(e.target.value) })}
                placeholder="۰"
                dir="ltr"
                className="text-left"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>بانک</Label>
              <Input
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                placeholder="نام بانک"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>صادرکننده</Label>
              <Input
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="نام صادرکننده"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>دریافت‌کننده</Label>
              <Input
                value={formData.receiver}
                onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                placeholder="نام دریافت‌کننده"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>شماره حساب (اختیاری)</Label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="شماره حساب"
              />
            </div>

            <div className="space-y-2">
              <Label>وضعیت</Label>
              <Select value={formData.status} onValueChange={(value: CheckStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="cashed">وصول شده</SelectItem>
                  <SelectItem value="bounced">برگشتی</SelectItem>
                  <SelectItem value="cancelled">لغو شده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تاریخ سررسید</Label>
              <JalaliDatePicker
                value={formData.dueDate}
                onChange={(date) => setFormData({ ...formData, dueDate: date })}
              />
            </div>

            <div className="space-y-2">
              <Label>تاریخ صدور</Label>
              <JalaliDatePicker
                value={formData.issueDate}
                onChange={(date) => setFormData({ ...formData, issueDate: date })}
              />
            </div>
          </div>

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
              ثبت چک
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

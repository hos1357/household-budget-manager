import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Key, Clock, CheckCircle } from 'lucide-react';
import { activateLicense } from '@/lib/license';
import type { LicenseStatus } from '@/types/license';
import { useToast } from '@/components/ui/use-toast';

interface LicenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenseStatus: LicenseStatus;
  userId: string;
  onLicenseActivated: () => void;
}

export function LicenseModal({ 
  open, 
  onOpenChange, 
  licenseStatus, 
  userId,
  onLicenseActivated 
}: LicenseModalProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      toast({
        title: 'خطا',
        description: 'لطفاً کد لایسنس را وارد کنید',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const result = await activateLicense(userId, licenseKey.trim().toUpperCase());
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'موفق',
        description: result.message,
      });
      onLicenseActivated();
      onOpenChange(false);
    } else {
      toast({
        title: 'خطا',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const isExpired = licenseStatus.licenseType === 'expired';

  return (
    <Dialog open={open} onOpenChange={isExpired ? undefined : onOpenChange}>
      <DialogContent 
        className="sm:max-w-md" 
        dir="rtl"
        onPointerDownOutside={isExpired ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isExpired ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            {isExpired ? (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>دوره آزمایشی به پایان رسید</span>
              </>
            ) : (
              <>
                <Clock className="h-5 w-5 text-amber-500" />
                <span>وضعیت لایسنس</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-right">
            {isExpired ? (
              'برای ادامه استفاده از برنامه، لطفاً کد لایسنس خود را وارد کنید.'
            ) : (
              `${licenseStatus.daysRemaining} روز از دوره آزمایشی رایگان شما باقی مانده است.`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* License Status Card */}
          <div className={`p-4 rounded-lg border ${
            isExpired 
              ? 'bg-red-50 border-red-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              {isExpired ? (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              ) : (
                <Clock className="h-8 w-8 text-amber-500" />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {isExpired ? 'لایسنس منقضی شده' : 'دوره آزمایشی'}
                </p>
                <p className="text-sm text-gray-600">
                  {isExpired 
                    ? 'دسترسی شما به برنامه محدود شده است'
                    : `${licenseStatus.daysRemaining} روز باقی‌مانده`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* License Key Input */}
          <div className="space-y-2">
            <Label htmlFor="license-key" className="text-right block">
              کد لایسنس
            </Label>
            <div className="flex gap-2">
              <Input
                id="license-key"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="text-center font-mono tracking-wider"
                dir="ltr"
              />
            </div>
            <p className="text-xs text-gray-500 text-right">
              کد لایسنس را از فروشنده دریافت کنید
            </p>
          </div>

          {/* Activate Button */}
          <Button 
            onClick={handleActivate} 
            className="w-full"
            disabled={isLoading || !licenseKey.trim()}
          >
            {isLoading ? (
              'در حال بررسی...'
            ) : (
              <>
                <Key className="h-4 w-4 ml-2" />
                فعال‌سازی لایسنس
              </>
            )}
          </Button>

          {/* Info */}
          {!isExpired && (
            <p className="text-xs text-center text-gray-500">
              می‌توانید بعداً از بخش تنظیمات لایسنس را فعال کنید
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

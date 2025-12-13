import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Key, Calendar, Sparkles } from 'lucide-react';
import type { LicenseStatus } from '@/types/license';
import { formatJalaliDateFull } from '@/lib/jalali';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenseStatus: LicenseStatus;
  userId: string;
  userName: string;
  onActivateLicense: () => void;
}

export function WelcomeModal({ 
  open, 
  onOpenChange, 
  licenseStatus, 
  userName,
  onActivateLicense 
}: WelcomeModalProps) {
  // Calculate trial end date
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + (licenseStatus.daysRemaining || 3));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg" 
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right text-2xl">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <span>خوش آمدید!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Welcome Message */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              سلام {userName} عزیز! 👋
            </h3>
            <p className="text-gray-600">
              به برنامه همیار مالی من خوش آمدید
            </p>
          </div>

          {/* Trial Info Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-200 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-emerald-800 text-lg mb-1">
                  دوره آزمایشی رایگان
                </h4>
                <p className="text-emerald-700 text-sm mb-3">
                  شما <span className="font-bold">{licenseStatus.daysRemaining} روز</span> فرصت دارید تا از تمام امکانات برنامه به صورت رایگان استفاده کنید.
                </p>
                <div className="bg-white/60 rounded-lg p-3 text-sm">
                  <p className="text-emerald-800">
                    <span className="font-semibold">تاریخ پایان دوره رایگان:</span>
                    <br />
                    <span className="font-bold text-lg">{formatJalaliDateFull(trialEndDate)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* License Option */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-200 rounded-xl">
                <Key className="w-6 h-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-1">
                  کد لایسنس دارید؟
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  اگر کد لایسنس دارید، همین الان می‌توانید آن را فعال کنید و از محدودیت زمانی خارج شوید.
                </p>
                <Button 
                  variant="outline" 
                  onClick={onActivateLicense}
                  className="w-full"
                >
                  <Key className="w-4 h-4 ml-2" />
                  فعال‌سازی لایسنس
                </Button>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full text-lg py-6"
          >
            شروع استفاده از برنامه
          </Button>

          <p className="text-xs text-center text-gray-500">
            می‌توانید بعداً از بخش تنظیمات لایسنس را فعال کنید
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

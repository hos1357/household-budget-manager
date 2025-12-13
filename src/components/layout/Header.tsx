import React, { useEffect, useState } from 'react';
import { LogOut, User, Key, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { getLicense, checkLicenseStatus } from '@/lib/license';
import type { LicenseStatus } from '@/types/license';
import { formatJalaliDateFull } from '@/lib/jalali';

export const Header: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name;
        setUserName(fullName || session.user.email?.split('@')[0] || 'کاربر');
        
        // Get license status
        const license = await getLicense(session.user.id);
        const status = checkLicenseStatus(license);
        setLicenseStatus(status);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Wait 1 minute before redirecting
    setTimeout(() => {
      window.location.href = '/auth';
    }, 60000); // 60000ms = 1 minute
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Welcome Message */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">خوش آمدید</p>
              <p className="font-bold text-foreground">{userName}</p>
            </div>
          </div>

          {/* License Status & Logout */}
          <div className="flex items-center gap-4">
            {/* License Status Badge */}
            {licenseStatus && (
              <div className="hidden sm:flex items-center gap-2">
                {licenseStatus.licenseType === 'permanent' ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    <Key className="w-3 h-3 ml-1" />
                    لایسنس دائمی
                  </Badge>
                ) : licenseStatus.licenseType === 'trial' ? (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    <Clock className="w-3 h-3 ml-1" />
                    {licenseStatus.daysRemaining} روز رایگان باقی‌مانده
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    لایسنس منقضی شده
                  </Badge>
                )}
              </div>
            )}

            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

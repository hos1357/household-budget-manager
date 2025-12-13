import React, { useState, useEffect } from 'react';
import { Trash2, Download, Upload, Info, LogOut, Key, Clock, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { getLicense, checkLicenseStatus, activateLicense } from '@/lib/license';
import type { LicenseStatus } from '@/types/license';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { refreshData } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadLicense = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const license = await getLicense(user.id);
        setLicenseStatus(checkLicenseStatus(license));
        
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', user.email)
          .single();
        
        if (adminData) {
          setIsAdmin(true);
        }
      }
    };
    loadLicense();
  }, []);

  const handleActivateLicense = async () => {
    if (!licenseKey.trim() || !userId) return;
    
    setIsActivating(true);
    const result = await activateLicense(userId, licenseKey.trim().toUpperCase());
    setIsActivating(false);

    if (result.success) {
      toast({
        title: 'موفق',
        description: result.message,
      });
      // Refresh license status
      const license = await getLicense(userId);
      setLicenseStatus(checkLicenseStatus(license));
      setLicenseKey('');
    } else {
      toast({
        title: 'خطا',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleExportData = () => {
    const data = {
      expenses: localStorage.getItem('tankhah_expenses'),
      categories: localStorage.getItem('tankhah_categories'),
      incomes: localStorage.getItem('tankhah_incomes'),
      budgets: localStorage.getItem('tankhah_budgets'),
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tankhah-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'موفق',
      description: 'پشتیبان‌گیری با موفقیت انجام شد',
    });
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.expenses) localStorage.setItem('tankhah_expenses', data.expenses);
          if (data.categories) localStorage.setItem('tankhah_categories', data.categories);
          if (data.incomes) localStorage.setItem('tankhah_incomes', data.incomes);
          if (data.budgets) localStorage.setItem('tankhah_budgets', data.budgets);
          
          refreshData();
          
          toast({
            title: 'موفق',
            description: 'داده‌ها با موفقیت بازیابی شدند',
          });
        } catch {
          toast({
            title: 'خطا',
            description: 'فایل نامعتبر است',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearData = () => {
    localStorage.removeItem('tankhah_expenses');
    localStorage.removeItem('tankhah_categories');
    localStorage.removeItem('tankhah_incomes');
    localStorage.removeItem('tankhah_budgets');
    
    refreshData();
    setClearDialogOpen(false);
    
    toast({
      title: 'انجام شد',
      description: 'تمام داده‌ها پاک شدند',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLogoutDialogOpen(false);
    toast({
      title: 'خروج موفق',
      description: 'از حساب کاربری خارج شدید. لطفاً یک دقیقه صبر کنید...',
    });
    // Wait 1 minute before redirecting
    setTimeout(() => {
      window.location.href = '/auth';
    }, 60000); // 60000ms = 1 minute
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
          تنظیمات
        </h1>
        <p className="text-base text-muted-foreground">
          مدیریت تنظیمات برنامه
        </p>
      </div>

      {/* Data Management */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>مدیریت داده‌ها</CardTitle>
          <CardDescription>
            پشتیبان‌گیری و بازیابی اطلاعات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleExportData} className="flex-1">
              <Download className="w-4 h-4 ml-2" />
              پشتیبان‌گیری
            </Button>
            <Button variant="outline" onClick={handleImportData} className="flex-1">
              <Upload className="w-4 h-4 ml-2" />
              بازیابی
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            با پشتیبان‌گیری می‌توانید تمام اطلاعات خود را در یک فایل ذخیره کنید و در صورت نیاز بازیابی کنید.
          </p>
        </CardContent>
      </Card>

      {/* License Management */}
      <Card className="shadow-card border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            مدیریت لایسنس
          </CardTitle>
          <CardDescription>
            وضعیت لایسنس و فعال‌سازی
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* License Status */}
          {licenseStatus && (
            <div className={`p-4 rounded-lg border ${
              licenseStatus.licenseType === 'permanent' 
                ? 'bg-green-50 border-green-200' 
                : licenseStatus.licenseType === 'trial'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {licenseStatus.licenseType === 'permanent' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-amber-600" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {licenseStatus.licenseType === 'permanent' 
                        ? 'لایسنس دائمی' 
                        : licenseStatus.licenseType === 'trial'
                        ? 'دوره آزمایشی'
                        : 'لایسنس منقضی شده'
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      {licenseStatus.licenseType === 'permanent' 
                        ? 'دسترسی کامل به تمام امکانات'
                        : licenseStatus.licenseType === 'trial'
                        ? `${licenseStatus.daysRemaining} روز باقی‌مانده`
                        : 'لطفاً لایسنس خود را فعال کنید'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant={
                  licenseStatus.licenseType === 'permanent' 
                    ? 'default' 
                    : licenseStatus.licenseType === 'trial'
                    ? 'secondary'
                    : 'destructive'
                }>
                  {licenseStatus.licenseType === 'permanent' 
                    ? 'فعال' 
                    : licenseStatus.licenseType === 'trial'
                    ? 'آزمایشی'
                    : 'منقضی'
                  }
                </Badge>
              </div>
            </div>
          )}

          {/* Activate License */}
          {licenseStatus?.licenseType !== 'permanent' && (
            <div className="space-y-3">
              <Label htmlFor="license-key">کد لایسنس</Label>
              <div className="flex gap-2">
                <Input
                  id="license-key"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  className="text-center font-mono tracking-wider"
                  dir="ltr"
                />
                <Button 
                  onClick={handleActivateLicense}
                  disabled={isActivating || !licenseKey.trim()}
                >
                  {isActivating ? 'در حال بررسی...' : 'فعال‌سازی'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                کد لایسنس را از فروشنده دریافت کنید
              </p>
            </div>
          )}
          
          {/* Admin Panel Button */}
          {isAdmin && (
            <div className="pt-4 border-t border-border">
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                className="w-full border-primary/50 hover:bg-primary/10"
              >
                <Shield className="w-4 h-4 ml-2" />
                پنل مدیریت (ایجاد کد لایسنس)
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                شما به عنوان ادمین می‌توانید کد لایسنس ایجاد کنید
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-card border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">منطقه خطر</CardTitle>
          <CardDescription>
            این عملیات غیرقابل بازگشت هستند
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="destructive"
            onClick={() => setClearDialogOpen(true)}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 ml-2" />
            پاک کردن تمام داده‌ها
          </Button>
          <Button
            variant="outline"
            onClick={() => setLogoutDialogOpen(true)}
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 ml-2" />
            خروج از حساب
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            درباره برنامه
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">نسخه</span>
            <span className="font-medium">۱.۰.۰</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">توسعه‌دهنده</span>
            <span className="font-medium">همیار مالی من</span>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              این برنامه برای مدیریت هزینه‌های خانه طراحی شده است.
              <br />
              تمام داده‌ها به صورت محلی در مرورگر شما ذخیره می‌شوند.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Clear Data Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>پاک کردن تمام داده‌ها</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید؟ این عمل تمام هزینه‌ها، درآمدها، دسته‌بندی‌ها و تنظیمات را پاک می‌کند و قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-destructive hover:bg-destructive/90"
            >
              پاک کردن همه چیز
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>خروج از حساب</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90"
            >
              خروج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

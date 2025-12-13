import React, { useState, useEffect } from 'react';
import { Shield, Key, Copy, Check, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface GeneratedLicense {
  id: string;
  key: string;
  type: 'trial' | 'permanent';
  trialDays?: number;
  createdAt: string;
  expiresAt?: string;
  usedBy?: string;
  isUsed: boolean;
}

// Simple license key generator
const generateLicenseKey = (type: 'trial' | 'permanent'): string => {
  const prefix = type === 'permanent' ? 'PERM' : 'TRIAL';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) key += '-';
  }
  return `${prefix}-${key}`;
};

export const Admin: React.FC = () => {
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<GeneratedLicense[]>([]);
  const [newLicenseType, setNewLicenseType] = useState<'trial' | 'permanent'>('permanent');
  const [trialDays, setTrialDays] = useState('30');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbAdminPassword, setDbAdminPassword] = useState<string | null>(null);

  // Check if user is admin and load password
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;
      
      const { data } = await supabase
        .from('admin_users')
        .select('admin_password')
        .eq('email', user.email)
        .single();
      
      if (data) {
        setDbAdminPassword(data.admin_password);
        // Auto-authenticate admin without password prompt
        setIsAuthenticated(true);
      }
    };
    checkAdminAccess();
  }, []);

  // Load existing licenses from database
  useEffect(() => {
    if (isAuthenticated) {
      loadLicenses();
    }
  }, [isAuthenticated]);

  const loadLicenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('license_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری لایسنس‌ها',
        variant: 'destructive',
      });
    } else if (data) {
      const formattedLicenses: GeneratedLicense[] = data.map((item: any) => ({
        id: item.id,
        key: item.license_key,
        type: item.license_key.startsWith('PERM') ? 'permanent' : 'trial',
        trialDays: item.trial_days,
        createdAt: item.created_at,
        expiresAt: undefined,
        usedBy: item.used_by,
        isUsed: item.is_used,
      }));
      setLicenses(formattedLicenses);
    }
    setLoading(false);
  };

  const handleAdminLogin = () => {
    if (dbAdminPassword && adminPassword === dbAdminPassword) {
      setIsAuthenticated(true);
      toast({
        title: 'ورود موفق',
        description: 'به پنل ادمین خوش آمدید',
      });
    } else {
      toast({
        title: 'خطا',
        description: 'رمز عبور اشتباه است',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateLicense = async () => {
    setLoading(true);
    const key = generateLicenseKey(newLicenseType);

    try {
      // Insert into database
      const { data, error } = await supabase
        .from('license_keys')
        .insert({
          license_key: key,
          is_used: false,
          trial_days: newLicenseType === 'trial' ? parseInt(trialDays) : null,
        })
        .select()
        .single();

      if (error) {
        console.error('License creation error:', error);
        toast({
          title: 'خطا',
          description: error.message || 'خطا در ایجاد لایسنس',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'لایسنس ایجاد شد',
        description: newLicenseType === 'permanent' 
          ? `کد لایسنس: ${key} (دائمی - برای همیشه)`
          : `کد لایسنس: ${key} (آزمایشی - ${trialDays} روز)`,
      });

      // Reload licenses
      await loadLicenses();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: 'خطا',
        description: 'خطای غیرمنتظره رخ داد',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'کپی شد',
      description: 'کد لایسنس در کلیپ‌بورد کپی شد',
    });
  };

  const handleDeleteLicense = async (id: string) => {
    const { error } = await supabase
      .from('license_keys')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'خطا',
        description: 'خطا در حذف لایسنس',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'حذف شد',
      description: 'لایسنس با موفقیت حذف شد',
    });

    await loadLicenses();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">دسترسی محدود</CardTitle>
            <CardDescription>شما دسترسی به پنل ادمین ندارید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              فقط کاربران ادمین می‌توانند به این بخش دسترسی داشته باشند.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            پنل ادمین
          </h1>
          <p className="text-muted-foreground mt-1">
            مدیریت لایسنس‌ها و کاربران
          </p>
        </div>
      </div>

      {/* License Generator */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            تولید لایسنس جدید
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>نوع لایسنس</Label>
              <Select value={newLicenseType} onValueChange={(v: 'trial' | 'permanent') => setNewLicenseType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">دائمی (برای همیشه)</SelectItem>
                  <SelectItem value="trial">آزمایشی (محدود به روز)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newLicenseType === 'trial' && (
              <div className="space-y-2">
                <Label>مدت اعتبار (روز)</Label>
                <Input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  min="1"
                  max="365"
                />
              </div>
            )}

            <div className="flex items-end">
              <Button onClick={handleGenerateLicense} className="w-full" disabled={loading}>
                <Plus className="w-4 h-4 ml-2" />
                {loading ? 'در حال ایجاد...' : 'تولید لایسنس'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Licenses */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            لایسنس‌های تولید شده
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              در حال بارگذاری...
            </p>
          ) : licenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              هنوز لایسنسی تولید نشده است
            </p>
          ) : (
            <div className="space-y-3">
              {licenses.map((license) => (
                <div
                  key={license.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-xl gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="font-mono text-lg font-bold text-foreground">
                      {license.key}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={license.type === 'permanent' ? 'default' : 'secondary'}>
                        {license.type === 'permanent' ? 'دائمی (برای همیشه)' : `آزمایشی (${license.trialDays || 30} روز)`}
                      </Badge>
                      {license.isUsed && (
                        <Badge variant="outline">استفاده شده</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyKey(license.id, license.key)}
                    >
                      {copiedId === license.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteLicense(license.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="shadow-card bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-amber-800 mb-2">راهنمای استفاده</h3>
          <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
            <li>لایسنس دائمی: اعتبار یک ساله از زمان فعال‌سازی</li>
            <li>لایسنس آزمایشی: با محدودیت زمانی مشخص (پیش‌فرض ۳۰ روز)</li>
            <li>کد لایسنس را به کاربر بدهید تا در تنظیمات وارد کند</li>
            <li>کاربران جدید ۳ روز دوره آزمایشی رایگان دارند</li>
            <li>برای امنیت بیشتر، رمز ادمین را تغییر دهید</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

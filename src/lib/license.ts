// ======== کد اصلاح شده و کامل ========

import { supabase } from './supabase';
import type { License, LicenseStatus } from '@/types/license';

// --- لیستی از ایمیل‌های ادمین ---
const ADMIN_EMAILS = ['your-main-admin-email@example.com', 'your-second-email@example.com'];

// --- کلیدهای دائمی که فقط برای ادمین‌ها کار می‌کند ---
const MASTER_ADMIN_KEYS = [
  'PERM-ADMIN-XXXX-YYYY-ZZZZ',
  'TANKHAH-PRO-2024-FULL',
];

const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url.includes('supabase'));
};

// --- تابع getLicense (بدون تغییر) ---
// این تابع فقط لایسنس موجود را از دیتابیس می‌خواند
export async function getLicense(userId: string): Promise<License | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured!');
    return null; // در حالت خطا، هیچ لایسنسی برنگردان
  }
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('License fetch error:', error.message);
      return null;
    }
    return data; // یا رکورد لایسنس را برمی‌گرداند یا null
  } catch (err) {
    console.error('License fetch failed:', err);
    return null;
  }
}

// --- تابع activateLicense (منطق اصلی اینجا اصلاح شده) ---
export async function activateLicense(userId: string, userEmail: string, licenseKey: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'اتصال به سرور برقرار نیست.' };
  }

  const normalizedKey = licenseKey.trim().toUpperCase();
  const normalizedEmail = userEmail.trim().toLowerCase();

  // --- سناریوی 1: فعال‌سازی با کد ادمین ---
  const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail);
  const isAdminKey = MASTER_ADMIN_KEYS.includes(normalizedKey);

  if (isAdminKey) {
    if (!isAdminEmail) {
      return { success: false, message: 'این کد لایسنس مخصوص ادمین است.' };
    }
    
    // اگر کاربر ادمین است و کد ادمین را وارد کرده، لایسنس او را دائمی کن
    const { data: license, error } = await supabase
      .from('licenses')
      .upsert({
        user_id: userId,
        license_key: normalizedKey,
        license_type: 'permanent',
        is_active: true,
        activated_at: new Date().toISOString(),
        expiry_date: null, // دائمی
        trial_end_date: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Admin license activation error:', error);
      return { success: false, message: 'خطا در فعال‌سازی لایسنس ادمین' };
    }
    return { success: true, message: 'لایسنس دائمی ادمین با موفقیت فعال شد!' };
  }

  // --- سناریوی 2: فعال‌سازی با کدهای معمولی از دیتابیس ---
  try {
    // ابتدا چک کن که آیا چنین کدی در دیتابیس وجود دارد و استفاده نشده؟
    const { data: keyData, error: keyError } = await supabase
      .from('license_keys')
      .select('*')
      .eq('license_key', normalizedKey)
      .eq('is_used', false)
      .single();

    if (keyError || !keyData) {
      return { success: false, message: 'کد لایسنس نامعتبر است یا قبلاً استفاده شده است' };
    }

    // اگر کد معتبر بود، آن را به عنوان "استفاده شده" علامت بزن
    const { error: updateKeyError } = await supabase
      .from('license_keys')
      .update({ is_used: true, used_by: userId, used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    if (updateKeyError) {
      // اگر در این مرحله خطا رخ داد، باید تراکنش را برگرداند (در یک سیستم واقعی)
      return { success: false, message: 'خطا در مصرف کد لایسنس' };
    }

    // حالا رکورد لایسنس کاربر را در دیتابیس ایجاد یا آپدیت کن
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (keyData.trial_days || 0)); // اگر trial_days نداشت، 0 در نظر بگیر

    const { error: upsertLicenseError } = await supabase
      .from('licenses')
      .upsert({
        user_id: userId,
        license_key: normalizedKey,
        license_type: keyData.trial_days ? 'trial' : 'permanent',
        is_active: true,
        activated_at: new Date().toISOString(),
        expiry_date: keyData.trial_days ? null : expiryDate.toISOString(), // اگر دائمی یکساله باشد
        trial_end_date: keyData.trial_days ? expiryDate.toISOString() : null, // اگر آزمایشی باشد
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertLicenseError) {
      console.error('User license update error:', upsertLicenseError);
      return { success: false, message: 'خطا در به‌روزرسانی لایسنس کاربر' };
    }
    
    const message = keyData.trial_days
      ? `لایسنس آزمایشی ${keyData.trial_days} روزه با موفقیت فعال شد!`
      : 'لایسنس دائمی با موفقیت فعال شد!';
    
    return { success: true, message: message };

  } catch (err) {
    console.error('General license activation error:', err);
    return { success: false, message: 'خطایی در فرآیند فعال‌سازی رخ داد.' };
  }
}

// --- تابع checkLicenseStatus (اصلاح شده) ---
export function checkLicenseStatus(license: License | null): LicenseStatus {
  // اگر هیچ لایسنسی وجود ندارد، کاربر باید آن را فعال کند
  if (!license) {
    return {
      isValid: false,
      licenseType: 'none',
      daysRemaining: 0,
    };
  }

  // اگر لایسنس غیرفعال است
  if (!license.is_active) {
    return { isValid: false, licenseType: 'inactive', daysRemaining: 0 };
  }

  const now = new Date();

  // اگر لایسنس دائمی است
  if (license.license_type === 'permanent') {
    // اگر تاریخ انقضا دارد (مثلا دائمی یکساله)
    if (license.expiry_date) {
      const expiry = new Date(license.expiry_date);
      if (now > expiry) {
        return { isValid: false, licenseType: 'expired', daysRemaining: 0 };
      }
      const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { isValid: true, licenseType: 'permanent', daysRemaining: days };
    }
    // اگر تاریخ انقضا ندارد (دائمی واقعی)
    return { isValid: true, licenseType: 'permanent', daysRemaining: Infinity }; // Infinity برای دائمی
  }

  // اگر لایسنس آزمایشی است
  if (license.license_type === 'trial' && license.trial_end_date) {
    const expiry = new Date(license.trial_end_date);
    if (now > expiry) {
      return { isValid: false, licenseType: 'expired', daysRemaining: 0 };
    }
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { isValid: true, licenseType: 'trial', daysRemaining: days };
  }

  // حالت پیش‌فرض: نامعتبر
  return { isValid: false, licenseType: 'unknown', daysRemaining: 0 };
}

import { supabase } from './supabase';
import type { License, LicenseStatus } from '@/types/license';

// Check if Supabase is properly configured
const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url.includes('supabase'));
};

// Create a default trial license for offline/unconfigured mode
const createDefaultTrialLicense = (userId: string): License => {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 3);
  
  return {
    id: 'local-trial',
    user_id: userId,
    license_type: 'trial',
    license_key: null,
    trial_start_date: new Date().toISOString(),
    trial_end_date: trialEndDate.toISOString(),
    expiry_date: null,
    is_active: true,
    activated_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export async function getLicense(userId: string): Promise<License | null> {
  // If Supabase is not configured, return local trial
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using local trial mode');
    return createDefaultTrialLicense(userId);
  }

  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      // Network error or other issues - return local trial
      console.warn('License fetch error, using local trial:', error.message);
      return createDefaultTrialLicense(userId);
    }

    // No license found - return null to trigger creation
    if (!data) {
      return null;
    }

    return data;
  } catch (err) {
    console.warn('License fetch failed, using local trial:', err);
    return createDefaultTrialLicense(userId);
  }
}

export async function createTrialLicense(userId: string): Promise<License | null> {
  // If Supabase is not configured, return a local trial license
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, creating local trial license');
    return createDefaultTrialLicense(userId);
  }

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 3);

  try {
    // First check if user exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    // If user doesn't exist or there's an error, return local trial
    if (userError || !userData) {
      console.warn('User not found in database, using local trial');
      return createDefaultTrialLicense(userId);
    }

    const { data, error } = await supabase
      .from('licenses')
      .insert({
        user_id: userId,
        license_type: 'trial',
        trial_start_date: new Date().toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.warn('Error creating trial license, using local trial:', error.message);
      return createDefaultTrialLicense(userId);
    }

    return data;
  } catch (err) {
    console.warn('Trial license creation failed, using local trial:', err);
    return createDefaultTrialLicense(userId);
  }
}

// Master license keys that work without database
const MASTER_LICENSE_KEYS = [
  'PERM-TEST-2024-ABCD-EFGH',
  'PERM-ADMIN-XXXX-YYYY-ZZZZ',
  'TANKHAH-PRO-2024-FULL',
];

export async function activateLicense(userId: string, licenseKey: string): Promise<{ success: boolean; message: string }> {
  const normalizedKey = licenseKey.trim().toUpperCase();
  
  // Check master keys first (works without database)
  if (MASTER_LICENSE_KEYS.includes(normalizedKey)) {
    // Master keys are permanent (forever)
    // Update user's license to permanent
    const { error: updateLicenseError } = await supabase
      .from('licenses')
      .update({
        license_key: normalizedKey,
        license_type: 'permanent',
        is_active: true,
        activated_at: new Date().toISOString(),
        expiry_date: null, // No expiry = forever
        trial_end_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateLicenseError) {
      console.error('License update error:', updateLicenseError);
      return { success: false, message: 'خطا در به‌روزرسانی لایسنس' };
    }

    return { success: true, message: 'لایسنس دائمی با موفقیت فعال شد! اعتبار: برای همیشه' };
  }

  // Try database license keys
  try {
    const { data: keyData, error: keyError } = await supabase
      .from('license_keys')
      .select('*')
      .eq('license_key', normalizedKey)
      .eq('is_used', false)
      .single();

    if (keyError || !keyData) {
      return { success: false, message: 'کد لایسنس نامعتبر است یا قبلاً استفاده شده است' };
    }

    // Determine license type and expiry date
    const isTrialKey = keyData.trial_days !== null && keyData.trial_days !== undefined;
    
    if (isTrialKey) {
      // Trial license: add trial_days to current date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + keyData.trial_days);
      
      // Mark the key as used
      const { error: updateKeyError } = await supabase
        .from('license_keys')
        .update({
          is_used: true,
          used_by: userId,
          used_at: new Date().toISOString(),
        })
        .eq('id', keyData.id);

      if (updateKeyError) {
        return { success: false, message: 'خطا در فعال‌سازی لایسنس' };
      }

      // Update user's license with trial
      const { error: updateLicenseError } = await supabase
        .from('licenses')
        .update({
          license_key: normalizedKey,
          license_type: 'trial',
          is_active: true,
          activated_at: new Date().toISOString(),
          trial_end_date: expiryDate.toISOString(),
          expiry_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateLicenseError) {
        return { success: false, message: 'خطا در به‌روزرسانی لایسنس' };
      }

      return { success: true, message: `لایسنس آزمایشی با موفقیت فعال شد! اعتبار: ${keyData.trial_days} روز` };
    } else {
      // Permanent license: no expiry date (forever)
      // Mark the key as used
      const { error: updateKeyError } = await supabase
        .from('license_keys')
        .update({
          is_used: true,
          used_by: userId,
          used_at: new Date().toISOString(),
        })
        .eq('id', keyData.id);

      if (updateKeyError) {
        return { success: false, message: 'خطا در فعال‌سازی لایسنس' };
      }

      // Update user's license to permanent (no expiry_date = forever)
      const { error: updateLicenseError } = await supabase
        .from('licenses')
        .update({
          license_key: normalizedKey,
          license_type: 'permanent',
          is_active: true,
          activated_at: new Date().toISOString(),
          trial_end_date: null,
          expiry_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateLicenseError) {
        return { success: false, message: 'خطا در به‌روزرسانی لایسنس' };
      }

      return { success: true, message: 'لایسنس دائمی با موفقیت فعال شد! اعتبار: برای همیشه' };
    }
  } catch (err) {
    console.error('License activation error:', err);
    return { success: false, message: 'کد لایسنس نامعتبر است' };
  }
}

export function checkLicenseStatus(license: License | null): LicenseStatus {
  if (!license) {
    return {
      isValid: true, // Allow access without license (3 days free)
      licenseType: 'trial',
      daysRemaining: 3,
      trialEndDate: null,
    };
  }

  // Permanent license - check if it has expiry_date (1 year) or is truly permanent
  if (license.license_type === 'permanent' && license.is_active) {
    // If there's an expiry_date, check if it's still valid
    if (license.expiry_date) {
      const now = new Date();
      const expiryDate = new Date(license.expiry_date);
      const diffTime = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        return {
          isValid: true,
          licenseType: 'permanent',
          daysRemaining,
          trialEndDate: null,
        };
      } else {
        // License expired
        return {
          isValid: false,
          licenseType: 'expired',
          daysRemaining: 0,
          trialEndDate: null,
        };
      }
    }
    
    // No expiry_date means truly permanent (forever)
    return {
      isValid: true,
      licenseType: 'permanent',
      daysRemaining: -1, // Unlimited
      trialEndDate: null,
    };
  }

  // Check trial license
  const now = new Date();
  const trialEnd = new Date(license.trial_end_date);
  const diffTime = trialEnd.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining > 0) {
    return {
      isValid: true,
      licenseType: 'trial',
      daysRemaining,
      trialEndDate: license.trial_end_date,
    };
  }

  return {
    isValid: false,
    licenseType: 'expired',
    daysRemaining: 0,
    trialEndDate: license.trial_end_date,
  };
}

// Generate a random license key (for admin use)
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;
  const parts: string[] = [];

  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(segment);
  }

  return parts.join('-'); // Format: XXXX-XXXX-XXXX-XXXX
}

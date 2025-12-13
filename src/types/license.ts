export interface License {
  id: string;
  user_id: string;
  license_key: string | null;
  license_type: 'trial' | 'permanent';
  trial_start_date: string;
  trial_end_date: string;
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LicenseStatus {
  isValid: boolean;
  licenseType: 'trial' | 'permanent' | 'expired';
  daysRemaining: number;
  trialEndDate: string | null;
}

-- Add trial_days column to license_keys table
ALTER TABLE public.license_keys 
ADD COLUMN IF NOT EXISTS trial_days integer DEFAULT NULL;

-- Comment: trial_days is NULL for permanent licenses, and contains the number of days for trial licenses

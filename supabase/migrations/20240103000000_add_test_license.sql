-- Add test license keys for testing purposes
INSERT INTO license_keys (license_key, is_used)
VALUES 
  ('PERM-TEST-2024-ABCD-EFGH', false),
  ('PERM-MYKEY-1234-5678-9ABC', false),
  ('PERM-ADMIN-XXXX-YYYY-ZZZZ', false)
ON CONFLICT (license_key) DO NOTHING;

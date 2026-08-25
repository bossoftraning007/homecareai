-- Fix existing profiles: Sync emails from auth.users
-- Run this in Supabase SQL Editor

-- Update email for all profiles that have null/empty email
UPDATE profiles
SET email = (
  SELECT email FROM auth.users WHERE auth.users.id = profiles.id
)
WHERE email IS NULL OR email = '';

-- Verify the fix
SELECT p.id, p.email, p.full_name, p.created_at, p.last_sign_in
FROM profiles p
ORDER BY p.created_at DESC;

-- Also check if there are profiles without matching auth.users
SELECT p.id, p.email, p.full_name
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

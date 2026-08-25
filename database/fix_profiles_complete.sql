-- Complete fix for profiles table and admin user display
-- Run this in Supabase SQL Editor

-- Step 1: Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Step 2: Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Step 3: Add is_admin column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Step 4: Add last_sign_in column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_sign_in'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_sign_in TIMESTAMPTZ;
  END IF;
END $$;

-- Step 5: Sync emails from auth.users for all profiles
UPDATE profiles
SET email = (
  SELECT email FROM auth.users WHERE auth.users.id = profiles.id
)
WHERE email IS NULL OR email = '';

-- Step 6: Sync full_name from auth.users if full_name is empty
UPDATE profiles
SET full_name = COALESCE(
  (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
  (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
  (SELECT split_part(email, '@', 1) FROM auth.users WHERE auth.users.id = profiles.id),
  'Unknown'
)
WHERE full_name IS NULL OR full_name = '';

-- Step 7: Update last_sign_in from auth.users
UPDATE profiles
SET last_sign_in = (
  SELECT last_sign_in_at FROM auth.users WHERE auth.users.id = profiles.id
)
WHERE last_sign_in IS NULL;

-- Verify the fix
SELECT 
  p.id, 
  p.email, 
  p.full_name, 
  p.is_admin,
  p.created_at, 
  p.last_sign_in
FROM profiles p
ORDER BY p.created_at DESC;

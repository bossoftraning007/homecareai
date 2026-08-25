-- Fix: Add missing columns to existing profiles table
-- Run this in Supabase SQL Editor

-- Step 1: Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
    RAISE NOTICE 'Added email column';
  END IF;
END $$;

-- Step 2: Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Added full_name column';
  END IF;
END $$;

-- Step 3: Add is_admin column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_admin column';
  END IF;
END $$;

-- Step 4: Add last_sign_in column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_sign_in'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_sign_in TIMESTAMPTZ;
    RAISE NOTICE 'Added last_sign_in column';
  END IF;
END $$;

-- Step 5: Add avatar_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Added avatar_url column';
  END IF;
END $$;

-- Step 6: Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column';
  END IF;
END $$;

-- Step 7: Sync emails from auth.users
UPDATE profiles
SET email = (
  SELECT email FROM auth.users WHERE auth.users.id = profiles.id
)
WHERE email IS NULL OR email = '';

-- Step 8: Sync full_name from auth.users
UPDATE profiles
SET full_name = COALESCE(
  (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
  (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
  (SELECT split_part(email, '@', 1) FROM auth.users WHERE auth.users.id = profiles.id),
  'Unknown'
)
WHERE full_name IS NULL OR full_name = '';

-- Step 9: Sync last_sign_in from auth.users
UPDATE profiles
SET last_sign_in = (
  SELECT last_sign_in_at FROM auth.users WHERE auth.users.id = profiles.id
)
WHERE last_sign_in IS NULL;

-- Step 10: Insert any missing users from auth.users
INSERT INTO profiles (id, email, full_name, created_at, last_sign_in)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1),
    'Unknown'
  ),
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- Verify
SELECT id, email, full_name, created_at, last_sign_in FROM profiles ORDER BY created_at DESC;

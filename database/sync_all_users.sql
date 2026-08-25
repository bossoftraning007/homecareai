-- Check: How many users in auth.users vs profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles;

-- Show all auth users that are NOT in profiles
SELECT u.id, u.email, u.created_at, u.last_sign_in_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Sync ALL missing users from auth.users to profiles
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

-- Verify: Count after sync
SELECT COUNT(*) as total_profiles_now FROM profiles;

-- Show all profiles
SELECT id, email, full_name, created_at FROM profiles ORDER BY created_at DESC;

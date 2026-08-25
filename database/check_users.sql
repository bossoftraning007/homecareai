-- Diagnostic: Check users in auth.users vs profiles

-- 1. Count users in each table
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles;

-- 2. Show ALL auth users
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Show ALL profiles
SELECT id, email, full_name, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- 4. Find auth users NOT in profiles
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

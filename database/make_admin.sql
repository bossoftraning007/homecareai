-- Check if your user is admin
SELECT id, email, is_admin FROM profiles WHERE email LIKE '%your_email%';

-- If is_admin is false, update it to true
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your_email@example.com';  -- Replace with your actual email

-- Verify
SELECT id, email, is_admin FROM profiles WHERE is_admin = true;

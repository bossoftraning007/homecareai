-- Fix: Remove recursive RLS policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a security definer function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status FROM profiles WHERE id = user_id;
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policy using the function (no recursion)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    is_admin(auth.uid()) = true
  );

-- Verify
SELECT id, email, is_admin FROM profiles ORDER BY created_at DESC;

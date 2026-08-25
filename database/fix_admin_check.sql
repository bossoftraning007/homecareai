-- Fix: Create security definer function for admin check (bypasses RLS)

-- Drop existing function if exists
DROP FUNCTION IF EXISTS check_is_admin(UUID);

-- Create security definer function (runs as postgres, bypasses RLS)
CREATE OR REPLACE FUNCTION check_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status FROM profiles WHERE id = user_id;
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify
SELECT check_is_admin('YOUR_USER_ID_HERE');  -- Replace with your user ID

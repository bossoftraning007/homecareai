-- Family Health War Room Schema
-- Manages family members and aggregates their health data

CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- who manages this family member
  member_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- if they have account
  member_email TEXT, -- if no account yet
  full_name TEXT NOT NULL,
  relationship VARCHAR(30), -- self, spouse, child, parent, sibling, other
  date_of_birth DATE,
  gender VARCHAR(20),
  avatar_color VARCHAR(20) DEFAULT 'blue',
  is_active BOOLEAN DEFAULT TRUE,
  invite_status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_owner ON family_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_family_member_user ON family_members(member_user_id);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own family" ON family_members;
CREATE POLICY "Users manage own family" ON family_members
  FOR ALL USING (auth.uid() = owner_id);

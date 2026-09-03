-- Content Manager Schema
-- Run this in Supabase SQL Editor

-- The health_articles table already exists from library_schema.sql
-- But we need to add image_url if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'health_articles' AND column_name = 'image_url') THEN
    ALTER TABLE health_articles ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'health_articles' AND column_name = 'author_email') THEN
    ALTER TABLE health_articles ADD COLUMN author_email TEXT;
  END IF;
END $$;

-- Admin users table (for protecting content manager)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'admin', -- admin, editor, viewer
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admins (your accounts)
INSERT INTO admin_users (email, role) VALUES
  ('bossoftraning007@gmail.com', 'admin'),
  ('premcharantejtej@gmail.com', 'admin'),
  ('tejpersonal007@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Article drafts (for work-in-progress)
CREATE TABLE IF NOT EXISTS article_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_email TEXT,
  title TEXT,
  content TEXT,
  category VARCHAR(50),
  tags TEXT[],
  image_url TEXT,
  last_saved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article categories reference
CREATE TABLE IF NOT EXISTS article_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Insert default categories
INSERT INTO article_categories (key, label, icon, sort_order) VALUES
  ('nutrition', 'Nutrition', '🍎', 1),
  ('sleep', 'Sleep', '😴', 2),
  ('mental_health', 'Mental Health', '🧠', 3),
  ('exercise', 'Exercise', '🏃', 4),
  ('remedies', 'Remedies', '🌿', 5),
  ('conditions', 'Conditions', '🩺', 6),
  ('prevention', 'Prevention', '🛡️', 7),
  ('wellness', 'Wellness', '✨', 8),
  ('news', 'Health News', '📰', 9)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read categories" ON article_categories;
DROP POLICY IF EXISTS "Admins can manage drafts" ON article_drafts;

-- Categories: anyone can read
CREATE POLICY "Anyone can read categories" ON article_categories
  FOR SELECT USING (is_active = TRUE);

-- Drafts: only admins (we use service role for now, RLS allows service to bypass)
CREATE POLICY "Admins can manage drafts" ON article_drafts
  FOR ALL USING (true);

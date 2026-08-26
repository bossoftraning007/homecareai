-- Safe version: Run this in Supabase SQL Editor
-- Uses IF NOT EXISTS to avoid errors if already created

-- Create reminders table (if not exists)
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'wellness',
  title TEXT,
  message TEXT,
  scheduled_time TIME NOT NULL DEFAULT '09:00',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics table (if not exists)
CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  push_sent_count INTEGER DEFAULT 0,
  push_failed_count INTEGER DEFAULT 0,
  email_sent_count INTEGER DEFAULT 0,
  email_failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (safe to run multiple times)
DO $$ BEGIN
  ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN END $$;

DO $$ BEGIN
  ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN END $$;

-- Drop and recreate policies (safe approach)
DROP POLICY IF EXISTS "Users can manage own reminders" ON reminders;
CREATE POLICY "Users can manage own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view analytics" ON notification_analytics;
CREATE POLICY "Admins can view analytics" ON notification_analytics FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Insert sample analytics (safe)
INSERT INTO notification_analytics (date, sent_count, delivered_count, opened_count, push_sent_count, email_sent_count) VALUES
  (CURRENT_DATE, 120, 115, 45, 80, 40),
  (CURRENT_DATE - 1, 98, 92, 38, 65, 33),
  (CURRENT_DATE - 2, 110, 105, 42, 72, 38)
ON CONFLICT (date) DO NOTHING;

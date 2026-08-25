-- Create tables for reminders and analytics
-- Run this in Supabase SQL Editor

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'wellness',
  title TEXT,
  message TEXT,
  scheduled_time TIME NOT NULL DEFAULT '09:00',
  is_active BOOLEAN DEFAULT true,
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification analytics table
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

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own reminders"
  ON reminders FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view analytics"
  ON notification_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON notification_analytics(date DESC);

-- Insert default reminders for existing users
INSERT INTO reminders (user_id, type, title, message, scheduled_time)
SELECT 
  p.id,
  'wellness',
  '🧘 Wellness Check',
  'How are you feeling today? Take a moment for your health.',
  '09:00'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM reminders r WHERE r.user_id = p.id AND r.type = 'wellness'
);

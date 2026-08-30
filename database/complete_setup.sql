-- HOME CARE AI - Complete Database Setup
-- Run this ENTIRE file in Supabase SQL Editor

-- ============================================
-- 1. REMINDERS TABLE
-- ============================================
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

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own reminders" ON reminders;
CREATE POLICY "Users can manage own reminders"
  ON reminders FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id, is_active);

-- ============================================
-- 2. RECOVERY PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recovery_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  symptom TEXT NOT NULL,
  remedy TEXT NOT NULL,
  severity INTEGER DEFAULT 3,
  total_hours FLOAT DEFAULT 72,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expected_completion TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recovery_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recovery plans" ON recovery_plans;
CREATE POLICY "Users can manage own recovery plans" ON recovery_plans FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recovery_plans_user ON recovery_plans(user_id, status);

-- ============================================
-- 3. RECOVERY MILESTONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recovery_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES recovery_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  expected_day INTEGER NOT NULL,
  expected_hour INTEGER DEFAULT 0,
  improvement_percent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  reached_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recovery_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own milestones" ON recovery_milestones;
CREATE POLICY "Users can view own milestones" ON recovery_milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM recovery_plans WHERE recovery_plans.id = recovery_milestones.plan_id AND recovery_plans.user_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_recovery_milestones_plan ON recovery_milestones(plan_id, expected_day);

-- ============================================
-- 4. RECOVERY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recovery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES recovery_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  symptom_severity INTEGER,
  energy_level INTEGER,
  notes TEXT,
  remedy_taken BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recovery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recovery logs" ON recovery_logs;
CREATE POLICY "Users can manage own recovery logs" ON recovery_logs FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recovery_logs_plan ON recovery_logs(plan_id, log_date);

-- ============================================
-- 5. TIMELINE EVENTS TABLE (Health Journey)
-- ============================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📌',
  metadata JSONB DEFAULT '{}',
  event_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own timeline events" ON timeline_events;
CREATE POLICY "Users can manage own timeline events"
  ON timeline_events FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_timeline_user_date ON timeline_events(user_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON timeline_events(user_id, event_type);

-- ============================================
-- 6. NOTIFICATION ANALYTICS TABLE
-- ============================================
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

ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view analytics" ON notification_analytics;
CREATE POLICY "Admins can view analytics"
  ON notification_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE INDEX IF NOT EXISTS idx_analytics_date ON notification_analytics(date DESC);

-- ============================================
-- 7. PROFILES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 8. FAVORITES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- ============================================
-- 9. CHAT SESSIONS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own chat sessions" ON chat_sessions;
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

-- ============================================
-- 10. MESSAGES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_emergency BOOLEAN DEFAULT false,
  followups JSONB DEFAULT '[]',
  related JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own messages" ON messages;
CREATE POLICY "Users can manage own messages" ON messages FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);

-- ============================================
-- 11. PUSH SUBSCRIPTIONS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);

-- ============================================
-- 12. NOTIFICATIONS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'All tables created successfully! 🎉' AS status;

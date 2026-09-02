-- Dashboard Home Page Schema
-- Run this in Supabase SQL Editor

-- Vitals tracking
CREATE TABLE IF NOT EXISTS vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  metric_type VARCHAR(50) NOT NULL, -- bp_systolic, bp_diastolic, weight, bmi, blood_sugar, temperature, heart_rate, oxygen
  value NUMERIC NOT NULL,
  unit VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Goals
CREATE TABLE IF NOT EXISTS health_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- water, sleep, steps, mood_log, meds, exercise
  target_value NUMERIC NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  level VARCHAR(20) DEFAULT 'Bronze', -- Bronze, Silver, Gold, Diamond
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_type)
);

-- Achievements/Badges
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_name VARCHAR(100) NOT NULL,
  badge_icon VARCHAR(20),
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_name)
);

-- Streak freezes (forgiveness system)
CREATE TABLE IF NOT EXISTS streak_freezes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  freezes_available INTEGER DEFAULT 1,
  freezes_used INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Family/Caregiver links
CREATE TABLE IF NOT EXISTS family_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship VARCHAR(50), -- parent, child, spouse, friend
  permissions JSONB DEFAULT '{"view_stats": true, "view_meds": false, "view_symptoms": true}'::jsonb,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caregiver_id, patient_id)
);

-- Medication reminders log
CREATE TABLE IF NOT EXISTS medication_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- pending, taken, missed, snoozed
  snooze_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily health score
CREATE TABLE IF NOT EXISTS daily_health_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score_date DATE DEFAULT CURRENT_DATE,
  total_score INTEGER, -- 0-100
  sleep_score INTEGER,
  nutrition_score INTEGER,
  activity_score INTEGER,
  mood_score INTEGER,
  hydration_score INTEGER,
  ai_briefing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, score_date)
);

-- Enable RLS
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_health_scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users manage own vitals" ON vitals;
DROP POLICY IF EXISTS "Users manage own goals" ON health_goals;
DROP POLICY IF EXISTS "Users manage own achievements" ON achievements;
DROP POLICY IF EXISTS "Users manage own freezes" ON streak_freezes;
DROP POLICY IF EXISTS "Caregivers can view linked patients" ON family_links;
DROP POLICY IF EXISTS "Users manage own timeline" ON medication_timeline;
DROP POLICY IF EXISTS "Users manage own scores" ON daily_health_scores;

-- Policies
CREATE POLICY "Users manage own vitals" ON vitals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own goals" ON health_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own freezes" ON streak_freezes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own timeline" ON medication_timeline FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own scores" ON daily_health_scores FOR ALL USING (auth.uid() = user_id);

-- Family links: caregiver can see their linked patients
CREATE POLICY "Caregivers can view linked patients" ON family_links
  FOR SELECT
  USING (auth.uid() = caregiver_id OR auth.uid() = patient_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vitals_user_date ON vitals(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_type ON vitals(user_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_goals_user ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_user_time ON medication_timeline(user_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON daily_health_scores(user_id, score_date DESC);
CREATE INDEX IF NOT EXISTS idx_family_caregiver ON family_links(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_family_patient ON family_links(patient_id);

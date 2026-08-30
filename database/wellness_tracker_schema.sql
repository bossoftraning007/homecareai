-- Sleep & Mood Tracker - Wellness Logs Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS wellness_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours FLOAT CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  mood VARCHAR(20) CHECK (mood IN ('happy', 'sad', 'anxious', 'calm', 'energetic', 'tired', 'angry', 'stressed')),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  water_glasses INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Enable RLS
ALTER TABLE wellness_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can manage own wellness logs" ON wellness_logs;

-- Policies
CREATE POLICY "Users can manage own wellness logs"
  ON wellness_logs FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wellness_user_date ON wellness_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_mood ON wellness_logs(user_id, mood);
CREATE INDEX IF NOT EXISTS idx_wellness_date ON wellness_logs(log_date DESC);

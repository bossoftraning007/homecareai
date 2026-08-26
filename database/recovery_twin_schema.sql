-- Live Health Twin - Recovery Tracking Schema
-- Run this in Supabase SQL Editor

-- Recovery Plans: Generated when user starts a remedy routine
CREATE TABLE IF NOT EXISTS recovery_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  symptom TEXT NOT NULL,
  remedy TEXT NOT NULL,
  severity INTEGER DEFAULT 3, -- 1-5 scale
  total_hours FLOAT DEFAULT 72, -- predicted recovery hours
  status TEXT DEFAULT 'active', -- active, completed, paused
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expected_completion TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery Milestones: Predicted checkpoints along the recovery path
CREATE TABLE IF NOT EXISTS recovery_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES recovery_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  expected_day INTEGER NOT NULL, -- day number from start
  expected_hour INTEGER DEFAULT 0, -- hour within the day
  improvement_percent INTEGER DEFAULT 0, -- expected % improvement
  status TEXT DEFAULT 'pending', -- pending, reached, missed
  reached_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery Logs: Daily progress entries from users
CREATE TABLE IF NOT EXISTS recovery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES recovery_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  symptom_severity INTEGER, -- 1-5 scale
  energy_level INTEGER, -- 1-5 scale
  notes TEXT,
  remedy_taken BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recovery_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own recovery plans" ON recovery_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own milestones" ON recovery_milestones FOR ALL USING (EXISTS (SELECT 1 FROM recovery_plans WHERE recovery_plans.id = recovery_milestones.plan_id AND recovery_plans.user_id = auth.uid()));
CREATE POLICY "Users can manage own recovery logs" ON recovery_logs FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recovery_plans_user ON recovery_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_recovery_milestones_plan ON recovery_milestones(plan_id, expected_day);
CREATE INDEX IF NOT EXISTS idx_recovery_logs_plan ON recovery_logs(plan_id, log_date);

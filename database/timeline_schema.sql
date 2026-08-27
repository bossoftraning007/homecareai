-- My Health Journey - Timeline Events Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'chat', 'medication', 'wellness', 'recovery', 'symptom', 'achievement'
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📌',
  metadata JSONB DEFAULT '{}', -- Flexible data storage
  event_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own timeline events"
  ON timeline_events FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_timeline_user_date ON timeline_events(user_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON timeline_events(user_id, event_type);

-- Function to auto-log events
CREATE OR REPLACE FUNCTION log_timeline_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT '📌',
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO timeline_events (user_id, event_type, title, description, icon, metadata)
  VALUES (p_user_id, p_event_type, p_title, p_description, p_icon, p_metadata)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

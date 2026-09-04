-- Symptom Time Machine Schema
-- Stores interactive Q&A sessions and root cause analysis

CREATE TABLE IF NOT EXISTS symptom_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_symptom TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, abandoned
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Q&A pairs
CREATE TABLE IF NOT EXISTS symptom_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES symptom_sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  question_type VARCHAR(30), -- text, yes_no, scale, multiple_choice
  asked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Final analysis
CREATE TABLE IF NOT EXISTS symptom_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES symptom_sessions(id) ON DELETE CASCADE UNIQUE,
  likely_causes TEXT[], -- ['lack of sleep', 'dehydration']
  confidence_scores JSONB, -- {"lack_of_sleep": 75, "dehydration": 45}
  recommendations TEXT[],
  timeline_events JSONB, -- structured timeline of events
  red_flags TEXT[], -- emergency warnings
  severity VARCHAR(20) DEFAULT 'mild', -- mild, moderate, severe
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON symptom_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_session ON symptom_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_analysis_session ON symptom_analysis(session_id);

ALTER TABLE symptom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own sessions" ON symptom_sessions;
DROP POLICY IF EXISTS "Users manage own answers" ON symptom_answers;
DROP POLICY IF EXISTS "Users manage own analysis" ON symptom_analysis;

CREATE POLICY "Users manage own sessions" ON symptom_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own answers" ON symptom_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM symptom_sessions WHERE id = symptom_answers.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own analysis" ON symptom_analysis FOR ALL USING (
  EXISTS (SELECT 1 FROM symptom_sessions WHERE id = symptom_analysis.session_id AND user_id = auth.uid())
);

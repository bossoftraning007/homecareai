-- AI Health Twin Schema
-- Stores historical data, predictions, and AI insights

CREATE TABLE IF NOT EXISTS health_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  predicted_health_score INTEGER, -- 0-100
  predicted_sleep_hours FLOAT,
  predicted_mood VARCHAR(20),
  predicted_energy INTEGER, -- 1-5
  predicted_risk_level VARCHAR(20), -- low, moderate, high
  risk_factors TEXT[], -- e.g., ['low_sleep', 'high_stress']
  recommendations TEXT[], -- personalized tips
  confidence_score INTEGER, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON health_predictions(user_id, prediction_date DESC);

-- Insights generated for the user
CREATE TABLE IF NOT EXISTS health_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50), -- trend, pattern, alert, prediction
  title TEXT NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  related_metric VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_user ON health_insights(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE health_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own predictions" ON health_predictions;
DROP POLICY IF EXISTS "Users manage own insights" ON health_insights;

CREATE POLICY "Users manage own predictions" ON health_predictions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own insights" ON health_insights FOR ALL USING (auth.uid() = user_id);

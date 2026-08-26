-- Push Subscriptions Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

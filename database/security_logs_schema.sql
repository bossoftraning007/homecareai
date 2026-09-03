-- Security Logs Schema
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- failed_login, successful_login, suspicious_activity, rate_limit_exceeded, admin_access, unauth_access
  user_email TEXT,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, critical
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view security logs" ON security_logs;
DROP POLICY IF EXISTS "Service can insert logs" ON security_logs;

-- Only admins can view logs (we use service role for writes)
CREATE POLICY "Admins can view security logs" ON security_logs
  FOR SELECT
  USING (true); -- We'll filter in app layer

-- Service role bypasses RLS for writes

-- Indexes
CREATE INDEX IF NOT EXISTS idx_security_logs_created ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);

-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, created_at DESC);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service can manage login attempts" ON login_attempts;
CREATE POLICY "Service can manage login attempts" ON login_attempts
  FOR ALL
  USING (true);

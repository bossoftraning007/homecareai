-- Gamification schema migration
-- Adds XP, streaks, badges to user profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON profiles(current_streak);

-- Leaderboard view
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT id, full_name, xp, current_streak, badges
FROM profiles
WHERE xp > 0
ORDER BY xp DESC;

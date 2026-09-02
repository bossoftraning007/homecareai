-- Health Library Schema
-- Run this in Supabase SQL Editor

-- Original AI-generated articles
CREATE TABLE IF NOT EXISTS health_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- nutrition, sleep, mental_health, exercise, remedies, conditions, wellness
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 5, -- minutes
  author VARCHAR(100) DEFAULT 'HomeCare AI',
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health survey/trend facts for AI personalization
CREATE TABLE IF NOT EXISTS health_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fact TEXT NOT NULL,
  category VARCHAR(50),
  source VARCHAR(200), -- e.g., "WHO 2023", "CDC Report"
  relevance_tags TEXT[] DEFAULT '{}', -- e.g., ["hydration", "adults", "global"]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User bookmarks
CREATE TABLE IF NOT EXISTS article_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES health_articles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Article read history (for personalization)
CREATE TABLE IF NOT EXISTS article_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES health_articles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE health_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read published articles" ON health_articles;
DROP POLICY IF EXISTS "Anyone can read trends" ON health_trends;
DROP POLICY IF EXISTS "Users manage own bookmarks" ON article_bookmarks;
DROP POLICY IF EXISTS "Users manage own views" ON article_views;

-- Articles: public read for published
CREATE POLICY "Anyone can read published articles" ON health_articles
  FOR SELECT USING (is_published = TRUE);

-- Trends: public read
CREATE POLICY "Anyone can read trends" ON health_trends
  FOR SELECT USING (is_active = TRUE);

-- Bookmarks: own only
CREATE POLICY "Users manage own bookmarks" ON article_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Views: own only
CREATE POLICY "Users manage own views" ON article_views
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_articles_category ON health_articles(category, is_published);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON health_articles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_created ON health_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON health_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON article_bookmarks(user_id);

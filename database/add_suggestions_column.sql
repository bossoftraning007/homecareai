-- Add suggestions column to messages table
-- Run this in Supabase SQL Editor

ALTER TABLE messages ADD COLUMN IF NOT EXISTS suggestions JSONB DEFAULT '[]';

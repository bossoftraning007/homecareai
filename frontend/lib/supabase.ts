import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if credentials exist
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  language: string
  theme: string
  created_at: string
}

export type ChatSession = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export type MessageDB = {
  id: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  is_emergency: boolean
  created_at: string
}

export type Favorite = {
  id: string
  user_id: string
  content: string
  category: string | null
  created_at: string
}

export type WellnessEntry = {
  id: string
  user_id: string
  entry_date: string
  mood: number
  water: number
  sleep: number
  exercise: boolean
  notes: string | null
  created_at: string
}

export type Reminder = {
  id: string
  user_id: string
  title: string
  time: string
  frequency: string
  active: boolean
  created_at: string
}
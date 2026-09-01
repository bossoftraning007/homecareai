'use client'
import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Auth not configured' } as any }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Auth not configured' } as any }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Auth not configured' } as any }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/chat`,
      },
    })
    if (data?.url) {
      window.location.href = data.url
    }
    return { data, error }
  }

  const signInWithFacebook = async () => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Auth not configured' } as any }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/chat`,
      },
    })
    if (data?.url) {
      window.location.href = data.url
    }
    return { data, error }
  }

  const signInWithTwitter = async () => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Auth not configured' } as any }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}/chat`,
      },
    })
    if (data?.url) {
      window.location.href = data.url
    }
    return { data, error }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return { error: null }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut,
  }
}
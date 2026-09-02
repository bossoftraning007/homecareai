'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type DashboardData = {
  health_score: { total: number; breakdown: any[]; grade: string; vitals_alert: boolean }
  ai_briefing: { greeting: string; message: string; tip: string; all_tips: string[]; priority: string | null }
  today_wellness: any
  recent_vitals: any[]
  active_medications: any[]
  medication_timeline: any[]
  goals: any[]
  achievements: any[]
  streak_freezes: { freezes_available: number; freezes_used: number }
  caregivers: any[]
  recent_symptoms: any[]
  total_xp: number
  user_level: { name: string; icon: string; color: string; next_xp: number | null }
  current_date: string
}

const QUICK_LOG_MOODS = [
  { value: 'happy', emoji: '😄', label: 'Happy' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'energetic', emoji: '⚡', label: 'Energetic' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'stressed', emoji: '😫', label: 'Stressed' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

export default function DashboardPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuickLog, setShowQuickLog] = useState(false)
  const [showVitalsModal, setShowVitalsModal] = useState(false)
  const [userName, setUserName] = useState('Friend')

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadDashboard()
    loadUserName()
  }, [mounted, user])

  const loadUserName = async () => {
    if (!user) {
      setUserName('Friend')
      return
    }
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Friend'
    setUserName(name)
  }

  const loadDashboard = async () => {
    setLoading(true)
    try {
      if (!user) {
        setData(getGuestDashboard())
        return
      }

      const res = await fetch(`${API_URL}/api/dashboard`, {
        headers: { 'x-user-id': user.id },
      })

      if (res.ok) {
        const dashboardData = await res.json()
        setData(dashboardData)
      } else {
        setData(getGuestDashboard())
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
      setData(getGuestDashboard())
    } finally {
      setLoading(false)
    }
  }

  const getGuestDashboard = (): DashboardData => ({
    health_score: { total: 75, breakdown: [], grade: 'B', vitals_alert: false },
    ai_briefing: {
      greeting: 'Welcome to HomeCare AI!',
      message: 'Login to unlock personalized health insights.',
      tip: '💡 Tip: Log your daily wellness to build healthy habits.',
      all_tips: [],
      priority: 'Sign in to get started',
    },
    today_wellness: null,
    recent_vitals: [],
    active_medications: [],
    medication_timeline: [],
    goals: [],
    achievements: [],
    streak_freezes: { freezes_available: 1, freezes_used: 0 },
    caregivers: [],
    recent_symptoms: [],
    total_xp: 0,
    user_level: { name: 'Bronze', icon: '🥉', color: 'amber', next_xp: 200 },
    current_date: new Date().toISOString().split('T')[0],
  })

  const handleQuickLog = async (type: string, value?: string) => {
    if (!user) {
      toast.error('Please login to use Quick Log')
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/dashboard/quick-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ type, ...(value && { mood: value }) }),
      })

      if (res.ok) {
        if (type === 'water') toast.success('💧 Water logged!', { icon: '💧' })
        else if (type === 'mood') toast.success(`Mood: ${value}`, { icon: '😊' })
        loadDashboard()
        setShowQuickLog(false)
      } else {
        toast.error('Failed to log. Try again.')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleSnoozeMed = async (timelineId: string) => {
    if (!user) return
    try {
      await fetch(`${API_URL}/api/dashboard/snooze-medication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ timeline_id: timelineId, minutes: 15 }),
      })
      toast.success('⏰ Snoozed for 15 minutes')
      loadDashboard()
    } catch {
      toast.error('Failed to snooze')
    }
  }

  const handleTakeMed = async (timelineId: string) => {
    if (!user) return
    try {
      await fetch(`${API_URL}/api/dashboard/quick-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ type: 'medication_taken', timeline_id: timelineId }),
      })
      toast.success('✅ Medication marked as taken!', { icon: '💊' })
      loadDashboard()
    } catch {
      toast.error('Failed to update')
    }
  }

  if (!mounted) return null

  if (loading && !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 to-teal-100'}`}>
        <div className="text-center">
          <div className="text-5xl animate-bounce">🏠</div>
          <p className={`mt-3 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const scoreColor = data!.health_score.total >= 80 ? 'emerald' : data!.health_score.total >= 60 ? 'amber' : 'red'

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-teal-950'
      : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/80 border-emerald-800' : 'bg-white/80 border-emerald-200'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏠</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              Hello, {userName}!
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && data.total_xp > 0 && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
              {data.user_level.icon} {data.user_level.name}
            </div>
          )}
          <a href="/chat" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-700 text-emerald-300' : 'bg-white/70 border-emerald-200 text-emerald-700'}`}>
            💬
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* AI Daily Briefing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-md border rounded-2xl p-5 shadow-lg ${isDark ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-700' : 'bg-gradient-to-br from-emerald-100/80 to-teal-100/80 border-emerald-300'}`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg flex-shrink-0">
              🤖
            </div>
            <div className="flex-1">
              <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                AI DAILY BRIEFING
              </div>
              <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {data?.ai_briefing.greeting}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {data?.ai_briefing.message}
              </p>
              {data?.ai_briefing.priority && (
                <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                  🎯 Priority: {data.ai_briefing.priority}
                </div>
              )}
              {data?.ai_briefing.tip && (
                <p className={`mt-2 text-sm italic ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {data.ai_briefing.tip}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`backdrop-blur-md border rounded-2xl p-5 shadow-lg ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/80 border-emerald-200'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📊 Today's Health Score
            </h3>
            <div className="text-right">
              <div className={`text-4xl font-black ${isDark ? `text-${scoreColor}-400` : `text-${scoreColor}-600`}`}>
                {data?.health_score.total}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/ 100 · Grade {data?.health_score.grade}</div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="space-y-2">
            {data?.health_score.breakdown.map((cat: any) => {
              const pct = (cat.score / cat.max) * 100
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {cat.icon} {cat.category}
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {cat.score}/{cat.max}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {data?.health_score.vitals_alert && (
            <div className={`mt-3 p-3 rounded-xl text-sm ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
              ⚠️ Some vital readings need attention!
            </div>
          )}
        </motion.div>

        {/* Quick Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`backdrop-blur-md border rounded-2xl p-5 shadow-lg ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/80 border-emerald-200'}`}
        >
          <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ⚡ Quick Log
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLog('water')}
              className={`p-4 rounded-xl text-center transition-all ${isDark ? 'bg-blue-900/30 hover:bg-blue-800/40 text-blue-300' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}
            >
              <div className="text-2xl mb-1">💧</div>
              <div className="text-xs font-semibold">+1 Glass</div>
              <div className="text-xs opacity-70 mt-1">
                {data?.today_wellness?.water_glasses || 0}/8
              </div>
            </button>

            <button
              onClick={() => setShowQuickLog(true)}
              className={`p-4 rounded-xl text-center transition-all ${isDark ? 'bg-pink-900/30 hover:bg-pink-800/40 text-pink-300' : 'bg-pink-50 hover:bg-pink-100 text-pink-700'}`}
            >
              <div className="text-2xl mb-1">😊</div>
              <div className="text-xs font-semibold">Mood</div>
              <div className="text-xs opacity-70 mt-1 truncate">
                {data?.today_wellness?.mood || 'Log now'}
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/sleep-mood'}
              className={`p-4 rounded-xl text-center transition-all ${isDark ? 'bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-300' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'}`}
            >
              <div className="text-2xl mb-1">🌙</div>
              <div className="text-xs font-semibold">Sleep</div>
              <div className="text-xs opacity-70 mt-1">
                {data?.today_wellness?.sleep_hours || 0}h
              </div>
            </button>
          </div>
        </motion.div>

        {/* Medication Timeline */}
        {data && data.medication_timeline.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`backdrop-blur-md border rounded-2xl p-5 shadow-lg ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/80 border-emerald-200'}`}
          >
            <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              💊 Today's Medications
            </h3>

            <div className="space-y-2">
              {data.medication_timeline.map((item: any) => {
                const time = new Date(item.scheduled_time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
                const isPending = item.status === 'pending'
                const isTaken = item.status === 'taken'
                return (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className={`w-12 text-center font-mono text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {time}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.medications?.name || 'Medication'}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.medications?.dosage} · {item.status}
                      </div>
                    </div>
                    {isPending && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleTakeMed(item.id)}
                          className="px-2 py-1 rounded-lg text-xs bg-emerald-500 text-white"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleSnoozeMed(item.id)}
                          className="px-2 py-1 rounded-lg text-xs bg-amber-500 text-white"
                        >
                          ⏰
                        </button>
                      </div>
                    )}
                    {isTaken && <span className="text-emerald-500">✅</span>}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { icon: '💗', label: 'Vitals', href: '/vitals', color: 'red' },
            { icon: '🎯', label: 'Goals', href: '/goals', color: 'emerald' },
            { icon: '📊', label: 'Reports', href: '/reports', color: 'blue' },
            { icon: '💊', label: 'Meds', href: '/medications', color: 'purple' },
            { icon: '🌙', label: 'Sleep', href: '/sleep-mood', color: 'indigo' },
            { icon: '🚨', label: 'SOS', href: '/emergency', color: 'red' },
            { icon: '👨‍👩‍👧', label: 'Family', href: '/caregiver', color: 'pink' },
            { icon: '💬', label: 'AI Chat', href: '/chat', color: 'teal' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`backdrop-blur-md border rounded-2xl p-4 text-center transition-all hover:scale-105 ${isDark ? `bg-gray-800/70 border-${action.color}-800 hover:bg-gray-700/70` : `bg-white/80 border-${action.color}-200 hover:bg-white`}`}
            >
              <div className="text-3xl mb-1">{action.icon}</div>
              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{action.label}</div>
            </a>
          ))}
        </motion.div>

        {/* Recent Symptoms */}
        {data && data.recent_symptoms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`backdrop-blur-md border rounded-2xl p-5 shadow-lg ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/80 border-emerald-200'}`}
          >
            <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🩺 Recent Symptoms
            </h3>
            <div className="space-y-2">
              {data.recent_symptoms.slice(0, 3).map((s: any) => (
                <div key={s.id} className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {s.title || s.description}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(s.event_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Streak Freeze */}
        {data && data.streak_freezes.freezes_available > 0 && (
          <div className={`p-3 rounded-xl text-center text-sm ${isDark ? 'bg-cyan-900/30 text-cyan-300' : 'bg-cyan-50 text-cyan-700'}`}>
            ❄️ You have {data.streak_freezes.freezes_available} Streak Freeze available!
          </div>
        )}

        {/* Login prompt for guests */}
        {!user && (
          <div className={`p-4 rounded-2xl text-center ${isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
            💡 <a href="/login" className="underline font-semibold">Login</a> to unlock all features and sync your data!
          </div>
        )}
      </div>

      {/* Quick Log Mood Modal */}
      <AnimatePresence>
        {showQuickLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowQuickLog(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                How are you feeling?
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_LOG_MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => handleQuickLog('mood', m.value)}
                    className={`p-3 rounded-xl text-center transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className="text-2xl mb-1">{m.emoji}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{m.label}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowQuickLog(false)}
                className={`mt-4 w-full py-2 rounded-xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

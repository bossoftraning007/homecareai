'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useAuth } from '@/lib/useAuth'
import { supabase, type WellnessEntry, type Medication, TRACKER_KEY, MEDICATION_STORAGE_KEY } from '@/lib/supabase'

type Stats = {
  daysTracked: number
  avgMood: number
  avgWater: number
  avgSleep: number
  exerciseStreak: number
  medicationAdherence: number
  activeMeds: number
}

const API_URL = 'https://homecareai-backend.onrender.com'

export default function InsightsPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [entries, setEntries] = useState<WellnessEntry[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [mounted, setMounted] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)

  const isDark = theme === 'dark'

  const loadFromLocal = () => {
    const savedW = localStorage.getItem(TRACKER_KEY)
    if (savedW) {
      try { setEntries(JSON.parse(savedW)) } catch {}
    }

    const savedM = localStorage.getItem(MEDICATION_STORAGE_KEY)
    if (savedM) {
      try { setMedications(JSON.parse(savedM)) } catch {}
    }
  }

  const loadFromCloud = async () => {
    if (!user) return
    const { data: wellness } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: true })

    if (wellness) setEntries(wellness as WellnessEntry[])

    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (meds) setMedications(meds as Medication[])
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (user) {
      loadFromCloud()
    } else {
      loadFromLocal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user])

  const getStats = (): Stats => {
    const daysTracked = entries.length
    const avgMood = entries.length > 0
      ? entries.reduce((s, e) => s + (e.mood || 0), 0) / entries.length
      : 0
    const avgWater = entries.length > 0
      ? entries.reduce((s, e) => s + (e.water || 0), 0) / entries.length
      : 0
    const avgSleep = entries.length > 0
      ? entries.reduce((s, e) => s + (e.sleep || 0), 0) / entries.length
      : 0

    const streakCount = entries
      .filter(e => e.exercise || (e.mood || 0) >= 3)
      .length

    const activeMeds = medications.filter(m => m.is_active).length
    const medAdherence = medications.length > 0
      ? (activeMeds / medications.length) * 100
      : 0

    return {
      daysTracked,
      avgMood: Math.round(avgMood * 10) / 10,
      avgWater: Math.round(avgWater * 10) / 10,
      avgSleep: Math.round(avgSleep * 10) / 10,
      exerciseStreak: streakCount,
      medicationAdherence: Math.round(medAdherence),
      activeMeds,
    }
  }

  const generateInsights = async () => {
    if (!entries.length && !medications.length) {
      toast.error('No health data yet!')
      return
    }

    setLoadingInsights(true)
    setInsights(null)

    const stats = getStats()
    const recentEntries = entries.slice(-14)

    const prompt = `You are a health insights assistant. Analyze this health data and provide 3-5 actionable insights. Keep paragraphs short and use bullet points where possible.

Wellness Summary:
- Days tracked: ${stats.daysTracked}
- Average mood: ${stats.avgMood}/5
- Average water: ${stats.avgWater} glasses/day
- Average sleep: ${stats.avgSleep} hours/night
- Exercise sessions: ${stats.exerciseStreak}
- Medication adherence: ${stats.medicationAdherence}%

Recent 14-day data: ${JSON.stringify(recentEntries.map(e => ({
      date: e.entry_date || e.date,
      mood: e.mood,
      water: e.water,
      sleep: e.sleep,
      exercise: e.exercise,
    })))}

Active medications: ${medications.filter(m => m.is_active).map(m => m.name).join(', ')}

Generate health insights like a caring doctor would. Include patterns noticed, recommendations for improvement, and positive reinforcement.`

    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        messages: [{ role: 'user', content: prompt }],
      })
      setInsights(res.data.reply)
    } catch {
      toast.error('Failed to generate insights')
    } finally {
      setLoadingInsights(false)
    }
  }

  const chartData = entries.slice(-14).map(e => ({
    date: new Date(e.entry_date || e.date || '').toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    mood: e.mood,
    water: e.water,
    sleep: e.sleep,
  }))

  const moodEmojis = ['😢', '😔', '😐', '🙂', '😄']

  if (!mounted) return null

  const stats = getStats()

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Health Insights Dashboard
            </div>
            <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              {user && <span className="text-blue-500">☁️</span>}
              {stats.daysTracked} days tracked
            </div>
          </div>
        </div>
        <Link href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
          🏠
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {!user && (
          <div className={`p-3 rounded-xl text-center text-sm ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
            💡 <Link href="/login" className="underline font-semibold">Login</Link> to sync health data across devices!
          </div>
        )}

        {(!entries.length && !medications.length) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-8 shadow-md text-center ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
          >
            <div className="text-5xl mb-3">📊</div>
            <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              No health data yet
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Track your wellness on the Tracker page and medications on the Medication page to see insights here.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/tracker" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all">
                📊 Open Tracker
              </Link>
              <Link href="/medications" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 shadow-md transition-all">
                💊 Medications
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                📈 Health Statistics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Days Tracked', value: stats.daysTracked, icon: '📅', color: 'from-blue-500 to-cyan-500' },
                  { label: 'Avg Mood', value: `${moodEmojis[Math.round(stats.avgMood) - 1]} ${stats.avgMood}/5`, icon: '😊', color: 'from-yellow-500 to-orange-500' },
                  { label: 'Avg Water', value: `${stats.avgWater}💧`, icon: '💧', color: 'from-sky-500 to-blue-500' },
                  { label: 'Avg Sleep', value: `${stats.avgSleep}h`, icon: '💤', color: 'from-indigo-500 to-purple-500' },
                  { label: 'Exercise Sessions', value: stats.exerciseStreak, icon: '🏃', color: 'from-green-500 to-teal-500' },
                  { label: 'Med Adherence', value: `${stats.medicationAdherence}%`, icon: '💊', color: 'from-emerald-500 to-green-600' },
                  { label: 'Active Meds', value: stats.activeMeds, icon: '✅', color: 'from-teal-500 to-cyan-500' },
                  { label: 'Wellness Score', value: `${Math.round((stats.avgMood / 5 * 30 + stats.avgWater / 8 * 25 + stats.avgSleep / 8 * 25 + (stats.exerciseStreak > 0 ? 20 : 0)))}`, icon: '🌟', color: 'from-purple-500 to-pink-500' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`backdrop-blur-sm border rounded-xl p-3 text-center shadow-md ${isDark ? 'bg-gray-900/50 border-emerald-900' : 'bg-white/50 border-green-100'}`}
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{stat.value}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {entries.length > 0 && chartData.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  📊 Last 14 Days Trends
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#164e39' : '#d1fae5'} />
                    <XAxis dataKey="date" stroke={isDark ? '#6ee7b7' : '#065f46'} style={{ fontSize: 11 }} />
                    <YAxis stroke={isDark ? '#6ee7b7' : '#065f46'} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="mood" stroke="#f59e0b" strokeWidth={2} name="Mood" />
                    <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} name="Water" />
                    <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} name="Sleep" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                💊 Medication Overview
              </h2>
              {medications.length > 0 ? (
                <div className="space-y-3">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${isDark ? 'bg-gray-900/50 border border-emerald-900' : 'bg-white/50 border border-green-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-xl`}>💊</div>
                        <div>
                          <div className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{med.name}</div>
                          <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                            {med.dosage && `${med.dosage} · `}
                            {med.frequency}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${med.is_active
                        ? (isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-green-100 text-green-700')
                        : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')
                      }`}>
                        {med.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                  No medications tracked. <Link href="/medications" className={`underline ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>Add one</Link>.
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  🌱 AI Health Insights
                </h2>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={generateInsights}
                  disabled={loadingInsights}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${isDark
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 disabled:opacity-60'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 disabled:opacity-60'
                  }`}
                >
                  {loadingInsights ? '⏳ Analyzing...' : '🔄 Generate Insights'}
                </motion.button>
              </div>

              <AnimatePresence>
                {insights ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}
                  >
                    {insights.split('\n').map((paragraph, i) => (
                      <p key={i} className={isDark ? 'text-emerald-100' : 'text-gray-700'}>{paragraph}</p>
                    ))}
                  </motion.div>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                    Click &quot;Generate Insights&quot; for AI-powered analysis of your health trends.
                  </p>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

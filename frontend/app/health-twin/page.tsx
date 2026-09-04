'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts'
import { useAuth } from '@/lib/useAuth'

type Prediction = {
  date: string
  day_name: string
  health_score: number
  sleep_hours: number
  mood: string
  energy: number
  risk_level: string
  risk_factors: string[]
  recommendations: string[]
}

type TwinData = {
  current_score: number
  current_metrics: {
    avg_sleep_hours: number
    avg_mood_score: number
    avg_energy: number
    avg_bp: number
    avg_hr: number
  }
  trends: {
    sleep_change: number
    mood_change: number
    weight_change: number
  }
  risk_level: string
  risk_factors: string[]
  next_7_days: Prediction[]
  insights: { type: string; title: string; description: string; priority: string; metric?: string }[]
  confidence: number
  data_points_analyzed: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

const MOOD_EMOJI: Record<string, string> = {
  happy: '😄', calm: '😌', energetic: '⚡', tired: '😴',
  sad: '😢', anxious: '😰', stressed: '😫', angry: '😠',
}

const DEMO_DATA: TwinData = {
  current_score: 78,
  current_metrics: {
    avg_sleep_hours: 7.2,
    avg_mood_score: 3.8,
    avg_energy: 3.5,
    avg_bp: 122,
    avg_hr: 74,
  },
  trends: {
    sleep_change: 0.3,
    mood_change: 0.2,
    weight_change: -0.5,
  },
  risk_level: 'low',
  risk_factors: [],
  next_7_days: [
    { date: '2026-09-05', day_name: 'Friday', health_score: 80, sleep_hours: 7.4, mood: 'happy', energy: 4, risk_level: 'low', risk_factors: [], recommendations: ['Maintain current routine'] },
    { date: '2026-09-06', day_name: 'Saturday', health_score: 82, sleep_hours: 7.8, mood: 'energetic', energy: 4, risk_level: 'low', risk_factors: [], recommendations: ['Great day for outdoor activities'] },
    { date: '2026-09-07', day_name: 'Sunday', health_score: 85, sleep_hours: 8.2, mood: 'happy', energy: 4, risk_level: 'low', risk_factors: [], recommendations: ['Relax and recover'] },
    { date: '2026-09-08', day_name: 'Monday', health_score: 76, sleep_hours: 6.9, mood: 'tired', energy: 3, risk_level: 'low', risk_factors: [], recommendations: ['Start week strong with morning walk'] },
    { date: '2026-09-09', day_name: 'Tuesday', health_score: 78, sleep_hours: 7.1, mood: 'calm', energy: 3, risk_level: 'low', risk_factors: [], recommendations: ['Maintain consistency'] },
    { date: '2026-09-10', day_name: 'Wednesday', health_score: 80, sleep_hours: 7.5, mood: 'happy', energy: 4, risk_level: 'low', risk_factors: [], recommendations: ['Mid-week check-in with vitals'] },
    { date: '2026-09-11', day_name: 'Thursday', health_score: 79, sleep_hours: 7.3, mood: 'calm', energy: 4, risk_level: 'low', risk_factors: [], recommendations: ['Continue healthy patterns'] },
  ],
  insights: [
    {
      type: 'trend',
      title: 'Positive Sleep Trajectory',
      description: 'Your sleep has improved by 0.3 hours over the last week. This correlates with better mood and energy levels.',
      priority: 'positive',
      metric: 'sleep',
    },
    {
      type: 'pattern',
      title: 'Weekend Boost',
      description: 'You consistently feel better on weekends. Consider what changes you could bring to weekdays.',
      priority: 'low',
    },
    {
      type: 'positive',
      title: 'Excellent Energy Levels',
      description: 'Your energy is in the top 30% of users. Keep up your current routine!',
      priority: 'positive',
      metric: 'energy',
    },
  ],
  confidence: 75,
  data_points_analyzed: 24,
}

export default function HealthTwinPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<TwinData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadTwin()
  }, [mounted, user])

  const loadTwin = async () => {
    setLoading(true)
    try {
      if (!user) {
        setData(DEMO_DATA)
        return
      }
      const res = await fetch(`${API_URL}/api/health-twin`, {
        headers: { 'x-user-id': user.id },
      })
      if (res.ok) {
        const twinData = await res.json()
        if (twinData && twinData.data_points_analyzed > 0) {
          setData(twinData)
        } else {
          setData(DEMO_DATA)
        }
      } else {
        setData(DEMO_DATA)
      }
    } catch {
      setData(DEMO_DATA)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (loading && !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-purple-50'}`}>
        <div className="text-center">
          <div className="text-5xl animate-bounce">🧬</div>
          <p className={`mt-3 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Analyzing your health patterns...</p>
        </div>
      </div>
    )
  }

  const chartData = data!.next_7_days.map((p, i) => ({
    day: p.day_name.substring(0, 3),
    score: p.health_score,
    today: i === 0,
  }))

  const riskColor = {
    low: 'emerald',
    moderate: 'amber',
    high: 'red',
    unknown: 'gray',
  }[data!.risk_level] || 'gray'

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-950'
      : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/80 border-purple-800' : 'bg-white/80 border-purple-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧬</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
              AI Health Twin
            </div>
            <div className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              7-day health prediction
            </div>
          </div>
        </div>
        <a href="/dashboard" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-purple-800 text-purple-300' : 'bg-white/70 border-purple-200 text-purple-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Disclaimer */}
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border-l-4 ${isDark ? 'bg-amber-900/30 border-amber-500' : 'bg-amber-50 border-amber-500'}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <div className={`text-xs font-bold mb-1 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  MEDICAL DISCLAIMER
                </div>
                <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                  These predictions are <strong>AI-generated estimates based on your logged data</strong>. They are NOT medical diagnoses.
                  Always consult a qualified doctor for serious health concerns. In emergencies, call your local emergency number.
                </p>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className={`mt-2 text-xs underline ${isDark ? 'text-amber-300' : 'text-amber-700'}`}
                >
                  I understand, hide this
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl shadow-lg ${
            isDark
              ? 'bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-700'
              : 'bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-xs font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                YOUR HEALTH TWIN SCORE
              </div>
              <div className={`text-6xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {data!.current_score}
              </div>
              <div className={`text-xs ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                out of 100
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                CONFIDENCE
              </div>
              <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {data!.confidence}%
              </div>
              <div className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>
                {data!.data_points_analyzed} data points
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-3 py-1 rounded-full font-bold ${
              riskColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-500' :
              riskColor === 'amber' ? 'bg-amber-500/20 text-amber-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {riskColor === 'emerald' ? '✓ LOW RISK' : riskColor === 'amber' ? '⚠ MODERATE' : '⚠ HIGH RISK'}
            </span>
            <span className={isDark ? 'text-purple-300' : 'text-purple-700'}>
              Risk level for the next 7 days
            </span>
          </div>
        </motion.div>

        {/* 7-Day Prediction Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-5 rounded-2xl shadow-lg ${isDark ? 'bg-gray-800/70 border border-purple-800' : 'bg-white border border-purple-200'}`}
        >
          <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🔮 7-Day Health Forecast
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e9d5ff'} />
              <XAxis dataKey="day" stroke={isDark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 12 }} />
              <YAxis domain={[40, 100]} stroke={isDark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
              <Area type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} fill="url(#scoreGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Current Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-5 rounded-2xl shadow-lg ${isDark ? 'bg-gray-800/70 border border-purple-800' : 'bg-white border border-purple-200'}`}
        >
          <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📊 Current Health Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Sleep', value: `${data!.current_metrics.avg_sleep_hours}h`, icon: '💤', change: data!.trends.sleep_change, good: data!.trends.sleep_change >= 0 },
              { label: 'Mood', value: data!.current_metrics.avg_mood_score.toFixed(1), icon: '😊', change: data!.trends.mood_change, good: data!.trends.mood_change >= 0 },
              { label: 'Energy', value: `${data!.current_metrics.avg_energy.toFixed(1)}/5`, icon: '⚡', change: 0, good: true },
              { label: 'BP', value: `${data!.current_metrics.avg_bp}`, icon: '🩸', change: 0, good: data!.current_metrics.avg_bp < 130 },
              { label: 'Weight', value: `${data!.trends.weight_change >= 0 ? '+' : ''}${data!.trends.weight_change}kg`, icon: '⚖️', change: data!.trends.weight_change, good: true },
            ].map((m, i) => (
              <div key={i} className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{m.value}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{m.label}</div>
                {m.change !== 0 && (
                  <div className={`text-xs mt-1 ${m.good ? 'text-emerald-500' : 'text-red-500'}`}>
                    {m.change > 0 ? '↑' : '↓'} {Math.abs(m.change).toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-5 rounded-2xl shadow-lg ${isDark ? 'bg-gray-800/70 border border-purple-800' : 'bg-white border border-purple-200'}`}
        >
          <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            💡 AI Insights for You
          </h3>
          <div className="space-y-3">
            {data!.insights.map((insight, i) => {
              const priorityColor = insight.priority === 'high' ? 'red' : insight.priority === 'positive' ? 'emerald' : 'blue'
              return (
                <div key={i} className={`p-3 rounded-xl border-l-4 ${
                  priorityColor === 'red' ? isDark ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-400' :
                  priorityColor === 'emerald' ? isDark ? 'bg-emerald-900/20 border-emerald-500' : 'bg-emerald-50 border-emerald-400' :
                  isDark ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-400'
                }`}>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {insight.title}
                  </div>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {insight.description}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* 7-Day Forecast Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-5 rounded-2xl shadow-lg ${isDark ? 'bg-gray-800/70 border border-purple-800' : 'bg-white border border-purple-200'}`}
        >
          <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📅 Day-by-Day Forecast
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data!.next_7_days.map((day, i) => (
              <div key={i} className={`p-3 rounded-xl border ${isDark ? 'bg-gray-700/30 border-purple-800' : 'bg-gray-50 border-purple-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {day.day_name}
                    </div>
                    <div className={`text-lg font-black ${day.health_score >= 80 ? 'text-emerald-500' : day.health_score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                      {day.health_score}
                    </div>
                  </div>
                  <div className="text-3xl">{MOOD_EMOJI[day.mood] || '😐'}</div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    💤 {day.sleep_hours}h
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    ⚡ {day.energy}/5
                  </span>
                </div>
                {day.recommendations[0] && (
                  <p className={`text-xs mt-2 italic ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    💡 {day.recommendations[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA to log more data */}
        <div className={`p-4 rounded-2xl text-center ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
          <p className="text-sm">
            💡 The more you log, the more accurate your predictions become.{' '}
            <a href="/sleep-mood" className="underline font-bold">Log today</a>
          </p>
        </div>
      </div>
    </div>
  )
}

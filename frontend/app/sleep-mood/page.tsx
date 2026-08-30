'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type WellnessLog = {
  id: string
  log_date: string
  sleep_hours: number | null
  sleep_quality: number | null
  mood: string | null
  energy_level: number | null
  water_glasses: number
  exercise_minutes: number
  notes: string
}

type Insights = {
  insights: string[]
  averages: {
    sleep_hours: number
    sleep_quality: number
    energy_level: number
    water_glasses: number
    exercise_minutes: number
  }
  mood_distribution: Record<string, number>
  most_common_mood: string
  total_logs: number
}

const MOODS = [
  { value: 'happy', emoji: '😄', label: 'Happy' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'energetic', emoji: '⚡', label: 'Energetic' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'stressed', emoji: '😫', label: 'Stressed' },
  { value: 'angry', emoji: '😠', label: 'Angry' },
]

const SLEEP_QUALITY_LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent']
const ENERGY_LABELS = ['', 'Exhausted', 'Low', 'Moderate', 'High', 'Supercharged']

const MOOD_COLORS: Record<string, string> = {
  happy: '#fbbf24',
  calm: '#34d399',
  energetic: '#f97316',
  tired: '#a78bfa',
  sad: '#60a5fa',
  anxious: '#f87171',
  stressed: '#ef4444',
  angry: '#dc2626',
}

export default function SleepMoodPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [logs, setLogs] = useState<WellnessLog[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'insights'>('log')

  // Form state
  const [sleepHours, setSleepHours] = useState(7)
  const [sleepQuality, setSleepQuality] = useState(3)
  const [mood, setMood] = useState<string>('')
  const [energyLevel, setEnergyLevel] = useState(3)
  const [waterGlasses, setWaterGlasses] = useState(4)
  const [exerciseMinutes, setExerciseMinutes] = useState(0)
  const [notes, setNotes] = useState('')

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadData()
  }, [mounted, user])

  const loadData = async () => {
    setLoading(true)
    try {
      if (user) {
        await loadFromCloud()
      } else {
        loadFromLocal()
      }
    } finally {
      setLoading(false)
    }
  }

  const loadFromCloud = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('wellness_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(30)

    if (error) {
      console.error('Error loading wellness logs:', error)
      return
    }

    if (data) {
      setLogs(data as WellnessLog[])

      // Set form to today's values if exists
      const todayLog = data.find(l => l.log_date === today)
      if (todayLog) {
        setSleepHours(todayLog.sleep_hours || 7)
        setSleepQuality(todayLog.sleep_quality || 3)
        setMood(todayLog.mood || '')
        setEnergyLevel(todayLog.energy_level || 3)
        setWaterGlasses(todayLog.water_glasses || 0)
        setExerciseMinutes(todayLog.exercise_minutes || 0)
        setNotes(todayLog.notes || '')
      }
    }

    // Load insights
    await loadInsights()
  }

  const loadInsights = async () => {
    if (!user) return

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('wellness_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', startDate)
      .order('log_date', { ascending: true })

    if (error || !data || data.length === 0) {
      setInsights({
        insights: ['Start logging your sleep and mood to get personalized insights!'],
        averages: { sleep_hours: 0, sleep_quality: 0, energy_level: 0, water_glasses: 0, exercise_minutes: 0 },
        mood_distribution: {},
        most_common_mood: 'unknown',
        total_logs: 0,
      })
      return
    }

    const logs = data as WellnessLog[]
    const total = logs.length

    const avgSleep = logs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / total
    const avgQuality = logs.reduce((s, l) => s + (l.sleep_quality || 0), 0) / total
    const avgEnergy = logs.reduce((s, l) => s + (l.energy_level || 0), 0) / total
    const avgWater = logs.reduce((s, l) => s + (l.water_glasses || 0), 0) / total
    const avgExercise = logs.reduce((s, l) => s + (l.exercise_minutes || 0), 0) / total

    const moodCounts: Record<string, number> = {}
    logs.forEach(l => {
      if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1
    })
    const mostCommon = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'

    const generatedInsights: string[] = []

    if (avgSleep < 7) generatedInsights.push('You\'re averaging less than 7 hours of sleep. Try going to bed 30 minutes earlier.')
    else if (avgSleep >= 7 && avgSleep <= 9) generatedInsights.push('Great! You\'re getting the recommended 7-9 hours of sleep.')

    if (avgQuality < 3) generatedInsights.push('Your sleep quality could improve. Try avoiding screens 1 hour before bed.')
    if (avgEnergy < 3) generatedInsights.push('Your energy levels are low. More sleep and hydration might help.')
    if (avgWater < 8) generatedInsights.push('You\'re drinking less than 8 glasses of water. Stay hydrated!')
    if (avgExercise < 30) generatedInsights.push('Try to get at least 30 minutes of exercise daily for better health.')
    if (mostCommon === 'stressed') generatedInsights.push('You\'ve been feeling stressed often. Consider relaxation techniques like deep breathing.')
    if (mostCommon === 'happy') generatedInsights.push('Great! You\'ve been feeling happy often. Keep doing what you\'re doing!')

    // Correlation
    const goodSleepDays = logs.filter(l => (l.sleep_hours || 0) >= 7)
    if (goodSleepDays.length > 0) {
      const goodEnergy = goodSleepDays.reduce((s, l) => s + (l.energy_level || 3), 0) / goodSleepDays.length
      if (goodEnergy >= 4) generatedInsights.push('On days you sleep 7+ hours, your energy is significantly better!')
    }

    setInsights({
      insights: generatedInsights,
      averages: {
        sleep_hours: Math.round(avgSleep * 10) / 10,
        sleep_quality: Math.round(avgQuality * 10) / 10,
        energy_level: Math.round(avgEnergy * 10) / 10,
        water_glasses: Math.round(avgWater * 10) / 10,
        exercise_minutes: Math.round(avgExercise),
      },
      mood_distribution: moodCounts,
      most_common_mood: mostCommon,
      total_logs: total,
    })
  }

  const loadFromLocal = () => {
    const saved = localStorage.getItem('wellness_logs')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setLogs(data)
        const today = new Date().toISOString().split('T')[0]
        const todayLog = data.find((l: WellnessLog) => l.log_date === today)
        if (todayLog) {
          setSleepHours(todayLog.sleep_hours || 7)
          setSleepQuality(todayLog.sleep_quality || 3)
          setMood(todayLog.mood || '')
          setEnergyLevel(todayLog.energy_level || 3)
          setWaterGlasses(todayLog.water_glasses || 0)
          setExerciseMinutes(todayLog.exercise_minutes || 0)
          setNotes(todayLog.notes || '')
        }
      } catch { }
    }
  }

  const saveLog = async () => {
    if (!mood) {
      toast.error('Please select your mood!')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const logData = {
      log_date: today,
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      mood,
      energy_level: energyLevel,
      water_glasses: waterGlasses,
      exercise_minutes: exerciseMinutes,
      notes,
    }

    if (user) {
      const { error } = await supabase
        .from('wellness_logs')
        .upsert({ ...logData, user_id: user.id }, { onConflict: 'user_id,log_date' })

      if (error) {
        toast.error('Failed to save!')
        console.error(error)
        return
      }

      await loadFromCloud()
    } else {
      const existing = JSON.parse(localStorage.getItem('wellness_logs') || '[]')
      const filtered = existing.filter((l: WellnessLog) => l.log_date !== today)
      const updated = [...filtered, { ...logData, id: crypto.randomUUID() }]
      localStorage.setItem('wellness_logs', JSON.stringify(updated))
      setLogs(updated)
    }

    toast.success('Saved!', { icon: '💾' })
  }

  const getMoodEmoji = (moodValue: string) => {
    return MOODS.find(m => m.value === moodValue)?.emoji || '❓'
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950'
      : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-indigo-900' : 'bg-white/70 border-indigo-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌙</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
              Sleep & Mood
            </div>
            <div className={`text-xs ${isDark ? 'text-indigo-300/70' : 'text-indigo-700/70'}`}>
              {user ? '☁️ Synced' : '📱 Local'}
            </div>
          </div>
        </div>
        <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-indigo-800 text-indigo-300' : 'bg-white/70 border-indigo-200 text-indigo-700'}`}>
          🏠
        </a>
      </div>

      {/* Tabs */}
      <div className={`max-w-3xl mx-auto px-4 pt-4`}>
        <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          {(['log', 'history', 'insights'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                ? isDark
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-indigo-500 text-white shadow-lg'
                : isDark
                  ? 'text-indigo-300 hover:bg-gray-700/50'
                  : 'text-indigo-600 hover:bg-white/50'
              }`}
            >
              {tab === 'log' && '✏️ Log'}
              {tab === 'history' && '📊 History'}
              {tab === 'insights' && '💡 Insights'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {/* LOG TAB */}
          {activeTab === 'log' && (
            <motion.div
              key="log"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Sleep Section */}
              <div className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                  💤 Sleep
                </h3>

                <div className="mb-4">
                  <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                    Hours slept: <span className="text-indigo-500">{sleepHours}h</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs mt-1 opacity-60">
                    <span>0h</span>
                    <span>7h</span>
                    <span>14h</span>
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                    Sleep quality: <span className="text-indigo-500">{SLEEP_QUALITY_LABELS[sleepQuality]}</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(q => (
                      <button
                        key={q}
                        onClick={() => setSleepQuality(q)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${sleepQuality === q
                          ? 'bg-indigo-500 text-white shadow-md'
                          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {SLEEP_QUALITY_LABELS[q]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mood Section */}
              <div className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                  😊 Mood
                </h3>

                <div className="grid grid-cols-4 gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`p-3 rounded-xl text-center transition-all ${mood === m.value
                        ? 'bg-indigo-500 text-white shadow-lg scale-105'
                        : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-2xl mb-1">{m.emoji}</div>
                      <div className="text-xs font-medium">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy & Activity */}
              <div className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                  ⚡ Energy & Activity
                </h3>

                <div className="mb-4">
                  <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                    Energy level: <span className="text-indigo-500">{ENERGY_LABELS[energyLevel]}</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(e => (
                      <button
                        key={e}
                        onClick={() => setEnergyLevel(e)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${energyLevel === e
                          ? 'bg-amber-500 text-white shadow-md'
                          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ENERGY_LABELS[e]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                      💧 Water: {waterGlasses} glasses
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      value={waterGlasses}
                      onChange={(e) => setWaterGlasses(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                      🏃 Exercise: {exerciseMinutes} min
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="5"
                      value={exerciseMinutes}
                      onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                      className="w-full accent-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}>
                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                  📝 Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How was your day? Any thoughts..."
                  className={`w-full p-3 rounded-xl border resize-none h-24 ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={saveLog}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
              >
                💾 Save Today&apos;s Log {user && '☁️'}
              </button>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-4xl animate-bounce">⏳</div>
                  <p className={`mt-2 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>Loading...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className={`text-center py-12 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-indigo-800' : 'bg-white/50 border-indigo-200'}`}>
                  <div className="text-5xl mb-3">📭</div>
                  <p className={`font-medium ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>No logs yet</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>Start tracking your sleep and mood!</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={log.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`backdrop-blur-sm border rounded-xl p-4 shadow-sm ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                        {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-2xl">{getMoodEmoji(log.mood || '')}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {log.sleep_hours && (
                        <span className={`px-2 py-1 rounded-lg ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                          💤 {log.sleep_hours}h
                        </span>
                      )}
                      {log.sleep_quality && (
                        <span className={`px-2 py-1 rounded-lg ${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                          ⭐ {SLEEP_QUALITY_LABELS[log.sleep_quality]}
                        </span>
                      )}
                      {log.energy_level && (
                        <span className={`px-2 py-1 rounded-lg ${isDark ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                          ⚡ {ENERGY_LABELS[log.energy_level]}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-lg ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                        💧 {log.water_glasses}
                      </span>
                      {log.exercise_minutes > 0 && (
                        <span className={`px-2 py-1 rounded-lg ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                          🏃 {log.exercise_minutes}min
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <p className={`mt-2 text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        &quot;{log.notes}&quot;
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* INSIGHTS TAB */}
          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {!insights ? (
                <div className="text-center py-12">
                  <div className="text-4xl animate-bounce">⏳</div>
                  <p className={`mt-2 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>Loading insights...</p>
                </div>
              ) : (
                <>
                  {/* Averages */}
                  <div className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                      📊 30-Day Averages
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Sleep', value: `${insights.averages.sleep_hours}h`, icon: '💤', color: 'indigo' },
                        { label: 'Quality', value: `${insights.averages.sleep_quality}/5`, icon: '⭐', color: 'purple' },
                        { label: 'Energy', value: `${insights.averages.energy_level}/5`, icon: '⚡', color: 'amber' },
                        { label: 'Water', value: `${insights.averages.water_glasses}`, icon: '💧', color: 'blue' },
                        { label: 'Exercise', value: `${insights.averages.exercise_minutes}min`, icon: '🏃', color: 'green' },
                        { label: 'Entries', value: `${insights.total_logs}`, icon: '📅', color: 'pink' },
                      ].map((stat, i) => (
                        <div key={i} className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="text-xl mb-1">{stat.icon}</div>
                          <div className={`text-lg font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>{stat.value}</div>
                          <div className={`text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mood Distribution */}
                  {Object.keys(insights.mood_distribution).length > 0 && (
                    <div className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}>
                      <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                        😊 Mood Distribution
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(insights.mood_distribution)
                          .sort((a, b) => b[1] - a[1])
                          .map(([moodValue, count]) => {
                            const percentage = Math.round((count / insights.total_logs) * 100)
                            const moodInfo = MOODS.find(m => m.value === moodValue)
                            return (
                              <div key={moodValue} className="flex items-center gap-3">
                                <span className="text-xl w-8">{moodInfo?.emoji || '❓'}</span>
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className={isDark ? 'text-indigo-200' : 'text-indigo-700'}>{moodInfo?.label || moodValue}</span>
                                    <span className={isDark ? 'text-indigo-400' : 'text-indigo-500'}>{percentage}%</span>
                                  </div>
                                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: MOOD_COLORS[moodValue] || '#6366f1',
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  {/* AI Insights */}
                  <div className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                      💡 Personalized Insights
                    </h3>
                    <div className="space-y-3">
                      {insights.insights.map((insight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`p-3 rounded-xl border-l-4 ${isDark ? 'bg-indigo-900/30 border-indigo-500' : 'bg-indigo-50 border-indigo-400'}`}
                        >
                          <p className={`text-sm ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

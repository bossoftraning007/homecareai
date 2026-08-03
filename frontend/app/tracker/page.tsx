'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

type TrackEntry = {
  date: string
  mood: number
  water: number
  sleep: number
  exercise: boolean
}

const TRACKER_KEY = 'homecare_tracker'

export default function TrackerPage() {
  const { theme } = useTheme()
  const [entries, setEntries] = useState<TrackEntry[]>([])
  const [mounted, setMounted] = useState(false)
  const [todayMood, setTodayMood] = useState(3)
  const [todayWater, setTodayWater] = useState(4)
  const [todaySleep, setTodaySleep] = useState(7)
  const [todayExercise, setTodayExercise] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(TRACKER_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setEntries(data)
        const today = new Date().toDateString()
        const todayEntry = data.find((e: TrackEntry) => new Date(e.date).toDateString() === today)
        if (todayEntry) {
          setTodayMood(todayEntry.mood)
          setTodayWater(todayEntry.water)
          setTodaySleep(todayEntry.sleep)
          setTodayExercise(todayEntry.exercise)
        }
      } catch { }
    }
  }, [])

  const saveToday = () => {
    const today = new Date().toDateString()
    const filtered = entries.filter(e => new Date(e.date).toDateString() !== today)
    const newEntry: TrackEntry = {
      date: new Date().toISOString(),
      mood: todayMood,
      water: todayWater,
      sleep: todaySleep,
      exercise: todayExercise
    }
    const updated = [...filtered, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setEntries(updated)
    localStorage.setItem(TRACKER_KEY, JSON.stringify(updated))
    toast.success('Saved!', { icon: '📊' })
  }

  const chartData = entries.slice(-7).map(e => ({
    date: new Date(e.date).toLocaleDateString('en', { weekday: 'short' }),
    mood: e.mood,
    water: e.water,
    sleep: e.sleep
  }))

  const moodEmojis = ['😢', '😔', '😐', '🙂', '😄']

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Wellness Tracker
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Track your daily health
            </div>
          </div>
        </div>
        <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">

        {/* Today's tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
        >
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            🌟 Today's Check-in
          </h2>

          {/* Mood */}
          <div className="mb-4">
            <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              How are you feeling? {moodEmojis[todayMood - 1]}
            </label>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4, 5].map(m => (
                <button
                  key={m}
                  onClick={() => setTodayMood(m)}
                  className={`text-3xl p-3 rounded-xl transition-all ${todayMood === m
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 scale-110 shadow-lg'
                    : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {moodEmojis[m - 1]}
                </button>
              ))}
            </div>
          </div>

          {/* Water */}
          <div className="mb-4">
            <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              💧 Water glasses: {todayWater}/8
            </label>
            <input
              type="range"
              min="0"
              max="12"
              value={todayWater}
              onChange={(e) => setTodayWater(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex gap-1 mt-2">
              {[...Array(8)].map((_, i) => (
                <span key={i} className="text-xl">{i < todayWater ? '💧' : '⚪'}</span>
              ))}
            </div>
          </div>

          {/* Sleep */}
          <div className="mb-4">
            <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              💤 Sleep hours: {todaySleep}
            </label>
            <input
              type="range"
              min="0"
              max="12"
              value={todaySleep}
              onChange={(e) => setTodaySleep(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Exercise */}
          <div className="mb-4">
            <button
              onClick={() => setTodayExercise(!todayExercise)}
              className={`w-full p-3 rounded-xl font-semibold transition-all ${todayExercise
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {todayExercise ? '✅ Exercised today!' : '🏃 Did you exercise?'}
            </button>
          </div>

          <button
            onClick={saveToday}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
          >
            💾 Save Today's Check-in
          </button>
        </motion.div>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
          >
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              📈 Last 7 Days
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#164e39' : '#d1fae5'} />
                <XAxis dataKey="date" stroke={isDark ? '#6ee7b7' : '#065f46'} style={{ fontSize: 12 }} />
                <YAxis stroke={isDark ? '#6ee7b7' : '#065f46'} style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                <Line type="monotone" dataKey="mood" stroke="#f59e0b" strokeWidth={2} name="Mood" />
                <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} name="Water" />
                <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} name="Sleep" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Stats */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: 'Days tracked', value: entries.length, icon: '📅' },
              { label: 'Avg water', value: `${(entries.reduce((s, e) => s + e.water, 0) / entries.length).toFixed(1)}`, icon: '💧' },
              { label: 'Avg sleep', value: `${(entries.reduce((s, e) => s + e.sleep, 0) / entries.length).toFixed(1)}h`, icon: '💤' },
            ].map((stat, i) => (
              <div key={i} className={`backdrop-blur-sm border rounded-2xl p-3 text-center shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{stat.value}</div>
                <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
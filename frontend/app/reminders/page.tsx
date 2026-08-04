'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'

type Reminder = {
  id: string
  title: string
  time: string
  frequency: string
  active: boolean
  createdAt: string
}

const REMINDER_KEY = 'homecare_reminders'

export default function RemindersPage() {
  const { theme } = useTheme()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [mounted, setMounted] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('08:00')
  const [newFrequency, setNewFrequency] = useState('daily')

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(REMINDER_KEY)
    if (saved) {
      try { setReminders(JSON.parse(saved)) } catch { }
    }
  }, [])

  const saveReminders = (list: Reminder[]) => {
    setReminders(list)
    localStorage.setItem(REMINDER_KEY, JSON.stringify(list))
  }

  const addReminder = () => {
    if (!newTitle.trim()) {
      toast.error('Enter reminder title!')
      return
    }
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      frequency: newFrequency,
      active: true,
      createdAt: new Date().toISOString()
    }
    saveReminders([...reminders, newReminder])
    toast.success('Reminder added!', { icon: '⏰' })
    setNewTitle('')
    setShowAdd(false)

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const toggleReminder = (id: string) => {
    saveReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r))
    toast.success('Updated!', { icon: '✅' })
  }

  const deleteReminder = (id: string) => {
    if (confirm('Delete reminder?')) {
      saveReminders(reminders.filter(r => r.id !== id))
      toast.success('Deleted!', { icon: '🗑️' })
    }
  }

  const quickReminders = [
    { icon: '💧', title: 'Drink Water', time: '10:00' },
    { icon: '💊', title: 'Take Medicine', time: '08:00' },
    { icon: '🧘', title: 'Meditate', time: '07:00' },
    { icon: '🚶', title: 'Go for Walk', time: '18:00' },
    { icon: '💤', title: 'Sleep Time', time: '22:00' },
  ]

  const addQuick = (title: string, time: string) => {
    setNewTitle(title)
    setNewTime(time)
    setShowAdd(true)
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏰</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Reminders
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              {reminders.filter(r => r.active).length} active
            </div>
          </div>
        </div>
        <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* Quick add */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
          <h2 className={`text-sm font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            ⚡ Quick Add
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {quickReminders.map((q) => (
              <button
                key={q.title}
                onClick={() => addQuick(q.title, q.time)}
                className={`p-3 rounded-xl border transition-all hover:scale-105 ${isDark ? 'bg-gray-900/50 border-emerald-900 text-emerald-200' : 'bg-white/50 border-green-100 text-green-800'}`}
              >
                <div className="text-2xl">{q.icon}</div>
                <div className="text-xs mt-1">{q.title}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Add button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowAdd(!showAdd)}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
        >
          {showAdd ? '❌ Cancel' : '➕ Add Reminder'}
        </motion.button>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Take vitamin D"
                  className={`w-full px-4 py-2 rounded-xl border ${isDark ? 'bg-gray-900 border-emerald-900 text-emerald-100' : 'bg-white border-green-200 text-green-900'}`}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-gray-900 border-emerald-900 text-emerald-100' : 'bg-white border-green-200 text-green-900'}`}
                  />
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-gray-900 border-emerald-900 text-emerald-100' : 'bg-white border-green-200 text-green-900'}`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="once">Once</option>
                  </select>
                </div>
                <button
                  onClick={addReminder}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  ✅ Save Reminder
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminders list */}
        {reminders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-3">⏰</div>
            <p className={isDark ? 'text-emerald-300' : 'text-green-700'}>
              No reminders yet. Add your first one!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {reminders.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: i * 0.05 }}
                  className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md flex items-center justify-between ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'} ${!r.active && 'opacity-50'}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleReminder(r.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${r.active ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {r.active ? '✓' : '○'}
                    </button>
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                        {r.title}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                        {r.time} • {r.frequency}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="text-red-500 hover:text-red-700 transition-all"
                  >
                    🗑️
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className={`text-xs text-center mt-6 p-3 rounded-xl border ${isDark ? 'bg-yellow-950/30 border-yellow-900 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
          💡 Note: Reminders work when app is open. Enable notifications for best experience.
        </div>
      </div>
    </div>
  )
}
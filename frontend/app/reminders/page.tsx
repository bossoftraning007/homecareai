'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type Reminder = {
  id: string
  type: string
  title: string
  message: string
  scheduled_time: string
  is_active: boolean
}

const REMINDER_TYPES = [
  { id: 'medication', icon: '💊', label: 'Medication' },
  { id: 'water', icon: '💧', label: 'Water' },
  { id: 'wellness', icon: '🧘', label: 'Wellness' },
  { id: 'sleep', icon: '😴', label: 'Sleep' },
]

export default function RemindersPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'wellness',
    title: '',
    message: '',
    scheduled_time: '09:00',
  })

  const isDark = theme === 'dark'

  useEffect(() => {
    loadReminders()
  }, [user])

  const loadReminders = async () => {
    if (!user) return
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_time')
    setReminders(data || [])
  }

  const createReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase.from('reminders').insert({
      user_id: user.id,
      type: form.type,
      title: form.title || `${REMINDER_TYPES.find(t => t.id === form.type)?.icon} ${form.type} reminder`,
      message: form.message || 'Time for your reminder!',
      scheduled_time: form.scheduled_time,
      is_active: true,
    })

    if (error) {
      toast.error('Failed to create reminder')
    } else {
      toast.success('Reminder created!')
      setShowForm(false)
      setForm({ type: 'wellness', title: '', message: '', scheduled_time: '09:00' })
      loadReminders()
    }
  }

  const toggleReminder = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('reminders')
      .update({ is_active: !currentStatus })
      .eq('id', id)
    loadReminders()
  }

  const deleteReminder = async (id: string) => {
    await supabase.from('reminders').delete().eq('id', id)
    toast.success('Reminder deleted')
    loadReminders()
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950' : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50'}`}>
      <Toaster position="top-center" />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Reminders
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
          >
            + Add Reminder
          </button>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={createReminder}
            className={`mb-6 p-5 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={`w-full mt-1 px-4 py-2 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  {REMINDER_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Title (optional)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Custom title..."
                  className={`w-full mt-1 px-4 py-2 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Message (optional)</label>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Custom message..."
                  className={`w-full mt-1 px-4 py-2 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Time</label>
                <input
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                  className={`w-full mt-1 px-4 py-2 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
                >
                  Create Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`px-6 py-3 rounded-xl font-semibold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {reminders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">⏰</div>
            <p>No reminders yet. Create your first reminder!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center justify-between p-4 rounded-2xl border ${
                  reminder.is_active
                    ? isDark ? 'bg-gray-800/50 border-emerald-800' : 'bg-white border-emerald-200'
                    : isDark ? 'bg-gray-800/30 border-gray-700 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {REMINDER_TYPES.find(t => t.id === reminder.type)?.icon || '⏰'}
                  </span>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {reminder.title}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {reminder.scheduled_time} • {reminder.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReminder(reminder.id, reminder.is_active)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      reminder.is_active ? 'bg-emerald-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        reminder.is_active ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

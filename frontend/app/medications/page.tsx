'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import axios from 'axios'
import { useAuth } from '@/lib/useAuth'
import { supabase, type Medication, MEDICATION_STORAGE_KEY } from '@/lib/supabase'
import { usePushNotifications } from '@/app/components/usePushNotifications'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed']
const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night', 'Before bed', 'With food']

export default function MedicationsPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [mounted, setMounted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    times: [],
    notes: '',
    is_active: true,
  })

  const isDark = theme === 'dark'
  const { permission, subscribe } = usePushNotifications()

  const loadFromLocal = () => {
    const saved = localStorage.getItem(MEDICATION_STORAGE_KEY)
    if (saved) {
      try {
        setMedications(JSON.parse(saved) as Medication[])
      } catch { }
    }
  }

  const loadFromCloud = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setMedications(data as Medication[])
    }
    if (error) console.error(error)
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

  const saveToLocalStorage = (items: Medication[]) => {
    localStorage.setItem(MEDICATION_STORAGE_KEY, JSON.stringify(items))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Enter medication name!')
      return
    }

    if (!form.times.length) {
      toast.error('Select at least one time!')
      return
    }

    const newMed: Medication = {
      ...form,
      id: editingId || undefined,
      user_id: user?.id,
      is_active: form.is_active,
    }

    let updated: Medication[]

    if (user) {
      if (editingId) {
        const { error } = await supabase
          .from('medications')
          .update({
            name: newMed.name,
            dosage: newMed.dosage,
            frequency: newMed.frequency,
            times: newMed.times,
            notes: newMed.notes,
            is_active: newMed.is_active,
          })
          .eq('id', editingId)

        if (error) {
          toast.error(error.message)
          return
        }
      } else {
        const { data, error } = await supabase
          .from('medications')
          .insert([{
            user_id: user.id,
            name: newMed.name,
            dosage: newMed.dosage,
            frequency: newMed.frequency,
            times: newMed.times,
            notes: newMed.notes,
            is_active: newMed.is_active,
          }])
          .select()

        if (error) {
          toast.error(error.message)
          return
        }
        if (data) {
          newMed.id = data[0].id
          newMed.created_at = data[0].created_at
        }
      }

      updated = editingId
        ? medications.map(m => m.id === editingId ? { ...m, ...newMed } : m)
        : [newMed, ...medications]
    } else {
      const tempId = crypto.randomUUID()
      updated = editingId
        ? medications.map(m => m.id === editingId ? { ...m, ...newMed } : m)
        : [{ ...newMed, id: tempId }, ...medications]
    }

    setMedications(updated)
    saveToLocalStorage(updated)
    resetForm()
    setShowForm(false)
    toast.success(editingId ? '✅ Updated!' : '✅ Added!', { icon: '💊' })
  }

  const toggleActive = async (med: Medication) => {
    const updated = medications.map(m =>
      m.id === med.id ? { ...m, is_active: !m.is_active } : m
    )
    setMedications(updated)
    saveToLocalStorage(updated)

    if (user && med.id) {
      await supabase
        .from('medications')
        .update({ is_active: !med.is_active })
        .eq('id', med.id)
    }
  }

  const deleteMed = async (id: string) => {
    if (!confirm('Delete this medication?')) return

    if (user) {
      await supabase.from('medications').delete().eq('id', id)
    }

    const updated = medications.filter(m => m.id !== id)
    setMedications(updated)
    saveToLocalStorage(updated)
    toast.success('🗑️ Deleted', { icon: '💊' })
  }

  const editMed = (med: Medication) => {
    setForm({
      name: med.name,
      dosage: med.dosage || '',
      frequency: med.frequency,
      times: med.times || [],
      notes: med.notes || '',
      is_active: med.is_active,
    })
    setEditingId(med.id || null)
    setShowForm(true)
  }

  const resetForm = () => {
    setForm({
      name: '',
      dosage: '',
      frequency: 'Once daily',
      times: [],
      notes: '',
      is_active: true,
    })
    setEditingId(null)
  }

  const toggleTime = (time: string) => {
    setForm(prev => ({
      ...prev,
      times: prev.times.includes(time)
        ? prev.times.filter(t => t !== time)
        : [...prev.times, time],
    }))
  }

  const activeCount = medications.filter(m => m.is_active).length
  const inactiveCount = medications.length - activeCount

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💊</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Medication Tracker
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              {user && <span className="text-blue-500">☁️</span>}
              {activeCount} active · {inactiveCount} inactive
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && permission === 'granted' && !subscribed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={subscribe}
              className={`text-xs px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}
            >
              🔔 Enable Reminders
            </motion.button>
          )}
          {subscribed && (
            <>
              <span className="text-xs text-green-500">🔔 On</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  try {
                    await axios.post(`${API_URL}/api/push/notify`, {
                      user_id: user!.id,
                      title: 'Medication Reminder',
                      body: 'Time to take your medication!',
                    })
                    toast.success('🔔 Notification sent!')
                  } catch {
                    toast.error('Failed to send')
                  }
                }}
                className="text-xs px-2 py-1 rounded-full border bg-blue-500/20 border-blue-400 text-blue-300 hover:bg-blue-500/30"
              >
                Test
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { resetForm(); setShowForm(true) }}
            className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}
          >
            ➕ Add
          </motion.button>
          <Link href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
            🏠
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {!user && (
          <div className={`p-3 rounded-xl text-center text-sm ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
            💡 <a href="/login" className="underline font-semibold">Login</a> to sync medications across devices!
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                {editingId ? '✏️ Edit Medication' : '➕ Add New Medication'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Paracetamol, Omega-3..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100 placeholder:text-emerald-300/50' : 'bg-white border-green-200 text-green-900 placeholder:text-green-600/60'}`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={form.dosage || ''}
                      onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                      placeholder="e.g., 500mg, 1 tablet"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100 placeholder:text-emerald-300/50' : 'bg-white border-green-200 text-green-900 placeholder:text-green-600/60'}`}
                    />
                  </div>

                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      Frequency *
                    </label>
                    <select
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100' : 'bg-white border-green-200 text-green-900'}`}
                    >
                      {FREQUENCIES.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                    Times * (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIME_OPTIONS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTime(t)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.times.includes(t)
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105'
                            : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                    Notes
                  </label>
                  <textarea
                    value={form.notes || ''}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g., Take with food, special instructions..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100 placeholder:text-emerald-300/50' : 'bg-white border-green-200 text-green-900 placeholder:text-green-600/60'}`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm() }}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
                  >
                    {editingId ? 'Update' : 'Save'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {!showForm && medications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-8 shadow-md text-center ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
          >
            <div className="text-5xl mb-3">💊</div>
            <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              No medications yet
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Track your daily medications and never miss a dose again
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
            >
              ➕ Add First Medication
            </button>
          </motion.div>
        )}

        <div className="space-y-3">
          {medications.filter(m => m.is_active).map(med => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      {med.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white`}>
                      ● Active
                    </span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-emerald-300/80' : 'text-green-700/80'} mb-2`}>
                    {med.dosage && <span>💊 {med.dosage} · </span>}
                    <span>🔁 {med.frequency}</span>
                  </div>
                  {med.times && med.times.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {med.times.map(t => (
                        <span key={t} className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-emerald-200' : 'bg-green-100 text-green-800'}`}>
                          ⏰ {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {med.notes && (
                    <p className={`text-xs ${isDark ? 'text-emerald-300/60' : 'text-green-700/60'}`}>
                      📝 {med.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleActive(med)}
                    title={med.is_active ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-xl ${med.is_active
                      ? (isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-green-100 text-green-700')
                      : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')
                    }`}
                  >
                    {med.is_active ? '✅' : '✴️'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => editMed(med)}
                    title="Edit"
                    className={`p-2 rounded-xl ${isDark ? 'bg-gray-700 text-emerald-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    ✏️
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteMed(med.id!)}
                    title="Delete"
                    className={`p-2 rounded-xl ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                  >
                    🗑️
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {inactiveCount > 0 && (
            <div className={`text-xs ${isDark ? 'text-emerald-300/50' : 'text-green-700/50'} mt-2`}>
              + {inactiveCount} inactive medication{inactiveCount > 1 ? 's' : ''} hidden
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

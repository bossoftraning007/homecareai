'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type Vital = {
  id: string
  metric_type: string
  value: number
  unit: string
  recorded_at: string
  notes: string
}

const METRICS = [
  { key: 'bp_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', icon: '🩸', normalRange: '90-120', min: 70, max: 200 },
  { key: 'bp_diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', icon: '💉', normalRange: '60-80', min: 40, max: 130 },
  { key: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️', normalRange: 'varies', min: 30, max: 200 },
  { key: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL', icon: '🩸', normalRange: '70-100', min: 40, max: 400 },
  { key: 'temperature', label: 'Temperature', unit: '°F', icon: '🌡️', normalRange: '97-99', min: 90, max: 110 },
  { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: '❤️', normalRange: '60-100', min: 40, max: 200 },
  { key: 'oxygen', label: 'Oxygen Level (SpO2)', unit: '%', icon: '🫁', normalRange: '95-100', min: 70, max: 100 },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

export default function VitalsPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [vitals, setVitals] = useState<Vital[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string>('heart_rate')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [aiInsight, setAiInsight] = useState<string>('')

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadVitals()
  }, [mounted, user])

  const loadVitals = async () => {
    setLoading(true)
    try {
      if (!user) {
        setVitals(getDemoVitals())
        generateAIInsight(getDemoVitals())
        return
      }

      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(50)

      if (data) {
        setVitals(data as Vital[])
        generateAIInsight(data as Vital[])
      }
    } catch (err) {
      console.error(err)
      setVitals(getDemoVitals())
    } finally {
      setLoading(false)
    }
  }

  const getDemoVitals = (): Vital[] => {
    const now = Date.now()
    const day = 86400000
    return [
      { id: '1', metric_type: 'heart_rate', value: 72, unit: 'bpm', recorded_at: new Date(now - day).toISOString(), notes: '' },
      { id: '2', metric_type: 'heart_rate', value: 75, unit: 'bpm', recorded_at: new Date(now - 2 * day).toISOString(), notes: '' },
      { id: '3', metric_type: 'heart_rate', value: 68, unit: 'bpm', recorded_at: new Date(now - 3 * day).toISOString(), notes: '' },
      { id: '4', metric_type: 'weight', value: 70, unit: 'kg', recorded_at: new Date(now - day).toISOString(), notes: '' },
      { id: '5', metric_type: 'weight', value: 70.5, unit: 'kg', recorded_at: new Date(now - 2 * day).toISOString(), notes: '' },
      { id: '6', metric_type: 'bp_systolic', value: 120, unit: 'mmHg', recorded_at: new Date(now - day).toISOString(), notes: '' },
      { id: '7', metric_type: 'bp_systolic', value: 125, unit: 'mmHg', recorded_at: new Date(now - 2 * day).toISOString(), notes: '' },
    ]
  }

  const generateAIInsight = (data: Vital[]) => {
    if (!data || data.length === 0) {
      setAiInsight('Start logging your vitals to get AI-powered insights!')
      return
    }

    const bpReadings = data.filter(v => v.metric_type === 'bp_systolic')
    if (bpReadings.length >= 3) {
      const recent = bpReadings.slice(0, 3).map(r => r.value)
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length
      if (avg > 130) {
        setAiInsight('⚠️ Your blood pressure has been elevated for 3 readings. Consider consulting a doctor.')
        return
      }
    }

    const hrReadings = data.filter(v => v.metric_type === 'heart_rate')
    if (hrReadings.length > 0) {
      const last = hrReadings[0].value
      if (last > 100) {
        setAiInsight('⚠️ Your heart rate is above 100 bpm. Try to rest and re-measure in 15 minutes.')
        return
      }
    }

    setAiInsight('✅ Your vitals look stable. Keep up the consistent tracking!')
  }

  const handleAddVital = async () => {
    if (!newValue || !selectedMetric) {
      toast.error('Please enter a value')
      return
    }

    const metricInfo = METRICS.find(m => m.key === selectedMetric)
    if (!metricInfo) return

    const vital = {
      user_id: user?.id,
      metric_type: selectedMetric,
      value: parseFloat(newValue),
      unit: metricInfo.unit,
      notes: newNotes,
      recorded_at: new Date().toISOString(),
    }

    if (user) {
      const { error } = await supabase.from('vitals').insert(vital)
      if (error) {
        toast.error('Failed to save')
        return
      }
    }

    setVitals([{ ...vital, id: Date.now().toString() } as Vital, ...vitals])
    setNewValue('')
    setNewNotes('')
    setShowAddModal(false)
    toast.success(`${metricInfo.label} logged!`, { icon: metricInfo.icon })
    loadVitals()
  }

  const getMetricInfo = (key: string) => METRICS.find(m => m.key === key)

  const filteredVitals = vitals.filter(v => v.metric_type === selectedMetric)

  const chartData = filteredVitals
    .slice(0, 14)
    .reverse()
    .map(v => ({
      date: new Date(v.recorded_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: v.value,
    }))

  const latestReading = filteredVitals[0]

  const isAbnormal = (metric: string, value: number) => {
    if (metric === 'heart_rate' && (value > 100 || value < 60)) return true
    if (metric === 'bp_systolic' && (value > 140 || value < 90)) return true
    if (metric === 'bp_diastolic' && (value > 90 || value < 60)) return true
    if (metric === 'oxygen' && value < 95) return true
    if (metric === 'temperature' && (value > 99.5 || value < 97)) return true
    if (metric === 'blood_sugar' && (value > 140 || value < 70)) return true
    return false
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-red-950 to-rose-950'
      : 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/80 border-red-900' : 'bg-white/80 border-red-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💗</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-red-200' : 'text-red-800'}`}>
              Vitals Tracker
            </div>
            <div className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              Track health numbers
            </div>
          </div>
        </div>
        <a href="/dashboard" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-red-800 text-red-300' : 'bg-white/70 border-red-200 text-red-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* AI Insight */}
        {aiInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border-l-4 ${
              aiInsight.includes('⚠️')
                ? isDark ? 'bg-red-900/30 border-red-500 text-red-200' : 'bg-red-50 border-red-500 text-red-800'
                : isDark ? 'bg-emerald-900/30 border-emerald-500 text-emerald-200' : 'bg-emerald-50 border-emerald-500 text-emerald-800'
            }`}
          >
            <div className="text-xs font-semibold mb-1 opacity-70">AI INSIGHT</div>
            <p className="text-sm">{aiInsight}</p>
          </motion.div>
        )}

        {/* Metric Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedMetric === m.key
                  ? isDark ? 'bg-red-600 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg'
                  : isDark ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
            >
              {m.icon} {m.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Latest Reading */}
        {latestReading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-md border rounded-2xl p-5 shadow-lg ${
              isAbnormal(selectedMetric, latestReading.value)
                ? isDark ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-300'
                : isDark ? 'bg-gray-800/70 border-red-800' : 'bg-white/80 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  LATEST READING
                </div>
                <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {latestReading.value} <span className="text-lg font-normal">{latestReading.unit}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(latestReading.recorded_at).toLocaleDateString()}
                </div>
                {isAbnormal(selectedMetric, latestReading.value) && (
                  <button
                    onClick={() => window.location.href = '/emergency'}
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded-full font-bold"
                  >
                    🚨 Emergency
                  </button>
                )}
              </div>
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Normal range: {getMetricInfo(selectedMetric)?.normalRange} {getMetricInfo(selectedMetric)?.unit}
            </div>
          </motion.div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-md border rounded-2xl p-5 shadow-lg ${isDark ? 'bg-gray-800/70 border-red-800' : 'bg-white/80 border-red-200'}`}
          >
            <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📈 Trend (Last 14 readings)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#fecaca'} />
                <XAxis dataKey="date" stroke={isDark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* History */}
        <div className={`backdrop-blur-md border rounded-2xl p-5 shadow-lg ${isDark ? 'bg-gray-800/70 border-red-800' : 'bg-white/80 border-red-200'}`}>
          <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📋 History
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredVitals.length === 0 ? (
              <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No readings yet. Tap "Add Reading" below!
              </p>
            ) : (
              filteredVitals.map((v) => {
                const abnormal = isAbnormal(v.metric_type, v.value)
                return (
                  <div key={v.id} className={`flex items-center justify-between p-3 rounded-xl ${
                    abnormal
                      ? isDark ? 'bg-red-900/20' : 'bg-red-50'
                      : isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                  }`}>
                    <div>
                      <div className={`font-semibold ${abnormal ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                        {v.value} {v.unit}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(v.recorded_at).toLocaleString()}
                      </div>
                    </div>
                    {abnormal && <span className="text-red-500">⚠️</span>}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
        >
          ➕ Add Reading
        </button>

        {/* Export to Doctor */}
        <button
          onClick={() => window.location.href = '/reports'}
          className={`w-full py-3 rounded-xl font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}
        >
          📄 Export Report for Doctor
        </button>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add {getMetricInfo(selectedMetric)?.label}
              </h3>

              <div className="mb-3">
                <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Value ({getMetricInfo(selectedMetric)?.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Normal: ${getMetricInfo(selectedMetric)?.normalRange}`}
                  className={`w-full p-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div className="mb-4">
                <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes (optional)
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Any context?"
                  className={`w-full p-3 rounded-xl border resize-none h-20 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVital}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

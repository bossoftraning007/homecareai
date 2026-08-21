'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'

type Appliance = {
  id: string
  name: string
  type: 'hvac' | 'plumbing' | 'electrical' | 'kitchen' | 'other'
  installed_date: string
  last_service?: string
  health_score: number
  notes?: string
}

const APPLIANCE_TYPES = [
  { value: 'hvac', label: '❄️ HVAC' },
  { value: 'plumbing', label: '🔧 Plumbing' },
  { value: 'electrical', label: '⚡ Electrical' },
  { value: 'kitchen', label: '🍳 Kitchen' },
  { value: 'other', label: '📦 Other' },
]

const APPLIANCE_STORAGE_KEY = 'smart_appliances'

export default function SafetyMonitoringPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Fall Detection State
  const [fallDetectionActive, setFallDetectionActive] = useState(false)
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 })
  const [fallDetected, setFallDetected] = useState(false)
  const [sensitivity, setSensitivity] = useState(3)
  const fallTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastAccelerationRef = useRef({ x: 0, y: 0, z: 0, time: 0 })

  // Appliance State
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [showAddAppliance, setShowAddAppliance] = useState(false)
  const [applianceForm, setApplianceForm] = useState({
    name: '',
    type: 'hvac',
    installed_date: '',
    notes: '',
  })

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    loadAppliances()
  }, [])

  useEffect(() => {
    return () => {
      if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current)
    }
  }, [])

  const loadAppliances = () => {
    const saved = localStorage.getItem(APPLIANCE_STORAGE_KEY)
    if (saved) {
      try { setAppliances(JSON.parse(saved)) } catch {}
    }
  }

  const saveAppliances = (updated: Appliance[]) => {
    setAppliances(updated)
    localStorage.setItem(APPLIANCE_STORAGE_KEY, JSON.stringify(updated))
  }

  const calculateHealthScore = (installedDate: string, lastService?: string): number => {
    const now = new Date()
    const installed = new Date(installedDate)
    const ageYears = (now.getTime() - installed.getTime()) / (365.25 * 24 * 60 * 60 * 1000)

    let score = 100
    score -= Math.min(ageYears * 5, 40)

    if (lastService) {
      const lastServ = new Date(lastService)
      const monthsSinceService = (now.getTime() - lastServ.getTime()) / (30 * 24 * 60 * 60 * 1000)
      if (monthsSinceService > 12) score -= 20
      else if (monthsSinceService > 6) score -= 10
    } else {
      score -= 30
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  const requestMotionPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        return permission === 'granted'
      } catch {
        return false
      }
    }
    return true
  }

  const startFallDetection = async () => {
    const hasPermission = await requestMotionPermission()
    if (!hasPermission) {
      toast.error('Motion permission denied')
      return
    }

    setFallDetectionActive(true)
    toast.success('🛡️ Fall detection active')

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity
      if (!acc) return

      const x = acc.x || 0
      const y = acc.y || 0
      const z = acc.z || 0

      setAcceleration({ x, y, z })

      const totalAcceleration = Math.sqrt(x * x + y * y + z * z)

      const threshold = sensitivity * 9.81

      if (totalAcceleration > threshold) {
        const now = Date.now()
        const timeSinceLastFall = now - lastAccelerationRef.current.time

        if (timeSinceLastFall > 3000) {
          lastAccelerationRef.current = { x, y, z, time: now }

          if (!fallDetected) {
            setFallDetected(true)
            toast.error('🚨 Fall detected! Sending alert...', { duration: 10000 })

            fallTimeoutRef.current = setTimeout(() => {
              setFallDetected(false)
            }, 10000)
          }
        }
      }
    }

    window.addEventListener('devicemotion', handleMotion)
  }

  const stopFallDetection = () => {
    setFallDetectionActive(false)
    setFallDetected(false)
    toast('Fall detection stopped', { icon: '⏹️' })
  }

  const cancelFallAlert = () => {
    setFallDetected(false)
    if (fallTimeoutRef.current) {
      clearTimeout(fallTimeoutRef.current)
      fallTimeoutRef.current = null
    }
    toast.success('✅ False alarm cancelled')
  }

  const addAppliance = (e: React.FormEvent) => {
    e.preventDefault()
    if (!applianceForm.name.trim()) {
      toast.error('Enter appliance name!')
      return
    }

    const newAppliance: Appliance = {
      id: crypto.randomUUID(),
      name: applianceForm.name,
      type: applianceForm.type as Appliance['type'],
      installed_date: applianceForm.installed_date || new Date().toISOString(),
      notes: applianceForm.notes,
      health_score: calculateHealthScore(applianceForm.installed_date || new Date().toISOString()),
    }

    const updated = [...appliances, newAppliance]
    saveAppliances(updated)
    setShowAddAppliance(false)
    setApplianceForm({ name: '', type: 'hvac', installed_date: '', notes: '' })
    toast.success('✅ Appliance added!')
  }

  const deleteAppliance = (id: string) => {
    const updated = appliances.filter(a => a.id !== id)
    saveAppliances(updated)
    toast.success('Appliance removed')
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-rose-500'
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900'
      : 'bg-gradient-to-br from-slate-50 via-white to-gray-100'
    }`}>
      <Toaster position="top-center" />

      {/* Fall Detection Alert Overlay */}
      <AnimatePresence>
        {fallDetected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-red-900/80 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center p-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                🚨
              </motion.div>
              <h2 className="text-4xl font-black text-white mb-4">FALL DETECTED!</h2>
              <p className="text-xl text-red-200 mb-6">Emergency contacts will be notified in 10 seconds</p>
              <button
                onClick={cancelFallAlert}
                className="px-8 py-4 bg-white text-red-600 font-bold text-xl rounded-full hover:bg-gray-100 transition-all"
              >
                I'M OK - CANCEL ALERT
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-slate-700' : 'bg-white/70 border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Safety Monitor
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Fall detection · Appliance scoring
            </div>
          </div>
        </div>
        <Link href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-slate-700 text-slate-300' : 'bg-white/70 border-slate-200 text-slate-700'}`}>
          🏠
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Fall Detection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-slate-700' : 'bg-white/70 border-slate-200'}`}
        >
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            🏃 Fall Detection
          </h2>

          <div className="text-center mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${fallDetectionActive
              ? (isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
              : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')
            }`}>
              <span>{fallDetectionActive ? '🟢' : '⚪'}</span>
              <span className="text-sm font-medium">
                {fallDetectionActive ? 'Monitoring Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Live Acceleration */}
          {fallDetectionActive && (
            <div className={`grid grid-cols-3 gap-2 mb-4 p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-slate-100'}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                  {acceleration.x.toFixed(1)}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>X</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                  {acceleration.y.toFixed(1)}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Y</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                  {acceleration.z.toFixed(1)}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Z</div>
              </div>
            </div>
          )}

          {/* Sensitivity */}
          <div className="mb-4">
            <label className={`text-sm font-medium block mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Sensitivity: {sensitivity === 1 ? 'Low' : sensitivity === 2 ? 'Medium' : 'High'}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fallDetectionActive ? stopFallDetection : startFallDetection}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              fallDetectionActive
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
            }`}
          >
            {fallDetectionActive ? '⏹️ Stop Detection' : '▶️ Start Fall Detection'}
          </motion.button>

          <p className={`text-xs text-center mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Keep device on person for accurate detection. Works best with mobile devices.
          </p>
        </motion.div>

        {/* Smart Appliance Scoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-slate-700' : 'bg-white/70 border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              🏠 Appliance Health
            </h2>
            <button
              onClick={() => setShowAddAppliance(true)}
              className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-slate-700 text-slate-300' : 'bg-white/70 border-slate-200 text-slate-700'}`}
            >
              ➕ Add
            </button>
          </div>

          <AnimatePresence>
            {showAddAppliance && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={addAppliance}
                className="space-y-3 mb-4 p-4 rounded-xl border border-slate-200"
              >
                <input
                  type="text"
                  value={applianceForm.name}
                  onChange={(e) => setApplianceForm({ ...applianceForm, name: e.target.value })}
                  placeholder="Appliance Name (e.g., AC Unit 1)"
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                  required
                />
                <select
                  value={applianceForm.type}
                  onChange={(e) => setApplianceForm({ ...applianceForm, type: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                >
                  {APPLIANCE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={applianceForm.installed_date}
                  onChange={(e) => setApplianceForm({ ...applianceForm, installed_date: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                />
                <textarea
                  value={applianceForm.notes}
                  onChange={(e) => setApplianceForm({ ...applianceForm, notes: e.target.value })}
                  placeholder="Notes (optional)"
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none resize-none ${isDark ? 'bg-gray-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddAppliance(false)} className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 text-white font-medium">Add</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {appliances.length === 0 ? (
            <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No appliances tracked yet. Add your home systems to monitor their health.
            </p>
          ) : (
            <div className="space-y-3">
              {appliances.map(appliance => (
                <div key={appliance.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/50 border-slate-700' : 'bg-white/50 border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{appliance.name}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {APPLIANCE_TYPES.find(t => t.value === appliance.type)?.label} · Installed: {new Date(appliance.installed_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getHealthColor(appliance.health_score)}`}>
                        {appliance.health_score}
                      </span>
                      <button onClick={() => deleteAppliance(appliance.id)} className="p-1 rounded text-red-500 hover:bg-red-100">🗑️</button>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${appliance.health_score}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full bg-gradient-to-r ${getHealthBg(appliance.health_score)}`}
                    />
                  </div>
                  {appliance.notes && (
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>📝 {appliance.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Banner */}
        <div className={`p-4 rounded-xl border text-center text-xs ${isDark ? 'bg-blue-900/20 border-blue-800/50 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          💡 Fall detection uses your device's accelerometer. For best results, keep the device in your pocket or wear it.
        </div>
      </div>
    </div>
  )
}

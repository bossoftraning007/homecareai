'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type SafeZone = {
  id: string
  name: string
  lat: number
  lng: number
  radius: number // in meters
  is_active: boolean
}

type LocationLog = {
  id: string
  lat: number
  lng: number
  timestamp: string
  is_inside_zone: boolean
}

const GEOFENCE_STORAGE_KEY = 'safe_zones'
const LOCATION_LOG_KEY = 'location_logs'

export default function GeoFencingPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [safeZones, setSafeZones] = useState<SafeZone[]>([])
  const [locationLogs, setLocationLogs] = useState<LocationLog[]>([])
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [showAddZone, setShowAddZone] = useState(false)
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const isDark = theme === 'dark'

  const [zoneForm, setZoneForm] = useState({
    name: '',
    lat: '',
    lng: '',
    radius: '500',
  })

  useEffect(() => {
    setMounted(true)
    loadSafeZones()
    loadLocationLogs()
  }, [])

  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
      }
    }
  }, [])

  const loadSafeZones = () => {
    const saved = localStorage.getItem(GEOFENCE_STORAGE_KEY)
    if (saved) {
      try { setSafeZones(JSON.parse(saved)) } catch {}
    }
  }

  const loadLocationLogs = () => {
    const saved = localStorage.getItem(LOCATION_LOG_KEY)
    if (saved) {
      try { setLocationLogs(JSON.parse(saved).slice(0, 50)) } catch {}
    }
  }

  const saveSafeZones = (zones: SafeZone[]) => {
    setSafeZones(zones)
    localStorage.setItem(GEOFENCE_STORAGE_KEY, JSON.stringify(zones))
  }

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      })
    })
  }, [])

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const checkZones = (lat: number, lng: number) => {
    let insideAnyZone = false
    safeZones.forEach(zone => {
      if (zone.is_active) {
        const distance = calculateDistance(lat, lng, zone.lat, zone.lng)
        if (distance <= zone.radius) {
          insideAnyZone = true
        }
      }
    })
    return insideAnyZone
  }

  const addSafeZone = (e: React.FormEvent) => {
    e.preventDefault()
    const lat = parseFloat(zoneForm.lat)
    const lng = parseFloat(zoneForm.lng)
    const radius = parseInt(zoneForm.radius)

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      toast.error('Please enter valid coordinates')
      return
    }

    if (!zoneForm.name.trim()) {
      toast.error('Please enter a name for this zone')
      return
    }

    const newZone: SafeZone = {
      id: crypto.randomUUID(),
      name: zoneForm.name,
      lat,
      lng,
      radius,
      is_active: true,
    }

    const updated = [...safeZones, newZone]
    saveSafeZones(updated)
    setShowAddZone(false)
    setZoneForm({ name: '', lat: '', lng: '', radius: '500' })
    toast.success('✅ Safe zone added!')
  }

  const useCurrentLocation = async () => {
    try {
      const position = await getCurrentPosition()
      setZoneForm(prev => ({
        ...prev,
        lat: position.coords.latitude.toFixed(6),
        lng: position.coords.longitude.toFixed(6),
      }))
      toast.success('📍 Location captured!')
    } catch {
      toast.error('Could not get location')
    }
  }

  const deleteZone = (id: string) => {
    const updated = safeZones.filter(z => z.id !== id)
    saveSafeZones(updated)
    toast.success('Zone deleted')
  }

  const toggleZoneActive = (id: string) => {
    const updated = safeZones.map(z =>
      z.id === id ? { ...z, is_active: !z.is_active } : z
    )
    saveSafeZones(updated)
  }

  const startTracking = async () => {
    if (safeZones.filter(z => z.is_active).length === 0) {
      toast.error('Add at least one active safe zone first!')
      return
    }

    setIsTracking(true)
    toast.success('📍 Location tracking started')

    const trackLocation = async () => {
      try {
        const position = await getCurrentPosition()
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setCurrentPosition({ lat, lng })

        const isInside = checkZones(lat, lng)

        const logEntry: LocationLog = {
          id: crypto.randomUUID(),
          lat,
          lng,
          timestamp: new Date().toISOString(),
          is_inside_zone: isInside,
        }

        const updatedLogs = [logEntry, ...locationLogs].slice(0, 100)
        setLocationLogs(updatedLogs)
        localStorage.setItem(LOCATION_LOG_KEY, JSON.stringify(updatedLogs))

        if (!isInside) {
          toast.error('⚠️ Outside safe zone!', { duration: 5000 })
        }
      } catch (err) {
        console.error('Tracking error:', err)
      }
    }

    trackLocation()
    trackingIntervalRef.current = setInterval(trackLocation, 60000)
  }

  const stopTracking = () => {
    setIsTracking(false)
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
      trackingIntervalRef.current = null
    }
    toast('Tracking stopped', { icon: '⏹️' })
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950'
      : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-blue-900' : 'bg-white/70 border-blue-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              Geo-Fencing
            </div>
            <div className={`text-xs ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
              {safeZones.length} zone{safeZones.length !== 1 ? 's' : ''} · {isTracking ? '🟢 Tracking' : '⚪ Inactive'}
            </div>
          </div>
        </div>
        <Link href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-blue-800 text-blue-300' : 'bg-white/70 border-blue-200 text-blue-700'}`}>
          🏠
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md text-center ${isDark ? 'bg-gray-800/70 border-blue-800' : 'bg-white/70 border-blue-200'}`}
        >
          <div className="text-5xl mb-3">{currentPosition ? (checkZones(currentPosition.lat, currentPosition.lng) ? '✅' : '⚠️') : '📍'}</div>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
            {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
          </h2>
          <p className={`text-sm mb-4 ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
            {currentPosition
              ? `Lat: ${currentPosition.lat.toFixed(4)}, Lng: ${currentPosition.lng.toFixed(4)}`
              : 'No location data yet'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isTracking ? stopTracking : startTracking}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              isTracking
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
            }`}
          >
            {isTracking ? '⏹️ Stop Tracking' : '▶️ Start Tracking'}
          </motion.button>
        </motion.div>

        {/* Safe Zones */}
        <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-blue-800' : 'bg-white/70 border-blue-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              🏠 Safe Zones
            </h2>
            <button
              onClick={() => setShowAddZone(true)}
              className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-blue-800 text-blue-300' : 'bg-white/70 border-blue-200 text-blue-700'}`}
            >
              ➕ Add Zone
            </button>
          </div>

          <AnimatePresence>
            {showAddZone && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={addSafeZone}
                className="space-y-3 mb-4 p-4 rounded-xl border border-blue-200"
              >
                <input
                  type="text"
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                  placeholder="Zone Name (e.g., Home, Office)"
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-blue-800 text-blue-100' : 'bg-white border-blue-200 text-blue-900'}`}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={zoneForm.lat}
                    onChange={(e) => setZoneForm({ ...zoneForm, lat: e.target.value })}
                    placeholder="Latitude"
                    className={`px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-blue-800 text-blue-100' : 'bg-white border-blue-200 text-blue-900'}`}
                    required
                  />
                  <input
                    type="text"
                    value={zoneForm.lng}
                    onChange={(e) => setZoneForm({ ...zoneForm, lng: e.target.value })}
                    placeholder="Longitude"
                    className={`px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-blue-800 text-blue-100' : 'bg-white border-blue-200 text-blue-900'}`}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    value={zoneForm.radius}
                    onChange={(e) => setZoneForm({ ...zoneForm, radius: e.target.value })}
                    className="flex-1"
                  />
                  <span className={`text-sm font-medium w-16 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>{zoneForm.radius}m</span>
                </div>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className={`w-full py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-blue-200' : 'bg-blue-50 text-blue-700'}`}
                >
                  📍 Use My Current Location
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddZone(false)} className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium">Add Zone</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {safeZones.length === 0 ? (
            <p className={`text-sm text-center py-4 ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
              No safe zones yet. Add your home or frequent locations.
            </p>
          ) : (
            <div className="space-y-2">
              {safeZones.map(zone => (
                <div key={zone.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-gray-900/50 border-blue-900' : 'bg-white/50 border-blue-100'}`}>
                  <div className="flex-1">
                    <div className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>{zone.name}</div>
                    <div className={`text-xs ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
                      {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)} · Radius: {zone.radius}m
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleZoneActive(zone.id)}
                      className={`p-2 rounded-lg ${zone.is_active ? 'text-green-500' : 'text-gray-400'}`}
                    >
                      {zone.is_active ? '🟢' : '⚪'}
                    </button>
                    <button onClick={() => deleteZone(zone.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location History */}
        {locationLogs.length > 0 && (
          <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-blue-800' : 'bg-white/70 border-blue-200'}`}>
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              📋 Location History
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {locationLogs.slice(0, 20).map(log => (
                <div key={log.id} className={`flex items-center justify-between p-2 rounded-lg text-sm ${isDark ? 'bg-gray-900/50' : 'bg-blue-50/50'}`}>
                  <span className={log.is_inside_zone ? 'text-green-500' : 'text-red-500'}>
                    {log.is_inside_zone ? '✅ Inside' : '⚠️ Outside'}
                  </span>
                  <span className={isDark ? 'text-blue-300/70' : 'text-blue-700/70'}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

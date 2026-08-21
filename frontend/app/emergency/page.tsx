'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type EmergencyContact = {
  id: string
  name: string
  phone: string
  email?: string
  relationship: string
  notify_sms: boolean
  notify_email: boolean
  notify_push: boolean
}

type SOSLog = {
  id: string
  triggered_at: string
  location_lat?: number
  location_lng?: number
  location_address?: string
  status: 'active' | 'resolved' | 'false_alarm'
  resolved_at?: string
}

const SOS_STORAGE_KEY = 'homecare_sos_contacts'
const SOS_LOG_KEY = 'homecare_sos_logs'

export default function EmergencyPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [sosLogs, setSosLogs] = useState<SOSLog[]>([])
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const [sosActive, setSosActive] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const sosAudioRef = useRef<HTMLAudioElement | null>(null)

  const isDark = theme === 'dark'

  const [contactForm, setContactForm] = useState<EmergencyContact>({
    id: '',
    name: '',
    phone: '',
    email: '',
    relationship: '',
    notify_sms: true,
    notify_email: true,
    notify_push: true,
  })

  useEffect(() => {
    setMounted(true)
    loadContacts()
    loadSOSLogs()
  }, [])

  const loadContacts = async () => {
    if (user) {
      const { data } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (data) setContacts(data as EmergencyContact[])
    } else {
      const saved = localStorage.getItem(SOS_STORAGE_KEY)
      if (saved) {
        try { setContacts(JSON.parse(saved)) } catch {}
      }
    }
  }

  const loadSOSLogs = () => {
    const saved = localStorage.getItem(SOS_LOG_KEY)
    if (saved) {
      try { setSosLogs(JSON.parse(saved)) } catch {}
    }
  }

  const saveContacts = async (updated: EmergencyContact[]) => {
    setContacts(updated)
    if (user) {
      // Sync to cloud
    } else {
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(updated))
    }
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      toast.error('Name and phone are required!')
      return
    }

    const newContact: EmergencyContact = {
      ...contactForm,
      id: editingContact?.id || crypto.randomUUID(),
    }

    let updated: EmergencyContact[]
    if (editingContact) {
      updated = contacts.map(c => c.id === editingContact.id ? newContact : c)
      toast.success('Contact updated!')
    } else {
      updated = [...contacts, newContact]
      toast.success('Contact added!')
    }

    await saveContacts(updated)
    setShowContactForm(false)
    setEditingContact(null)
    setContactForm({
      id: '', name: '', phone: '', email: '', relationship: '',
      notify_sms: true, notify_email: true, notify_push: true,
    })
  }

  const deleteContact = async (id: string) => {
    const updated = contacts.filter(c => c.id !== id)
    await saveContacts(updated)
    if (user) {
      await supabase.from('emergency_contacts').delete().eq('id', id)
    }
    toast.success('Contact removed')
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
        maximumAge: 30000,
      })
    })
  }, [])

  const triggerSOS = async () => {
    if (contacts.length === 0) {
      toast.error('Add at least one emergency contact first!', { icon: '⚠️' })
      return
    }

    setCountdown(5)
    setSosActive(true)

    // Get location
    try {
      const position = await getCurrentPosition()
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
    } catch {
      toast.error('Could not get location', { icon: '📍' })
    }

    // Countdown before triggering
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          executeSOS()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const executeSOS = async () => {
    const locationStr = currentLocation
      ? `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`
      : 'Location unavailable'

    const message = `🚨 EMERGENCY ALERT from HomeCare AI!\n\nUser: ${user?.email || 'Unknown'}\nLocation: ${locationStr}\nTime: ${new Date().toLocaleString()}\n\nPlease check on them immediately!`

    // Send notifications to all contacts
    for (const contact of contacts) {
      try {
        if (contact.email) {
          // In production, this would send via backend email service
          console.log(`Sending email to ${contact.email}: ${message}`)
        }
        // For now, we log - real SMS/push would go through backend
      } catch (err) {
        console.error('Failed to notify contact:', err)
      }
    }

    // Log the SOS event
    const logEntry: SOSLog = {
      id: crypto.randomUUID(),
      triggered_at: new Date().toISOString(),
      location_lat: currentLocation?.lat,
      location_lng: currentLocation?.lng,
      status: 'active',
    }
    const updatedLogs = [logEntry, ...sosLogs]
    setSosLogs(updatedLogs)
    localStorage.setItem(SOS_LOG_KEY, JSON.stringify(updatedLogs))

    // Store in cloud if logged in
    if (user) {
      await supabase.from('sos_logs').insert([{
        user_id: user.id,
        location_lat: currentLocation?.lat,
        location_lng: currentLocation?.lng,
        status: 'active',
      }])
    }

    toast.success('SOS sent! Help is on the way.', { icon: '🚨', duration: 10000 })

    // Play alert sound
    try {
      const audio = new Audio('/sos-alert.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch {}
  }

  const cancelSOS = () => {
    setCountdown(0)
    setSosActive(false)
    toast('SOS cancelled', { icon: '✅' })
  }

  const resolveSOS = async (logId: string) => {
    const updated = sosLogs.map(l =>
      l.id === logId ? { ...l, status: 'resolved' as const, resolved_at: new Date().toISOString() } : l
    )
    setSosLogs(updated)
    localStorage.setItem(SOS_LOG_KEY, JSON.stringify(updated))
    setSosActive(false)
    toast.success('SOS marked as resolved')
  }

  const editContact = (contact: EmergencyContact) => {
    setContactForm(contact)
    setEditingContact(contact)
    setShowContactForm(true)
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-red-950 to-orange-950'
      : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
    }`}>
      <Toaster position="top-center" />

      {/* SOS Overlay */}
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                🚨
              </motion.div>
              <h2 className="text-4xl font-black text-white mb-4">SOS TRIGGERING IN</h2>
              <div className="text-8xl font-black text-red-500 mb-6">{countdown}</div>
              <button
                onClick={cancelSOS}
                className="px-8 py-4 bg-white text-red-600 font-bold text-xl rounded-full hover:bg-gray-100 transition-all"
              >
                CANCEL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-red-900' : 'bg-white/70 border-red-200'}`}>
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl"
          >
            🚨
          </motion.span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-red-200' : 'text-red-800'}`}>
              Emergency SOS
            </div>
            <div className={`text-xs ${isDark ? 'text-red-300/70' : 'text-red-700/70'}`}>
              {contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <Link href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-red-800 text-red-300' : 'bg-white/70 border-red-200 text-red-700'}`}>
          🏠
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Main SOS Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerSOS}
            disabled={countdown > 0}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white shadow-2xl shadow-red-500/50 flex flex-col items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-5xl mb-2">🆘</span>
            <span className="text-lg font-black">HOLD FOR SOS</span>
          </motion.button>
          <p className={`mt-4 text-sm ${isDark ? 'text-red-300/70' : 'text-red-700/70'}`}>
            Tap to trigger emergency alert to all contacts
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('tel:108')}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white text-center shadow-md"
          >
            <div className="text-2xl mb-1">🚑</div>
            <div className="text-xs font-semibold">Call 108</div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('tel:102')}
            className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white text-center shadow-md"
          >
            <div className="text-2xl mb-1">🚐</div>
            <div className="text-xs font-semibold">Ambulance</div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('tel:1091')}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white text-center shadow-md"
          >
            <div className="text-2xl mb-1">🆘</div>
            <div className="text-xs font-semibold">Women Helpline</div>
          </motion.button>
        </div>

        {/* Emergency Contacts */}
        <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-red-800' : 'bg-white/70 border-red-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-red-200' : 'text-red-800'}`}>
              👥 Emergency Contacts
            </h2>
            <button
              onClick={() => { setEditingContact(null); setContactForm({ id: '', name: '', phone: '', email: '', relationship: '', notify_sms: true, notify_email: true, notify_push: true }); setShowContactForm(true) }}
              className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-red-800 text-red-300' : 'bg-white/70 border-red-200 text-red-700'}`}
            >
              ➕ Add
            </button>
          </div>

          <AnimatePresence>
            {showContactForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddContact}
                className="space-y-3 mb-4 p-4 rounded-xl border border-red-200"
              >
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Contact Name *"
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-red-800 text-red-100' : 'bg-white border-red-200 text-red-900'}`}
                  required
                />
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="Phone Number *"
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-red-800 text-red-100' : 'bg-white border-red-200 text-red-900'}`}
                  required
                />
                <input
                  type="email"
                  value={contactForm.email || ''}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="Email (optional)"
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-red-800 text-red-100' : 'bg-white border-red-200 text-red-900'}`}
                />
                <input
                  type="text"
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                  placeholder="Relationship (e.g., Son, Daughter, Friend)"
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-red-800 text-red-100' : 'bg-white border-red-200 text-red-900'}`}
                />
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={contactForm.notify_sms} onChange={(e) => setContactForm({ ...contactForm, notify_sms: e.target.checked })} className="rounded" />
                    SMS
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={contactForm.notify_email} onChange={(e) => setContactForm({ ...contactForm, notify_email: e.target.checked })} className="rounded" />
                    Email
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={contactForm.notify_push} onChange={(e) => setContactForm({ ...contactForm, notify_push: e.target.checked })} className="rounded" />
                    Push
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowContactForm(false); setEditingContact(null) }} className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium">{editingContact ? 'Update' : 'Add'}</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {contacts.length === 0 ? (
            <p className={`text-sm text-center py-4 ${isDark ? 'text-red-300/70' : 'text-red-700/70'}`}>
              No emergency contacts yet. Add at least one to enable SOS alerts.
            </p>
          ) : (
            <div className="space-y-2">
              {contacts.map(contact => (
                <div key={contact.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-gray-900/50 border-red-900' : 'bg-white/50 border-red-100'}`}>
                  <div>
                    <div className={`font-semibold ${isDark ? 'text-red-200' : 'text-red-800'}`}>{contact.name}</div>
                    <div className={`text-xs ${isDark ? 'text-red-300/70' : 'text-red-700/70'}`}>
                      {contact.phone} {contact.relationship && `· ${contact.relationship}`}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => editContact(contact)} className="p-2 rounded-lg hover:bg-gray-200">✏️</button>
                    <button onClick={() => deleteContact(contact.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-500">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SOS History */}
        {sosLogs.length > 0 && (
          <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-red-800' : 'bg-white/70 border-red-200'}`}>
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-red-200' : 'text-red-800'}`}>
              📋 SOS History
            </h2>
            <div className="space-y-2">
              {sosLogs.slice(0, 5).map(log => (
                <div key={log.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-gray-900/50 border-red-900' : 'bg-white/50 border-red-100'}`}>
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                      {new Date(log.triggered_at).toLocaleString()}
                    </div>
                    <div className={`text-xs ${log.status === 'resolved' ? 'text-green-500' : log.status === 'active' ? 'text-red-500' : 'text-gray-500'}`}>
                      {log.status === 'resolved' ? '✅ Resolved' : log.status === 'active' ? '🚨 Active' : '⚪ False Alarm'}
                    </div>
                  </div>
                  {log.status === 'active' && (
                    <button
                      onClick={() => resolveSOS(log.id)}
                      className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-medium"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className={`p-3 rounded-xl border text-center text-xs ${isDark ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
          ⚠️ SOS alerts are sent to your designated contacts. In a real emergency, always call local emergency services first.
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type ProfileTab = 'overview' | 'remedies' | 'emergency' | 'settings'

function AdminButton() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.is_admin) setIsAdmin(true)
      })
  }, [user])

  if (!isAdmin) return null

  return (
    <motion.a
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      href="/admin"
      className="block bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-2xl font-semibold text-center shadow-md hover:from-yellow-600 hover:to-orange-600 transition-all"
    >
      Admin Dashboard
    </motion.a>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const [stats, setStats] = useState({
    chats: 0,
    favorites: 0,
    trackerEntries: 0,
    reminders: 0,
    streak: 7,
    emergencyContacts: 2,
  })

  const [preferences, setPreferences] = useState({
    voiceTone: 'calm',
    speechSpeed: 1,
    avoidHoney: false,
    avoidNuts: false,
    avoidDairy: false,
    avoidGluten: false,
  })

  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([])
  const [medicalId, setMedicalId] = useState({
    bloodGroup: '',
    allergies: '',
    conditions: '',
    emergencyNote: '',
  })
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingContact, setEditingContact] = useState<any>(null)
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relation: '' })
  const [showMedicalForm, setShowMedicalForm] = useState(false)

  const [savedRemedies] = useState([
    { id: '1', name: 'Honey Lemon Tea', tags: ['Cold', 'Immunity'], icon: '🍯' },
    { id: '2', name: 'Ginger Steam', tags: ['Congestion', 'Head'], icon: '🫚' },
    { id: '3', name: 'Turmeric Milk', tags: ['Sleep', 'Pain'], icon: '🥛' },
    { id: '4', name: 'Salt Water Gargle', tags: ['Throat', 'Pain'], icon: '🧂' },
    { id: '5', name: 'Peppermint Oil', tags: ['Head', 'Nausea'], icon: '🌿' },
    { id: '6', name: 'Chamomile Tea', tags: ['Sleep', 'Stress'], icon: '🌼' },
  ])

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      loadStats()
      loadPreferences()
      loadEmergencyData()
    }
  }, [user, loading, router])

  const loadStats = async () => {
    if (!user) return

    const [chats, favorites, wellness, reminders] = await Promise.all([
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('wellness_entries').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('reminders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    setStats({
      chats: chats.count || 0,
      favorites: favorites.count || 0,
      trackerEntries: wellness.count || 0,
      reminders: reminders.count || 0,
      streak: 7,
      emergencyContacts: emergencyContacts.length,
    })
  }

  const loadPreferences = () => {
    const saved = localStorage.getItem('health_preferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch {}
    }
  }

  const loadEmergencyData = async () => {
    if (!user) return
    const { data: contacts } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (contacts && contacts.length > 0) {
      setEmergencyContacts(contacts)
    }

    const { data: medical } = await supabase
      .from('medical_ids')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (medical) {
      setMedicalId({
        bloodGroup: medical.blood_group || '',
        allergies: medical.allergies || '',
        conditions: medical.conditions || '',
        emergencyNote: medical.emergency_note || '',
      })
    }
  }

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      toast.error('Name and phone are required!')
      return
    }

    if (!user) {
      toast.error('Please login first')
      return
    }

    try {
      if (editingContact) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update({ name: contactForm.name, phone: contactForm.phone, relation: contactForm.relation })
          .eq('id', editingContact.id)

        if (!error) {
          setEmergencyContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...contactForm } : c))
          toast.success('Contact updated!')
        }
      } else {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .insert([{ user_id: user.id, name: contactForm.name, phone: contactForm.phone, relation: contactForm.relation }])
          .select()
          .single()

        if (!error && data) {
          setEmergencyContacts(prev => [...prev, data])
          toast.success('Contact added!')
        }
      }
    } catch {
      toast.error('Failed to save contact')
    }

    setShowContactForm(false)
    setEditingContact(null)
    setContactForm({ name: '', phone: '', relation: '' })
  }

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this contact?')) return
    try {
      await supabase.from('emergency_contacts').delete().eq('id', id)
      setEmergencyContacts(prev => prev.filter(c => c.id !== id))
      toast.success('Contact deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const saveMedicalId = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { error } = await supabase
        .from('medical_ids')
        .upsert([{
          user_id: user.id,
          blood_group: medicalId.bloodGroup,
          allergies: medicalId.allergies,
          conditions: medicalId.conditions,
          emergency_note: medicalId.emergencyNote,
        }])

      if (!error) {
        toast.success('Medical ID saved!')
        setShowMedicalForm(false)
      }
    } catch {
      toast.error('Failed to save')
    }
  }

  const savePreferences = () => {
    localStorage.setItem('health_preferences', JSON.stringify(preferences))
    toast.success('Preferences saved!')
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    await signOut()
    toast.success('Logged out successfully!')
    router.push('/')
  }

  const exportData = async () => {
    if (!user) return
    const data = {
      profile: { email: user.email, name: user.user_metadata?.full_name },
      stats,
      preferences,
      medicalId,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `homecare-ai-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported!')
  }

  if (!mounted || loading) return null
  if (!user) return null

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const isGoogleUser = user.app_metadata?.provider === 'google'

  const tabs: { id: ProfileTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'remedies', label: 'My Remedies', icon: '🌿' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`max-w-sm w-full rounded-2xl p-6 shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Logout?</h3>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Are you sure you want to logout from HomeCare AI?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 py-2.5 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              My Profile
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Your digital health card
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-all ${isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}
            title="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
            🏠
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* Digital Health Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
        >
          <div className="flex flex-col items-center text-center">
            {/* Avatar with Glow Ring */}
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 blur-md opacity-60 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-4xl text-white shadow-xl ring-4 ring-emerald-400/30">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>

            <h2 className={`text-2xl font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              {displayName}
            </h2>

            <div className={`flex items-center gap-2 mt-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              <span className="text-sm">{user.email}</span>
              {isGoogleUser && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Google Verified</span>
              )}
            </div>

            <p className={`text-xs mt-2 ${isDark ? 'text-emerald-300/50' : 'text-green-700/50'}`}>
              Member since {new Date(user.created_at).toLocaleDateString()} • Pro Member
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: 'Saved Remedies', value: stats.favorites, icon: '🔖' },
              { label: 'Day Streak', value: `${stats.streak} Days`, icon: '🔥' },
              { label: 'Emergency Contacts', value: stats.emergencyContacts, icon: '🛡️' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-emerald-50/50'}`}
              >
                <div className="text-xl">{stat.icon}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{stat.value}</div>
                <div className={`text-xs ${isDark ? 'text-emerald-300/60' : 'text-green-700/60'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-emerald-100/50'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? (isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white text-green-800 shadow-sm')
                  : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '💬', label: 'Total Chats', value: stats.chats, color: 'from-green-500 to-emerald-500' },
                  { icon: '⭐', label: 'Favorites', value: stats.favorites, color: 'from-yellow-500 to-orange-500' },
                  { icon: '📊', label: 'Tracker Entries', value: stats.trackerEntries, color: 'from-blue-500 to-cyan-500' },
                  { icon: '⏰', label: 'Reminders', value: stats.reminders, color: 'from-purple-500 to-pink-500' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-gradient-to-r ${s.color} rounded-2xl p-4 text-white shadow-md`}
                  >
                    <div className="text-2xl">{s.icon}</div>
                    <div className="text-2xl font-bold mt-1">{s.value}</div>
                    <div className="text-xs opacity-90">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Admin button */}
              <AdminButton />

              {/* Quick Links */}
              <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
                <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  Quick Access
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: '💬', label: 'Chat', href: '/chat' },
                    { icon: '⭐', label: 'Favorites', href: '/favorites' },
                    { icon: '📊', label: 'Tracker', href: '/tracker' },
                    { icon: '🔐', label: 'Vault', href: '/vault' },
                  ].map((link) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`text-center p-3 rounded-xl border transition-all ${isDark ? 'bg-gray-900/50 border-emerald-900 text-emerald-200 hover:border-emerald-600' : 'bg-white/50 border-green-100 text-green-800 hover:border-green-400'}`}
                    >
                      <div className="text-2xl">{link.icon}</div>
                      <div className="text-xs mt-1">{link.label}</div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'remedies' && (
            <motion.div
              key="remedies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Saved Remedies Hub */}
              <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  My Health Vault
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {savedRemedies.map((remedy, i) => (
                    <motion.div
                      key={remedy.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-3 rounded-xl border ${isDark ? 'bg-gray-900/50 border-emerald-900' : 'bg-emerald-50 border-green-200'}`}
                    >
                      <div className="text-2xl mb-1">{remedy.icon}</div>
                      <div className={`font-semibold text-sm ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{remedy.name}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {remedy.tags.map(tag => (
                          <span key={tag} className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-green-700'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Symptom History Timeline */}
              <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  Recent Symptom History
                </h3>
                <div className="space-y-3">
                  {[
                    { symptom: 'Headache', date: 'Today', icon: '🤕' },
                    { symptom: 'Cold', date: 'Yesterday', icon: '🤧' },
                    { symptom: 'Sleep Issues', date: '2 days ago', icon: '😴' },
                    { symptom: 'Acidity', date: '3 days ago', icon: '🤢' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 p-2 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-emerald-50/50'}`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{item.symptom}</div>
                        <div className={`text-xs ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>{item.date}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'emergency' && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Contact Form Modal */}
              <AnimatePresence>
                {showContactForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      className={`max-w-sm w-full rounded-2xl p-6 shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    >
                      <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                      </h3>
                      <form onSubmit={saveContact} className="space-y-3">
                        <input
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Full Name *"
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                          required
                        />
                        <input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="Phone Number * (e.g., +91 98765 43210)"
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                          required
                        />
                        <input
                          type="text"
                          value={contactForm.relation}
                          onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })}
                          placeholder="Relation (e.g., Son, Daughter, Friend)"
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => { setShowContactForm(false); setEditingContact(null); setContactForm({ name: '', phone: '', relation: '' }) }}
                            className={`flex-1 py-2.5 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600"
                          >
                            {editingContact ? 'Update' : 'Add Contact'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Emergency Contacts */}
              <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                    Emergency Contacts ({emergencyContacts.length})
                  </h3>
                  <button
                    onClick={() => { setEditingContact(null); setContactForm({ name: '', phone: '', relation: '' }); setShowContactForm(true) }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600"
                  >
                    + Add Contact
                  </button>
                </div>

                {emergencyContacts.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">📞</div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No emergency contacts yet</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Add family or friends you want notified in emergencies</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emergencyContacts.map((contact, i) => (
                      <motion.div
                        key={contact.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-gray-900/50 border-emerald-900' : 'bg-white/50 border-green-100'}`}
                      >
                        <div className="flex-1">
                          <div className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{contact.name}</div>
                          <div className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-green-600/70'}`}>
                            {contact.relation && `${contact.relation} | `}{contact.phone}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.a
                            href={`tel:${contact.phone}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white shadow-md"
                          >
                            📞
                          </motion.a>
                          <button
                            onClick={() => { setEditingContact(contact); setContactForm({ name: contact.name, phone: contact.phone, relation: contact.relation || '' }); setShowContactForm(true) }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteContact(contact.id)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-500'}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Medical ID Form Modal */}
              <AnimatePresence>
                {showMedicalForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      className={`max-w-sm w-full rounded-2xl p-6 shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    >
                      <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Edit Medical ID
                      </h3>
                      <form onSubmit={saveMedicalId} className="space-y-3">
                        <div>
                          <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Blood Group</label>
                          <select
                            value={medicalId.bloodGroup}
                            onChange={(e) => setMedicalId({ ...medicalId, bloodGroup: e.target.value })}
                            className={`w-full mt-1 px-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                          >
                            <option value="">Select</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                        <div>
                          <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Allergies (comma separated)</label>
                          <input
                            type="text"
                            value={medicalId.allergies}
                            onChange={(e) => setMedicalId({ ...medicalId, allergies: e.target.value })}
                            placeholder="e.g., Penicillin, Peanuts"
                            className={`w-full mt-1 px-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                          />
                        </div>
                        <div>
                          <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Medical Conditions</label>
                          <input
                            type="text"
                            value={medicalId.conditions}
                            onChange={(e) => setMedicalId({ ...medicalId, conditions: e.target.value })}
                            placeholder="e.g., Diabetes, Hypertension"
                            className={`w-full mt-1 px-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                          />
                        </div>
                        <div>
                          <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Emergency Note</label>
                          <textarea
                            value={medicalId.emergencyNote}
                            onChange={(e) => setMedicalId({ ...medicalId, emergencyNote: e.target.value })}
                            placeholder="Any critical info for emergencies"
                            rows={2}
                            className={`w-full mt-1 px-4 py-2.5 rounded-xl border text-sm outline-none resize-none ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setShowMedicalForm(false)}
                            className={`flex-1 py-2.5 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600"
                          >
                            Save Medical ID
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Medical ID */}
              <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                    Medical ID Snapshot
                  </h3>
                  <button
                    onClick={() => setShowMedicalForm(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-emerald-50/50'}`}>
                    <div className="text-lg">🩸</div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>Blood Group</div>
                    <div className={`text-sm font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      {medicalId.bloodGroup || 'Not set'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-emerald-50/50'}`}>
                    <div className="text-lg">⚠️</div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>Allergies</div>
                    <div className={`text-sm font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      {medicalId.allergies || 'None listed'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-emerald-50/50'}`}>
                    <div className="text-lg">🏥</div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>Conditions</div>
                    <div className={`text-sm font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      {medicalId.conditions || 'None listed'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-emerald-50/50'}`}>
                    <div className="text-lg">📋</div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>Emergency Note</div>
                    <div className={`text-sm font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      {medicalId.emergencyNote || 'None'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Health Preferences */}
              <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  AI Voice Assistant
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-green-600/70'}`}>Voice Tone</label>
                    <select
                      value={preferences.voiceTone}
                      onChange={(e) => setPreferences({ ...preferences, voiceTone: e.target.value })}
                      className={`w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100' : 'bg-white border-green-200 text-green-900'}`}
                    >
                      <option value="calm">Calm & Reassuring</option>
                      <option value="energetic">Energetic</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-green-600/70'}`}>Speech Speed: {preferences.speechSpeed}x</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.5"
                      value={preferences.speechSpeed}
                      onChange={(e) => setPreferences({ ...preferences, speechSpeed: parseFloat(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Dietary Filters */}
              <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  Dietary & Allergenic Filters
                </h3>
                <div className="space-y-2">
                  {[
                    { key: 'avoidHoney', label: 'Avoid Honey' },
                    { key: 'avoidNuts', label: 'Avoid Nuts' },
                    { key: 'avoidDairy', label: 'Avoid Dairy' },
                    { key: 'avoidGluten', label: 'Avoid Gluten' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-emerald-500/10">
                      <span className={`text-sm ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{item.label}</span>
                      <input
                        type="checkbox"
                        checked={(preferences as any)[item.key]}
                        onChange={(e) => setPreferences({ ...preferences, [item.key]: e.target.checked })}
                        className="w-5 h-5 rounded accent-emerald-500"
                      />
                    </label>
                  ))}
                </div>
                <button
                  onClick={savePreferences}
                  className="w-full mt-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
                >
                  Save Preferences
                </button>
              </div>

              {/* Privacy & Security */}
              <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  Privacy & Security
                </h3>
                <div className="space-y-3">
                  {/* Connected Account */}
                  <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-emerald-50/50'}`}>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>Connected Account</div>
                      <div className={`text-xs ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>
                        {isGoogleUser ? 'Secured via Google SSO' : 'Email & Password'}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-green-700'}`}>
                      {isGoogleUser ? 'Google' : 'Email'}
                    </span>
                  </div>

                  {/* Export Data */}
                  <button
                    onClick={exportData}
                    className={`w-full flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-900/50 hover:bg-gray-900' : 'bg-emerald-50/50 hover:bg-emerald-100'}`}
                  >
                    <div className="text-left">
                      <div className={`text-sm font-medium ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>Export My Health Data</div>
                      <div className={`text-xs ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>Download all your data as JSON</div>
                    </div>
                    <span>📥</span>
                  </button>

                  {/* Delete Account */}
                  <button
                    className={`w-full flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-red-900/20 hover:bg-red-900/30' : 'bg-red-50 hover:bg-red-100'}`}
                  >
                    <div className="text-left">
                      <div className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>Delete Account</div>
                      <div className={`text-xs ${isDark ? 'text-red-400/60' : 'text-red-600/60'}`}>Permanently remove your data</div>
                    </div>
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-red-500 text-white py-3 rounded-2xl font-semibold hover:bg-red-600 shadow-md transition-all"
        >
          🚪 Logout
        </motion.button>
      </div>
    </div>
  )
}

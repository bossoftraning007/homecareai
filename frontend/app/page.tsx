'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'

const symptoms = [
  { icon: '🤧', label: 'Cold', value: 'I have a cold and blocked nose' },
  { icon: '😷', label: 'Cough', value: 'I have a cough' },
  { icon: '🤒', label: 'Sore Throat', value: 'I have a sore throat' },
  { icon: '🤕', label: 'Headache', value: 'I have a headache' },
  { icon: '🤢', label: 'Acidity', value: 'I have acidity and indigestion' },
  { icon: '😴', label: 'Constipation', value: 'I have constipation' },
  { icon: '🤮', label: 'Diarrhea', value: 'I have diarrhea' },
  { icon: '🩹', label: 'Minor Cut', value: 'I have a minor cut or scrape' },
  { icon: '🌡️', label: 'Fever', value: 'I have a mild fever' },
  { icon: '💤', label: 'Sleep Issues', value: 'I have trouble sleeping' },
  { icon: '😰', label: 'Stress', value: 'I am feeling stressed' },
  { icon: '🦷', label: 'Toothache', value: 'I have a toothache' },
  { icon: '👁️', label: 'Eye Strain', value: 'I have eye strain' },
  { icon: '💪', label: 'Muscle Pain', value: 'I have muscle pain' },
  { icon: '🩸', label: 'Nose Bleed', value: 'I have a nose bleed' },
  { icon: '🤧', label: 'Allergies', value: 'I have seasonal allergies' },
]

const features = [
  { icon: '💬', label: 'AI Chat', href: '/chat', color: 'from-emerald-500 to-teal-500', desc: 'Talk to AI for natural remedies' },
  { icon: '🎤', label: 'Voice Mode', href: '/voice', color: 'from-purple-500 to-pink-500', desc: 'Hands-free conversation' },
  { icon: '📋', label: 'Assessment', href: '/questionnaire', color: 'from-indigo-500 to-purple-500', desc: 'Guided health questions' },
  { icon: '📖', label: 'Symptom Guide', href: '/symptoms', color: 'from-teal-500 to-cyan-500', desc: 'Detailed remedies & info' },
  { icon: '⭐', label: 'Favorites', href: '/favorites', color: 'from-yellow-500 to-orange-500', desc: 'Save helpful remedies' },
  { icon: '📊', label: 'Wellness Tracker', href: '/tracker', color: 'from-blue-500 to-indigo-500', desc: 'Track mood, water, sleep' },
  { icon: '⏰', label: 'Reminders', href: '/reminders', color: 'from-purple-500 to-pink-500', desc: 'Medicine & wellness alerts' },
  { icon: '🚨', label: 'Emergency', href: '/emergency', color: 'from-red-500 to-orange-500', desc: 'Quick access to helplines' },
]

const dailyTips = [
  '💧 Drink 8 glasses of water daily',
  '🥗 Eat colorful fruits and vegetables',
  '😴 Get 7-8 hours of quality sleep',
  '🚶 Walk 30 minutes every day',
  '🧘 Practice 5 min meditation',
  '🌞 Get 15 min of morning sunlight',
  '🍵 Drink warm water in morning',
  '🥦 Add greens to every meal',
]

export default function HomePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [tipIndex, setTipIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    setTipIndex(Math.floor(Math.random() * dailyTips.length))
  }, [])

  const filteredSymptoms = symptoms.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSymptom = (value: string, label: string) => {
    localStorage.setItem('initial_message', value)
    toast.success(`Getting remedies for ${label}...`, { icon: '🌿' })
    setTimeout(() => router.push('/chat'), 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) {
      toast.error('Please describe your symptom!')
      return
    }
    localStorage.setItem('initial_message', input)
    toast.success('Getting remedies...', { icon: '🌿' })
    setTimeout(() => router.push('/chat'), 500)
  }

  const handleLogout = async () => {
    if (confirm('Logout?')) {
      await signOut()
      toast.success('Logged out!', { icon: '👋' })
    }
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

  if (!mounted) return null

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      {/* Floating decorations */}
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 left-10 text-6xl opacity-10 pointer-events-none">🌿</motion.div>
      <motion.div animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} className="absolute top-40 right-16 text-5xl opacity-10 pointer-events-none">🍃</motion.div>
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 2 }} className="absolute bottom-40 left-20 text-6xl opacity-10 pointer-events-none">🌱</motion.div>
      <motion.div animate={{ y: [0, -15, 0], rotate: [0, -15, 0] }} transition={{ duration: 9, repeat: Infinity, delay: 0.5 }} className="absolute bottom-20 right-10 text-5xl opacity-10 pointer-events-none">🌾</motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed top-0 left-0 h-full w-80 z-50 shadow-2xl overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-white'}`}
            >
              <div className={`p-6 border-b ${isDark ? 'border-emerald-900' : 'border-green-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🌿</span>
                    <span className={`text-xl font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      HomeCare<span className="text-emerald-500">AI</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-gray-900'}`}
                  >
                    ✕
                  </button>
                </div>
                {user && (
                  <Link href="/profile" onClick={() => setSidebarOpen(false)}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-emerald-900/30 hover:bg-emerald-900/50' : 'bg-green-50 hover:bg-green-100'}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                        {displayName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{displayName}</div>
                        <div className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-green-600'}`}>View profile</div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              <div className="p-4">
                <div className={`text-xs font-semibold mb-3 ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>FEATURES</div>
                <nav className="space-y-1">
                  {features.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isDark ? 'hover:bg-emerald-900/30 text-emerald-200' : 'hover:bg-green-50 text-green-800'}`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xl shadow-md`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className={`text-xs ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </nav>

                <div className={`text-xs font-semibold mb-3 mt-6 ${isDark ? 'text-emerald-400/60' : 'text-green-600/60'}`}>MORE</div>
                <nav className="space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isDark ? 'hover:bg-emerald-900/30 text-emerald-200' : 'hover:bg-green-50 text-green-800'}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center text-xl">⚙️</div>
                    <div className="font-medium text-sm">Settings</div>
                  </Link>
                  {user ? (
                    <button
                      onClick={() => { handleLogout(); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl">🚪</div>
                      <div className="font-medium text-sm text-red-500">Logout</div>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isDark ? 'hover:bg-emerald-900/30 text-emerald-200' : 'hover:bg-green-50 text-green-800'}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl">🔐</div>
                      <div className="font-medium text-sm">Login / Signup</div>
                    </Link>
                  )}
                </nav>
              </div>

              <div className={`p-6 mt-4 border-t ${isDark ? 'border-emerald-900' : 'border-green-200'}`}>
                <div className={`text-xs text-center ${isDark ? 'text-emerald-400/50' : 'text-green-600/50'}`}>
                  🌿 Natural remedies powered by AI
                </div>
                <div className={`text-xs text-center mt-1 ${isDark ? 'text-emerald-400/40' : 'text-green-600/40'}`}>
                  Not medical advice
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <nav className={`sticky top-0 z-30 backdrop-blur-xl border-b ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-emerald-900/30 text-emerald-200' : 'hover:bg-green-100 text-green-800'}`}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-2xl">🌿</motion.div>
              <span className={`text-lg sm:text-xl font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                HomeCare<span className="text-emerald-500">AI</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-lg transition-all ${isDark ? 'bg-emerald-900/30 text-yellow-300 hover:bg-emerald-900/50' : 'bg-green-100 text-gray-700 hover:bg-green-200'}`}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            {user ? (
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-emerald-900/30 text-emerald-200 hover:bg-emerald-900/50' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  {displayName?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{displayName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-all"
              >
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">

        {/* Daily Tip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm border shadow-md ${isDark ? 'bg-emerald-900/40 border-emerald-800 text-emerald-200' : 'bg-white/70 border-green-200 text-green-800'}`}>
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.span>
            {dailyTips[tipIndex]}
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`inline-block p-4 backdrop-blur-sm rounded-full shadow-lg mb-4 border ${isDark ? 'bg-emerald-900/50 border-emerald-800' : 'bg-white/60 border-green-200'}`}
          >
            <span className="text-5xl">🌿</span>
          </motion.div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            HomeCare AI
          </h1>
          <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-emerald-200/80' : 'text-green-800/70'}`}>
            Natural home remedies • Ancient wisdom • Modern care
          </p>
          <p className={`text-sm mt-2 italic ${isDark ? 'text-emerald-300/60' : 'text-green-700/60'}`}>
            &ldquo;Nature heals what medicine cannot&rdquo;
          </p>
          {user && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`mt-3 text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-green-700'}`}
            >
              Welcome back, {displayName}! 💚
            </motion.p>
          )}
        </motion.div>

        {/* Quick Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-8 max-w-3xl mx-auto"
        >
          {features.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-br ${item.color} p-2 sm:p-3 rounded-2xl text-white text-center shadow-md hover:shadow-lg transition-all`}
                >
                  <div className="text-xl sm:text-2xl">{item.icon}</div>
                  <div className="text-xs font-semibold mt-1">{item.label}</div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md mx-auto mb-6"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search symptoms..."
            className={`w-full px-4 py-3 rounded-full text-sm outline-none backdrop-blur-sm border ${isDark ? 'bg-emerald-900/30 text-emerald-100 placeholder:text-emerald-300/50 border-emerald-800' : 'bg-white/70 text-green-900 placeholder:text-green-600/60 border-green-200'}`}
          />
        </motion.div>

        {/* Symptoms Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-4xl mx-auto"
        >
          {filteredSymptoms.map((s, index) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSymptom(s.value, s.label)}
              className={`group p-5 rounded-2xl backdrop-blur-sm border transition-all shadow-md hover:shadow-xl ${isDark ? 'bg-emerald-900/30 border-emerald-800 hover:bg-emerald-900/50 hover:border-emerald-500/50' : 'bg-white/70 border-green-200 hover:bg-white hover:border-green-400'}`}
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
              <div className={`text-sm font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{s.label}</div>
            </motion.button>
          ))}
        </motion.div>

        {filteredSymptoms.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>
            No symptoms match. Try the input below! 👇
          </div>
        )}

        {/* Custom Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          onSubmit={handleSubmit}
          className={`max-w-2xl mx-auto flex gap-2 p-2 rounded-full shadow-lg backdrop-blur-sm border ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-white/70 border-green-200'}`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Or describe how you're feeling..."
            className={`flex-1 bg-transparent px-5 py-3 text-sm outline-none ${isDark ? 'text-emerald-100 placeholder:text-emerald-300/50' : 'text-green-900 placeholder:text-green-600/60'}`}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Get Help 🌿
          </motion.button>
        </motion.form>

        {/* Info Cards - Real values, not fake stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto"
        >
          <div className={`backdrop-blur-sm border rounded-2xl p-5 text-center ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-white/60 border-green-200'}`}>
            <div className="text-4xl mb-2">🌿</div>
            <h3 className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>Natural Remedies</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>Traditional wisdom for common health issues</p>
          </div>
          <div className={`backdrop-blur-sm border rounded-2xl p-5 text-center ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-white/60 border-green-200'}`}>
            <div className="text-4xl mb-2">🌍</div>
            <h3 className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>10 Languages</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>English, Telugu, Hindi, Tamil, and more</p>
          </div>
          <div className={`backdrop-blur-sm border rounded-2xl p-5 text-center ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-white/60 border-green-200'}`}>
            <div className="text-4xl mb-2">💚</div>
            <h3 className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>Safe Guidance</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>Clear warnings for when to see a doctor</p>
          </div>
        </motion.div>

        {/* Login prompt for guests - honest */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className={`mt-8 p-4 rounded-2xl max-w-2xl mx-auto text-center backdrop-blur-sm border ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-white/60 border-green-200'}`}
          >
            <div className="text-2xl mb-2">☁️</div>
            <p className={`text-sm font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Sign up to save your data across devices
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Access chat history, favorites, and wellness tracking from anywhere
            </p>
            <Link
              href="/login"
              className="inline-block mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Get Started - Free
            </Link>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className={`mt-8 p-4 rounded-2xl max-w-2xl mx-auto text-center backdrop-blur-sm border ${isDark ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}
        >
          <p className="text-xs">
            ⚠️ <strong>Important:</strong> For minor symptoms only. Not a substitute for professional medical advice. Consult a healthcare provider for serious or persistent symptoms.
          </p>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className={`relative z-10 py-8 px-4 mt-12 border-t ${isDark ? 'border-emerald-900' : 'border-green-200'}`}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🌿</span>
            <span className={`font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              HomeCare<span className="text-emerald-500">AI</span>
            </span>
          </div>
          <p className={`text-xs mb-2 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
            Natural remedies powered by AI
          </p>
          <p className={`text-xs ${isDark ? 'text-emerald-400/50' : 'text-green-600/50'}`}>
            Made with 💚 for natural wellness • Not medical advice
          </p>
        </div>
      </footer>

    </div>
  )
}
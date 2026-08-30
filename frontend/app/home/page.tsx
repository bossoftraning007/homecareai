'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'

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
]

const features = [
  { icon: '💬', label: 'AI Chat', href: '/chat', color: 'from-emerald-500 to-teal-500', desc: 'Talk to AI for natural remedies' },
  { icon: '🌿', label: 'Health Journey', href: '/journey', color: 'from-green-500 to-emerald-500', desc: 'Your complete health timeline' },
  { icon: '🧬', label: 'Health Twin', href: '/recovery', color: 'from-pink-500 to-rose-500', desc: 'Predictive recovery timeline' },
  { icon: '🎤', label: 'Voice Mode', href: '/voice', color: 'from-purple-500 to-pink-500', desc: 'Hands-free conversation' },
  { icon: '🌦️', label: 'Seasonal', href: '/seasonal', color: 'from-sky-500 to-blue-500', desc: 'Health guide by season' },
  { icon: '📋', label: 'Assessment', href: '/questionnaire', color: 'from-indigo-500 to-purple-500', desc: 'Guided health questions' },
  { icon: '📖', label: 'Symptom Guide', href: '/symptoms', color: 'from-teal-500 to-cyan-500', desc: 'Detailed remedies & info' },
  { icon: '⭐', label: 'Favorites', href: '/favorites', color: 'from-yellow-500 to-orange-500', desc: 'Save helpful remedies' },
  { icon: '📊', label: 'Wellness Tracker', href: '/tracker', color: 'from-blue-500 to-indigo-500', desc: 'Track mood, water, sleep' },
  { icon: '⏰', label: 'Reminders', href: '/reminders', color: 'from-purple-500 to-pink-500', desc: 'Medicine & wellness alerts' },
  { icon: '🚨', label: 'Emergency', href: '/emergency', color: 'from-red-500 to-orange-500', desc: 'Quick access to helplines' },
  { icon: '💊', label: 'Medication', href: '/medications', color: 'from-emerald-500 to-green-600', desc: 'Track daily medications' },
  { icon: '📊', label: 'Health Insights', href: '/insights', color: 'from-blue-500 to-cyan-500', desc: 'AI-powered health insights' },
  { icon: '📆', label: 'Symptom Timeline', href: '/symptoms-timeline', color: 'from-indigo-500 to-purple-500', desc: 'Pattern analysis' },
]

const dailyTips = [
  '💧 Drink 8 glasses of water daily',
  '🥗 Eat colorful fruits and vegetables',
  '😴 Get 7-8 hours of quality sleep',
  '🚶 Walk 30 minutes every day',
  '🧘 Practice 5 min meditation',
  '🌞 Get 15 min of morning sunlight',
]

export default function HomePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [tipIndex, setTipIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    setTipIndex(Math.floor(Math.random() * dailyTips.length))
    return () => {
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current)
    }
  }, [])

  const navigateToChat = useCallback((value: string, label: string) => {
    localStorage.setItem('initial_message', value)
    toast.success(`Getting remedies for ${label}...`, { icon: '🌿' })
    navigateTimeoutRef.current = setTimeout(() => router.push('/chat'), 500)
  }, [router])

  const handleSymptom = useCallback((value: string, label: string) => {
    navigateToChat(value, label)
  }, [navigateToChat])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) {
      toast.error('Please describe your symptom!')
      return
    }
    localStorage.setItem('initial_message', input)
    toast.success('Getting remedies...', { icon: '🌿' })
    navigateTimeoutRef.current = setTimeout(() => router.push('/chat'), 500)
  }, [input, router])

  const filteredSymptoms = symptoms.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase())
  )

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0]

  if (!mounted) return null

  return (
    <div className={`min-h-screen relative overflow-hidden smooth-scroll ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
        : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50'
    }`}>
      {/* New Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* New Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Hero */}
      <section className="relative pt-24 pb-4 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border shadow-sm ${isDark ? 'bg-emerald-900/40 border-emerald-800 text-emerald-200' : 'bg-white border-emerald-200 text-emerald-800'}`}>
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.span>
              {dailyTips[tipIndex]}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
            <h1 className={`text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Natural
              <br />
              <span className="text-gradient">Healing.</span>
            </h1>
            <p className={`text-lg sm:text-xl font-medium max-w-2xl mx-auto ${isDark ? 'text-emerald-200/70' : 'text-gray-600'}`}>
              Choose your symptom or feature to get started
            </p>
            {user && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`mt-3 text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}
              >
                Welcome back, {displayName}! 💚
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="relative px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-12 gap-3 mb-6"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-12 sm:col-span-6 md:col-span-5">
              <Link href="/chat">
                <div className="relative h-full min-h-[200px] p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl overflow-hidden group cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">💬</div>
                    <h3 className="text-2xl font-black mb-1">AI Chat</h3>
                    <p className="text-white/80 text-sm mb-4">Talk to AI for natural remedies in your language</p>
                    <div className="inline-flex items-center gap-1 text-sm font-semibold">
                      Start Chat <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-6 sm:col-span-3 md:col-span-4">
              <Link href="/voice">
                <div className="h-full min-h-[200px] p-5 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl group cursor-pointer relative overflow-hidden">
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <div className="relative z-10">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">🎤</motion.div>
                    <h3 className="text-lg font-black">Voice</h3>
                    <p className="text-white/80 text-xs mt-1">Hands-free mode</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-6 sm:col-span-3 md:col-span-3">
              <Link href="/symptoms">
                <div className="h-full min-h-[200px] p-5 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-xl group cursor-pointer relative overflow-hidden">
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <div className="relative z-10">
                    <div className="text-4xl mb-2">📖</div>
                    <h3 className="text-lg font-black">Guide</h3>
                    <p className="text-white/80 text-xs mt-1">30+ remedies</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-12 sm:col-span-6 md:col-span-3">
              <Link href="/questionnaire">
                <div className={`h-full min-h-[140px] p-5 rounded-3xl border shadow-lg group cursor-pointer relative overflow-hidden ${isDark ? 'bg-gray-800/50 border-emerald-900' : 'bg-white border-emerald-100'}`}>
                  <div className="text-3xl mb-2">📋</div>
                  <h3 className={`text-md font-black ${isDark ? 'text-emerald-200' : 'text-gray-900'}`}>Guided Assessment</h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-emerald-300/70' : 'text-gray-600'}`}>Personalized advice</p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-6 sm:col-span-3 md:col-span-3">
              <Link href="/tracker">
                <div className="h-full min-h-[140px] p-5 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-xl group cursor-pointer">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="text-md font-black">Wellness</h3>
                  <p className="text-white/80 text-xs mt-1">Track health</p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-6 sm:col-span-3 md:col-span-3">
              <Link href="/emergency">
                <div className="h-full min-h-[140px] p-5 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-xl group cursor-pointer">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-3xl mb-2">🚨</motion.div>
              <h3 className="text-md font-black">Emergency</h3>
              <p className="text-white/80 text-xs mt-1">Quick help</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-6 sm:col-span-3 md:col-span-3">
          <Link href="/medications">
            <div className="h-full min-h-[140px] p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl group cursor-pointer">
              <div className="text-3xl mb-2">💊</div>
              <h3 className="text-md font-black">Medication</h3>
              <p className="text-white/80 text-xs mt-1">Daily tracking</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-6 sm:col-span-3 md:col-span-3">
          <Link href="/insights">
            <div className="h-full min-h-[140px] p-5 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl group cursor-pointer">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-md font-black">Health Insights</h3>
              <p className="text-white/80 text-xs mt-1">AI-powered analysis</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-6 sm:col-span-3 md:col-span-3">
          <Link href="/journey">
            <div className="h-full min-h-[140px] p-5 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl group cursor-pointer">
              <div className="text-3xl mb-2">🌿</div>
              <h3 className="text-md font-black">Health Journey</h3>
              <p className="text-white/80 text-xs mt-1">Your timeline</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="col-span-6 sm:col-span-3 md:col-span-3">
          <Link href="/symptoms-timeline">
            <div className="h-full min-h-[140px] p-5 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl group cursor-pointer">
              <div className="text-3xl mb-2">📆</div>
              <h3 className="text-md font-black">Timeline</h3>
              <p className="text-white/80 text-xs mt-1">Pattern analysis</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: '⭐', label: 'Favorites', href: '/favorites', color: 'from-yellow-500 to-orange-500' },
              { icon: '⏰', label: 'Reminders', href: '/reminders', color: 'from-purple-500 to-pink-500' },
              { icon: '💊', label: 'Medication', href: '/medications', color: 'from-emerald-500 to-green-600' },
              { icon: '📊', label: 'Insights', href: '/insights', color: 'from-blue-500 to-cyan-500' },
              { icon: '📆', label: 'Timeline', href: '/symptoms-timeline', color: 'from-indigo-500 to-purple-500' },
              { icon: '⚙️', label: 'Settings', href: '/settings', color: 'from-gray-500 to-slate-600' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3 }}>
                <Link href={item.href}>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white text-center shadow-md hover:shadow-xl transition-all cursor-pointer`}>
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-xs font-semibold mt-1">{item.label}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Symptoms */}
      <section className="relative px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold tracking-wider mb-3 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
              QUICK HELP
            </div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What&apos;s bothering you?
            </h2>
            <p className={`text-base ${isDark ? 'text-emerald-200/60' : 'text-gray-600'}`}>
              Tap any symptom for instant natural remedies
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-md mx-auto mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search symptoms..."
              className={`w-full px-5 py-3 rounded-full text-sm outline-none border shadow-sm ${isDark ? 'bg-emerald-900/30 text-emerald-100 placeholder:text-emerald-300/50 border-emerald-800' : 'bg-white text-gray-900 placeholder:text-gray-400 border-emerald-100'}`}
            />
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredSymptoms.map((s, i) => (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSymptom(s.value, s.label)}
                className={`group relative p-5 rounded-2xl border shadow-md hover:shadow-2xl transition-all overflow-hidden ${isDark ? 'bg-emerald-900/30 border-emerald-800 hover:border-emerald-500/50' : 'bg-white border-emerald-100 hover:border-emerald-400'}`}
              >
                <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                <div className={`text-sm font-bold ${isDark ? 'text-emerald-200' : 'text-gray-900'}`}>{s.label}</div>
              </motion.button>
            ))}
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className={`mt-8 max-w-2xl mx-auto flex gap-2 p-2 rounded-full shadow-xl border ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-white border-emerald-100'}`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Or describe your symptoms..."
              className={`flex-1 bg-transparent px-5 py-3 text-sm outline-none ${isDark ? 'text-emerald-100 placeholder:text-emerald-300/50' : 'text-gray-900 placeholder:text-gray-400'}`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-emerald-500/50"
            >
              Get Help →
            </motion.button>
          </motion.form>
        </div>
      </section>

      <section className="px-4 py-6">
        <div className={`max-w-2xl mx-auto p-4 rounded-2xl border text-center text-xs ${isDark ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
          ⚠️ <strong>Important:</strong> For minor symptoms only. Not a substitute for professional medical advice.
        </div>
      </section>

      {/* New Footer */}
      <Footer />
    </div>
  )
}
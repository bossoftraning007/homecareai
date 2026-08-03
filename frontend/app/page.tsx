'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'

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

export default function Home() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    setTipIndex(Math.floor(Math.random() * dailyTips.length))
  }, [])

  const filteredSymptoms = symptoms.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSymptom = (value: string, label: string) => {
    localStorage.setItem('initial_message', value)
    toast.success(`Checking remedies for ${label}...`, {
      icon: '🌿',
      style: { background: theme === 'dark' ? '#065f46' : '#065f46', color: '#fff' },
    })
    setTimeout(() => router.push('/chat'), 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) {
      toast.error('Please describe your symptom!')
      return
    }
    localStorage.setItem('initial_message', input)
    toast.success('Analyzing your symptoms...', { icon: '🌿' })
    setTimeout(() => router.push('/chat'), 500)
  }

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'dark' : ''}`}>
      <Toaster position="top-center" />

      <div className={`absolute inset-0 transition-all duration-500 ${isDark
        ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
        : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
      }`} />

      {/* Floating decorations */}
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-10 left-10 text-6xl opacity-20">🌿</motion.div>
      <motion.div animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute top-20 right-16 text-5xl opacity-20">🍃</motion.div>
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} className="absolute bottom-20 left-20 text-6xl opacity-20">🌱</motion.div>
      <motion.div animate={{ y: [0, -15, 0], rotate: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} className="absolute bottom-32 right-10 text-5xl opacity-20">🌾</motion.div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">

        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all backdrop-blur-sm ${isDark
            ? 'bg-gray-800/70 text-yellow-300 hover:bg-gray-700'
            : 'bg-white/70 text-gray-700 hover:bg-white'
          }`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Daily tip banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm shadow-md ${isDark
            ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-800'
            : 'bg-white/70 text-green-800 border border-green-200'
          }`}
        >
          {dailyTips[tipIndex]}
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 mt-12"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`inline-block p-4 backdrop-blur-sm rounded-full shadow-lg mb-4 border ${isDark
              ? 'bg-emerald-900/50 border-emerald-800'
              : 'bg-white/60 border-green-200'
            }`}
          >
            <span className="text-5xl">🌿</span>
          </motion.div>
          <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${isDark
            ? 'from-emerald-300 to-green-400'
            : 'from-green-700 to-emerald-600'
          }`}>
            HomeCare AI
          </h1>
          <p className={`mt-3 text-base font-medium ${isDark ? 'text-emerald-200/80' : 'text-green-800/70'}`}>
            Natural home remedies • Ancient wisdom • Modern care
          </p>
          <p className={`mt-1 text-sm italic ${isDark ? 'text-emerald-300/60' : 'text-green-700/60'}`}>
            Nature heals what medicine cannot
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md mb-6"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search symptoms..."
            className={`w-full px-4 py-2 rounded-full text-sm outline-none backdrop-blur-sm border transition-all ${isDark
              ? 'bg-gray-800/70 text-emerald-100 placeholder:text-emerald-300/50 border-emerald-800'
              : 'bg-white/70 text-green-900 placeholder:text-green-600/60 border-green-200'
            }`}
          />
        </motion.div>

        {/* Symptom grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 mb-8 w-full max-w-4xl"
        >
          {filteredSymptoms.map((s, index) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSymptom(s.value, s.label)}
              className={`group flex flex-col items-center justify-center p-4 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer border backdrop-blur-sm ${isDark
                ? 'bg-gray-800/60 border-emerald-800 hover:bg-gray-800 hover:border-emerald-600'
                : 'bg-white/70 border-green-200 hover:bg-white hover:border-green-400'
              }`}
            >
              <span className="text-3xl mb-2 group-hover:scale-125 transition-transform">
                {s.icon}
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                {s.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {filteredSymptoms.length === 0 && (
          <p className={`text-sm mb-4 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
            No symptoms found. Try describing it below! 👇
          </p>
        )}

        {/* Input form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          onSubmit={handleSubmit}
          className={`w-full max-w-2xl flex gap-2 p-2 rounded-full shadow-lg backdrop-blur-sm border ${isDark
            ? 'bg-gray-800/70 border-emerald-800'
            : 'bg-white/70 border-green-200'
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe how you're feeling..."
            className={`flex-1 bg-transparent px-5 py-3 text-sm outline-none ${isDark
              ? 'text-emerald-100 placeholder:text-emerald-300/50'
              : 'text-green-900 placeholder:text-green-600/60'
            }`}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
          >
            Heal 🌿
          </motion.button>
        </motion.form>

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8 max-w-3xl w-full"
        >
          {[
            { icon: '🌿', title: 'Natural Remedies', desc: 'Time-tested solutions' },
            { icon: '🍯', title: 'Ancient Wisdom', desc: 'Traditional healing' },
            { icon: '💚', title: 'Safe Guidance', desc: 'Know when to see doctor' },
          ].map((item, i) => (
            <div key={i} className={`backdrop-blur-sm rounded-2xl p-4 text-center border ${isDark
              ? 'bg-gray-800/60 border-emerald-800'
              : 'bg-white/60 border-green-200'
            }`}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className={`font-semibold text-sm ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                {item.title}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>

        <p className={`text-xs mt-6 text-center max-w-md backdrop-blur-sm rounded-full px-4 py-2 border ${isDark
          ? 'bg-gray-800/50 border-emerald-800 text-emerald-300/70'
          : 'bg-white/50 border-green-200 text-green-800/60'
        }`}>
          For minor symptoms only • Not a substitute for medical advice
        </p>

      </div>
    </div>
  )
}
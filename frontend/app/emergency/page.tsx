'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

const emergencyContacts = [
  { icon: '🚑', name: 'Ambulance', number: '108', color: 'from-red-500 to-orange-500' },
  { icon: '👮', name: 'Police', number: '100', color: 'from-blue-500 to-indigo-500' },
  { icon: '🔥', name: 'Fire', number: '101', color: 'from-orange-500 to-red-600' },
  { icon: '🏥', name: 'Medical Helpline', number: '104', color: 'from-green-500 to-emerald-500' },
  { icon: '👶', name: 'Child Helpline', number: '1098', color: 'from-pink-500 to-rose-500' },
  { icon: '👩', name: 'Women Helpline', number: '1091', color: 'from-purple-500 to-pink-500' },
  { icon: '💊', name: 'Poison Control', number: '1066', color: 'from-yellow-500 to-orange-500' },
  { icon: '🧠', name: 'Mental Health', number: '1800-599-0019', color: 'from-teal-500 to-cyan-500' },
]

const symptoms911 = [
  { icon: '😰', text: 'Difficulty breathing' },
  { icon: '💔', text: 'Chest pain' },
  { icon: '🩸', text: 'Severe bleeding' },
  { icon: '🤕', text: 'Head injury' },
  { icon: '😵', text: 'Loss of consciousness' },
  { icon: '🥶', text: 'Signs of stroke' },
  { icon: '🤢', text: 'Severe allergic reaction' },
  { icon: '🔥', text: 'Severe burns' },
]

export default function EmergencyPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-red-950 via-gray-900 to-orange-950'
      : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
    }`}>

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark
        ? 'bg-gray-900/70 border-red-900'
        : 'bg-white/70 border-red-200'
      }`}>
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-2xl"
          >
            🚨
          </motion.span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-red-200' : 'text-red-800'}`}>
              Emergency
            </div>
            <div className={`text-xs ${isDark ? 'text-red-300/70' : 'text-red-700/70'}`}>
              India helpline numbers
            </div>
          </div>
        </div>
        <a
          href="/"
          className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark
            ? 'bg-gray-800/70 border-red-800 text-red-300'
            : 'bg-white/70 border-red-200 text-red-700'
          }`}
        >
          🏠
        </a>
      </div>

      <div className="max-w-3xl mx-auto p-4">

        {/* Warning banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border-2 mb-6 ${isDark
            ? 'bg-red-950/50 border-red-800 text-red-200'
            : 'bg-red-100 border-red-300 text-red-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <div className="font-bold mb-1">In case of emergency</div>
              <div className="text-sm opacity-90">
                Call the appropriate number immediately. Don't wait!
              </div>
            </div>
          </div>
        </motion.div>

        {/* Emergency contacts */}
        <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-red-200' : 'text-red-800'}`}>
          📞 Emergency Contacts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {emergencyContacts.map((contact, i) => (
            <motion.a
              key={contact.name}
              href={`tel:${contact.number}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`bg-gradient-to-r ${contact.color} p-4 rounded-2xl shadow-lg text-white flex items-center gap-4 transition-all hover:shadow-xl`}
            >
              <span className="text-3xl">{contact.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-sm">{contact.name}</div>
                <div className="text-2xl font-bold">{contact.number}</div>
              </div>
              <span className="text-2xl">📞</span>
            </motion.a>
          ))}
        </div>

        {/* When to call */}
        <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-red-200' : 'text-red-800'}`}>
          🚨 Call 108 immediately for:
        </h2>
        <div className={`backdrop-blur-sm border rounded-2xl p-4 ${isDark
          ? 'bg-gray-800/70 border-red-900'
          : 'bg-white/70 border-red-200'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {symptoms911.map((symptom, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'text-red-200' : 'text-red-800'}`}
              >
                <span className="text-xl">{symptom.icon}</span>
                <span className="text-sm">{symptom.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className={`text-xs text-center mt-6 ${isDark ? 'text-red-300/70' : 'text-red-700/70'}`}>
          💚 Stay calm, seek help immediately, and stay safe.
        </p>
      </div>
    </div>
  )
}
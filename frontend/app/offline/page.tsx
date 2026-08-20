'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function OfflinePage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = theme === 'dark'

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-red-950 to-gray-950'
      : 'bg-gradient-to-br from-red-50 via-white to-gray-100'
    }`}>
      <div className={`backdrop-blur-md border-b px-4 py-3 shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-red-900' : 'bg-white/70 border-red-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📡</span>
          <span className={`font-bold text-lg ${isDark ? 'text-red-200' : 'text-red-800'}`}>
            Offline Mode
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-2xl p-8 shadow-md ${isDark ? 'bg-gray-800/70 border-red-900' : 'bg-white/70 border-red-200'}`}
        >
          <div className="text-6xl mb-4">📡</div>
          <h1 className={`text-2xl font-bold mb-3 ${isDark ? 'text-red-200' : 'text-red-800'}`}>
            You&apos;re Offline
          </h1>
          <p className={`text-sm mb-6 ${isDark ? 'text-red-300/80' : 'text-red-700/80'}`}>
            No internet connection. Some features may be limited.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
        >
          <h2 className={`text-lg font-bold mb-4 text-left ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            ✅ Available Offline
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: '💬', label: 'Chat History', href: '/chat', desc: 'Read past conversations' },
              { icon: '📊', label: 'Wellness Tracker', href: '/tracker', desc: 'View tracked data' },
              { icon: '💊', label: 'Medications', href: '/medications', desc: 'Med schedule' },
              { icon: '📖', label: 'Symptom Guide', href: '/symptoms', desc: '30+ remedies' },
              { icon: '📆', label: 'Timeline', href: '/symptoms-timeline', desc: 'Pattern history' },
              { icon: '📊', label: 'Insights', href: '/insights', desc: 'Health stats' },
            ].map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link href={item.href} className="group">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md group-hover:scale-105 transition-transform">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-xs opacity-80">{item.desc}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-yellow-900' : 'bg-white/70 border-yellow-200'}`}
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-xl">💡</span>
            <span className={isDark ? 'text-yellow-300' : 'text-yellow-700'}>
              Data you viewed previously is cached and available offline.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

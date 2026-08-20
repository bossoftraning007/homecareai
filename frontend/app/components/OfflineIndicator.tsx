'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import Link from 'next/link'

export default function OfflineIndicator() {
  const { theme } = useTheme()
  const [isOnline, setIsOnline] = useState(true)
  const isDark = theme === 'dark'

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-lg ${
            isDark ? 'bg-red-900/80 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">📡</span>
              <span className="font-semibold">
                You&apos;re offline. Viewing cached data.
              </span>
            </div>
            <Link
              href="/offline"
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isDark ? 'bg-red-800 hover:bg-red-700 text-red-100' : 'bg-red-100 hover:bg-red-200 text-red-800'
              }`}
            >
              Offline Mode
            </Link>
          </div>
        </motion.div>
      )}
      {isOnline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-lg ${
            isDark ? 'bg-green-900/80 border-green-800 text-green-200' : 'bg-green-50 border-green-200 text-green-800'
          }`}
        >
          <div className="max-w-3xl mx-auto px-4 py-1 flex items-center justify-center text-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Back online
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

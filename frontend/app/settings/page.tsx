'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'

const themes = [
  { id: 'forest', name: 'Forest', icon: '🌿', color: 'from-green-500 to-emerald-600', preview: 'bg-gradient-to-br from-green-50 to-teal-100' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', color: 'from-blue-500 to-cyan-600', preview: 'bg-gradient-to-br from-blue-50 to-cyan-100' },
  { id: 'sunset', name: 'Sunset', icon: '🌅', color: 'from-orange-500 to-red-600', preview: 'bg-gradient-to-br from-orange-50 to-yellow-100' },
  { id: 'lavender', name: 'Lavender', icon: '💜', color: 'from-purple-500 to-pink-600', preview: 'bg-gradient-to-br from-purple-50 to-pink-100' },
  { id: 'rose', name: 'Rose', icon: '🌹', color: 'from-pink-500 to-rose-600', preview: 'bg-gradient-to-br from-pink-50 to-rose-100' },
  { id: 'midnight', name: 'Midnight', icon: '🌙', color: 'from-indigo-500 to-purple-600', preview: 'bg-gradient-to-br from-indigo-50 to-purple-100' },
  { id: 'sunnyside', name: 'Sunnyside', icon: '☀️', color: 'from-amber-400 to-yellow-500', preview: 'bg-gradient-to-br from-yellow-50 to-amber-100' },
  { id: 'ember', name: 'Ember', icon: '🔥', color: 'from-red-500 to-orange-600', preview: 'bg-gradient-to-br from-red-50 to-orange-100' },
  { id: 'cosmic', name: 'Cosmic', icon: '🌌', color: 'from-violet-500 to-indigo-600', preview: 'bg-gradient-to-br from-violet-50 to-indigo-100' },
  { id: 'mint', name: 'Mint', icon: '🍃', color: 'from-teal-400 to-green-500', preview: 'bg-gradient-to-br from-teal-50 to-green-100' },
  { id: 'desert', name: 'Desert', icon: '🏜️', color: 'from-amber-600 to-orange-700', preview: 'bg-gradient-to-br from-amber-50 to-orange-100' },
  { id: 'graphite', name: 'Graphite', icon: '⚡', color: 'from-gray-500 to-slate-600', preview: 'bg-gradient-to-br from-gray-50 to-slate-100' },
]


const THEME_KEY = 'homecare_color_theme'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [colorTheme, setColorTheme] = useState('forest')
  const [mounted, setMounted] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(THEME_KEY) || 'forest'
    setColorTheme(saved)
    document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '')
    document.documentElement.classList.add(`theme-${saved}`)
  }, [])

  const changeTheme = (themeId: string) => {
    setColorTheme(themeId)
    localStorage.setItem(THEME_KEY, themeId)
    document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '')
    document.documentElement.classList.add(`theme-${themeId}`)
    toast.success(`Theme changed to ${themes.find(t => t.id === themeId)?.name}!`, { icon: themes.find(t => t.id === themeId)?.icon })
  }

  const clearAllData = () => {
    if (confirm('Delete ALL app data? (Chat history, favorites, tracker, etc.)')) {
      localStorage.clear()
      toast.success('All data cleared!', { icon: '🗑️' })
      setTimeout(() => window.location.href = '/', 1000)
    }
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Settings
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Customize your experience
            </div>
          </div>
        </div>
        <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">

        {/* Dark mode */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            🌓 Appearance
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme === 'light'
                ? 'border-yellow-400 bg-yellow-50'
                : isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">☀️</div>
              <div className={`text-sm font-semibold ${theme === 'light' ? 'text-yellow-700' : isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                Light
              </div>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme === 'dark'
                ? 'border-emerald-400 bg-emerald-950'
                : isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">🌙</div>
              <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-emerald-200' : isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                Dark
              </div>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme === 'system'
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                : isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">💻</div>
              <div className={`text-sm font-semibold ${theme === 'system' ? 'text-blue-700 dark:text-blue-300' : isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                Auto
              </div>
            </button>
          </div>
        </motion.div>

        {/* Color themes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            🎨 Color Theme
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => changeTheme(t.id)}
                className={`p-4 rounded-xl border-2 transition-all ${colorTheme === t.id
                  ? 'border-emerald-400 shadow-lg scale-105'
                  : isDark ? 'border-gray-700' : 'border-gray-200'
                } ${t.preview}`}
              >
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className={`text-sm font-bold bg-gradient-to-r ${t.color} bg-clip-text text-transparent`}>
                  {t.name}
                </div>
                {colorTheme === t.id && (
                  <div className="text-xs text-emerald-600 font-semibold mt-1">✓ Active</div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Data management */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            💾 Data Management
          </h2>
          <p className={`text-sm mb-4 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
            Clear all stored data including chat history, favorites, and tracker entries.
          </p>
          <button
            onClick={clearAllData}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all shadow-md"
          >
            🗑️ Clear All Data
          </button>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
          <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            ℹ️ About HomeCare AI
          </h2>
          <div className={`text-sm space-y-2 ${isDark ? 'text-emerald-300/80' : 'text-green-700/80'}`}>
            <p>🌿 Natural home remedies powered by AI</p>
            <p>🔒 All data stored locally on your device</p>
            <p>💚 100% free and open</p>
            <p className="pt-2 font-semibold">Version 3.0 • Built with love</p>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
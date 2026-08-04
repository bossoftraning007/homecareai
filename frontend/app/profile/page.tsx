'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { user, signOut, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    chats: 0,
    favorites: 0,
    trackerEntries: 0,
    reminders: 0
  })

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      loadStats()
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
    })
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut()
      toast.success('Logged out!', { icon: '👋' })
      router.push('/')
    }
  }

  if (!mounted || loading) return null
  if (!user) return null

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">👤</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              My Profile
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Your health journey
            </div>
          </div>
        </div>
        <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md text-center ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-4xl text-white shadow-lg mb-4">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            {displayName}
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
            {user.email}
          </p>
          <p className={`text-xs mt-2 ${isDark ? 'text-emerald-300/50' : 'text-green-700/50'}`}>
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { icon: '💬', label: 'Chats', value: stats.chats, color: 'from-green-500 to-emerald-500' },
            { icon: '⭐', label: 'Favorites', value: stats.favorites, color: 'from-yellow-500 to-orange-500' },
            { icon: '📊', label: 'Tracker', value: stats.trackerEntries, color: 'from-blue-500 to-cyan-500' },
            { icon: '⏰', label: 'Reminders', value: stats.reminders, color: 'from-purple-500 to-pink-500' },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-r ${s.color} rounded-2xl p-4 text-white shadow-md text-center`}>
              <div className="text-3xl">{s.icon}</div>
              <div className="text-2xl font-bold mt-1">{s.value}</div>
              <div className="text-xs opacity-90">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
        >
          <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            Quick Access
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '💬', label: 'Chat', href: '/chat' },
              { icon: '⭐', label: 'Favorites', href: '/favorites' },
              { icon: '📊', label: 'Tracker', href: '/tracker' },
              { icon: '⏰', label: 'Reminders', href: '/reminders' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-center p-3 rounded-xl border transition-all hover:scale-105 ${isDark ? 'bg-gray-900/50 border-emerald-900 text-emerald-200' : 'bg-white/50 border-green-100 text-green-800'}`}
              >
                <div className="text-2xl">{link.icon}</div>
                <div className="text-xs mt-1">{link.label}</div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-2xl font-semibold hover:bg-red-600 shadow-md transition-all"
        >
          🚪 Logout
        </motion.button>

      </div>
    </div>
  )
}
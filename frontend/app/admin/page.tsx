'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  email: string
  full_name: string | null
  created_at: string
  chat_count: number
  favorite_count: number
  wellness_count: number
  reminder_count: number
}

type Notification = {
  id: string
  message: string
  read: boolean
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalFavorites: 0,
    totalReminders: 0,
    todaySignups: 0,
    activeToday: 0,
  })

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    checkAdmin()
  }, [user, authLoading])

  const checkAdmin = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (data?.is_admin) {
      setIsAdmin(true)
      loadData()
    } else {
      toast.error('Admin access required!')
      setTimeout(() => router.push('/'), 2000)
    }
  }

  const loadData = async () => {
    setLoading(true)

    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const [chatsRes, favsRes, wellnessRes, remindersRes, notifsRes] = await Promise.all([
        supabase.from('messages').select('user_id'),
        supabase.from('favorites').select('user_id'),
        supabase.from('wellness_entries').select('user_id'),
        supabase.from('reminders').select('user_id'),
        supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(20),
      ])

      const chatCounts: Record<string, number> = {}
      const favCounts: Record<string, number> = {}
      const wellnessCounts: Record<string, number> = {}
      const reminderCounts: Record<string, number> = {}

      chatsRes.data?.forEach(m => { chatCounts[m.user_id] = (chatCounts[m.user_id] || 0) + 1 })
      favsRes.data?.forEach(f => { favCounts[f.user_id] = (favCounts[f.user_id] || 0) + 1 })
      wellnessRes.data?.forEach(w => { wellnessCounts[w.user_id] = (wellnessCounts[w.user_id] || 0) + 1 })
      remindersRes.data?.forEach(r => { reminderCounts[r.user_id] = (reminderCounts[r.user_id] || 0) + 1 })

      const userList: User[] = (profiles || []).map(p => ({
        id: p.id,
        email: p.email || 'N/A',
        full_name: p.full_name,
        created_at: p.created_at,
        chat_count: chatCounts[p.id] || 0,
        favorite_count: favCounts[p.id] || 0,
        wellness_count: wellnessCounts[p.id] || 0,
        reminder_count: reminderCounts[p.id] || 0,
      }))

      setUsers(userList)
      setNotifications(notifsRes.data || [])

      const today = new Date().toDateString()
      const todaySignups = userList.filter(u =>
        new Date(u.created_at).toDateString() === today
      ).length

      const activeToday = userList.filter(u =>
        u.chat_count > 0 || u.favorite_count > 0 || u.wellness_count > 0
      ).length

      setStats({
        totalUsers: userList.length,
        totalChats: chatsRes.data?.length || 0,
        totalFavorites: favsRes.data?.length || 0,
        totalReminders: remindersRes.data?.length || 0,
        todaySignups,
        activeToday,
      })

    } catch (err) {
      toast.error('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    await supabase.from('admin_notifications').update({ read: true }).eq('id', id)
    loadData()
  }

  const clearAllNotifications = async () => {
    if (confirm('Delete ALL notifications?')) {
      await supabase.from('admin_notifications').delete().not('id', 'is', null)
      toast.success('Cleared!')
      loadData()
    }
  }

  if (!mounted || authLoading) return null
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p>Checking access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Admin Dashboard
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              HomeCare AI Analytics
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}
          >
            🔄
          </button>
          <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
            🏠
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">

        {loading ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⏳</div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: 'from-green-500 to-emerald-600' },
                { icon: '💬', label: 'Total Chats', value: stats.totalChats, color: 'from-blue-500 to-cyan-600' },
                { icon: '⭐', label: 'Favorites', value: stats.totalFavorites, color: 'from-yellow-500 to-orange-500' },
                { icon: '⏰', label: 'Reminders', value: stats.totalReminders, color: 'from-purple-500 to-pink-500' },
                { icon: '🆕', label: 'New Today', value: stats.todaySignups, color: 'from-teal-500 to-green-500' },
                { icon: '🔥', label: 'Active Users', value: stats.activeToday, color: 'from-red-500 to-orange-500' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-gradient-to-r ${stat.color} rounded-2xl p-4 text-white shadow-md`}
                >
                  <div className="text-3xl">{stat.icon}</div>
                  <div className="text-3xl font-bold mt-1">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`backdrop-blur-sm border rounded-2xl p-4 mb-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-lg font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                    🔔 Recent Activity ({notifications.filter(n => !n.read).length} new)
                  </h2>
                  <button
                    onClick={clearAllNotifications}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${!n.read
                        ? isDark ? 'bg-emerald-900/50 border-emerald-700' : 'bg-green-100 border-green-300'
                        : isDark ? 'bg-gray-900/50 border-emerald-900' : 'bg-white/50 border-green-100'
                      }`}
                    >
                      <div className={`text-sm flex items-center gap-2 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                        {!n.read && <span className="text-blue-500">●</span>}
                        {n.message}
                      </div>
                      <div className={`text-xs mt-1 ${isDark ? 'text-emerald-300/60' : 'text-green-700/60'}`}>
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Users Table */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`backdrop-blur-sm border rounded-2xl shadow-md overflow-hidden ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <div className={`px-4 py-3 border-b ${isDark ? 'border-emerald-900' : 'border-green-200'}`}>
                <h2 className={`text-lg font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  👥 All Users ({users.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'bg-gray-900/50 text-emerald-300' : 'bg-green-50 text-green-800'}>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Joined</th>
                      <th className="px-4 py-3 text-center">💬</th>
                      <th className="px-4 py-3 text-center">⭐</th>
                      <th className="px-4 py-3 text-center">📊</th>
                      <th className="px-4 py-3 text-center">⏰</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={`px-4 py-8 text-center ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                          No users yet
                        </td>
                      </tr>
                    ) : (
                      users.map((u, i) => (
                        <motion.tr
                          key={u.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className={`border-t ${isDark ? 'border-emerald-900/50 hover:bg-gray-900/30' : 'border-green-100 hover:bg-green-50/50'}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                                {(u.full_name || u.email).charAt(0).toUpperCase()}
                              </div>
                              <span className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                                {u.full_name || 'No name'}
                              </span>
                            </div>
                          </td>
                          <td className={`px-4 py-3 ${isDark ? 'text-emerald-300/80' : 'text-green-700'}`}>
                            {u.email}
                          </td>
                          <td className={`px-4 py-3 text-xs ${isDark ? 'text-emerald-300/60' : 'text-green-700/70'}`}>
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">{u.chat_count}</td>
                          <td className="px-4 py-3 text-center font-bold">{u.favorite_count}</td>
                          <td className="px-4 py-3 text-center font-bold">{u.wellness_count}</td>
                          <td className="px-4 py-3 text-center font-bold">{u.reminder_count}</td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Info */}
            <div className={`mt-6 p-4 rounded-xl border text-sm text-center ${isDark ? 'bg-emerald-900/30 border-emerald-800 text-emerald-200' : 'bg-white/50 border-green-200 text-green-800'}`}>
              💡 This dashboard only shows public profile data. User chat content is private.
            </div>

          </>
        )}
      </div>
    </div>
  )
}
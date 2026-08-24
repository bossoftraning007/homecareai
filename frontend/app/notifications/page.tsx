'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { NotificationPreferences } from '../components/Notifications'
import toast, { Toaster } from 'react-hot-toast'

type NotificationType = 'remedy_followup' | 'emergency' | 'seasonal' | 'security' | 'broadcast'

type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  body: string
  icon: string
  action_url?: string
  action_text?: string
  is_read: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  read_at?: string
}

const typeConfig: Record<NotificationType, { icon: string; color: string; label: string }> = {
  remedy_followup: { icon: 'R', color: 'bg-emerald-500', label: 'Remedy Follow-up' },
  emergency: { icon: 'E', color: 'bg-red-500', label: 'Emergency' },
  seasonal: { icon: 'S', color: 'bg-blue-500', label: 'Seasonal Advisory' },
  security: { icon: 'S', color: 'bg-purple-500', label: 'Security' },
  broadcast: { icon: 'B', color: 'bg-orange-500', label: 'Broadcast' },
}

export default function NotificationsPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'all' | 'preferences'>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all')
  const [loading, setLoading] = useState(true)

  const isDark = theme === 'dark'

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const channel = supabase
      .channel('notifications-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotifications()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(100)
    setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
  }

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user?.id)
      .eq('is_read', false)
  }

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await supabase.from('notifications').update({ is_archived: true }).eq('id', id)
  }

  const handleClick = (notif: NotificationItem) => {
    if (!notif.is_read) markAsRead(notif.id)
    if (notif.action_url) window.location.href = notif.action_url
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'all') return true
    return n.type === filter
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950' : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50'}`}>
      <Toaster position="top-center" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h1>
            <p className={`text-sm ${isDark ? 'text-emerald-300/70' : 'text-gray-500'}`}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          <a
            href="/home"
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
          >
            <span className="text-xl">{'<'} </span>
          </a>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-4 ${isDark ? 'bg-gray-800/50' : 'bg-emerald-100/50'}`}>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
              activeTab === 'all'
                ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white text-green-800 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
              activeTab === 'preferences'
                ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white text-green-800 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Preferences
          </button>
        </div>

        {activeTab === 'preferences' ? (
          <NotificationPreferences />
        ) : (
          <>
            {/* Filter Bar */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'remedy_followup', label: 'Remedy' },
                { id: 'emergency', label: 'Emergency' },
                { id: 'seasonal', label: 'Seasonal' },
                { id: 'broadcast', label: 'News' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    filter === f.id
                      ? 'bg-emerald-500 text-white'
                      : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="mb-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
              >
                Mark all as read
              </button>
            )}

            {/* Notification List */}
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">N</div>
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {filtered.map((notif) => {
                    const config = typeConfig[notif.type] || typeConfig.broadcast
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        onClick={() => handleClick(notif)}
                        className={`flex gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                          notif.is_read
                            ? isDark ? 'bg-gray-800/30 border-gray-800 hover:bg-gray-800/50' : 'bg-white border-gray-100 hover:bg-gray-50'
                            : isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                        } ${notif.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}
                      >
                        <div className={`w-10 h-10 min-w-[40px] ${config.color} rounded-xl flex items-center justify-center text-white text-sm font-bold`}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${notif.is_read ? 'font-medium' : 'font-bold'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {notif.title}
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id) }}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              ×
                            </button>
                          </div>
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notif.body}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-400">{formatTime(notif.created_at)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${config.color} text-white`}>
                              {config.label}
                            </span>
                            {notif.action_text && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                {notif.action_text}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

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
  remedy_followup: { icon: 'R', color: 'bg-emerald-500', label: 'Remedy' },
  emergency: { icon: 'E', color: 'bg-red-500', label: 'Emergency' },
  seasonal: { icon: 'S', color: 'bg-blue-500', label: 'Seasonal' },
  security: { icon: 'S', color: 'bg-purple-500', label: 'Security' },
  broadcast: { icon: 'B', color: 'bg-orange-500', label: 'News' },
}

export function NotificationBell() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifications(data || [])

      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('is_archived', false)
      setUnreadCount(count || 0)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
    setLoading(false)
  }, [user])

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('is_archived', false)
      setUnreadCount(count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()

    if (!user) return
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications()
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchNotifications, fetchUnreadCount])

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
  }

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user?.id)
      .eq('is_read', false)
  }

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', id)
  }

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.is_read) markAsRead(notif.id)
    if (notif.action_url) {
      window.location.href = notif.action_url
    }
    setIsOpen(false)
  }

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

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px]"
        aria-label="Notifications"
      >
        <span className="text-xl">B</span>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 sm:w-96 max-h-[70vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-bold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-500">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto max-h-[50vh]">
                {loading ? (
                  <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No notifications yet</div>
                ) : (
                  notifications.map((notif) => {
                    const config = typeConfig[notif.type] || typeConfig.broadcast
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex gap-3 p-4 border-b border-gray-50 dark:border-gray-800 cursor-pointer transition-colors ${
                          notif.is_read
                            ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            : 'bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                        } ${notif.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${notif.is_read ? 'font-medium' : 'font-bold'} text-gray-900 dark:text-white truncate`}>
                              {notif.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notif.id)
                              }}
                              className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {notif.body}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-gray-400">
                              {formatTime(notif.created_at)}
                            </span>
                            {notif.action_text && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                {notif.action_text}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>

              <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <a
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                >
                  View all notifications
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function NotificationPreferences() {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState({
    remedy_followups: true,
    emergency_alerts: true,
    seasonal_advisories: true,
    account_security: true,
    marketing_broadcasts: false,
    quiet_start_hour: 22,
    quiet_end_hour: 7,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setPrefs(data)
      })
  }, [user])

  const savePreferences = async () => {
    if (!user) return
    setSaving(true)
    await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...prefs })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm">Notification Preferences</h3>

      {[
        { key: 'remedy_followups', label: 'Remedy Follow-ups', desc: 'Gentle nudges after using remedies' },
        { key: 'emergency_alerts', label: 'Emergency Alerts', desc: 'Critical symptom warnings' },
        { key: 'seasonal_advisories', label: 'Seasonal Tips', desc: 'Weather-based health advice' },
        { key: 'account_security', label: 'Security Alerts', desc: 'Login and account changes' },
        { key: 'marketing_broadcasts', label: 'News & Updates', desc: 'New features and announcements' },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
          <button
            onClick={() => toggle(item.key as keyof typeof prefs)}
            className={`w-11 h-6 rounded-full transition-colors ${
              prefs[item.key as keyof typeof prefs] ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: prefs[item.key as keyof typeof prefs] ? 20 : 2 }}
              className="w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>
      ))}

      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <p className="text-sm font-medium mb-2">Quiet Hours</p>
        <div className="flex items-center gap-2">
          <select
            value={prefs.quiet_start_hour}
            onChange={(e) => setPrefs((p) => ({ ...p, quiet_start_hour: Number(e.target.value) }))}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-900"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
            ))}
          </select>
          <span className="text-gray-500">to</span>
          <select
            value={prefs.quiet_end_hour}
            onChange={(e) => setPrefs((p) => ({ ...p, quiet_end_hour: Number(e.target.value) }))}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-900"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-2">Non-emergency notifications won&apos;t buzz during these hours</p>
      </div>

      <button
        onClick={savePreferences}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
      >
        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useAuth } from "@/lib/useAuth"
import { supabase } from "@/lib/supabase"

type NotificationType = "ai_insight" | "medication" | "wellness" | "recovery" | "reminder" | "safety" | "achievement" | "weekly" | "system"

type Notification = {
  id: string
  type: NotificationType
  title: string
  body: string
  url?: string
  read: boolean
  created_at: string
}

const NOTIFICATION_CATEGORIES: { type: NotificationType; label: string; icon: string; color: string }[] = [
  { type: "all", label: "All", icon: "🔔", color: "gray" } as any,
  { type: "ai_insight", label: "AI Insights", icon: "🧠", color: "blue" },
  { type: "medication", label: "Medication", icon: "💊", color: "red" },
  { type: "recovery", label: "Recovery", icon: "🧬", color: "purple" },
  { type: "wellness", label: "Wellness", icon: "💧", color: "cyan" },
  { type: "reminder", label: "Reminders", icon: "⏰", color: "amber" },
  { type: "safety", label: "Safety", icon: "⚠️", color: "red" },
  { type: "achievement", label: "Achievements", icon: "🏆", color: "yellow" },
  { type: "weekly", label: "Weekly", icon: "📊", color: "green" },
]

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "ai_insight",
    title: "🧠 AI Wellness Insight",
    body: "Your sleep quality improved 20% this week. Keep up the good work!",
    url: "/insights",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    type: "medication",
    title: "💊 Medication Reminder",
    body: "Time to take your evening medication.",
    url: "/medications",
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    type: "recovery",
    title: "🧬 Recovery Update",
    body: "You've reached Day 3 of your cold recovery plan! 50% milestone achieved.",
    url: "/recovery",
    read: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "4",
    type: "wellness",
    title: "💧 Hydration Check",
    body: "You're at 5/8 glasses today. Keep drinking!",
    url: "/tracker",
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "5",
    type: "safety",
    title: "⚠️ Symptom Alert",
    body: "You've reported fever for 3 days. Consider consulting a doctor.",
    url: "/emergency",
    read: false,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "6",
    type: "achievement",
    title: "🏆 Achievement Unlocked!",
    body: "You completed 7 wellness check-ins this week!",
    read: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
]

export default function NotificationsPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<NotificationType | "all">("all")
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [quietHours, setQuietHours] = useState({ from: "22:00", to: "07:00", enabled: true })

  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const filteredNotifications = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeTab)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case "safety":
        return "border-l-4 border-red-500 bg-red-500/5"
      case "medication":
        return "border-l-4 border-orange-500 bg-orange-500/5"
      case "ai_insight":
        return "border-l-4 border-blue-500 bg-blue-500/5"
      case "recovery":
        return "border-l-4 border-purple-500 bg-purple-500/5"
      case "achievement":
        return "border-l-4 border-yellow-500 bg-yellow-500/5"
      case "wellness":
        return "border-l-4 border-cyan-500 bg-cyan-500/5"
      default:
        return "border-l-4 border-gray-300"
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950"
          : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100"
      }`}
    >
      {/* Header */}
      <div
        className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${
          isDark ? "bg-gray-900/70 border-emerald-900" : "bg-white/70 border-green-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔔</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? "text-emerald-200" : "text-green-800"}`}>
              Notifications
            </div>
            <div className={`text-xs ${isDark ? "text-emerald-300/70" : "text-green-700/70"}`}>
              {unreadCount} unread
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className={`text-xs px-3 py-1.5 rounded-full ${
              isDark ? "bg-emerald-900/50 text-emerald-300" : "bg-green-100 text-green-700"
            }`}
          >
            Mark all read
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`text-sm px-3 py-2 rounded-full border ${
              isDark ? "bg-gray-800/70 border-emerald-800 text-emerald-300" : "bg-white/70 border-green-200 text-green-700"
            }`}
          >
            ⚙️
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${
                isDark ? "bg-gray-800/70 border-emerald-800" : "bg-white/70 border-green-200"
              }`}
            >
              <h3 className={`font-bold mb-4 ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                ⚙️ Notification Settings
              </h3>

              <div className="space-y-4">
                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                      🔊 Notification Sound
                    </div>
                    <div className={`text-xs ${isDark ? "text-emerald-400" : "text-green-600"}`}>
                      Play sound on new notifications
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      soundEnabled ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        soundEnabled ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Quiet Hours */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                      🌙 Quiet Hours
                    </div>
                    <div className={`text-xs ${isDark ? "text-emerald-400" : "text-green-600"}`}>
                      {quietHours.from} - {quietHours.to}
                    </div>
                  </div>
                  <button
                    onClick={() => setQuietHours({ ...quietHours, enabled: !quietHours.enabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      quietHours.enabled ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        quietHours.enabled ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Frequency */}
                <div>
                  <div className={`font-medium mb-2 ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                    📊 Notification Frequency
                  </div>
                  <div className="flex gap-2">
                    {["Minimal", "Balanced", "All"].map((freq) => (
                      <button
                        key={freq}
                        className={`px-3 py-1.5 rounded-full text-xs ${
                          freq === "Balanced"
                            ? isDark
                              ? "bg-emerald-600 text-white"
                              : "bg-green-600 text-white"
                            : isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {NOTIFICATION_CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              onClick={() => setActiveTab(cat.type as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === cat.type
                  ? isDark
                    ? "bg-emerald-600 text-white"
                    : "bg-green-600 text-white"
                  : isDark
                  ? "bg-gray-800/70 text-gray-300 hover:bg-gray-700"
                  : "bg-white/70 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div
              className={`text-center py-12 rounded-2xl ${
                isDark ? "bg-gray-800/50 text-emerald-400" : "bg-white/50 text-green-600"
              }`}
            >
              <div className="text-4xl mb-2">🔔</div>
              <div className="font-medium">No notifications</div>
              <div className="text-sm opacity-70">You're all caught up!</div>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`backdrop-blur-sm border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  isDark ? "bg-gray-800/70 border-emerald-900" : "bg-white/70 border-green-200"
                } ${!notification.read ? "ring-2 ring-emerald-500/30" : ""} ${getNotificationStyle(notification.type)}`}
                onClick={() => {
                  markAsRead(notification.id)
                  if (notification.url) {
                    window.location.href = notification.url
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div
                        className={`font-semibold text-sm ${
                          isDark ? "text-emerald-200" : "text-green-800"
                        }`}
                      >
                        {notification.title}
                      </div>
                      <div className={`text-xs ${isDark ? "text-emerald-400" : "text-green-600"}`}>
                        {formatTime(notification.created_at)}
                      </div>
                    </div>
                    <div
                      className={`text-sm mt-1 ${
                        isDark ? "text-emerald-300/80" : "text-green-700/80"
                      }`}
                    >
                      {notification.body}
                    </div>
                    {notification.url && (
                      <div className="mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? "bg-emerald-900/50 text-emerald-300" : "bg-green-100 text-green-700"
                          }`}
                        >
                          Tap to view →
                        </span>
                      </div>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type CaregiverProfile = {
  id: string
  full_name: string
  email: string
  phone?: string
  role: 'primary' | 'family' | 'medical' | 'admin'
  relationship?: string
  monitored_users: string[]
  permissions: {
    view_health: boolean
    view_medications: boolean
    view_sos: boolean
    receive_alerts: boolean
    manage_contacts: boolean
  }
}

type HealthSummary = {
  user_id: string
  user_name: string
  last_active: string
  medications_taken_today: number
  medications_total: number
  last_sos?: string
  wellness_score: number
  alerts: string[]
}

export default function CaregiverDashboard() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<CaregiverProfile | null>(null)
  const [monitoredUsers, setMonitoredUsers] = useState<HealthSummary[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    if (user) {
      loadCaregiverProfile()
    }
  }, [user])

  const loadCaregiverProfile = async () => {
    if (!user) return

    const { data: profileData } = await supabase
      .from('caregiver_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData as CaregiverProfile)
      loadMonitoredUsers(profileData.monitored_users || [])
    }
  }

  const loadMonitoredUsers = async (userIds: string[]) => {
    if (userIds.length === 0) {
      // Demo data for display
      setMonitoredUsers([{
        user_id: 'demo-1',
        user_name: 'Demo User',
        last_active: new Date().toISOString(),
        medications_taken_today: 2,
        medications_total: 3,
        wellness_score: 78,
        alerts: ['Missed evening medication'],
      }])
      return
    }

    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    if (users) {
      const summaries: HealthSummary[] = users.map(u => ({
        user_id: u.id,
        user_name: u.full_name || u.email,
        last_active: u.last_active || new Date().toISOString(),
        medications_taken_today: 0,
        medications_total: 0,
        wellness_score: 75,
        alerts: [],
      }))
      setMonitoredUsers(summaries)
    }
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950'
      : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-indigo-900' : 'bg-white/70 border-indigo-100'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">👨‍⚕️</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
              Caregiver Dashboard
            </div>
            <div className={`text-xs ${isDark ? 'text-indigo-300/70' : 'text-indigo-700/70'}`}>
              {monitoredUsers.length} user{monitoredUsers.length !== 1 ? 's' : ''} monitored
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-indigo-800 text-indigo-300' : 'bg-white/70 border-indigo-200 text-indigo-700'}`}>
            🏠 Home
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}
        >
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
            Welcome back, {user?.user_metadata?.full_name || 'Caregiver'}! 👋
          </h1>
          <p className={`text-sm ${isDark ? 'text-indigo-300/70' : 'text-indigo-700/70'}`}>
            Here's a quick overview of the people you're caring for.
          </p>
        </motion.div>

        {/* Users Overview */}
        {monitoredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-8 shadow-md text-center ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}
          >
            <div className="text-5xl mb-3">👥</div>
            <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
              No users being monitored yet
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-indigo-300/70' : 'text-indigo-700/70'}`}>
              Ask the person you want to monitor to add you as their caregiver.
            </p>
            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 shadow-md transition-all">
              📤 Share Invite Link
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monitoredUsers.map((userSummary, index) => (
              <motion.div
                key={userSummary.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-all ${isDark ? 'bg-gray-800/70 border-indigo-800 hover:border-indigo-600' : 'bg-white/70 border-indigo-200 hover:border-indigo-400'}`}
                onClick={() => setSelectedUser(selectedUser === userSummary.user_id ? null : userSummary.user_id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {userSummary.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                      {userSummary.user_name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-indigo-300/70' : 'text-indigo-700/70'}`}>
                      Last active: {new Date(userSummary.last_active).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={`text-2xl ${userSummary.wellness_score >= 80 ? '🟢' : userSummary.wellness_score >= 60 ? '🟡' : '🔴'}`}>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-900/50' : 'bg-indigo-50'}`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                      {userSummary.medications_taken_today}/{userSummary.medications_total}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-indigo-300/70' : 'text-indigo-600/70'}`}>Meds Today</div>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-900/50' : 'bg-indigo-50'}`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                      {userSummary.wellness_score}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-indigo-300/70' : 'text-indigo-600/70'}`}>Wellness</div>
                  </div>
                </div>

                {/* Alerts */}
                {userSummary.alerts.length > 0 && (
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                    {userSummary.alerts.map((alert, i) => (
                      <div key={i} className={`text-xs ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                        ⚠️ {alert}
                      </div>
                    ))}
                  </div>
                )}

                {/* Expanded Details */}
                {selectedUser === userSummary.user_id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-indigo-200"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <button className={`p-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>
                        📊 View Full Report
                      </button>
                      <button className={`p-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>
                        💬 Send Message
                      </button>
                      <button className={`p-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>
                        💊 Medications
                      </button>
                      <button className={`p-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>
                        📍 Location
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-indigo-800' : 'bg-white/70 border-indigo-200'}`}
        >
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
            📋 Recent Activity
          </h2>
          <div className="space-y-3">
            {[
              { time: '10:30 AM', event: 'Morning medication taken', user: 'Demo User', icon: '✅' },
              { time: '09:15 AM', event: 'AI Chat session started', user: 'Demo User', icon: '💬' },
              { time: '08:00 AM', event: 'Wellness check-in completed', user: 'Demo User', icon: '📊' },
              { time: 'Yesterday', event: 'SOS test alert resolved', user: 'Demo User', icon: '🚨' },
            ].map((activity, i) => (
              <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-indigo-50/50'}`}>
                <span className="text-xl">{activity.icon}</span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>{activity.event}</div>
                  <div className={`text-xs ${isDark ? 'text-indigo-300/70' : 'text-indigo-600/70'}`}>{activity.user} · {activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Permissions Info */}
        {profile && (
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-indigo-800' : 'bg-indigo-50/50 border-indigo-200'}`}>
            <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>Your Permissions</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.permissions).map(([key, value]) => (
                <span
                  key={key}
                  className={`text-xs px-2 py-1 rounded-full ${value
                    ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700')
                    : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')
                  }`}
                >
                  {value ? '✅' : '❌'} {key.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type AnalyticsData = {
  total_sent: number
  total_delivered: number
  total_opened: number
  open_rate: number
  total_push_sent: number
  total_push_failed: number
  push_success_rate: number
  daily_breakdown: any[]
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [user])

  const loadAnalytics = async () => {
    if (!user) return
    setLoading(true)

    // Get overall stats from notifications table
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, is_read, created_at')

    if (notifications) {
      const total = notifications.length
      const read = notifications.filter((n: any) => n.is_read).length
      const openRate = total > 0 ? Math.round((read / total) * 100) : 0

      // Daily breakdown
      const dailyMap: Record<string, { sent: number; opened: number }> = {}
      notifications.forEach((n: any) => {
        const date = n.created_at?.split('T')[0] || 'unknown'
        if (!dailyMap[date]) dailyMap[date] = { sent: 0, opened: 0 }
        dailyMap[date].sent++
        if (n.is_read) dailyMap[date].opened++
      })

      const dailyBreakdown = Object.entries(dailyMap)
        .map(([date, data]) => ({
          date,
          ...data,
          open_rate: data.sent > 0 ? Math.round((data.opened / data.sent) * 100) : 0,
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7)

      setStats({
        total_sent: total,
        total_delivered: total,
        total_opened: read,
        open_rate: openRate,
        total_push_sent: 0,
        total_push_failed: 0,
        push_success_rate: 0,
        daily_breakdown: dailyBreakdown,
      })
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Notification Analytics</h1>

      {stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Sent" value={stats.total_sent} icon="📤" />
            <StatCard label="Opened" value={stats.total_opened} icon="👁️" />
            <StatCard label="Open Rate" value={`${stats.open_rate}%`} icon="📊" />
            <StatCard label="Push Sent" value={stats.total_push_sent} icon="🔔" />
          </div>

          {/* Daily Breakdown */}
          <div className="bg-[#111] rounded-2xl p-5 border border-[#1a1a1a]">
            <h2 className="text-lg font-semibold mb-4">Daily Breakdown</h2>
            {stats.daily_breakdown.length === 0 ? (
              <p className="text-gray-500">No data yet</p>
            ) : (
              <div className="space-y-3">
                {stats.daily_breakdown.map((day: any) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">📤 {day.sent}</span>
                      <span className="text-sm">👁️ {day.opened}</span>
                      <span className="text-sm text-emerald-400">{day.open_rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-[#111] rounded-2xl p-5 border border-[#1a1a1a]">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

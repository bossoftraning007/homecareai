'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'

type ReportType = 'weekly' | 'monthly'

type ReportPreview = {
  period: string
  daysTracked: number
  avgSleep: number
  avgMood: string
  avgEnergy: number
  totalMedications: number
  totalSymptoms: number
  insights: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

export default function HealthReportsPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeReport, setActiveReport] = useState<ReportType>('weekly')
  const [preview, setPreview] = useState<ReportPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !user) return
    loadPreview()
  }, [mounted, user, activeReport])

  const loadPreview = async () => {
    setLoading(true)
    try {
      // Generate preview from local data for now
      setPreview(generateMockPreview())
    } catch {
      setPreview(generateMockPreview())
    } finally {
      setLoading(false)
    }
  }

  const generateMockPreview = (): ReportPreview => {
    const today = new Date()
    if (activeReport === 'weekly') {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - 7)
      return {
        period: `${weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`,
        daysTracked: 5,
        avgSleep: 7.2,
        avgMood: 'Happy',
        avgEnergy: 3.8,
        totalMedications: 2,
        totalSymptoms: 3,
        insights: [
          'You\'re getting good sleep! Keep it up.',
          'Your energy levels are above average.',
          'Consider drinking more water during the day.',
        ],
      }
    }
    return {
      period: today.toLocaleDateString('en', { month: 'long', year: 'numeric' }),
      daysTracked: 22,
      avgSleep: 6.8,
      avgMood: 'Calm',
      avgEnergy: 3.5,
      totalMedications: 3,
      totalSymptoms: 8,
      insights: [
        'Your sleep quality has improved this month.',
        'You\'ve been feeling calmer overall.',
        'Exercise frequency is up 20% from last month.',
      ],
    }
  }

  const downloadReport = async () => {
    if (!user) {
      toast.error('Please login to download reports')
      return
    }

    setDownloading(true)
    try {
      const endpoint = activeReport === 'weekly' ? '/api/reports/weekly' : '/api/reports/monthly'
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'x-user-id': user.id,
        },
      })

      if (!res.ok) {
        toast.error('Failed to generate report. Please try again.')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `health_report_${activeReport}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Report downloaded!', { icon: '📄' })
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download report')
    } finally {
      setDownloading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-blue-900' : 'bg-white/70 border-blue-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              Health Reports
            </div>
            <div className={`text-xs ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
              PDF reports for doctors
            </div>
          </div>
        </div>
        <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-blue-800 text-blue-300' : 'bg-white/70 border-blue-200 text-blue-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Report Type Selector */}
        <div className="flex gap-2 mb-6">
          {(['weekly', 'monthly'] as const).map(type => (
            <button
              key={type}
              onClick={() => setActiveReport(type)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${activeReport === type
                ? isDark
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-blue-500 text-white shadow-lg'
                : isDark
                  ? 'bg-gray-800/50 text-blue-300 hover:bg-gray-700/50'
                  : 'bg-white/50 text-blue-600 hover:bg-white/70'
              }`}
            >
              {type === 'weekly' ? '📅 Weekly Report' : '📆 Monthly Report'}
            </button>
          ))}
        </div>

        {/* Report Preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeReport}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Preview Card */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-blue-800' : 'bg-white/70 border-blue-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                  {activeReport === 'weekly' ? '📅 Weekly Report' : '📆 Monthly Report'}
                </h2>
                <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                  {preview?.period || 'Loading...'}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-4xl animate-bounce">⏳</div>
                  <p className={`mt-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Loading preview...</p>
                </div>
              ) : preview ? (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Days Tracked', value: preview.daysTracked, icon: '📅' },
                      { label: 'Avg Sleep', value: `${preview.avgSleep}h`, icon: '💤' },
                      { label: 'Avg Mood', value: preview.avgMood, icon: '😊' },
                      { label: 'Avg Energy', value: `${preview.avgEnergy}/5`, icon: '⚡' },
                      { label: 'Medications', value: preview.totalMedications, icon: '💊' },
                      { label: 'Symptoms', value: preview.totalSymptoms, icon: '🩺' },
                    ].map((stat, i) => (
                      <div key={i} className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="text-xl mb-1">{stat.icon}</div>
                        <div className={`text-lg font-bold ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>{stat.value}</div>
                        <div className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Insights */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                      💡 Key Insights
                    </h3>
                    <ul className="space-y-1">
                      {preview.insights.map((insight, i) => (
                        <li key={i} className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                          - {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className={isDark ? 'text-blue-300' : 'text-blue-600'}>No data available</p>
                </div>
              )}
            </div>

            {/* Report Contents */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-blue-800' : 'bg-white/70 border-blue-200'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                📋 Report Contents
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '📊', title: 'Summary Statistics', desc: 'Averages and totals for the period' },
                  { icon: '💤', title: 'Sleep & Mood Tracking', desc: 'Daily sleep hours, quality, and mood' },
                  { icon: '💊', title: 'Medication Tracker', desc: 'Medications taken and adherence' },
                  { icon: '🩺', title: 'Symptoms Log', desc: 'Reported symptoms and severity' },
                  { icon: '💡', title: 'AI Insights', desc: 'Personalized health recommendations' },
                  { icon: '😊', title: 'Mood Distribution', desc: 'Breakdown of mood patterns' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>{item.title}</div>
                      <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadReport}
              disabled={downloading || !user}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${downloading || !user
                ? isDark
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
              }`}
            >
              {downloading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating PDF...
                </>
              ) : (
                <>
                  📄 Download PDF Report
                </>
              )}
            </button>

            {!user && (
              <div className={`p-3 rounded-xl text-center text-sm ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
                💡 <a href="/login" className="underline font-semibold">Login</a> to generate personalized reports!
              </div>
            )}

            {/* Doctor Note */}
            <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-green-900/20 border-green-500' : 'bg-green-50 border-green-400'}`}>
              <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                <strong>👨‍⚕️ For Doctors:</strong> This report is generated from patient self-reported data and is intended 
                to supplement clinical assessments. It does not replace professional medical evaluation.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

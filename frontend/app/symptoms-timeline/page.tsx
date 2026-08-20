'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import toast, { Toaster } from 'react-hot-toast'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useAuth } from '@/lib/useAuth'
import { supabase, type MessageDB } from '@/lib/supabase'
import { symptomsData } from '@/lib/symptomData'

type SymptomEntry = {
  id: string
  symptom: string
  icon: string
  message: string
  timestamp: string
  date: string
}

type ChatMessage = {
  role: string
  content: string
  timestamp?: string
  created_at?: string
}

type ChartDatum = {
  date: string
  symptoms: string[]
  count: number
}

const CHAT_HISTORY_KEY = 'homecare_chat_history'
const API_URL = 'https://homecareai-backend.onrender.com'

const SYMPTOM_KEYWORDS: Record<string, { name: string; icon: string }> = {}
Object.values(symptomsData).forEach(s => {
  SYMPTOM_KEYWORDS[s.slug] = { name: s.name, icon: s.icon }
  s.seoKeywords?.forEach(kw => {
    SYMPTOM_KEYWORDS[kw.toLowerCase()] = { name: s.name, icon: s.icon }
  })
})

export default function SymptomTimelinePage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [entries, setEntries] = useState<SymptomEntry[]>([])
  const [mounted, setMounted] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)

  const isDark = theme === 'dark'

  const extractSymptoms = (messages: ChatMessage[]) => {
    const results: SymptomEntry[] = []
    let idCounter = 0

    for (const msg of messages) {
      if (msg.role !== 'user') continue

      const lowerContent = msg.content.toLowerCase()
      const matchedSymptoms = new Set<string>()

      Object.keys(SYMPTOM_KEYWORDS).forEach(keyword => {
        if (lowerContent.includes(keyword)) {
          matchedSymptoms.add(SYMPTOM_KEYWORDS[keyword].name.toLowerCase())
        }
      })

      if (matchedSymptoms.size > 0) {
        const ts = msg.timestamp || msg.created_at || new Date().toISOString()
        matchedSymptoms.forEach(symptom => {
          const info = Object.values(symptomsData).find(s => s.name.toLowerCase() === symptom)
          results.push({
            id: `sym-${idCounter++}`,
            symptom,
            icon: info?.icon || '🤒',
            message: msg.content,
            timestamp: ts,
            date: new Date(ts).toISOString().split('T')[0],
          })
        })
      }
    }

    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const loadFromLocal = () => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY)
    if (saved) {
      try {
        const msgs = JSON.parse(saved) as ChatMessage[]
        const mapped = msgs.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || m.created_at,
        }))
        setEntries(extractSymptoms(mapped))
      } catch {}
    }
  }

  const loadFromCloud = async () => {
    if (!user) return

    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id)
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: true })

      if (msgs) {
        const mapped = (msgs as MessageDB[]).map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        }))
        setEntries(extractSymptoms(mapped))
      }
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (user) {
      loadFromCloud()
    } else {
      loadFromLocal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user])

  const generateInsights = async () => {
    if (entries.length === 0) {
      toast.error('No symptom data to analyze!')
      return
    }

    setLoadingInsights(true)
    setInsights(null)

    const symptomMap: Record<string, number> = {}
    entries.forEach(e => {
      symptomMap[e.symptom] = (symptomMap[e.symptom] || 0) + 1
    })
    const symptomCounts = Object.entries(symptomMap)
      .sort(([, a], [, b]) => b - a)
      .map(([s, c]) => `${s}: ${c} times`)
      .join('; ')

    const prompt = `You are a health pattern analysis assistant. Analyze the symptom timeline data and provide insights.

Patient's symptom history:
- Total symptom reports: ${entries.length}
- Symptom frequency: ${symptomCounts}
- Symptoms: ${Object.keys(symptomMap).join(', ')}

Timeline data: ${JSON.stringify(entries.slice(-10).map(e => ({
      symptom: e.symptom,
      date: e.date,
      message: e.message.substring(0, 100),
    })))}

Provide:
1. Key patterns noticed (recurring symptoms, seasonal patterns)
2. Possible triggers or correlations
3. Recommendations for prevention or when to seek care
4. Positive observations

Keep it conversational and caring. Use short paragraphs and bullet points.`

    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        messages: [{ role: 'user', content: prompt }],
      })
      setInsights(res.data.reply)
    } catch {
      toast.error('Failed to generate insights')
    } finally {
      setLoadingInsights(false)
    }
  }

  const chartData = entries.slice().reverse().reduce((acc: ChartDatum[], entry) => {
    const existing = acc.find(a => a.date === entry.date)
    if (existing) {
      if (!existing.symptoms.includes(entry.symptom)) {
        existing.symptoms.push(entry.symptom)
        existing.count += 1
      }
    } else {
      acc.push({
        date: new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        symptoms: [entry.symptom],
        count: 1,
      })
    }
    return acc
  }, [])

  if (!mounted) return null

  const symptomStats = entries.reduce((acc: Record<string, { count: number; icon: string }>, e) => {
    if (!acc[e.symptom]) {
      acc[e.symptom] = { count: 0, icon: e.icon }
    }
    acc[e.symptom].count += 1
    return acc
  }, {})

  const sortedSymptoms = Object.entries(symptomStats).sort(([, a], [, b]) => b.count - a.count)

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📆</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Symptom Timeline
            </div>
            <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              {user && <span className="text-blue-500">☁️</span>}
              {entries.length} symptom {entries.length === 1 ? 'report' : 'reports'}
            </div>
          </div>
        </div>
        <Link href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
          🏠
        </Link>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {!user && (
          <div className={`p-3 rounded-xl text-center text-sm ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
            💡 <Link href="/login" className="underline font-semibold">Login</Link> to sync symptom history across devices!
          </div>
        )}

        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-8 shadow-md text-center ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
          >
            <div className="text-5xl mb-3">📆</div>
            <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              No symptom history yet
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Chat with the AI about your symptoms to build a timeline here.
            </p>
            <Link
              href="/chat"
              className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
            >
              💬 Start Chatting
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                📊 Symptom Frequency
              </h2>
              <div className="space-y-3">
                {sortedSymptoms.map(([symptom, data], i) => (
                  <motion.div
                    key={symptom}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-2xl w-10">{data.icon}</span>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm capitalize ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{symptom}</div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(data.count * 20, 100)}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                    <span className={`text-xs w-12 text-right font-semibold ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>
                      {data.count}x
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  📈 Symptom Activity Over Time
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#164e39' : '#d1fae5'} />
                    <XAxis dataKey="date" stroke={isDark ? '#6ee7b7' : '#065f46'} style={{ fontSize: 11 }} />
                    <YAxis stroke={isDark ? '#6ee7b7' : '#065f46'} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                    <Bar dataKey="count" fill={isDark ? '#34d399' : '#16a34a'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                📆 Symptom Timeline
              </h2>
              <div className="space-y-4">
                {entries.slice(0, 15).map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex gap-3`}
                  >
                    <div className="flex flex-col items-center w-16 flex-shrink-0">
                      <span className="text-xl">{entry.icon}</span>
                      <span className={`text-xs ${isDark ? 'text-emerald-300/50' : 'text-green-700/50'}`}>
                        {new Date(entry.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-emerald-300/40' : 'text-green-700/40'}`}>
                        {new Date(entry.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`flex-1 rounded-xl p-3 border text-sm ${isDark ? 'bg-gray-900/50 border-emerald-900 text-emerald-100' : 'bg-white/50 border-green-100 text-green-900'}`}>
                      <span className={`font-semibold capitalize ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>{entry.symptom}</span>
                      <p className={`mt-1 line-clamp-2 ${isDark ? 'text-emerald-300/80' : 'text-green-700/80'}`}>{entry.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  🌱 AI Pattern Analysis
                </h2>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={generateInsights}
                  disabled={loadingInsights}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${isDark
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 disabled:opacity-60'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 disabled:opacity-60'
                  }`}
                >
                  {loadingInsights ? '⏳ Analyzing...' : '🔄 Analyze Patterns'}
                </motion.button>
              </div>

              <AnimatePresence>
                {insights ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="prose prose-sm max-w-none"
                  >
                    {insights.split('\n').map((paragraph, i) => (
                      <p key={i} className={isDark ? 'text-emerald-100' : 'text-gray-700'}>{paragraph}</p>
                    ))}
                  </motion.div>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                    Click &quot;Analyze Patterns&quot; for AI-powered analysis of your symptom history.
                  </p>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

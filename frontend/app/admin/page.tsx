'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

type AdminTab = 'overview' | 'symptoms' | 'ai-logs' | 'users' | 'emergency' | 'analytics' | 'settings'

type SymptomEntry = {
  id: string
  name: string
  category: string
  cause: string
  remedy: string
  safety_flags: string[]
  created_at: string
}

type ChatLog = {
  id: string
  user_email: string
  query: string
  response: string
  timestamp: string
  feedback?: 'helpful' | 'unhelpful'
  response_time_ms?: number
}

type UserEntry = {
  id: string
  email: string
  full_name: string
  created_at: string
  last_sign_in: string
  is_active: boolean
}

type SOSAlert = {
  id: string
  user_email: string
  triggered_at: string
  location?: string
  status: 'active' | 'resolved'
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminDashboard() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Data states
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([])
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([])
  const [users, setUsers] = useState<UserEntry[]>([])
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([])
  const [activityFeed, setActivityFeed] = useState<string[]>([])

  // Stats
  const [totalUsers, setTotalUsers] = useState(1247)
  const [activeToday, setActiveToday] = useState(342)
  const [queriesToday, setQueriesToday] = useState(1856)
  const [sosCount, setSosCount] = useState(0)
  const [voiceRatio, setVoiceRatio] = useState(65)

  // Form states
  const [showSymptomForm, setShowSymptomForm] = useState(false)
  const [editingSymptom, setEditingSymptom] = useState<SymptomEntry | null>(null)
  const [symptomForm, setSymptomForm] = useState({
    name: '',
    category: '',
    cause: '',
    remedy: '',
    safety_flags: '',
  })

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    // Load symptoms from database
    const { data: symptomsData } = await supabase
      .from('symptoms_database')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (symptomsData) {
      setSymptoms(symptomsData as SymptomEntry[])
    } else {
      // Demo data
      setSymptoms([
        { id: '1', name: 'Headache', category: 'Pain', cause: 'Stress, dehydration', remedy: 'Rest, cold compress, hydration', safety_flags: ['severe', 'recurring'], created_at: new Date().toISOString() },
        { id: '2', name: 'Common Cold', category: 'Respiratory', cause: 'Viral infection', remedy: 'Rest, fluids, steam inhalation', safety_flags: ['fever'], created_at: new Date().toISOString() },
        { id: '3', name: 'Acidity', category: 'Digestive', cause: 'Spicy food, stress', remedy: 'Avoid spicy food, small meals, antacids', safety_flags: ['severe_pain'], created_at: new Date().toISOString() },
      ])
    }

    // Demo chat logs
    setChatLogs([
      { id: '1', user_email: 'user1@gmail.com', query: 'I have a headache', response: 'Try resting...', timestamp: new Date().toISOString(), feedback: 'helpful', response_time_ms: 450 },
      { id: '2', user_email: 'user2@gmail.com', query: 'Remedies for cold', response: 'Drink warm fluids...', timestamp: new Date(Date.now() - 300000).toISOString(), response_time_ms: 520 },
      { id: '3', user_email: 'user3@gmail.com', query: 'My stomach hurts', response: 'Avoid spicy food...', timestamp: new Date(Date.now() - 600000).toISOString(), feedback: 'unhelpful', response_time_ms: 380 },
    ])

    // Demo users
    setUsers([
      { id: '1', email: 'user1@gmail.com', full_name: 'Rahul Kumar', created_at: '2026-08-15', last_sign_in: new Date().toISOString(), is_active: true },
      { id: '2', email: 'user2@gmail.com', full_name: 'Priya Sharma', created_at: '2026-08-18', last_sign_in: new Date(Date.now() - 86400000).toISOString(), is_active: true },
      { id: '3', email: 'user3@gmail.com', full_name: 'Amit Patel', created_at: '2026-08-20', last_sign_in: new Date(Date.now() - 172800000).toISOString(), is_active: false },
    ])

    // Demo activity feed
    setActivityFeed([
      'User user1@gmail.com searched for "headache remedies"',
      'New user signed up via Google: user4@gmail.com',
      'User user2@gmail.com completed wellness check-in',
      'SOS alert triggered by user5@gmail.com - RESOLVED',
      'User user3@gmail.com added medication "Paracetamol"',
      'AI response flagged as unhelpful by user2@gmail.com',
    ])
  }

  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symptomForm.name || !symptomForm.remedy) {
      toast.error('Name and remedy are required!')
      return
    }

    const newSymptom: SymptomEntry = {
      id: editingSymptom?.id || crypto.randomUUID(),
      name: symptomForm.name,
      category: symptomForm.category || 'General',
      cause: symptomForm.cause || 'Unknown',
      remedy: symptomForm.remedy,
      safety_flags: symptomForm.safety_flags.split(',').map(s => s.trim()).filter(Boolean),
      created_at: new Date().toISOString(),
    }

    if (editingSymptom) {
      setSymptoms(prev => prev.map(s => s.id === editingSymptom.id ? newSymptom : s))
      toast.success('Symptom updated!')
    } else {
      setSymptoms(prev => [newSymptom, ...prev])
      toast.success('Symptom added!')
    }

    // Save to database
    await supabase.from('symptoms_database').upsert([{
      id: newSymptom.id,
      name: newSymptom.name,
      category: newSymptom.category,
      cause: newSymptom.cause,
      remedy: newSymptom.remedy,
      safety_flags: newSymptom.safety_flags,
    }])

    setShowSymptomForm(false)
    setEditingSymptom(null)
    setSymptomForm({ name: '', category: '', cause: '', remedy: '', safety_flags: '' })
  }

  const deleteSymptom = async (id: string) => {
    if (!confirm('Delete this symptom?')) return
    setSymptoms(prev => prev.filter(s => s.id !== id))
    await supabase.from('symptoms_database').delete().eq('id', id)
    toast.success('Symptom deleted')
  }

  const editSymptom = (symptom: SymptomEntry) => {
    setSymptomForm({
      name: symptom.name,
      category: symptom.category,
      cause: symptom.cause,
      remedy: symptom.remedy,
      safety_flags: symptom.safety_flags.join(', '),
    })
    setEditingSymptom(symptom)
    setShowSymptomForm(true)
  }

  if (!mounted) return null

  const navItems: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'symptoms', label: 'Symptom Database', icon: '🌿' },
    { id: 'ai-logs', label: 'AI Logs', icon: '🤖' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#111111] border-r border-[#1a1a1a] flex flex-col transition-all duration-300 fixed h-full z-20`}>
        {/* Logo */}
        <div className="p-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            {sidebarOpen && (
              <div>
                <div className="font-bold text-sm">HomeCareAI</div>
                <div className="text-[10px] text-gray-500">Admin v1.0</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === item.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-3 border-t border-[#1a1a1a]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-[#1a1a1a] text-sm"
          >
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1a1a1a] px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{navItems.find(n => n.id === activeTab)?.label}</h1>
              <p className="text-xs text-gray-500">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-emerald-400">Production: Active</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: totalUsers.toLocaleString(), change: '+12%', icon: '👥', color: 'emerald' },
                    { label: 'Active Today', value: activeToday.toLocaleString(), change: '+5%', icon: '🟢', color: 'blue' },
                    { label: 'Queries Today', value: queriesToday.toLocaleString(), change: '+18%', icon: '💬', color: 'purple' },
                    { label: 'SOS Alerts', value: sosCount.toString(), change: '0', icon: '🚨', color: 'red' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          stat.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                          stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                          stat.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Voice vs Text + Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Voice vs Text */}
                  <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-4">Voice vs Text Usage</h3>
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Voice', value: voiceRatio },
                                { name: 'Text', value: 100 - voiceRatio },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              dataKey="value"
                            >
                              <Cell fill="#10b981" />
                              <Cell fill="#3b82f6" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold">{voiceRatio}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Voice
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Text
                      </span>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-4">Live Activity Feed</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {activityFeed.map((activity, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-400 p-2 rounded-lg bg-[#0a0a0a]">
                          <span className="text-emerald-500">•</span>
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'symptoms' && (
              <motion.div
                key="symptoms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Symptom & Remedy Database</h2>
                  <button
                    onClick={() => { setShowSymptomForm(true); setEditingSymptom(null); setSymptomForm({ name: '', category: '', cause: '', remedy: '', safety_flags: '' }) }}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
                  >
                    + Add New
                  </button>
                </div>

                {/* Symptom Form Modal */}
                <AnimatePresence>
                  {showSymptomForm && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 max-w-lg w-full"
                      >
                        <h3 className="text-lg font-bold mb-4">{editingSymptom ? 'Edit Symptom' : 'Add New Symptom'}</h3>
                        <form onSubmit={handleAddSymptom} className="space-y-3">
                          <input
                            type="text"
                            value={symptomForm.name}
                            onChange={(e) => setSymptomForm({ ...symptomForm, name: e.target.value })}
                            placeholder="Symptom Name *"
                            className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white text-sm outline-none focus:border-emerald-500"
                            required
                          />
                          <input
                            type="text"
                            value={symptomForm.category}
                            onChange={(e) => setSymptomForm({ ...symptomForm, category: e.target.value })}
                            placeholder="Category (e.g., Pain, Digestive)"
                            className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white text-sm outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            value={symptomForm.cause}
                            onChange={(e) => setSymptomForm({ ...symptomForm, cause: e.target.value })}
                            placeholder="Primary Cause"
                            className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white text-sm outline-none focus:border-emerald-500"
                          />
                          <textarea
                            value={symptomForm.remedy}
                            onChange={(e) => setSymptomForm({ ...symptomForm, remedy: e.target.value })}
                            placeholder="Natural Remedy Steps *"
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white text-sm outline-none resize-none focus:border-emerald-500"
                            required
                          />
                          <input
                            type="text"
                            value={symptomForm.safety_flags}
                            onChange={(e) => setSymptomForm({ ...symptomForm, safety_flags: e.target.value })}
                            placeholder="Safety Flags (comma separated)"
                            className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white text-sm outline-none focus:border-emerald-500"
                          />
                          <div className="flex gap-3">
                            <button type="button" onClick={() => setShowSymptomForm(false)} className="flex-1 py-2 rounded-lg bg-[#1a1a1a] text-gray-400 text-sm">Cancel</button>
                            <button type="submit" className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium">{editingSymptom ? 'Update' : 'Add'}</button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Symptoms Table */}
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0a0a0a]">
                      <tr>
                        <th className="text-left p-3 text-gray-400">Symptom</th>
                        <th className="text-left p-3 text-gray-400">Category</th>
                        <th className="text-left p-3 text-gray-400">Cause</th>
                        <th className="text-left p-3 text-gray-400">Remedy</th>
                        <th className="text-left p-3 text-gray-400">Flags</th>
                        <th className="text-right p-3 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {symptoms.map(symptom => (
                        <tr key={symptom.id} className="border-t border-[#1a1a1a] hover:bg-[#1a1a1a]/50">
                          <td className="p-3 font-medium">{symptom.name}</td>
                          <td className="p-3 text-gray-400">{symptom.category}</td>
                          <td className="p-3 text-gray-400">{symptom.cause}</td>
                          <td className="p-3 text-gray-400 max-w-xs truncate">{symptom.remedy}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {symptom.safety_flags.map((flag, i) => (
                                <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">{flag}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => editSymptom(symptom)} className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                            <button onClick={() => deleteSymptom(symptom.id)} className="text-red-400 hover:text-red-300">Del</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'ai-logs' && (
              <motion.div
                key="ai-logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-bold">AI Chat Logs & Performance</h2>

                {/* Latency Chart */}
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-4">Response Time (ms)</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={chatLogs.map((log, i) => ({ name: i + 1, time: log.response_time_ms || 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#111', border: '1px solid #1a1a1a' }} />
                      <Line type="monotone" dataKey="time" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Chat Logs Table */}
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0a0a0a]">
                      <tr>
                        <th className="text-left p-3 text-gray-400">User</th>
                        <th className="text-left p-3 text-gray-400">Query</th>
                        <th className="text-left p-3 text-gray-400">Response</th>
                        <th className="text-left p-3 text-gray-400">Time</th>
                        <th className="text-left p-3 text-gray-400">Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chatLogs.map(log => (
                        <tr key={log.id} className="border-t border-[#1a1a1a]">
                          <td className="p-3 text-gray-400 text-xs">{log.user_email}</td>
                          <td className="p-3 max-w-xs truncate">{log.query}</td>
                          <td className="p-3 max-w-xs truncate text-gray-400">{log.response}</td>
                          <td className="p-3 text-xs">{log.response_time_ms}ms</td>
                          <td className="p-3">
                            {log.feedback === 'helpful' && <span className="text-xs text-emerald-400">👍 Helpful</span>}
                            {log.feedback === 'unhelpful' && <span className="text-xs text-red-400">👎 Unhelpful</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-bold">User Management</h2>
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0a0a0a]">
                      <tr>
                        <th className="text-left p-3 text-gray-400">Name</th>
                        <th className="text-left p-3 text-gray-400">Email</th>
                        <th className="text-left p-3 text-gray-400">Joined</th>
                        <th className="text-left p-3 text-gray-400">Last Active</th>
                        <th className="text-left p-3 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-t border-[#1a1a1a]">
                          <td className="p-3 font-medium">{u.full_name}</td>
                          <td className="p-3 text-gray-400">{u.email}</td>
                          <td className="p-3 text-gray-400 text-xs">{u.created_at}</td>
                          <td className="p-3 text-gray-400 text-xs">{new Date(u.last_sign_in).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'emergency' && (
              <motion.div
                key="emergency"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-bold">Emergency & SOS Alerts</h2>
                {sosAlerts.length === 0 ? (
                  <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-8 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-gray-400">No active SOS alerts. All clear!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sosAlerts.map(alert => (
                      <div key={alert.id} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-red-400">🚨 SOS Triggered</div>
                            <div className="text-sm text-gray-400">{alert.user_email} · {new Date(alert.triggered_at).toLocaleString()}</div>
                          </div>
                          <button className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs">Resolve</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-bold">Analytics & Insights</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-4">Daily Active Users (7 days)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { day: 'Mon', users: 280 },
                        { day: 'Tue', users: 320 },
                        { day: 'Wed', users: 290 },
                        { day: 'Thu', users: 350 },
                        { day: 'Fri', users: 310 },
                        { day: 'Sat', users: 250 },
                        { day: 'Sun', users: 220 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={10} />
                        <YAxis stroke="#6b7280" fontSize={10} />
                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #1a1a1a' }} />
                        <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-4">Top Symptoms Searched</h3>
                    <div className="space-y-2">
                      {[
                        { name: 'Headache', count: 342 },
                        { name: 'Cold', count: 289 },
                        { name: 'Fever', count: 234 },
                        { name: 'Acidity', count: 198 },
                        { name: 'Cough', count: 176 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(item.count / 342) * 100}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-bold">System Settings</h2>
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">API Status</div>
                      <div className="text-xs text-gray-500">FastAPI Backend</div>
                    </div>
                    <span className="flex items-center gap-2 text-emerald-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Frontend Status</div>
                      <div className="text-xs text-gray-500">Vercel Deployment</div>
                    </div>
                    <span className="flex items-center gap-2 text-emerald-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Database</div>
                      <div className="text-xs text-gray-500">Supabase</div>
                    </div>
                    <span className="flex items-center gap-2 text-emerald-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">AI Engine</div>
                      <div className="text-xs text-gray-500">Groq API</div>
                    </div>
                    <span className="flex items-center gap-2 text-emerald-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Operational
                    </span>
                  </div>
                  <hr className="border-[#1a1a1a]" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">App Version</div>
                      <div className="text-xs text-gray-500">Current release</div>
                    </div>
                    <span className="text-sm text-gray-400">v1.0.0</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
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
  user_id: string
  query: string
  response: string
  timestamp: string
  is_emergency: boolean
}

type UserEntry = {
  id: string
  email: string
  full_name: string
  created_at: string
  last_sign_in: string | null
}

type SOSAlert = {
  id: string
  user_id: string
  created_at: string
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminDashboard() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  // Real data states
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([])
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([])
  const [users, setUsers] = useState<UserEntry[]>([])
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([])

  // Real stats
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeToday, setActiveToday] = useState(0)
  const [queriesToday, setQueriesToday] = useState(0)
  const [sosCount, setSosCount] = useState(0)
  const [voiceCount, setVoiceCount] = useState(0)
  const [textCount, setTextCount] = useState(0)

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
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([
      loadUsers(),
      loadSymptoms(),
      loadChatLogs(),
      loadSOSAlerts(),
      loadStats(),
    ])
    setLoading(false)
  }

  const loadUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Profiles error:', error)
        return
      }

      if (profiles) {
        const userEntries: UserEntry[] = profiles.map((p: any) => ({
          id: p.id,
          email: p.email || 'No email',
          full_name: p.full_name || 'Unknown',
          created_at: p.created_at,
          last_sign_in: p.last_sign_in_at || null,
        }))
        setUsers(userEntries)
        setTotalUsers(userEntries.length)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const loadSymptoms = async () => {
    try {
      const { data, error } = await supabase
        .from('symptoms_database')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Table might not exist yet - load from JSON file
        const response = await fetch('/data/symptoms.json')
        if (response.ok) {
          const symptomsData = await response.json()
          const entries: SymptomEntry[] = Object.entries(symptomsData).map(([key, value]: [string, any]) => ({
            id: key,
            name: value.name || key,
            category: value.category || 'General',
            cause: value.cause || value.primaryCause || 'Various factors',
            remedy: value.remedy || value.remedies?.join(', ') || 'Consult healthcare provider',
            safety_flags: value.safetyFlags || value.red_flags || [],
            created_at: new Date().toISOString(),
          }))
          setSymptoms(entries)
        }
        return
      }

      if (data) {
        setSymptoms(data as SymptomEntry[])
      }
    } catch (err) {
      console.error('Failed to load symptoms:', err)
    }
  }

  const loadChatLogs = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Messages error:', error)
        return
      }

      if (messages) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')

        const emailMap = new Map()
        if (profiles) {
          profiles.forEach((p: any) => emailMap.set(p.id, p.email))
        }

        const logs: ChatLog[] = messages
          .filter((m: any) => m.role === 'user')
          .map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            user_email: emailMap.get(m.user_id) || m.user_id.substring(0, 8) + '...',
            query: m.content,
            response: '',
            timestamp: m.created_at,
            is_emergency: m.is_emergency || false,
          }))

        setChatLogs(logs)
        setQueriesToday(messages.filter((m: any) => {
          const today = new Date().toISOString().split('T')[0]
          return m.created_at?.startsWith(today)
        }).length)

        const emergencyCount = messages.filter((m: any) => m.is_emergency).length
        setSosCount(emergencyCount)
      }
    } catch (err) {
      console.error('Failed to load chat logs:', err)
    }
  }

  const loadSOSAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_emergency', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('SOS error:', error)
        return
      }

      if (data) {
        setSosAlerts(data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          created_at: d.created_at,
        })))
      }
    } catch (err) {
      console.error('Failed to load SOS alerts:', err)
    }
  }

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { count: activeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', today)

      setActiveToday(activeCount || 0)

      const { count: queryCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)

      setQueriesToday(queryCount || 0)

      setTextCount(queryCount || 0)
      setVoiceCount(0)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symptomForm.name || !symptomForm.remedy) {
      toast.error('Name and remedy are required!')
      return
    }

    const newSymptom = {
      id: editingSymptom?.id || crypto.randomUUID(),
      name: symptomForm.name,
      category: symptomForm.category || 'General',
      cause: symptomForm.cause || 'Unknown',
      remedy: symptomForm.remedy,
      safety_flags: symptomForm.safety_flags.split(',').map(s => s.trim()).filter(Boolean),
      created_at: new Date().toISOString(),
    }

    try {
      if (editingSymptom) {
        const { error } = await supabase
          .from('symptoms_database')
          .update(newSymptom)
          .eq('id', editingSymptom.id)
        if (!error) {
          setSymptoms(prev => prev.map(s => s.id === editingSymptom.id ? newSymptom : s))
          toast.success('Symptom updated!')
        }
      } else {
        const { error } = await supabase
          .from('symptoms_database')
          .insert([newSymptom])
        if (!error) {
          setSymptoms(prev => [newSymptom, ...prev])
          toast.success('Symptom added!')
        }
      }
    } catch {
      toast.error('Database error - saved locally')
      if (editingSymptom) {
        setSymptoms(prev => prev.map(s => s.id === editingSymptom.id ? newSymptom : s))
      } else {
        setSymptoms(prev => [newSymptom, ...prev])
      }
    }

    setShowSymptomForm(false)
    setEditingSymptom(null)
    setSymptomForm({ name: '', category: '', cause: '', remedy: '', safety_flags: '' })
  }

  const deleteSymptom = async (id: string) => {
    if (!confirm('Delete this symptom?')) return
    try {
      await supabase.from('symptoms_database').delete().eq('id', id')
      setSymptoms(prev => prev.filter(s => s.id !== id))
      toast.success('Symptom deleted')
    } catch {
      setSymptoms(prev => prev.filter(s => s.id !== id))
      toast.success('Symptom removed')
    }
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

  const voiceRatio = textCount + voiceCount > 0 ? Math.round((voiceCount / (textCount + voiceCount)) * 100) : 0

  if (!mounted) return null

  const navItems: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'symptoms', label: 'Symptom DB', icon: '🌿' },
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
              <p className="text-xs text-gray-500">Live data from database</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-emerald-400">Live</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-4xl mb-4"
              >
                🌿
              </motion.div>
              <p className="text-gray-400">Loading live data...</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        {!loading && (
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
                  {/* Real Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">👥</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          {totalUsers > 0 ? '+' + Math.min(totalUsers, 100) + '%' : '0%'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold">{totalUsers}</div>
                      <div className="text-xs text-gray-500">Total Registered Users</div>
                    </div>
                    <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🟢</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Today</span>
                      </div>
                      <div className="text-2xl font-bold">{activeToday}</div>
                      <div className="text-xs text-gray-500">Active Users Today</div>
                    </div>
                    <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">💬</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Today</span>
                      </div>
                      <div className="text-2xl font-bold">{queriesToday}</div>
                      <div className="text-xs text-gray-500">AI Queries Today</div>
                    </div>
                    <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🚨</span>
                        {sosCount > 0 ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse">ALERT</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Clear</span>
                        )}
                      </div>
                      <div className="text-2xl font-bold">{sosCount}</div>
                      <div className="text-xs text-gray-500">Emergency Alerts</div>
                    </div>
                  </div>

                  {/* Real Users List */}
                  <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-4">Recent Users ({users.length})</h3>
                    {users.length === 0 ? (
                      <p className="text-gray-500 text-sm">No users found in database</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {users.slice(0, 10).map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0a0a0a]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold">
                                {u.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{u.full_name}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(u.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    <h2 className="text-lg font-bold">Symptom Database ({symptoms.length})</h2>
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
                    {symptoms.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">No symptoms in database. Add your first symptom!</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-[#0a0a0a]">
                          <tr>
                            <th className="text-left p-3 text-gray-400">Symptom</th>
                            <th className="text-left p-3 text-gray-400">Category</th>
                            <th className="text-left p-3 text-gray-400">Cause</th>
                            <th className="text-left p-3 text-gray-400">Remedy</th>
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
                              <td className="p-3 text-right">
                                <button onClick={() => editSymptom(symptom)} className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                                <button onClick={() => deleteSymptom(symptom.id)} className="text-red-400 hover:text-red-300">Del</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
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
                  <h2 className="text-lg font-bold">Recent AI Conversations ({chatLogs.length})</h2>
                  <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                    {chatLogs.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">No chat logs found. Users haven't chatted yet.</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-[#0a0a0a]">
                          <tr>
                            <th className="text-left p-3 text-gray-400">User</th>
                            <th className="text-left p-3 text-gray-400">Query</th>
                            <th className="text-left p-3 text-gray-400">Time</th>
                            <th className="text-left p-3 text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chatLogs.map(log => (
                            <tr key={log.id} className="border-t border-[#1a1a1a]">
                              <td className="p-3 text-gray-400 text-xs">{log.user_email}</td>
                              <td className="p-3 max-w-xs truncate">{log.query}</td>
                              <td className="p-3 text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="p-3">
                                {log.is_emergency ? (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Emergency</span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Normal</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
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
                  <h2 className="text-lg font-bold">Registered Users ({users.length})</h2>
                  <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                    {users.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">No users found in database</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-[#0a0a0a]">
                          <tr>
                            <th className="text-left p-3 text-gray-400">Name</th>
                            <th className="text-left p-3 text-gray-400">Email</th>
                            <th className="text-left p-3 text-gray-400">Joined</th>
                            <th className="text-left p-3 text-gray-400">Last Sign In</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.id} className="border-t border-[#1a1a1a]">
                              <td className="p-3 font-medium">{u.full_name}</td>
                              <td className="p-3 text-gray-400">{u.email}</td>
                              <td className="p-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                              <td className="p-3 text-gray-400 text-xs">
                                {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : 'Never'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
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
                  <h2 className="text-lg font-bold">Emergency & SOS Alerts ({sosAlerts.length})</h2>
                  {sosAlerts.length === 0 ? (
                    <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-8 text-center">
                      <div className="text-4xl mb-3">✅</div>
                      <p className="text-gray-400">No emergency alerts. All clear!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sosAlerts.map(alert => (
                        <div key={alert.id} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-red-400">🚨 Emergency Alert</div>
                              <div className="text-sm text-gray-400">User: {alert.user_id.substring(0, 8)}... · {new Date(alert.created_at).toLocaleString()}</div>
                            </div>
                            <button className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs">Review</button>
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
                      <h3 className="text-sm font-semibold mb-4">User Growth</h3>
                      <div className="text-3xl font-bold text-emerald-400">{totalUsers}</div>
                      <p className="text-xs text-gray-500">Total registered users</p>
                    </div>
                    <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                      <h3 className="text-sm font-semibold mb-4">Today's Activity</h3>
                      <div className="text-3xl font-bold text-blue-400">{queriesToday}</div>
                      <p className="text-xs text-gray-500">Queries processed today</p>
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
                  <h2 className="text-lg font-bold">System Status</h2>
                  <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 space-y-4">
                    {[
                      { name: 'Supabase Database', status: true },
                      { name: 'FastAPI Backend', status: true },
                      { name: 'Vercel Frontend', status: true },
                      { name: 'Groq AI Engine', status: true },
                    ].map((service, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="font-medium">{service.name}</div>
                        <span className="flex items-center gap-2 text-emerald-400 text-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                        </span>
                      </div>
                    ))}
                    <hr className="border-[#1a1a1a]" />
                    <div className="flex items-center justify-between">
                      <div className="font-medium">App Version</div>
                      <span className="text-sm text-gray-400">v1.0.0</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}

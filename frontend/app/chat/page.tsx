'use client'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { translations, languageOptions, getSpeechLang, type Language } from '@/lib/translations'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  is_emergency?: boolean
  timestamp?: string
  followups?: string[]
  related?: string[]
}

const features = [
  { icon: '💬', label: 'AI Chat', href: '/chat', color: 'from-emerald-500 to-teal-500', desc: 'Talk to AI for natural remedies' },
  { icon: '🎤', label: 'Voice Mode', href: '/voice', color: 'from-purple-500 to-pink-500', desc: 'Hands-free conversation' },
  { icon: '📋', label: 'Assessment', href: '/questionnaire', color: 'from-indigo-500 to-purple-500', desc: 'Guided health questions' },
  { icon: '📖', label: 'Symptom Guide', href: '/symptoms', color: 'from-teal-500 to-cyan-500', desc: 'Detailed remedies & info' },
  { icon: '⭐', label: 'Favorites', href: '/favorites', color: 'from-yellow-500 to-orange-500', desc: 'Save helpful remedies' },
  { icon: '📊', label: 'Wellness Tracker', href: '/tracker', color: 'from-blue-500 to-indigo-500', desc: 'Track mood, water, sleep' },
  { icon: '⏰', label: 'Reminders', href: '/reminders', color: 'from-purple-500 to-pink-500', desc: 'Medicine & wellness alerts' },
  { icon: '🚨', label: 'Emergency', href: '/emergency', color: 'from-red-500 to-orange-500', desc: 'Quick access to helplines' },
  { icon: '💊', label: 'Medication', href: '/medications', color: 'from-emerald-500 to-green-600', desc: 'Track daily medications' },
]

const API_URL = 'https://homecareai-backend.onrender.com'
const STORAGE_KEY = 'homecare_chat_history'
const LANG_KEY = 'homecare_language'
const FAV_KEY = 'homecare_favorites'

// Helper to generate unique IDs
const generateId = (prefix: string = 'msg') => 
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export default function ChatPage() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<Language>('en')
  const [isListening, setIsListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const t = translations[language]
  const isDark = theme === 'dark'
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem(LANG_KEY) as Language
    if (savedLang && translations[savedLang]) setLanguage(savedLang)

    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initial = localStorage.getItem('initial_message')
    if (initial) {
      localStorage.removeItem('initial_message')
      const greeting: Message = {
        id: generateId('greeting'),
        role: 'assistant',
        content: t.greeting,
        timestamp: new Date().toISOString(),
        followups: ['I have a headache', 'I have a cold', 'I have fever', 'I have a cough']
      }
      setMessages([greeting])
      setTimeout(() => sendMessage(initial), 500)
      return
    }

    if (user) {
      loadChatFromCloud()
    } else {
      loadChatFromLocal()
    }
  }, [mounted, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    localStorage.setItem(LANG_KEY, language)
    if (recognitionRef.current) {
      recognitionRef.current.lang = getSpeechLang(language)
    }
  }, [language])

  const loadChatFromCloud = async () => {
    if (!user) return

    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (sessions && sessions.length > 0) {
      const currentSessionId = sessions[0].id
      setSessionId(currentSessionId)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true })

      if (msgs && msgs.length > 0) {
        setMessages(msgs.map((m, idx) => ({
          id: m.id || generateId(`db-${idx}`),
          role: m.role as 'user' | 'assistant',
          content: m.content,
          is_emergency: m.is_emergency,
          timestamp: m.created_at,
          followups: m.followups || [],
          related: m.related || [],
        })))
      } else {
        setDefaultGreeting()
      }
    } else {
      setDefaultGreeting()
    }
  }

  const loadChatFromLocal = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure all messages have unique IDs
        const withIds = parsed.map((m: Message, idx: number) => ({
          ...m,
          id: m.id || generateId(`local-${idx}`)
        }))
        setMessages(withIds)
      } catch {
        setDefaultGreeting()
      }
    } else {
      setDefaultGreeting()
    }
  }

  const setDefaultGreeting = () => {
    setMessages([{
      id: generateId('greeting'),
      role: 'assistant',
      content: t.greeting,
      timestamp: new Date().toISOString(),
      followups: ['I have a headache', 'I have a cold', 'I have fever', 'I have a cough']
    }])
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMsg: Message = {
      id: generateId('user'),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    let currentSessionId = sessionId

    if (user) {
      if (!currentSessionId) {
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ user_id: user.id, title: messageText.substring(0, 50) })
          .select()
          .single()
        if (newSession) {
          currentSessionId = newSession.id
          setSessionId(currentSessionId)
        }
      }
      if (currentSessionId) {
        await supabase.from('messages').insert({
          session_id: currentSessionId,
          user_id: user.id,
          role: 'user',
          content: messageText,
          is_emergency: false,
        })
      }
    }

    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        messages: updatedMessages.map(m => ({ 
          role: m.role, 
          content: m.content 
        }))
      })

      const assistantMsg: Message = {
        id: generateId('assistant'),
        role: 'assistant',
        content: res.data.reply,
        is_emergency: res.data.is_emergency,
        timestamp: new Date().toISOString(),
        followups: res.data.followups || [],
        related: res.data.related || [],
      }
      const newMessages = [...updatedMessages, assistantMsg]
      setMessages(newMessages)

      if (user && currentSessionId) {
        await supabase.from('messages').insert({
          session_id: currentSessionId,
          user_id: user.id,
          role: 'assistant',
          content: res.data.reply,
          is_emergency: res.data.is_emergency || false,
          followups: res.data.followups || [],
          related: res.data.related || [],
        })
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages))

      if (res.data.is_emergency) {
        toast.error(t.emergency, { icon: '🚨', duration: 5000 })
      }
    } catch (err) {
      toast.error(t.error)
      setMessages([...updatedMessages, {
        id: generateId('error'),
        role: 'assistant',
        content: t.errorMsg,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const handleFollowup = (question: string) => {
    sendMessage(question)
  }

  const clearChat = async () => {
    if (!confirm(t.clearConfirm)) return

    localStorage.removeItem(STORAGE_KEY)

    if (user && sessionId) {
      await supabase.from('messages').delete().eq('session_id', sessionId)
      await supabase.from('chat_sessions').delete().eq('id', sessionId)
      setSessionId(null)
    }

    setDefaultGreeting()
    toast.success(t.cleared, { icon: '🗑️' })
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success(t.copied, { icon: '📋' })
  }

  const saveFavorite = async (content: string) => {
    if (user) {
      await supabase.from('favorites').insert({
        user_id: user.id,
        content: content,
        category: null,
      })
    }

    const favs = JSON.parse(localStorage.getItem(FAV_KEY) || '[]')
    favs.push({ content, date: new Date().toISOString() })
    localStorage.setItem(FAV_KEY, JSON.stringify(favs))

    toast.success(t.favorited, { icon: '⭐' })
  }

  const speakMessage = (content: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Speech not supported')
      return
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = content.replace(/[*#`]/g, '').replace(/\n/g, ' ')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = getSpeechLang(language)
    utterance.rate = 0.9
    utterance.onend = () => setSpeakingIndex(null)
    setSpeakingIndex(index)
    window.speechSynthesis.speak(utterance)
  }

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice not supported')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    setIsListening(true)
    toast(t.listening, { icon: '🎤', duration: 3000 })

    recognitionRef.current.onresult = (event: any) => {
      setInput(event.results[0][0].transcript)
      setIsListening(false)
      inputRef.current?.focus()
    }
    recognitionRef.current.onerror = () => {
      setIsListening(false)
      toast.error('Voice failed')
    }
    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.start()
  }

  const exportChat = () => {
    const text = messages.map(m => {
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : ''
      return `[${time}] ${m.role === 'user' ? 'You' : 'HomeCare AI'}:\n${m.content}\n`
    }).join('\n---\n\n')

    const blob = new Blob([`HomeCare AI Chat Export\n${new Date().toLocaleString()}\n\n${text}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `homecare-chat-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Chat exported!', { icon: '📤' })
  }

  const handleLogout = async () => {
    if (confirm('Logout?')) {
      await signOut()
      toast.success('Logged out!', { icon: '👋' })
    }
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!mounted) return null

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative
                    ${isDark
                      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
                      : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50'}`}>
      <Toaster position="top-center" />

      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed top-0 left-0 h-full w-80 z-50 shadow-2xl overflow-y-auto
                          ${isDark ? 'bg-gray-900' : 'bg-white'}`}
            >
              <div className={`p-6 border-b ${isDark ? 'border-emerald-900' : 'border-emerald-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🌿</span>
                    <span className={`text-xl font-black tracking-tight
                                     ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>
                      HomeCare<span className="text-emerald-500">AI</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`p-2 rounded-lg text-xl
                               ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-gray-900'}`}
                  >
                    ✕
                  </button>
                </div>

                {user && (
                  <Link href="/profile" onClick={() => setSidebarOpen(false)}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all
                                    ${isDark
                                      ? 'bg-emerald-900/30 hover:bg-emerald-900/50'
                                      : 'bg-emerald-50 hover:bg-emerald-100'}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600
                                      flex items-center justify-center text-white font-bold">
                        {displayName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm
                                        ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>
                          {displayName}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-emerald-700'}`}>
                          View profile
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              <div className="p-4">
                <div className={`text-xs font-bold tracking-wider mb-3
                               ${isDark ? 'text-emerald-400/60' : 'text-emerald-600/60'}`}>
                  FEATURES
                </div>
                <nav className="space-y-1">
                  {features.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all
                                 ${isDark
                                   ? 'hover:bg-emerald-900/30 text-emerald-200'
                                   : 'hover:bg-emerald-50 text-emerald-900'}`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color}
                                      flex items-center justify-center text-xl shadow-md`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className={`text-xs ${isDark ? 'text-emerald-400/60' : 'text-emerald-600/60'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </Link>
                  ))}
                </nav>

                <div className={`text-xs font-bold tracking-wider mb-3 mt-6
                               ${isDark ? 'text-emerald-400/60' : 'text-emerald-600/60'}`}>
                  MORE
                </div>
                <nav className="space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all
                               ${isDark
                                 ? 'hover:bg-emerald-900/30 text-emerald-200'
                                 : 'hover:bg-emerald-50 text-emerald-900'}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-slate-600
                                    flex items-center justify-center text-xl">⚙️</div>
                    <div className="font-medium text-sm">Settings</div>
                  </Link>

                  {user ? (
                    <button
                      onClick={() => { handleLogout(); setSidebarOpen(false) }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all
                                 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl">
                        🚪
                      </div>
                      <div className="font-medium text-sm text-red-500">Logout</div>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all
                                 ${isDark
                                   ? 'hover:bg-emerald-900/30 text-emerald-200'
                                   : 'hover:bg-emerald-50 text-emerald-900'}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600
                                      flex items-center justify-center text-xl">🔐</div>
                      <div className="font-medium text-sm">Login / Signup</div>
                    </Link>
                  )}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* TOP NAV */}
      <nav className={`sticky top-0 z-30 backdrop-blur-xl border-b flex-shrink-0
                      ${isDark
                        ? 'bg-gray-900/70 border-emerald-900'
                        : 'bg-white/70 border-emerald-100'}`}>
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-lg transition-all
                         ${isDark
                           ? 'hover:bg-emerald-900/30 text-emerald-200'
                           : 'hover:bg-emerald-50 text-emerald-800'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-2xl"
              >
                🌿
              </motion.div>
              <span className={`text-lg sm:text-xl font-black tracking-tight
                               ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>
                HomeCare<span className="text-emerald-500">AI</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className={`text-xs px-2 py-2 rounded-full border font-semibold cursor-pointer transition-all ${isDark
                ? 'bg-gray-800/70 border-emerald-800 text-emerald-200'
                : 'bg-white/70 border-emerald-100 text-emerald-800'
              }`}
            >
              {languageOptions.map(opt => (
                <option key={opt.code} value={opt.code}>
                  {opt.flag} {opt.native}
                </option>
              ))}
            </select>

            <button
              onClick={exportChat}
              title="Export chat"
              className={`p-2 rounded-lg transition-all
                         ${isDark
                           ? 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50'
                           : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
            >
              📤
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearChat}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all
                         ${isDark
                           ? 'border-emerald-800 text-emerald-400 hover:bg-emerald-900/30'
                           : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
            >
              🗑️
            </motion.button>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-lg transition-all
                         ${isDark
                           ? 'bg-emerald-900/30 text-yellow-300 hover:bg-emerald-900/50'
                           : 'bg-emerald-50 text-gray-700 hover:bg-emerald-100'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {user ? (
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                           ${isDark
                             ? 'bg-emerald-900/30 text-emerald-200'
                             : 'bg-emerald-50 text-emerald-800'}`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600
                                flex items-center justify-center text-white text-xs font-bold">
                  {displayName?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{displayName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white
                           px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold
                           shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-all"
              >
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <motion.div
                  key={`msg-${i}-${msg.id}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                  flex-shrink-0 text-lg shadow-md
                                  ${isUser
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                    : isDark
                                      ? 'bg-emerald-900/60 border border-emerald-700'
                                      : 'bg-emerald-100 border border-emerald-200'}`}>
                    {isUser ? '👤' : '🌿'}
                  </div>

                  <div className={`max-w-[75%] flex flex-col gap-1
                                  ${isUser ? 'items-end' : 'items-start'}`}>

                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm prose-message
                                    ${isUser
                                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm'
                                      : msg.is_emergency
                                        ? 'bg-red-50 border-2 border-red-400 text-red-800 rounded-tl-sm dark:bg-red-950/50 dark:border-red-800 dark:text-red-200'
                                        : isDark
                                          ? 'bg-gray-800/80 border border-emerald-900/50 text-emerald-100 rounded-tl-sm'
                                          : 'bg-white border border-emerald-100 text-gray-800 rounded-tl-sm'}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className={`text-xs px-1
                                       ${isDark ? 'text-emerald-400/40' : 'text-gray-400'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                      {!isUser && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => speakMessage(msg.content, i)}
                            className={`text-xs ${isDark ? 'text-emerald-300/70 hover:text-emerald-200' : 'text-emerald-700/70 hover:text-emerald-800'}`}
                          >
                            {speakingIndex === i ? '⏸️' : '🔊'}
                          </button>
                          <button
                            onClick={() => copyMessage(msg.content)}
                            className={`text-xs ${isDark ? 'text-emerald-300/70 hover:text-emerald-200' : 'text-emerald-700/70 hover:text-emerald-800'}`}
                          >
                            📋
                          </button>
                          <button
                            onClick={() => saveFavorite(msg.content)}
                            className={`text-xs ${isDark ? 'text-emerald-300/70 hover:text-yellow-300' : 'text-emerald-700/70 hover:text-yellow-600'}`}
                          >
                            ⭐
                          </button>
                        </div>
                      )}
                    </div>

                    {msg.followups && msg.followups.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.followups.map((f, j) => (
                          <motion.button
                            key={`followup-${i}-${j}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: j * 0.1 }}
                            onClick={() => handleFollowup(f)}
                            className={`text-xs px-3 py-1.5 rounded-full border
                                       transition-all duration-200 cursor-pointer
                                       ${isDark
                                         ? 'bg-emerald-900/30 border-emerald-700 text-emerald-300 hover:bg-emerald-900/50'
                                         : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}
                          >
                            💡 {f}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {msg.related && msg.related.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.related.map((r, j) => (
                          <button
                            key={`related-${i}-${j}`}
                            onClick={() => handleFollowup(`Tell me about ${r}`)}
                            className={`text-xs px-2 py-1 rounded-full border transition-all
                                       ${isDark
                                         ? 'bg-blue-900/40 border-blue-700 text-blue-200 hover:bg-blue-800/60'
                                         : 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'}`}
                          >
                            🔗 {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg
                              ${isDark
                                ? 'bg-emerald-900/60 border border-emerald-700'
                                : 'bg-emerald-100 border border-emerald-200'}`}>
                🌿
              </div>
              <div className={`px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm
                              ${isDark
                                ? 'bg-gray-800/80 border border-emerald-900/50'
                                : 'bg-white border border-emerald-100'}`}>
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={`dot-${i}`}
                      className="w-2 h-2 rounded-full bg-emerald-500"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                  <span className={`text-xs ml-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{t.thinking}</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className={`flex-shrink-0 px-4 py-4 border-t
                      ${isDark
                        ? 'bg-gray-900/70 border-emerald-900 backdrop-blur-xl'
                        : 'bg-white/70 border-emerald-100 backdrop-blur-xl'}`}>

        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 max-w-4xl mx-auto">
          {['Headache', 'Cold', 'Fever', 'Cough', 'Stomach', 'Stress'].map((s, i) => (
            <motion.button
              key={`quick-${i}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage(`I have ${s}`)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border
                         transition-all duration-200
                         ${isDark
                           ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400 hover:bg-emerald-900/40'
                           : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}
            >
              {s}
            </motion.button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`max-w-4xl mx-auto flex gap-2 p-2 rounded-full shadow-xl border
                     ${isDark
                       ? 'bg-emerald-900/30 border-emerald-800'
                       : 'bg-white border-emerald-100'}`}
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startVoiceInput}
            className={`w-10 h-10 rounded-full flex items-center justify-center
                        transition-all duration-300 flex-shrink-0 text-lg
                        ${isListening
                          ? 'bg-red-500/20 text-red-400 animate-pulse'
                          : isDark
                            ? 'text-emerald-400 hover:bg-emerald-900/30'
                            : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            {isListening ? '⏹️' : '🎤'}
          </motion.button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t.placeholder}
            disabled={loading}
            className={`flex-1 bg-transparent text-sm outline-none disabled:opacity-50
                       ${isDark
                         ? 'text-emerald-100 placeholder:text-emerald-300/50'
                         : 'text-gray-900 placeholder:text-gray-400'}`}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || loading}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                        ${input.trim() && !loading
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/50'
                          : isDark
                            ? 'bg-emerald-900/20 text-emerald-700'
                            : 'bg-gray-100 text-gray-400'}`}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mx-auto"
              />
            ) : `${t.send} →`}
          </motion.button>
        </form>

        <p className={`text-xs text-center mt-2 ${isDark ? 'text-emerald-300/60' : 'text-emerald-800/60'}`}>
          {t.disclaimer} {user && <span className="text-blue-500">• ☁️ Cloud synced</span>}
        </p>
      </div>
    </div>
  )
}
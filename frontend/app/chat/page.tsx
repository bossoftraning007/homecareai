'use client'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { translations, languageOptions, getSpeechLang, type Language } from '@/lib/translations'

type Message = {
  role: 'user' | 'assistant'
  content: string
  is_emergency?: boolean
  timestamp?: string
  followups?: string[]
  related?: string[]
}

const API_URL = 'https://homecareai-backend.onrender.com'
const STORAGE_KEY = 'homecare_chat_history'
const LANG_KEY = 'homecare_language'
const FAV_KEY = 'homecare_favorites'

export default function ChatPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<Language>('en')
  const [isListening, setIsListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const t = translations[language]
  const isDark = theme === 'dark'

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
        role: 'assistant',
        content: t.greeting,
        timestamp: new Date().toISOString()
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
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
        setMessages(msgs.map(m => ({
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
        setMessages(JSON.parse(saved))
      } catch {
        setDefaultGreeting()
      }
    } else {
      setDefaultGreeting()
    }
  }

  const setDefaultGreeting = () => {
    setMessages([{
      role: 'assistant',
      content: t.greeting,
      timestamp: new Date().toISOString()
    }])
  }

  const sendMessage = async (text: string) => {
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    let currentSessionId = sessionId

    if (user) {
      if (!currentSessionId) {
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ user_id: user.id, title: text.substring(0, 50) })
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
          content: text,
          is_emergency: false,
        })
      }
    }

    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
      })

      const assistantMsg: Message = {
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
    if (!input.trim() || loading) return
    sendMessage(input)
  }

  const handleFollowup = (question: string) => {
    sendMessage(question)
  }

  const handleRelated = (symptom: string) => {
    sendMessage(`Tell me about ${symptom}`)
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

  const exportChat = () => {
    const text = messages.map(m => {
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : ''
      return `[${time}] ${m.role === 'user' ? '👤 You' : '🌿 HomeCare AI'}:\n${m.content}\n`
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
    if (!recognitionRef.current) { toast.error('Voice not supported'); return }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); return }

    setIsListening(true)
    toast(t.listening, { icon: '🎤', duration: 3000 })

    recognitionRef.current.onresult = (event: any) => {
      setInput(event.results[0][0].transcript)
      setIsListening(false)
    }
    recognitionRef.current.onerror = () => { setIsListening(false); toast.error('Voice failed') }
    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.start()
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!mounted) return null

  const lastMessage = messages[messages.length - 1]
  const showSuggestions = lastMessage?.role === 'assistant' && !loading && ((lastMessage.followups && lastMessage.followups.length > 0) || (lastMessage.related && lastMessage.related.length > 0))

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      <div className="absolute top-20 left-5 text-4xl opacity-10">🌿</div>
      <div className="absolute top-40 right-8 text-4xl opacity-10">🍃</div>
      <div className="absolute bottom-40 left-8 text-4xl opacity-10">🌱</div>

      <div className="relative z-10 min-h-screen flex flex-col">

        <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm ${isDark
          ? 'bg-gray-900/70 border-emerald-900'
          : 'bg-white/70 border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-2xl">🌿</motion.div>
            <div>
              <div className={`font-bold text-base sm:text-lg leading-tight ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                HomeCare AI
              </div>
              <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                {user && <span className="text-blue-500">☁️</span>}
                {t.subtitle}
              </div>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center flex-wrap">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className={`text-xs px-2 py-2 rounded-full border font-semibold cursor-pointer transition-all ${isDark
                ? 'bg-gray-800/70 border-emerald-800 text-emerald-200'
                : 'bg-white/70 border-green-200 text-green-800'
              }`}
            >
              {languageOptions.map(opt => (
                <option key={opt.code} value={opt.code}>
                  {opt.flag} {opt.native}
                </option>
              ))}
            </select>
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} title="Toggle theme" className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 text-yellow-300' : 'bg-white/70 border-green-200 text-gray-700'}`}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={exportChat} title={t.export} className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
              📤
            </button>
            <button onClick={clearChat} title={t.clear} className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 text-red-400' : 'bg-white/70 border-green-200 text-green-700 hover:text-red-600'}`}>
              🗑️
            </button>
            <a href="/voice" title="Voice Mode" className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-purple-800 text-purple-400' : 'bg-white/70 border-purple-200 text-purple-600'}`}>
  🎤
</a>
            <a href="/favorites" title="Favorites" className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 text-yellow-400' : 'bg-white/70 border-green-200 text-yellow-600'}`}>
              ⭐
            </a>
            <a href="/" title="Home" className={`text-sm px-3 sm:px-4 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
              🏠
            </a>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm shrink-0 shadow-md">
                      🌿
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md prose-message ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-br-sm'
                      : msg.is_emergency
                        ? 'bg-red-50 border-2 border-red-400 text-red-800 rounded-bl-sm dark:bg-red-950/50 dark:border-red-800 dark:text-red-200'
                        : isDark
                          ? 'bg-gray-800/80 backdrop-blur-sm border border-emerald-900 text-emerald-100 rounded-bl-sm'
                          : 'bg-white/80 backdrop-blur-sm border border-green-200 text-green-900 rounded-bl-sm'
                    }`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start ml-2'}`}>
                      {msg.timestamp && (
                        <span className={`text-xs ${isDark ? 'text-emerald-300/50' : 'text-green-700/50'}`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                      {msg.role === 'assistant' && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => speakMessage(msg.content, i)} title={speakingIndex === i ? t.stop : t.speak} className={`text-xs ${isDark ? 'text-emerald-300/70 hover:text-emerald-200' : 'text-green-700/70 hover:text-green-800'}`}>
                            {speakingIndex === i ? '⏸️' : '🔊'}
                          </button>
                          <button onClick={() => copyMessage(msg.content)} className={`text-xs ${isDark ? 'text-emerald-300/70 hover:text-emerald-200' : 'text-green-700/70 hover:text-green-800'}`}>
                            📋
                          </button>
                          <button onClick={() => saveFavorite(msg.content)} className={`text-xs ${isDark ? 'text-emerald-300/70 hover:text-yellow-300' : 'text-green-700/70 hover:text-yellow-600'}`}>
                            ⭐
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm shadow-md">🌿</div>
                <div className={`backdrop-blur-sm border px-4 py-3 rounded-2xl rounded-bl-sm shadow-md ${isDark ? 'bg-gray-800/80 border-emerald-900' : 'bg-white/80 border-green-200'}`}>
                  <div className="flex gap-1 items-center">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-2 h-2 bg-green-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-2 h-2 bg-green-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className={`text-xs ml-2 ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>{t.thinking}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {showSuggestions && lastMessage.followups && lastMessage.followups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="ml-10"
            >
              <div className={`text-xs mb-2 font-semibold ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>
                {t.followUps}
              </div>
              <div className="flex flex-wrap gap-2">
                {lastMessage.followups.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFollowup(q)}
                    className={`text-xs px-3 py-2 rounded-full border shadow-sm transition-all ${isDark
                      ? 'bg-emerald-900/40 border-emerald-700 text-emerald-200 hover:bg-emerald-800/60'
                      : 'bg-white border-green-300 text-green-800 hover:bg-green-50 hover:border-green-400'
                    }`}
                  >
                    💬 {q}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {showSuggestions && lastMessage.related && lastMessage.related.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="ml-10"
            >
              <div className={`text-xs mb-2 font-semibold ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>
                {t.related}
              </div>
              <div className="flex flex-wrap gap-2">
                {lastMessage.related.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRelated(s)}
                    className={`text-xs px-3 py-2 rounded-full border shadow-sm transition-all ${isDark
                      ? 'bg-blue-900/40 border-blue-700 text-blue-200 hover:bg-blue-800/60'
                      : 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100 hover:border-blue-400'
                    }`}
                  >
                    🔗 {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className={`backdrop-blur-md border-t px-4 py-3 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
          <form onSubmit={handleSubmit} className={`flex gap-2 max-w-3xl mx-auto rounded-full p-2 shadow-md border ${isDark ? 'bg-gray-800/80 border-emerald-900' : 'bg-white/80 border-green-200'}`}>
            <button
              type="button"
              onClick={startVoiceInput}
              className={`px-3 py-2 rounded-full transition-all ${isListening
                ? 'bg-red-500 text-white pulse-green'
                : isDark
                  ? 'bg-gray-700 text-emerald-300 hover:bg-gray-600'
                  : 'bg-white text-green-700 hover:bg-green-50'
              }`}
              title="Voice input"
            >
              {isListening ? '⏹️' : '🎤'}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              disabled={loading}
              className={`flex-1 bg-transparent px-2 py-2 text-sm outline-none disabled:opacity-50 ${isDark
                ? 'text-emerald-100 placeholder:text-emerald-300/50'
                : 'text-green-900 placeholder:text-green-600/60'
              }`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-5 py-2 rounded-full text-sm font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 shadow-md transition-all"
            >
              {loading ? '...' : `${t.send} 🌿`}
            </motion.button>
          </form>
          <p className={`text-xs text-center mt-2 ${isDark ? 'text-emerald-300/60' : 'text-green-800/60'}`}>
            {t.disclaimer} {user && <span className="text-blue-500">• ☁️ Cloud synced</span>}
          </p>
        </div>

      </div>
    </div>
  )
}
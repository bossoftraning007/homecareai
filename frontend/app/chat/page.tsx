'use client'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

type Message = {
  role: 'user' | 'assistant'
  content: string
  is_emergency?: boolean
  timestamp?: string
}

const API_URL = 'https://homecareai-backend.onrender.com'
const STORAGE_KEY = 'homecare_chat_history'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initial = localStorage.getItem('initial_message')
    const saved = localStorage.getItem(STORAGE_KEY)

    if (initial) {
      localStorage.removeItem('initial_message')
      const greeting: Message = {
        role: 'assistant',
        content: "Namaste! I'm HomeCare AI. Let me help you feel better with natural remedies. 🌿",
        timestamp: new Date().toISOString()
      }
      setMessages([greeting])
      setTimeout(() => sendMessage(initial), 500)
    } else if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch {
        setDefaultGreeting()
      }
    } else {
      setDefaultGreeting()
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const setDefaultGreeting = () => {
    setMessages([{
      role: 'assistant',
      content: "Namaste! I'm HomeCare AI 🌿\n\nI'll help you with natural remedies and safe home care tips.\n\nHow are you feeling today? 💚",
      timestamp: new Date().toISOString()
    }])
  }

  const sendMessage = async (text: string) => {
    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        messages: updatedMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })

      const assistantMsg: Message = {
        role: 'assistant',
        content: res.data.reply,
        is_emergency: res.data.is_emergency,
        timestamp: new Date().toISOString()
      }

      setMessages([...updatedMessages, assistantMsg])

      if (res.data.is_emergency) {
        toast.error('Emergency detected! Seek medical help.', {
          icon: '🚨',
          duration: 5000,
        })
      }
    } catch (err) {
      toast.error('Connection failed. Please try again.')
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: 'Sorry, connection failed. Please try again in a moment. 🌿',
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

  const clearChat = () => {
    if (confirm('Clear all chat history?')) {
      localStorage.removeItem(STORAGE_KEY)
      setDefaultGreeting()
      toast.success('Chat cleared!', { icon: '🗑️' })
    }
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      <Toaster position="top-center" />

      <div className="absolute top-20 left-5 text-4xl opacity-10">🌿</div>
      <div className="absolute top-40 right-8 text-4xl opacity-10">🍃</div>
      <div className="absolute bottom-40 left-8 text-4xl opacity-10">🌱</div>

      <div className="relative z-10 min-h-screen flex flex-col">

        <div className="bg-white/70 backdrop-blur-md border-b border-green-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-2xl"
            >
              🌿
            </motion.div>
            <div>
              <div className="font-bold text-green-800 text-lg leading-tight">HomeCare AI</div>
              <div className="text-xs text-green-700/70">Natural Healing Guide</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearChat}
              title="Clear chat"
              className="text-sm text-green-700 hover:text-red-600 bg-white/70 px-3 py-2 rounded-full border border-green-200 hover:bg-white transition-all"
            >
              🗑️
            </button>
            <a
              href="/"
              className="text-sm text-green-700 hover:text-green-900 bg-white/70 px-4 py-2 rounded-full border border-green-200 hover:bg-white transition-all"
            >
              Home
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
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm shrink-0 shadow-md">
                      🌿
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-br-sm'
                        : msg.is_emergency
                          ? 'bg-red-50 border-2 border-red-400 text-red-800 rounded-bl-sm'
                          : 'bg-white/80 backdrop-blur-sm border border-green-200 text-green-900 rounded-bl-sm'
                        }`}
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(msg.content)
                      }}
                    />
                    {msg.timestamp && (
                      <span className={`text-xs text-green-700/50 ${msg.role === 'user' ? 'text-right' : 'text-left ml-2'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm shadow-md">
                  🌿
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-green-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-md">
                  <div className="flex gap-1 items-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <span className="text-xs text-green-700 ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="bg-white/70 backdrop-blur-md border-t border-green-200 px-4 py-3">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-3xl mx-auto bg-white/80 rounded-full p-2 shadow-md border border-green-200"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptom..."
              disabled={loading}
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none text-green-900 placeholder:text-green-600/60 disabled:opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 shadow-md transition-all"
            >
              {loading ? '...' : 'Send 🌿'}
            </motion.button>
          </form>
          <p className="text-xs text-center text-green-800/60 mt-2">
            Natural care guidance • Not medical diagnosis
          </p>
        </div>

      </div>
    </div>
  )
}
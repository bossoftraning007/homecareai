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

type Language = 'en' | 'te' | 'hi'

const API_URL = 'https://homecareai-backend.onrender.com'
const STORAGE_KEY = 'homecare_chat_history'
const LANG_KEY = 'homecare_language'

const translations = {
  en: {
    greeting: "Namaste! I'm HomeCare AI 🌿\n\nI'll help you with natural remedies and safe home care tips.\n\nHow are you feeling today? 💚",
    placeholder: "Describe your symptom...",
    send: "Send",
    thinking: "Thinking...",
    home: "Home",
    clear: "Clear chat",
    clearConfirm: "Clear all chat history?",
    cleared: "Chat cleared!",
    copied: "Copied to clipboard!",
    emergency: "Emergency detected! Seek medical help.",
    error: "Connection failed. Please try again.",
    errorMsg: "Sorry, connection failed. Please try again in a moment. 🌿",
    disclaimer: "Natural care guidance • Not medical diagnosis",
    subtitle: "Natural Healing Guide",
    listening: "Listening...",
  },
  te: {
    greeting: "నమస్తే! నేను HomeCare AI 🌿\n\nసహజ నివారణలు మరియు సురక్షిత ఇంటి సంరక్షణ చిట్కాలతో నేను మీకు సహాయం చేస్తాను.\n\nఈరోజు మీరు ఎలా ఉన్నారు? 💚",
    placeholder: "మీ సమస్యను వివరించండి...",
    send: "పంపండి",
    thinking: "ఆలోచిస్తున్నాను...",
    home: "హోమ్",
    clear: "చాట్ క్లియర్ చేయండి",
    clearConfirm: "అన్ని చాట్ చరిత్రను క్లియర్ చేయాలా?",
    cleared: "చాట్ క్లియర్ అయింది!",
    copied: "కాపీ చేయబడింది!",
    emergency: "అత్యవసర పరిస్థితి! వైద్య సహాయం తీసుకోండి.",
    error: "కనెక్షన్ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    errorMsg: "క్షమించండి, కనెక్షన్ విఫలమైంది. దయచేసి కొద్దిసేపటిలో మళ్ళీ ప్రయత్నించండి. 🌿",
    disclaimer: "సహజ సంరక్షణ మార్గదర్శకత్వం • వైద్య నిర్ధారణ కాదు",
    subtitle: "సహజ వైద్య గైడ్",
    listening: "వింటున్నాను...",
  },
  hi: {
    greeting: "नमस्ते! मैं HomeCare AI हूँ 🌿\n\nमैं आपकी प्राकृतिक उपचार और सुरक्षित घरेलू देखभाल में मदद करूँगा।\n\nआज आप कैसा महसूस कर रहे हैं? 💚",
    placeholder: "अपना लक्षण बताएं...",
    send: "भेजें",
    thinking: "सोच रहा हूँ...",
    home: "होम",
    clear: "चैट क्लियर करें",
    clearConfirm: "सारी चैट हिस्ट्री क्लियर करें?",
    cleared: "चैट क्लियर हो गई!",
    copied: "कॉपी हो गया!",
    emergency: "आपातकाल! तुरंत डॉक्टर से मिलें।",
    error: "कनेक्शन विफल। कृपया पुनः प्रयास करें।",
    errorMsg: "क्षमा करें, कनेक्शन विफल हुआ। कृपया कुछ देर बाद पुनः प्रयास करें। 🌿",
    disclaimer: "प्राकृतिक देखभाल मार्गदर्शन • चिकित्सा निदान नहीं",
    subtitle: "प्राकृतिक चिकित्सा गाइड",
    listening: "सुन रहा हूँ...",
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<Language>('en')
  const [isListening, setIsListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const t = translations[language]

  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY) as Language
    if (savedLang) setLanguage(savedLang)

    const initial = localStorage.getItem('initial_message')
    const saved = localStorage.getItem(STORAGE_KEY)

    if (initial) {
      localStorage.removeItem('initial_message')
      const greeting: Message = {
        role: 'assistant',
        content: translations[savedLang || 'en'].greeting,
        timestamp: new Date().toISOString()
      }
      setMessages([greeting])
      setTimeout(() => sendMessage(initial), 500)
    } else if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch {
        setDefaultGreeting(savedLang || 'en')
      }
    } else {
      setDefaultGreeting(savedLang || 'en')
    }

    // Setup speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    localStorage.setItem(LANG_KEY, language)
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'en' ? 'en-US' : language === 'te' ? 'te-IN' : 'hi-IN'
    }
  }, [language])

  const setDefaultGreeting = (lang: Language = 'en') => {
    setMessages([{
      role: 'assistant',
      content: translations[lang].greeting,
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

  const clearChat = () => {
    if (confirm(t.clearConfirm)) {
      localStorage.removeItem(STORAGE_KEY)
      setDefaultGreeting(language)
      toast.success(t.cleared, { icon: '🗑️' })
    }
  }

  const copyMessage = (content: string) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/\*\*/g, '')
    navigator.clipboard.writeText(cleaned)
    toast.success(t.copied, { icon: '📋' })
  }

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice not supported on this browser')
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
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognitionRef.current.onerror = () => {
      setIsListening(false)
      toast.error('Voice recognition failed')
    }

    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.start()
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
              <div className="font-bold text-green-800 text-base sm:text-lg leading-tight">HomeCare AI</div>
              <div className="text-xs text-green-700/70">{t.subtitle}</div>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="text-xs bg-white/70 px-2 py-2 rounded-full border border-green-200 hover:bg-white transition-all cursor-pointer text-green-800 font-semibold"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="te">🇮🇳 తె</option>
              <option value="hi">🇮🇳 हि</option>
            </select>
            <button
              onClick={clearChat}
              title={t.clear}
              className="text-sm text-green-700 hover:text-red-600 bg-white/70 px-3 py-2 rounded-full border border-green-200 hover:bg-white transition-all"
            >
              🗑️
            </button>
            <a
              href="/"
              className="text-sm text-green-700 hover:text-green-900 bg-white/70 px-3 sm:px-4 py-2 rounded-full border border-green-200 hover:bg-white transition-all"
            >
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
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md relative ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-br-sm'
                        : msg.is_emergency
                          ? 'bg-red-50 border-2 border-red-400 text-red-800 rounded-bl-sm'
                          : 'bg-white/80 backdrop-blur-sm border border-green-200 text-green-900 rounded-bl-sm'
                        }`}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start ml-2'}`}>
                      {msg.timestamp && (
                        <span className="text-xs text-green-700/50">
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyMessage(msg.content)}
                          className="text-xs text-green-700/50 hover:text-green-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          📋 Copy
                        </button>
                      )}
                    </div>
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
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-2 h-2 bg-green-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-2 h-2 bg-green-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-green-700 ml-2">{t.thinking}</span>
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
            <button
              type="button"
              onClick={startVoiceInput}
              className={`px-3 py-2 rounded-full transition-all ${isListening
                ? 'bg-red-500 text-white pulse-green'
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
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none text-green-900 placeholder:text-green-600/60 disabled:opacity-50"
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
          <p className="text-xs text-center text-green-800/60 mt-2">
            {t.disclaimer}
          </p>
        </div>

      </div>
    </div>
  )
}
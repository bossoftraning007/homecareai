'use client'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { translations, languageOptions, getSpeechLang, type Language } from '@/lib/translations'

const API_URL = 'https://homecareai-backend.onrender.com'
const STORAGE_KEY = 'homecare_chat_history'
const LANG_KEY = 'homecare_language'

type Message = {
  role: 'user' | 'assistant'
  content: string
  is_emergency?: boolean
}

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function VoiceModePage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [lastResponse, setLastResponse] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [autoMode, setAutoMode] = useState(true)
  const [error, setError] = useState('')
  const recognitionRef = useRef<any>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

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
      recognitionRef.current.interimResults = true
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getSpeechLang(language)
    }
  }, [language])

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice not supported on this browser')
      return
    }

    if (voiceState === 'speaking') {
      window.speechSynthesis.cancel()
    }

    setError('')
    setTranscript('')
    setVoiceState('listening')

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      if (finalTranscript) {
        processQuery(finalTranscript)
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      setVoiceState('idle')
      if (event.error === 'no-speech') {
        setError('No speech detected. Tap mic to try again.')
      } else if (event.error === 'not-allowed') {
        setError('Please allow microphone access!')
        toast.error('Microphone permission needed!')
      } else {
        setError(`Voice error: ${event.error}`)
      }
    }

    recognitionRef.current.onend = () => {
      if (voiceState === 'listening') {
        setVoiceState('idle')
      }
    }

    try {
      recognitionRef.current.start()
    } catch (err) {
      setVoiceState('idle')
      toast.error('Cannot start voice')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setVoiceState('idle')
  }

  const processQuery = async (text: string) => {
    setVoiceState('thinking')
    setError('')

    const userMsg: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)

    // Save to Supabase if logged in
    if (user) {
      try {
        const { data: sessions } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        let sessionId = sessions?.[0]?.id
        if (!sessionId) {
          const { data: newSession } = await supabase
            .from('chat_sessions')
            .insert({ user_id: user.id, title: 'Voice Chat' })
            .select()
            .single()
          sessionId = newSession?.id
        }

        if (sessionId) {
          await supabase.from('messages').insert({
            session_id: sessionId,
            user_id: user.id,
            role: 'user',
            content: text,
            is_emergency: false,
          })
        }
      } catch (err) {
        console.error('Save error:', err)
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
      }
      setMessages([...updatedMessages, assistantMsg])
      setLastResponse(res.data.reply)

      // Save to Supabase
      if (user) {
        const { data: sessions } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (sessions?.[0]?.id) {
          await supabase.from('messages').insert({
            session_id: sessions[0].id,
            user_id: user.id,
            role: 'assistant',
            content: res.data.reply,
            is_emergency: res.data.is_emergency || false,
          })
        }
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...updatedMessages, assistantMsg]))

      if (res.data.is_emergency) {
        toast.error(t.emergency, { icon: '🚨', duration: 5000 })
      }

      // Speak the response
      speakResponse(res.data.reply)

    } catch (err) {
      setVoiceState('idle')
      toast.error(t.error)
      setError('Connection failed. Please try again.')
    }
  }

  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Speech not supported')
      setVoiceState('idle')
      return
    }

    window.speechSynthesis.cancel()

    // Clean markdown and emojis for cleaner speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[*#`_~]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/[🌿🍃🌱🌾💚🚨⚠️❌✅🔥📋⭐📊💬🎤🔊👋😊😷🤒]/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = getSpeechLang(language)
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 1

    utteranceRef.current = utterance
    setVoiceState('speaking')

    utterance.onend = () => {
      setVoiceState('idle')
      // Auto-listen after speaking
      if (autoMode) {
        setTimeout(() => {
          startListening()
        }, 500)
      }
    }

    utterance.onerror = () => {
      setVoiceState('idle')
    }

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setVoiceState('idle')
  }

  const clearAll = () => {
    if (confirm('Clear conversation?')) {
      setMessages([])
      setLastResponse('')
      setTranscript('')
      localStorage.removeItem(STORAGE_KEY)
      toast.success('Cleared!', { icon: '🗑️' })
    }
  }

  const getStatusText = () => {
    switch (voiceState) {
      case 'listening': return language === 'te' ? 'వింటున్నాను...' : language === 'hi' ? 'सुन रहा हूँ...' : language === 'ta' ? 'கேட்கிறேன்...' : language === 'bn' ? 'শুনছি...' : 'Listening...'
      case 'thinking': return language === 'te' ? 'ఆలోచిస్తున్నాను...' : language === 'hi' ? 'सोच रहा हूँ...' : language === 'ta' ? 'சிந்திக்கிறேன்...' : language === 'bn' ? 'ভাবছি...' : 'Thinking...'
      case 'speaking': return language === 'te' ? 'మాట్లాడుతున్నాను...' : language === 'hi' ? 'बोल रहा हूँ...' : language === 'ta' ? 'பேசுகிறேன்...' : language === 'bn' ? 'বলছি...' : 'Speaking...'
      default: return language === 'te' ? 'మైక్ నొక్కి మాట్లాడండి' : language === 'hi' ? 'माइक दबाकर बोलें' : language === 'ta' ? 'மைக்கை அழுத்தி பேசவும்' : language === 'bn' ? 'মাইক্রোফোন টিপে কথা বলুন' : 'Tap the mic and speak'
    }
  }

  const getButtonColor = () => {
    switch (voiceState) {
      case 'listening': return 'from-red-500 to-pink-600'
      case 'thinking': return 'from-yellow-500 to-orange-600'
      case 'speaking': return 'from-blue-500 to-indigo-600'
      default: return 'from-green-500 to-emerald-600'
    }
  }

  const getButtonIcon = () => {
    switch (voiceState) {
      case 'listening': return '🎤'
      case 'thinking': return '💭'
      case 'speaking': return '🔊'
      default: return '🎤'
    }
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Voice Mode
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Hands-free conversation
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className={`text-xs px-2 py-2 rounded-full border font-semibold cursor-pointer ${isDark
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
          <button
            onClick={() => setAutoMode(!autoMode)}
            title="Auto-listen after speaking"
            className={`text-xs px-3 py-2 rounded-full border font-semibold transition-all ${autoMode
              ? 'bg-green-500 text-white border-green-600'
              : isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'
            }`}
          >
            🔁 {autoMode ? 'ON' : 'OFF'}
          </button>
          <a href="/chat" title="Text Chat" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
            💬
          </a>
          <a href="/" title="Home" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
            🏠
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">

        {/* Big Voice Button */}
        <motion.button
          onClick={voiceState === 'listening' ? stopListening : voiceState === 'speaking' ? stopSpeaking : startListening}
          disabled={voiceState === 'thinking'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={voiceState === 'listening' ? {
            scale: [1, 1.1, 1],
          } : voiceState === 'speaking' ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={voiceState !== 'idle' ? {
            duration: 1,
            repeat: Infinity,
          } : {}}
          className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br ${getButtonColor()} shadow-2xl flex items-center justify-center text-8xl mb-6 disabled:opacity-70 relative`}
        >
          {voiceState === 'listening' && (
            <>
              <motion.div
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.3, 0, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 rounded-full bg-red-400"
              />
            </>
          )}
          <span className="relative z-10">{getButtonIcon()}</span>
        </motion.button>

        {/* Status Text */}
        <motion.div
          key={voiceState}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl font-bold mb-4 text-center ${isDark ? 'text-emerald-200' : 'text-green-800'}`}
        >
          {getStatusText()}
        </motion.div>

        {/* Transcript Display */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`w-full max-w-lg p-4 rounded-2xl mb-4 shadow-md border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-100' : 'bg-white/70 border-green-200 text-green-900'}`}
            >
              <div className={`text-xs mb-1 font-semibold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
                🗣️ You said:
              </div>
              <div className="text-sm italic">"{transcript}"</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Last AI Response Display */}
        <AnimatePresence>
          {lastResponse && voiceState !== 'listening' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`w-full max-w-lg p-4 rounded-2xl mb-4 shadow-md border max-h-64 overflow-y-auto ${isDark ? 'bg-emerald-900/40 border-emerald-700 text-emerald-100' : 'bg-white border-green-200 text-green-900'}`}
            >
              <div className={`text-xs mb-2 font-semibold flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
                🌿 HomeCare AI says:
                {voiceState === 'speaking' && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                )}
              </div>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {lastResponse.substring(0, 500)}
                {lastResponse.length > 500 && '...'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-3 rounded-xl text-sm text-center ${isDark ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-700'}`}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Instructions */}
        {!lastResponse && !transcript && voiceState === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-center max-w-md ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}
          >
            <p className="text-sm mb-2">
              {language === 'te' ? '🎤 మైక్ నొక్కి మాట్లాడండి' :
               language === 'hi' ? '🎤 माइक दबाकर बोलें' :
               language === 'ta' ? '🎤 மைக்கை அழுத்தி பேசவும்' :
               language === 'bn' ? '🎤 মাইক টিপে কথা বলুন' :
               '🎤 Tap the mic and start speaking'}
            </p>
            <p className="text-xs mt-4 opacity-70">
              {language === 'te' ? '💡 "నాకు జలుబు ఉంది" అని ప్రయత్నించండి' :
               language === 'hi' ? '💡 "मुझे सर्दी है" कहकर देखें' :
               '💡 Try saying: "I have a cold"'}
            </p>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex gap-2 mt-6">
          {messages.length > 0 && (
            <button
              onClick={clearAll}
              className={`px-4 py-2 rounded-full text-sm border shadow-sm transition-all ${isDark ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}
            >
              🗑️ Clear
            </button>
          )}
          {voiceState === 'speaking' && (
            <button
              onClick={stopSpeaking}
              className={`px-4 py-2 rounded-full text-sm border shadow-sm ${isDark ? 'bg-yellow-900/50 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}
            >
              ⏸️ Stop Speaking
            </button>
          )}
        </div>

        {/* Auto mode info */}
        <div className={`text-xs mt-4 text-center max-w-md ${isDark ? 'text-emerald-300/50' : 'text-green-700/60'}`}>
          {autoMode ? '🔁 Auto-listen ON: Mic activates after AI speaks' : '🔁 Auto-listen OFF: Tap mic each time'}
        </div>
      </div>
    </div>
  )
}
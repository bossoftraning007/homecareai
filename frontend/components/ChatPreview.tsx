'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const conversations = [
  { role: 'user', text: 'I have a cold and blocked nose' },
  { role: 'ai', text: '🌿 Try ginger tea with honey! Also steam inhalation helps clear congestion. Rest well!' },
  { role: 'user', text: 'எனக்கு தலைவலி (headache)' },
  { role: 'ai', text: '🌿 நீர் அருந்துங்கள் (drink water) and try peppermint oil on temples. Rest in a dark room.' },
  { role: 'user', text: 'मुझे बुखार है' },
  { role: 'ai', text: '🌿 तुलसी चाय पीएं। पर्याप्त आराम करें। तेज बुखार होने पर डॉक्टर से मिलें।' },
]

export default function ChatPreview({ isDark }: { isDark: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayedMessages, setDisplayedMessages] = useState<typeof conversations>([])
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (currentIndex >= conversations.length) {
      setTimeout(() => {
        setCurrentIndex(0)
        setDisplayedMessages([])
      }, 3000)
      return
    }

    const message = conversations[currentIndex]

    if (message.role === 'ai') {
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        setDisplayedMessages(prev => [...prev, message])
        setCurrentIndex(prev => prev + 1)
      }, 1500)
    } else {
      setTimeout(() => {
        setDisplayedMessages(prev => [...prev, message])
        setCurrentIndex(prev => prev + 1)
      }, 2000)
    }
  }, [currentIndex])

  return (
    <div className={`glass-card rounded-3xl p-6 shadow-2xl relative overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-2xl"
        >
          🌿
        </motion.div>
        <div>
          <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            HomeCare AI
          </div>
          <div className="flex items-center gap-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3 min-h-[300px]">
        <AnimatePresence>
          {displayedMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-sm'
                : isDark
                  ? 'bg-white/10 text-white rounded-bl-sm'
                  : 'bg-black/5 text-gray-900 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}

          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                <div className="flex gap-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-red-500"
        />
        <span className="text-xs font-semibold text-red-500">LIVE</span>
      </div>
    </div>
  )
}
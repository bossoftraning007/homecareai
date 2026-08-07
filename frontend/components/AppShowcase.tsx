'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

const screens = [
  {
    title: 'AI Chat',
    icon: '💬',
    color: 'from-emerald-500 to-teal-600',
    content: (
      <div className="p-4 space-y-2">
        <div className="flex justify-end">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-3 py-2 rounded-2xl rounded-br-sm text-xs max-w-[80%]">
            I have a headache
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs">🌿</div>
          <div className="bg-white/10 px-3 py-2 rounded-2xl rounded-bl-sm text-xs max-w-[80%]">
            Try peppermint oil on temples, drink water, rest in dark room 🌿
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Voice Mode',
    icon: '🎤',
    color: 'from-purple-500 to-pink-500',
    content: (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg mb-3"
        >
          🎤
        </motion.div>
        <div className="text-xs text-center">Listening...</div>
      </div>
    )
  },
  {
    title: 'Wellness',
    icon: '📊',
    color: 'from-blue-500 to-indigo-500',
    content: (
      <div className="p-4">
        <div className="text-xs font-bold mb-2">Today's Check-in</div>
        <div className="flex gap-1 mb-3">
          {['😢', '😔', '😐', '🙂', '😄'].map((e, i) => (
            <div key={i} className={`text-2xl p-1 rounded ${i === 3 ? 'bg-emerald-500' : ''}`}>
              {e}
            </div>
          ))}
        </div>
        <div className="text-xs mb-1">💧 Water: 5/8</div>
        <div className="text-xs">💤 Sleep: 7h</div>
      </div>
    )
  },
  {
    title: 'Symptoms',
    icon: '📖',
    color: 'from-teal-500 to-cyan-500',
    content: (
      <div className="p-4 grid grid-cols-3 gap-2">
        {['🤧', '🤕', '😷', '🌡️', '🤢', '💤'].map((icon, i) => (
          <div key={i} className="aspect-square bg-white/10 rounded-lg flex items-center justify-center text-2xl">
            {icon}
          </div>
        ))}
      </div>
    )
  },
]

export default function AppShowcase({ isDark }: { isDark: boolean }) {
  const [active, setActive] = useState(0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 items-center">

        {/* Left: Feature list */}
        <div className="space-y-3">
          {screens.map((screen, i) => (
            <motion.button
              key={i}
              onClick={() => setActive(i)}
              whileHover={{ x: 5 }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${active === i
                ? `bg-gradient-to-r ${screen.color} text-white border-transparent shadow-2xl`
                : isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10'
                  : 'bg-black/5 border-black/10 hover:bg-black/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{screen.icon}</div>
                <div>
                  <div className={`font-bold ${active === i ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>
                    {screen.title}
                  </div>
                  <div className={`text-sm ${active === i ? 'text-white/80' : isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Try it now →
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right: Phone mockup */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Phone Frame */}
            <div className={`relative w-72 h-[550px] rounded-[3rem] p-3 shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-gray-900'}`}>
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />

              {/* Screen */}
              <div className={`w-full h-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br ${screens[active].color} relative`}>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm">
                  <div className="p-4 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-bold">🌿 HomeCare AI</div>
                      <div className="text-xs">9:41</div>
                    </div>
                    <div className="rounded-2xl h-[430px] bg-black/40 backdrop-blur overflow-hidden">
                      {screens[active].content}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${screens[active].color} blur-3xl opacity-30 -z-10`} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const languages = [
  { name: 'English', native: 'English', pos: { top: '30%', left: '20%' } },
  { name: 'Telugu', native: 'తెలుగు', pos: { top: '40%', left: '65%' } },
  { name: 'Hindi', native: 'हिन्दी', pos: { top: '35%', left: '60%' } },
  { name: 'Tamil', native: 'தமிழ்', pos: { top: '50%', left: '62%' } },
  { name: 'Kannada', native: 'ಕನ್ನಡ', pos: { top: '48%', left: '58%' } },
  { name: 'Malayalam', native: 'മലയാളം', pos: { top: '55%', left: '60%' } },
  { name: 'Bengali', native: 'বাংলা', pos: { top: '38%', left: '70%' } },
  { name: 'Marathi', native: 'मराठी', pos: { top: '42%', left: '55%' } },
  { name: 'Gujarati', native: 'ગુજરાતી', pos: { top: '38%', left: '52%' } },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', pos: { top: '30%', left: '58%' } },
]

export default function InteractiveGlobe({ isDark }: { isDark: boolean }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square">
      {/* Globe Base */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.6)'} 0%, ${isDark ? 'rgba(6, 95, 70, 0.2)' : 'rgba(6, 95, 70, 0.3)'} 40%, transparent 70%)`,
        }}
      />

      {/* Globe Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-4 rounded-full border-2 border-dashed border-emerald-500/30"
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-8 rounded-full border-2 border-emerald-500/20"
      />

      {/* Center Icon */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50`}>
          <div className="text-6xl">🌿</div>
        </div>
      </motion.div>

      {/* Language Bubbles */}
      {languages.map((lang, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          style={lang.pos}
          className="absolute"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className={`glass-card px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg cursor-pointer hover:scale-110 transition-transform ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {lang.native}
          </motion.div>
        </motion.div>
      ))}

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-400"
          initial={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: 0,
          }}
          animate={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          style={{
            top: '50%',
            left: '50%',
          }}
        />
      ))}
    </div>
  )
}
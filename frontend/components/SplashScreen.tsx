'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Check if user has seen splash before
    const hasSeenSplash = sessionStorage.getItem('homecare_splash_seen')
    
    if (hasSeenSplash) {
      setShow(false)
      return
    }

    const timer = setTimeout(() => {
      setShow(false)
      sessionStorage.setItem('homecare_splash_seen', 'true')
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-emerald-900 via-green-900 to-teal-950"
        >
          {/* Background particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-emerald-400"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                opacity: 0,
              }}
              animate={{
                y: -100,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Ripple effects */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 rounded-full border-2 border-emerald-400/30"
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 2, 3],
                opacity: [1, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}

          <div className="text-center relative z-10">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                duration: 1,
                bounce: 0.5,
              }}
              className="mb-6"
            >
              <div className="text-9xl animate-glow">🌿</div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent mb-3"
            >
              HomeCare AI
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-lg sm:text-xl text-emerald-200 font-medium"
            >
              Natural Healing Powered by AI
            </motion.p>

            {/* Loader */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 flex justify-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-3 h-3 rounded-full bg-emerald-400"
                />
              ))}
            </motion.div>

            {/* Bottom text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-8 text-xs text-emerald-300/60"
            >
              🌍 10 Languages • 🌿 30+ Remedies • ⚡ Powered by Groq
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
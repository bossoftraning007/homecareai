'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

type Particle = {
  id: number
  x: number
  y: number
  duration: number
  delay: number
}

export default function SplashScreen() {
  const [show, setShow] = useState(true)
  const [phase, setPhase] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [mounted, setMounted] = useState(false)
  const [isPhone, setIsPhone] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Detect phone
    const phone = window.innerWidth < 768
    setIsPhone(phone)

    const width = window.innerWidth
    const height = window.innerHeight

    // Phone = 20 particles, Laptop = 40 particles (was 60!)
    const count = phone ? 20 : 40

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: height + 20,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 3,
    }))
    setParticles(newParticles)

    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => {
        setShow(false)
      }, 3600), // 3.6s total (was 4.2s)
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const skip = () => setShow(false)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[100] overflow-hidden bg-black"
        >
          {/* Aurora background */}
          <div className="absolute inset-0">
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0"
            />
          </div>

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), 
                               linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Particles - reduced count! */}
          {mounted && particles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              className="absolute w-1 h-1 rounded-full bg-emerald-400"
              initial={{ x: particle.x, y: particle.y, opacity: 0 }}
              animate={{ y: -100, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
              style={{ boxShadow: '0 0 6px rgba(16, 185, 129, 0.8)' }}
            />
          ))}

          {/* Glowing orbs - reduced from 4 to 2! */}
          {[0, 1].map((i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full blur-3xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.3, 1.3, 0],
                opacity: [0, 0.5, 0.3, 0],
              }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
              }}
              style={{
                width: isPhone ? '250px' : '350px',
                height: isPhone ? '250px' : '350px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.5), transparent)',
                top: `${25 + i * 30}%`,
                left: `${20 + i * 40}%`,
              }}
            />
          ))}

          {/* Ripple rings - reduced from 5 to 3! */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ripple-${i}`}
              className="absolute top-1/2 left-1/2 rounded-full border border-emerald-400/30"
              initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                width: ['0px', '600px'],
                height: ['0px', '600px'],
                x: '-50%',
                y: '-50%',
                opacity: [1, 0],
              }}
              transition={{
                duration: 3,
                delay: i * 0.8,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Skip button */}
          <button
            onClick={skip}
            className="absolute top-6 right-6 z-20 text-emerald-300/70
                       hover:text-emerald-100 text-sm font-medium transition-colors
                       bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full
                       border border-emerald-500/30"
          >
            Skip →
          </button>

          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">

            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{
                scale: phase >= 1 ? 1 : 0,
                rotate: phase >= 1 ? 0 : -180,
                opacity: phase >= 1 ? 1 : 0,
              }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              className="relative mb-8"
            >
              {/* Glow behind logo */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 blur-3xl bg-emerald-500 rounded-full"
              />

              {/* Leaf icon */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  y: [0, -8, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                <div className={`${isPhone ? 'text-8xl' : 'text-[10rem]'} leading-none filter drop-shadow-2xl`}>
                  🌿
                </div>
              </motion.div>

              {/* Rotating rings */}
              {phase >= 1 && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-6 border-2 border-dashed border-emerald-400/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-12 border border-emerald-400/15 rounded-full"
                  />
                </>
              )}
            </motion.div>

            {/* Title */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.h1
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={`${isPhone ? 'text-5xl' : 'text-7xl'} font-black tracking-tighter`}
                  >
                    <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                      HomeCare
                    </span>
                    <motion.span
                      animate={{
                        textShadow: [
                          '0 0 20px rgba(16, 185, 129, 0.5)',
                          '0 0 40px rgba(16, 185, 129, 0.8)',
                          '0 0 20px rgba(16, 185, 129, 0.5)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-emerald-400"
                    >
                      AI
                    </motion.span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-base sm:text-xl text-emerald-100/80 font-medium tracking-wide mt-3"
                  >
                    Natural Healing • Modern Intelligence
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feature badges */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex flex-wrap justify-center gap-2 max-w-sm sm:max-w-2xl"
                >
                  {[
                    { icon: '🌍', label: '10 Languages' },
                    { icon: '🎤', label: 'Voice AI' },
                    { icon: '🌿', label: '30+ Remedies' },
                    { icon: '⚡', label: 'Groq Powered' },
                    { icon: '💚', label: 'Free Forever' },
                  ].map((badge, i) => (
                    <motion.div
                      key={`badge-${i}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08, type: 'spring', bounce: 0.4 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full
                                 bg-emerald-500/10 backdrop-blur-md
                                 border border-emerald-500/30
                                 text-emerald-200 text-xs font-semibold"
                      style={{ boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)' }}
                    >
                      <span>{badge.icon}</span>
                      {badge.label}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading bar */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-10 w-56"
                >
                  <div className="h-0.5 bg-emerald-900/50 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                      style={{ boxShadow: '0 0 15px rgba(16, 185, 129, 0.8)' }}
                    />
                  </div>
                  <div className="text-emerald-300/60 text-xs text-center tracking-widest">
                    LOADING YOUR WELLNESS JOURNEY
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Final flash */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0.8, 0], scale: [0, 15, 20] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-emerald-400/20 pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-6 left-0 right-0 text-center text-emerald-400/40 text-xs tracking-wider">
            Made with 💚 for natural wellness
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
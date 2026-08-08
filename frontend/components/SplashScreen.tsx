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

  useEffect(() => {
    setMounted(true)

    // Generate particles ONLY on client after mount
    const width = window.innerWidth
    const height = window.innerHeight
    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: height + 20,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 3,
    }))
    setParticles(newParticles)

    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3600),
      setTimeout(() => {
        setShow(false)
      }, 4200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const skip = () => setShow(false)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-[100] overflow-hidden bg-black"
        >
          {/* Aurora background */}
          <div className="absolute inset-0">
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0"
            />
          </div>

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Particles - only render after client mount */}
          {mounted && particles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              className="absolute w-1 h-1 rounded-full bg-emerald-400"
              initial={{
                x: particle.x,
                y: particle.y,
                opacity: 0,
              }}
              animate={{
                y: -100,
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
              style={{
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
              }}
            />
          ))}

          {/* Glowing orbs */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full blur-3xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 1.5, 0],
                opacity: [0, 0.6, 0.4, 0],
              }}
              transition={{
                duration: 4,
                delay: i * 0.3,
                repeat: Infinity,
              }}
              style={{
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6), transparent)',
                top: `${20 + i * 20}%`,
                left: `${20 + (i * 25) % 60}%`,
              }}
            />
          ))}

          {/* Ripple rings */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={`ripple-${i}`}
              className="absolute top-1/2 left-1/2 rounded-full border border-emerald-400/30"
              initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                width: ['0px', '800px'],
                height: ['0px', '800px'],
                x: '-50%',
                y: '-50%',
                opacity: [1, 0],
              }}
              transition={{
                duration: 3,
                delay: i * 0.6,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Skip button */}
          <button
            onClick={skip}
            className="absolute top-6 right-6 z-20 text-emerald-300/70 hover:text-emerald-100 text-sm font-medium transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/30"
          >
            Skip →
          </button>

          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">

            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -360, opacity: 0 }}
              animate={{
                scale: phase >= 1 ? 1 : 0,
                rotate: phase >= 1 ? 0 : -360,
                opacity: phase >= 1 ? 1 : 0,
              }}
              transition={{
                duration: 1,
                type: 'spring',
                bounce: 0.5,
              }}
              className="relative mb-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute inset-0 blur-3xl bg-emerald-500 rounded-full"
              />

              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="relative"
              >
                <div className="text-[10rem] sm:text-[14rem] leading-none filter drop-shadow-2xl">
                  🌿
                </div>
              </motion.div>

              {phase >= 1 && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-8 border-2 border-dashed border-emerald-400/40 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-16 border border-emerald-400/20 rounded-full"
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
                  transition={{ duration: 0.8 }}
                >
                  <div className="mb-4 overflow-hidden">
                    <motion.h1
                      initial={{ y: 100 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter"
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
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg sm:text-2xl text-emerald-100/90 font-medium tracking-wide"
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
                  className="mt-10 flex flex-wrap justify-center gap-3 max-w-2xl"
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
                      initial={{ opacity: 0, scale: 0, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring', bounce: 0.5 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 text-emerald-200 text-sm font-semibold"
                      style={{
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <span className="text-lg">{badge.icon}</span>
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
                  className="mt-12 w-64"
                >
                  <div className="h-1 bg-emerald-900/50 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                      style={{
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)',
                      }}
                    />
                  </div>
                  <div className="text-emerald-300/70 text-xs text-center tracking-widest font-medium">
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
                  animate={{ opacity: [0, 1, 0], scale: [0, 20, 25] }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-emerald-400/30 flex items-center justify-center pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center text-emerald-400/40 text-xs tracking-wider">
            Made with 💚 for natural wellness
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
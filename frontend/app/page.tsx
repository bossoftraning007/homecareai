'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import AnimatedText from '@/components/AnimatedText'
import ChatPreview from '@/components/ChatPreview'
import InteractiveGlobe from '@/components/InteractiveGlobe'
import Testimonials from '@/components/Testimonials'
import ComparisonTable from '@/components/ComparisonTable'
import BlobBackground from '@/components/BlobBackground'
import AppShowcase from '@/components/AppShowcase'

export default function LandingPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

  if (!mounted) return null

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>

      <BlobBackground isDark={isDark} />

      {/* Mouse follower */}
      <div
        className="fixed w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none transition-transform duration-500 -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.4), transparent)',
          transform: `translate(${mousePos.x * 5 - 200}px, ${mousePos.y * 5 - 200}px)`,
        }}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b ${isDark ? 'bg-black/50 border-white/10' : 'bg-white/50 border-black/10'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-3xl">🌿</motion.div>
            <span className="text-xl font-bold">HomeCare<span className="text-emerald-500">AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Languages', 'Compare', 'Reviews'].map(item => (
              <button
                key={item}
                onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                className={`text-sm font-medium ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`p-2 rounded-lg ${isDark ? 'bg-white/10 text-yellow-300' : 'bg-black/5 text-gray-700'}`}>
              {isDark ? '☀️' : '🌙'}
            </button>
            {user ? (
              <Link href="/profile" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs">
                  {displayName?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{displayName}</span>
              </Link>
            ) : (
              <Link href="/login" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/25">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 glass-card"
            >
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-emerald-500" />
              🚀 Powered by Groq AI • 100% Free
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              <AnimatedText text="Natural Healing" />
              <br />
              <span className="text-gradient">Meets AI ✨</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-lg mb-8 ${isDark ? 'text-white/60' : 'text-gray-600'}`}
            >
              Get personalized natural remedies powered by AI in 10 Indian languages.
              Voice-first, ancient wisdom, modern intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/chat')}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-emerald-500/50 animate-glow"
              >
                💬 Chat Free →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/voice')}
                className="glass-card px-8 py-4 rounded-xl font-semibold text-lg"
              >
                🎤 Voice Mode
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 text-sm"
            >
              <div className="flex -space-x-2">
                {['👩', '👨', '👵', '🧑', '👩‍🏫'].map((emoji, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm border-2 ${isDark ? 'border-black' : 'border-white'}`}>
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => <span key={i}>⭐</span>)}
                </div>
                <div className={isDark ? 'text-white/60' : 'text-gray-600'}>Loved by 1000+ users</div>
              </div>
            </motion.div>
          </div>

          {/* Live Chat Preview */}
          <div className="lg:pl-8">
            <ChatPreview isDark={isDark} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { number: '10', label: 'Languages', icon: '🌍' },
              { number: '80+', label: 'Features', icon: '⚡' },
              { number: '30+', label: 'Remedies', icon: '🌿' },
              { number: '24/7', label: 'Available', icon: '☁️' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gradient mb-1">{stat.number}</div>
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Showcase */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 bg-emerald-500/10 text-emerald-400">FEATURES</div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Everything in <span className="text-gradient">One App</span>
            </h2>
            <p className={`text-lg ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Explore all features by clicking below
            </p>
          </motion.div>

          <AppShowcase isDark={isDark} />
        </div>
      </section>

      {/* Globe / Languages */}
      <section id="languages" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 bg-emerald-500/10 text-emerald-400">GLOBAL</div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              10 Languages <span className="text-gradient">Worldwide</span>
            </h2>
            <p className={`text-lg ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Reaching 1.4 billion+ people
            </p>
          </motion.div>

          <InteractiveGlobe isDark={isDark} />
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 bg-emerald-500/10 text-emerald-400">COMPARE</div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Why <span className="text-gradient">HomeCare AI?</span>
            </h2>
          </motion.div>

          <ComparisonTable isDark={isDark} />
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 bg-emerald-500/10 text-emerald-400">REVIEWS</div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Loved by <span className="text-gradient">Thousands</span>
            </h2>
          </motion.div>

          <Testimonials isDark={isDark} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 sm:p-16 text-center relative overflow-hidden animate-glow"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl animate-blob" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

            <div className="relative z-10">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl mb-6 inline-block">🌿</motion.div>
              <h2 className="text-3xl sm:text-5xl font-bold mb-4">
                Start Healing <span className="text-gradient">Today</span>
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                Join thousands using AI for natural wellness
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/chat')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-emerald-500/50"
                >
                  💬 Chat Free Now
                </motion.button>
                {!user && (
                  <Link href="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass-card px-8 py-4 rounded-xl font-semibold text-lg"
                    >
                      Sign Up Free
                    </motion.button>
                  </Link>
                )}
              </div>
              <p className={`text-xs mt-6 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                No credit card required • 100% free forever • Available worldwide
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🌿</span>
            <span className="text-xl font-bold">HomeCare<span className="text-emerald-500">AI</span></span>
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            Natural remedies powered by AI
          </p>
          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            Made with 💚 for natural wellness • Not medical advice
          </p>
        </div>
      </footer>

    </div>
  )
}
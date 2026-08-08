'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import SplashScreen from '@/components/SplashScreen'

const floatingWords = [
  'Natural Healing', 'AI Powered', 'Instant Relief',
  'Traditional Wisdom', 'Modern Science', 'Your Wellness'
]

const stats = [
  { number: '50+', label: 'Natural Remedies' },
  { number: '10', label: 'Languages' },
  { number: '100%', label: 'Free Forever' },
  { number: '24/7', label: 'AI Available' },
]

const features = [
  {
    icon: '🌿',
    title: 'Natural Remedies',
    desc: 'Ancient wisdom meets modern AI. Get personalized herbal solutions.',
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    glow: 'shadow-green-500/20',
  },
  {
    icon: '🤖',
    title: 'AI Health Assistant',
    desc: 'Powered by Llama 3.3. Smart, fast, accurate health guidance.',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: '🎤',
    title: 'Voice Mode',
    desc: 'Hands-free healing. Just speak your symptoms naturally.',
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
  },
  {
    icon: '🌍',
    title: '10 Languages',
    desc: 'Telugu, Hindi, Tamil, English and 6 more regional languages.',
    color: 'from-orange-500/20 to-yellow-500/20',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20',
  },
  {
    icon: '📊',
    title: 'Wellness Tracker',
    desc: 'Track mood, water, sleep and exercise. Cloud synced daily.',
    color: 'from-teal-500/20 to-green-500/20',
    border: 'border-teal-500/30',
    glow: 'shadow-teal-500/20',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    desc: 'Your health data stays yours. Supabase RLS protection.',
    color: 'from-red-500/20 to-pink-500/20',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20',
  },
]

function GradientOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -top-20 -right-40 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 -left-20 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          x: [0, 20, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function FloatingPill({ word, index }: { word: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                 bg-white/5 border border-white/10 text-white/60 backdrop-blur-sm
                 hover:bg-white/10 hover:text-white/90 transition-all duration-300"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      {word}
    </motion.div>
  )
}

function StatCard({ number, label, index }: { number: string; label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 1.2, duration: 0.5 }}
      className="text-center"
    >
      <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-xs text-white/50 mt-1 font-medium">{label}</div>
    </motion.div>
  )
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.21, 1.11, 0.81, 0.99] }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative p-6 rounded-2xl border backdrop-blur-xl cursor-pointer
                  bg-gradient-to-br ${feature.color} ${feature.border}
                  shadow-xl ${hovered ? feature.glow : ''}
                  transition-shadow duration-300`}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <motion.div
          animate={hovered ? { scale: 1.2, rotate: [0, -10, 10, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl mb-4"
        >
          {feature.icon}
        </motion.div>
        <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
        <p className="text-sm text-white/60 leading-relaxed">{feature.desc}</p>
      </div>

      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/20" />
    </motion.div>
  )
}

function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)
  const words = ['Headache', 'Cold', 'Cough', 'Fever', 'Stress', 'Fatigue']

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full
                   bg-green-500/10 border border-green-500/20 backdrop-blur-sm"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-green-400 font-semibold">AI-Powered Natural Wellness</span>
        <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">FREE</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center max-w-4xl mx-auto mb-6"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-4">
          Natural Fix for
          <br />
          <span className="relative inline-block">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.21, 1.11, 0.81, 0.99] }}
                className="inline-block bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent"
              >
                {words[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light mt-6">
          Your AI health companion. Get instant natural remedies,
          personalized wellness advice and traditional healing wisdom —
          completely free, forever.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 mb-12"
      >
        <Link href="/home">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden
                       bg-gradient-to-r from-green-500 to-emerald-500 text-white
                       shadow-lg shadow-green-500/30 hover:shadow-green-500/50
                       transition-shadow duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Healing Free
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.button>
        </Link>

        <Link href="/symptoms">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-2xl font-bold text-lg
                       bg-white/5 border border-white/10 text-white/80
                       hover:bg-white/10 hover:border-white/20
                       backdrop-blur-sm transition-all duration-300"
          >
            Browse Remedies
          </motion.button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-8 mb-12 flex-wrap justify-center"
      >
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} index={i} />
        ))}
      </motion.div>

      <div className="flex flex-wrap gap-2 justify-center max-w-lg mb-16">
        {floatingWords.map((word, i) => (
          <FloatingPill key={i} word={word} index={i} />
        ))}
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/30 font-medium tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
      </motion.div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="relative px-4 py-20 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold tracking-widest text-green-400 uppercase mb-4 block">
          Everything You Need
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Premium Wellness,
          <br />
          <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            Zero Cost
          </span>
        </h2>
        <p className="text-white/50 max-w-xl mx-auto">
          Built with modern AI and traditional wisdom. No subscriptions, no limits, no catches.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <FeatureCard key={i} feature={feature} index={i} />
        ))}
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="relative p-12 rounded-3xl border border-green-500/20
                        bg-gradient-to-br from-green-500/10 to-emerald-500/5
                        backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />

          <div className="relative z-10">
            <div className="text-5xl mb-6">🌿</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Start Healing
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                {' '}Today
              </span>
            </h2>
            <p className="text-white/50 mb-8 text-lg">
              Join thousands using AI-powered natural remedies. Free forever.
            </p>

            <Link href="/home">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-2xl font-bold text-xl
                           bg-gradient-to-r from-green-500 to-emerald-500 text-white
                           shadow-xl shadow-green-500/30 hover:shadow-green-500/50
                           transition-shadow duration-300"
              >
                Get Started Now — Free 🌿
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <>
      <SplashScreen />
      <main className="relative min-h-screen bg-[#080808] overflow-x-hidden">
        <GradientOrbs />

        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10">
          <HeroSection />
          <FeaturesSection />
          <CTASection />
        </div>
      </main>
    </>
  )
}
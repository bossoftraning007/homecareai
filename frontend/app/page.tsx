'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'

export default function LandingPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  const isDark = theme === 'dark'

  const features = [
    { icon: '🌿', title: 'Natural Remedies', desc: 'Ancient wisdom meets modern AI' },
    { icon: '🎤', title: 'Voice Assistant', desc: 'Hands-free conversation in 10 languages' },
    { icon: '📊', title: 'Wellness Tracker', desc: 'Monitor mood, water, sleep, exercise' },
    { icon: '🌍', title: '10 Languages', desc: 'Speak your language, get help' },
    { icon: '⚡', title: 'Instant AI', desc: 'Powered by Groq Llama 3.3' },
    { icon: '☁️', title: 'Cloud Sync', desc: 'Access from anywhere, anytime' },
  ]

  const stats = [
    { number: '80+', label: 'Features' },
    { number: '10', label: 'Languages' },
    { number: '30+', label: 'Remedies' },
    { number: '24/7', label: 'Available' },
  ]

  useEffect(() => {
    setMounted(true)

    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length)
    }, 3000)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

  if (!mounted) return null

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Aurora Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className={`absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-3xl opacity-30 ${isDark ? 'bg-emerald-500' : 'bg-emerald-300'}`}
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className={`absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 ${isDark ? 'bg-teal-500' : 'bg-teal-300'}`}
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className={`absolute bottom-0 left-1/3 w-[700px] h-[700px] rounded-full blur-3xl opacity-30 ${isDark ? 'bg-green-500' : 'bg-green-300'}`}
        />

        {/* Grid Pattern */}
        <div
          className={`absolute inset-0 opacity-[0.03] ${isDark ? 'bg-white' : 'bg-black'}`}
          style={{
            backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Mouse Follower Glow */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none transition-transform duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent 70%)',
            transform: `translate(${mousePosition.x * 5 - 250}px, ${mousePosition.y * 5 - 250}px)`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b ${isDark ? 'bg-black/50 border-white/10' : 'bg-white/50 border-black/10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-3xl"
              >
                🌿
              </motion.div>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                HomeCare<span className="text-emerald-500">AI</span>
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-6">
              {['Features', 'Languages', 'Chat', 'Symptoms'].map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => {
                    if (item === 'Chat') router.push('/chat')
                    else if (item === 'Symptoms') router.push('/symptoms')
                    else document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`text-sm font-medium transition-colors ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  {item}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`p-2 rounded-lg transition-all ${isDark ? 'bg-white/10 text-yellow-300 hover:bg-white/20' : 'bg-black/5 text-gray-700 hover:bg-black/10'}`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/5 text-gray-900 hover:bg-black/10'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs">
                      {displayName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{displayName}</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 border ${isDark ? 'bg-white/5 border-white/10 text-white/80' : 'bg-black/5 border-black/10 text-gray-700'}`}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-500"
              />
              Powered by Groq AI • 10 Languages • Free Forever
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-5xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Natural Healing
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Meets AI
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 ${isDark ? 'text-white/60' : 'text-gray-600'}`}
            >
              Get personalized natural remedies powered by AI.
              <br />
              Ancient wisdom, modern intelligence — in your language.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/chat')}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-emerald-500/50 transition-all"
              >
                <span className="relative z-10 flex items-center gap-2">
                  💬 Try Chat Now
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/voice')}
                className={`group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border transition-all ${isDark ? 'bg-white/5 border-white/20 text-white hover:bg-white/10' : 'bg-black/5 border-black/20 text-gray-900 hover:bg-black/10'}`}
              >
                🎤 Voice Mode
              </motion.button>
            </motion.div>

            {/* Feature Rotation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto"
            >
              <div className={`text-xs mb-3 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                Currently exploring:
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 rounded-2xl border backdrop-blur-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{features[currentFeature].icon}</div>
                    <div className="text-left">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {features[currentFeature].title}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        {features[currentFeature].desc}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-1 mt-3">
                {features.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all ${i === currentFeature
                      ? 'w-8 bg-emerald-500'
                      : `w-1 ${isDark ? 'bg-white/20' : 'bg-black/20'}`
                    }`}
                  />
                ))}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}
        >
          <div className="text-xs">Scroll to explore</div>
          <div className="w-6 h-10 rounded-full border-2 border-current flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 rounded-full bg-current"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border backdrop-blur-xl text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
              >
                <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className={`inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              FEATURES
            </div>
            <h2 className={`text-4xl md:text-6xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Everything you need
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                to stay healthy
              </span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Powered by cutting-edge AI, designed with love
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '💬', title: 'Smart Chat', desc: 'Talk to AI in natural language, get personalized remedies', gradient: 'from-emerald-500 to-teal-500', link: '/chat' },
              { icon: '🎤', title: 'Voice Assistant', desc: 'Hands-free conversation, perfect for elderly and driving', gradient: 'from-purple-500 to-pink-500', link: '/voice' },
              { icon: '📋', title: 'Guided Assessment', desc: 'Answer questions for super personalized advice', gradient: 'from-indigo-500 to-purple-500', link: '/questionnaire' },
              { icon: '📖', title: 'Symptom Guide', desc: '30+ conditions with detailed remedies and prevention', gradient: 'from-teal-500 to-cyan-500', link: '/symptoms' },
              { icon: '📊', title: 'Wellness Tracker', desc: 'Track mood, water, sleep, exercise with beautiful charts', gradient: 'from-blue-500 to-indigo-500', link: '/tracker' },
              { icon: '⏰', title: 'Reminders', desc: 'Never miss medicine, water, exercise reminders', gradient: 'from-purple-500 to-pink-500', link: '/reminders' },
              { icon: '⭐', title: 'Favorites', desc: 'Save your favorite remedies for quick access', gradient: 'from-yellow-500 to-orange-500', link: '/favorites' },
              { icon: '🚨', title: 'Emergency SOS', desc: 'One-tap access to emergency helplines', gradient: 'from-red-500 to-orange-500', link: '/emergency' },
              { icon: '☁️', title: 'Cloud Sync', desc: 'Access your data from any device, always synced', gradient: 'from-green-500 to-emerald-500', link: '/login' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link href={feature.link}>
                  <div className={`group relative p-6 rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden transition-all ${isDark ? 'bg-white/5 border-white/10 hover:border-emerald-500/50' : 'bg-black/5 border-black/10 hover:border-emerald-500/50'}`}>

                    {/* Gradient bg on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                    <div className="relative z-10">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-4`}>
                        <div className="text-3xl">{feature.icon}</div>
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        {feature.desc}
                      </p>
                      <div className={`mt-4 flex items-center gap-1 text-sm font-medium bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                        Explore
                        <motion.span
                          className="group-hover:translate-x-1 transition-transform"
                        >
                          →
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className={`inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              GLOBAL
            </div>
            <h2 className={`text-4xl md:text-6xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Speaks
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Your Language
              </span>
            </h2>
            <p className={`text-lg ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Available in 10 languages, reaching 1.4 billion+ people
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { flag: '🇬🇧', name: 'English', native: 'English' },
              { flag: '🇮🇳', name: 'Telugu', native: 'తెలుగు' },
              { flag: '🇮🇳', name: 'Hindi', native: 'हिन्दी' },
              { flag: '🇮🇳', name: 'Tamil', native: 'தமிழ்' },
              { flag: '🇮🇳', name: 'Kannada', native: 'ಕನ್ನಡ' },
              { flag: '🇮🇳', name: 'Malayalam', native: 'മലയാളം' },
              { flag: '🇮🇳', name: 'Bengali', native: 'বাংলা' },
              { flag: '🇮🇳', name: 'Marathi', native: 'मराठी' },
              { flag: '🇮🇳', name: 'Gujarati', native: 'ગુજરાતી' },
              { flag: '🇮🇳', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
            ].map((lang, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className={`p-4 rounded-2xl border backdrop-blur-xl text-center cursor-pointer ${isDark ? 'bg-white/5 border-white/10 hover:border-emerald-500/50' : 'bg-black/5 border-black/10 hover:border-emerald-500/50'}`}
              >
                <div className="text-4xl mb-2">{lang.flag}</div>
                <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {lang.native}
                </div>
                <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  {lang.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative overflow-hidden rounded-3xl p-8 sm:p-16 text-center border ${isDark ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-white/10' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'}`}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-6 inline-block"
              >
                🌿
              </motion.div>
              <h2 className={`text-3xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Start Your Healing Journey
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/login')}
                    className={`px-8 py-4 rounded-xl font-semibold text-lg border ${isDark ? 'bg-white/5 border-white/20 text-white hover:bg-white/10' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'}`}
                  >
                    Sign Up Free
                  </motion.button>
                )}
              </div>
              <p className={`text-xs mt-6 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                No credit card required • 100% free forever
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative py-12 px-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌿</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  HomeCareAI
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Natural remedies powered by AI
              </p>
            </div>
            <div>
              <div className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Product</div>
              <div className="space-y-2">
                {['Chat', 'Voice', 'Symptoms', 'Tracker'].map(item => (
                  <div key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className={`text-sm hover:text-emerald-500 transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}
                    >
                      {item}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Features</div>
              <div className="space-y-2">
                {['Favorites', 'Reminders', 'Emergency', 'Settings'].map(item => (
                  <div key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className={`text-sm hover:text-emerald-500 transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}
                    >
                      {item}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Powered by</div>
              <div className="space-y-2">
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>⚡ Groq AI</div>
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>⚛️ Next.js 16</div>
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>☁️ Supabase</div>
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>🚀 Vercel</div>
              </div>
            </div>
          </div>
          <div className={`pt-8 border-t text-center text-sm ${isDark ? 'border-white/10 text-white/40' : 'border-black/10 text-gray-500'}`}>
            <p>Made with 💚 for natural wellness • Not medical advice • Consult healthcare professionals for serious symptoms</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { user, signIn, signUp, signInWithGoogle } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    if (user) router.push('/chat')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Fill all fields!')
      return
    }

    setLoading(true)

    if (mode === 'signup') {
      if (!fullName) {
        toast.error('Enter your name!')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, fullName)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created! Check your email 📧', { icon: '🎉', duration: 5000 })
        // Trigger welcome email
        try {
          await fetch('/api/auth/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'signup',
              user_id: email,
              email: email,
              full_name: fullName,
            }),
          })
        } catch {}
        setMode('login')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Welcome back!', { icon: '🌿' })
        router.push('/chat')
      }
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome! 🌿', { icon: '🎉' })
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <Toaster position="top-center" />

      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-10 left-10 text-6xl opacity-20 z-10">🌿</motion.div>
      <motion.div animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute top-20 right-16 text-5xl opacity-20 z-10">🍃</motion.div>
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} className="absolute bottom-20 left-20 text-6xl opacity-20 z-10">🌱</motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-md border relative z-20 ${isDark ? 'bg-gray-800/80 border-emerald-800' : 'bg-white/80 border-green-200'}`}
      >

        <div className="text-center mb-6">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="inline-block text-5xl mb-3">
            🌿
          </motion.div>
          <h1 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-emerald-300 to-green-400' : 'from-green-700 to-emerald-600'}`}>
            HomeCare AI
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100 placeholder:text-emerald-300/50' : 'bg-white border-green-200 text-green-900 placeholder:text-green-600/60'}`}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100 placeholder:text-emerald-300/50' : 'bg-white border-green-200 text-green-900 placeholder:text-green-600/60'}`}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            minLength={6}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100 placeholder:text-emerald-300/50' : 'bg-white border-green-200 text-green-900 placeholder:text-green-600/60'}`}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 shadow-md transition-all"
          >
            {loading ? 'Please wait...' : (mode === 'login' ? '🔐 Login' : '🌱 Sign Up')}
          </motion.button>
        </form>

        <div className="my-4 flex items-center gap-2">
          <div className={`flex-1 h-px ${isDark ? 'bg-emerald-900' : 'bg-green-200'}`} />
          <span className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>OR</span>
          <div className={`flex-1 h-px ${isDark ? 'bg-emerald-900' : 'bg-green-200'}`} />
        </div>

        <button
          onClick={handleGoogleLogin}
          className={`w-full py-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-200 hover:bg-gray-700' : 'bg-white border-green-200 text-green-800 hover:bg-green-50'}`}
        >
          <span className="text-xl">🌐</span>
          Continue with Google
        </button>

        <p className={`text-center text-sm mt-6 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className={`font-semibold ${isDark ? 'text-emerald-300 hover:text-emerald-100' : 'text-green-700 hover:text-green-900'}`}
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>

        <div className="text-center mt-4">
          <a
            href="/"
            className={`text-xs ${isDark ? 'text-emerald-300/50 hover:text-emerald-200' : 'text-green-700/50 hover:text-green-800'}`}
          >
            ← Continue as guest
          </a>
        </div>
      </motion.div>
    </div>
  )
}
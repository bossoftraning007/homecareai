'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

const symptoms = [
  { icon: '🤧', label: 'Cold', value: 'I have a cold and blocked nose', color: 'from-blue-400 to-cyan-500' },
  { icon: '😷', label: 'Cough', value: 'I have a cough', color: 'from-purple-400 to-pink-500' },
  { icon: '🤒', label: 'Sore Throat', value: 'I have a sore throat', color: 'from-red-400 to-orange-500' },
  { icon: '🤕', label: 'Headache', value: 'I have a headache', color: 'from-yellow-400 to-orange-500' },
  { icon: '🤢', label: 'Acidity', value: 'I have acidity and indigestion', color: 'from-green-400 to-teal-500' },
  { icon: '😴', label: 'Constipation', value: 'I have constipation', color: 'from-indigo-400 to-purple-500' },
  { icon: '🤮', label: 'Diarrhea', value: 'I have diarrhea', color: 'from-pink-400 to-red-500' },
  { icon: '🩹', label: 'Minor Cut', value: 'I have a minor cut or scrape', color: 'from-red-400 to-pink-500' },
  { icon: '🌡️', label: 'Fever', value: 'I have a mild fever', color: 'from-orange-400 to-red-500' },
  { icon: '💤', label: 'Sleep Issues', value: 'I have trouble sleeping', color: 'from-indigo-400 to-blue-500' },
  { icon: '😰', label: 'Stress', value: 'I am feeling stressed', color: 'from-purple-400 to-indigo-500' },
  { icon: '🦷', label: 'Toothache', value: 'I have a toothache', color: 'from-cyan-400 to-blue-500' },
  { icon: '👁️', label: 'Eye Strain', value: 'I have eye strain', color: 'from-teal-400 to-green-500' },
  { icon: '💪', label: 'Muscle Pain', value: 'I have muscle pain', color: 'from-orange-400 to-yellow-500' },
  { icon: '🩸', label: 'Nose Bleed', value: 'I have a nose bleed', color: 'from-red-500 to-pink-500' },
  { icon: '🤧', label: 'Allergies', value: 'I have seasonal allergies', color: 'from-yellow-400 to-green-500' },
]

export default function Home() {
  const router = useRouter()
  const [input, setInput] = useState('')

  const handleSymptom = (value: string, label: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('initial_message', value)
    }
    toast.success(`Checking remedies for ${label}...`, {
      icon: '🌿',
      style: {
        background: '#065f46',
        color: '#fff',
      },
    })
    setTimeout(() => router.push('/chat'), 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) {
      toast.error('Please describe your symptom first!')
      return
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('initial_message', input)
    }
    toast.success('Analyzing your symptoms...', {
      icon: '🌿',
      style: {
        background: '#065f46',
        color: '#fff',
      },
    })
    setTimeout(() => router.push('/chat'), 500)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Toaster position="top-center" />

      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100" />

      {/* Floating decorations */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-10 left-10 text-6xl opacity-20"
      >
        🌿
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute top-20 right-16 text-5xl opacity-20"
      >
        🍃
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        className="absolute bottom-20 left-20 text-6xl opacity-20"
      >
        🌱
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        className="absolute bottom-32 right-10 text-5xl opacity-20"
      >
        🌾
      </motion.div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block p-4 bg-white/60 backdrop-blur-sm rounded-full shadow-lg mb-4 border border-green-200"
          >
            <span className="text-5xl">🌿</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
            HomeCare AI
          </h1>
          <p className="text-green-800/70 mt-3 text-base font-medium">
            Natural home remedies • Ancient wisdom • Modern care
          </p>
          <p className="text-green-700/60 mt-1 text-sm italic">
            Nature heals what medicine cannot
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 mb-8 w-full max-w-4xl"
        >
          {symptoms.map((s, index) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSymptom(s.value, s.label)}
              className="group flex flex-col items-center justify-center p-4 bg-white/70 backdrop-blur-sm border border-green-200 rounded-2xl shadow-md hover:shadow-xl hover:bg-white transition-all cursor-pointer"
            >
              <span className="text-3xl mb-2 group-hover:scale-125 transition-transform">
                {s.icon}
              </span>
              <span className="text-xs font-semibold text-green-800">
                {s.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          onSubmit={handleSubmit}
          className="w-full max-w-2xl flex gap-2 bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-lg border border-green-200"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe how you're feeling..."
            className="flex-1 bg-transparent px-5 py-3 text-sm outline-none text-green-900 placeholder:text-green-600/60"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
          >
            Heal 🌿
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8 max-w-3xl w-full"
        >
          <div className="bg-white/60 backdrop-blur-sm border border-green-200 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-2">🌿</div>
            <h3 className="font-semibold text-green-800 text-sm">Natural Remedies</h3>
            <p className="text-xs text-green-700/70 mt-1">Time-tested solutions</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm border border-green-200 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-2">🍯</div>
            <h3 className="font-semibold text-green-800 text-sm">Ancient Wisdom</h3>
            <p className="text-xs text-green-700/70 mt-1">Traditional healing</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm border border-green-200 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-2">💚</div>
            <h3 className="font-semibold text-green-800 text-sm">Safe Guidance</h3>
            <p className="text-xs text-green-700/70 mt-1">Know when to see doctor</p>
          </div>
        </motion.div>

        <p className="text-xs text-green-800/60 mt-6 text-center max-w-md bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-green-200">
          For minor symptoms only • Not a substitute for medical advice
        </p>

      </div>
    </div>
  )
}
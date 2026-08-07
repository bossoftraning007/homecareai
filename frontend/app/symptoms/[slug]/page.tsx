'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { symptomsData } from '@/lib/symptomData'

export default function SymptomDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [expandedRemedy, setExpandedRemedy] = useState<number | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const slug = params?.slug as string
  const symptom = symptomsData[slug]

  const isDark = theme === 'dark'

  useEffect(() => setMounted(true), [])

  const askAI = () => {
    if (!symptom) return
    localStorage.setItem('initial_message', `Tell me more about ${symptom.name} and give personalized advice`)
    toast.success('Opening chat...', { icon: '💬' })
    setTimeout(() => router.push('/chat'), 500)
  }

  const shareSymptom = () => {
    if (!symptom || typeof window === 'undefined') return
    const url = `${window.location.origin}/symptoms/${slug}`
    if (navigator.share) {
      navigator.share({
        title: `${symptom.name} - HomeCare AI`,
        text: symptom.shortDesc,
        url
      }).catch(() => { })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied!', { icon: '📋' })
    }
  }

  const readAloud = () => {
    if (!symptom) return
    if (!('speechSynthesis' in window)) {
      toast.error('Speech not supported')
      return
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const text = `${symptom.name}. ${symptom.fullDesc}. Top remedies: ${symptom.remedies.slice(0, 3).map(r => r.title).join(', ')}`
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  if (!mounted) return null

  if (!symptom) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-green-50'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            Symptom Not Found
          </h1>
          <Link href="/symptoms" className="text-green-600 underline">
            ← Back to symptoms
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <Link href="/symptoms" className={`flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>
          ← <span className="text-sm">Back</span>
        </Link>
        <div className="flex gap-2">
          <button onClick={readAloud} className={`text-sm px-3 py-2 rounded-full border ${isSpeaking ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
            {isSpeaking ? '⏸️' : '🔊'}
          </button>
          <button onClick={shareSymptom} className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
            📤
          </button>
          <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
            🏠
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md mb-6 text-center ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
          <div className="text-7xl mb-3">{symptom.icon}</div>
          <div className={`text-xs font-semibold mb-2 ${isDark ? 'text-emerald-400/70' : 'text-green-600'}`}>
            {symptom.category}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            {symptom.name}
          </h1>
          <p className={`text-sm mb-4 ${isDark ? 'text-emerald-300/80' : 'text-green-700/80'}`}>
            {symptom.fullDesc}
          </p>
          <button
            onClick={askAI}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            💬 Ask AI for Personalized Advice
          </button>
        </motion.div>

        {/* Causes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md mb-4 ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
          <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            🔍 Common Causes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {symptom.causes.map((cause, i) => (
              <div key={i} className={`text-sm p-2 ${isDark ? 'text-emerald-100' : 'text-green-900'}`}>
                • {cause}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Remedies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md mb-4 ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            🌿 Natural Remedies ({symptom.remedies.length})
          </h2>
          <div className="space-y-3">
            {symptom.remedies.map((remedy, i) => (
              <div key={i} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-900/50 border-emerald-900' : 'bg-white/50 border-green-100'}`}>
                <button
                  onClick={() => setExpandedRemedy(expandedRemedy === i ? null : i)}
                  className="w-full text-left p-4 flex justify-between items-center"
                >
                  <div>
                    <div className={`font-bold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      {i + 1}. {remedy.title}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                      {remedy.description}
                    </div>
                  </div>
                  <div className={`text-xl ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
                    {expandedRemedy === i ? '▲' : '▼'}
                  </div>
                </button>
                {expandedRemedy === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-4 pt-0 border-t ${isDark ? 'border-emerald-900' : 'border-green-100'}`}
                  >
                    {remedy.ingredients && (
                      <div className="mb-3">
                        <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
                          🥄 Ingredients:
                        </div>
                        <ul className={`text-sm space-y-1 ${isDark ? 'text-emerald-100' : 'text-green-900'}`}>
                          {remedy.ingredients.map((ing, j) => (
                            <li key={j}>• {ing}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {remedy.steps && (
                      <div>
                        <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
                          📝 Steps:
                        </div>
                        <ol className={`text-sm space-y-1 ${isDark ? 'text-emerald-100' : 'text-green-900'}`}>
                          {remedy.steps.map((step, j) => (
                            <li key={j}>{j + 1}. {step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Foods */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
            <h3 className={`text-md font-bold mb-3 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              ✅ Foods to Eat
            </h3>
            <ul className="space-y-1">
              {symptom.foods.eat.map((food, i) => (
                <li key={i} className={`text-sm ${isDark ? 'text-emerald-100' : 'text-green-900'}`}>
                  🌱 {food}
                </li>
              ))}
            </ul>
          </div>
          <div className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md ${isDark ? 'bg-gray-800/70 border-red-900' : 'bg-white/70 border-red-200'}`}>
            <h3 className={`text-md font-bold mb-3 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              ❌ Foods to Avoid
            </h3>
            <ul className="space-y-1">
              {symptom.foods.avoid.map((food, i) => (
                <li key={i} className={`text-sm ${isDark ? 'text-red-200' : 'text-red-900'}`}>
                  ⛔ {food}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Prevention */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md mb-4 ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
          <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
            🛡️ Prevention Tips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {symptom.prevention.map((tip, i) => (
              <div key={i} className={`text-sm p-2 rounded-lg ${isDark ? 'bg-gray-900/50 text-emerald-100' : 'bg-white/50 text-green-900'}`}>
                ✅ {tip}
              </div>
            ))}
          </div>
        </motion.div>

        {/* When to See Doctor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`backdrop-blur-sm border-2 rounded-2xl p-5 shadow-md mb-4 ${isDark ? 'bg-red-950/30 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            ⚠️ When to See a Doctor
          </h2>
          <ul className="space-y-2">
            {symptom.seeDoctor.map((warning, i) => (
              <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                🚨 <span>{warning}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Related */}
        {symptom.related && symptom.related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md mb-4 ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              🔗 Related Symptoms
            </h2>
            <div className="flex flex-wrap gap-2">
              {symptom.related.map((rel) => {
                const relSymptom = symptomsData[rel]
                if (!relSymptom) return null
                return (
                  <Link
                    key={rel}
                    href={`/symptoms/${rel}`}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${isDark ? 'bg-emerald-900/40 border-emerald-700 text-emerald-200' : 'bg-white border-green-300 text-green-800 hover:bg-green-50'}`}
                  >
                    {relSymptom.icon} {relSymptom.name}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <div className={`p-4 rounded-xl text-center text-xs ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
          💡 This information is for educational purposes. Not medical diagnosis. Consult healthcare professional for serious symptoms.
        </div>

      </div>
    </div>
  )
}
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const symptoms = [
  { icon: '🤧', label: 'Cold', value: 'I have a cold and blocked nose' },
  { icon: '😷', label: 'Cough', value: 'I have a cough' },
  { icon: '🤒', label: 'Sore Throat', value: 'I have a sore throat' },
  { icon: '🤕', label: 'Headache', value: 'I have a headache' },
  { icon: '🤢', label: 'Acidity', value: 'I have acidity and indigestion' },
  { icon: '😴', label: 'Constipation', value: 'I have constipation' },
  { icon: '🤮', label: 'Diarrhea', value: 'I have diarrhea' },
  { icon: '🩹', label: 'Minor Cut', value: 'I have a minor cut or scrape' },
]

export default function Home() {
  const router = useRouter()
  const [input, setInput] = useState('')

  const handleSymptom = (value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('initial_message', value)
    }
    router.push('/chat')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    if (typeof window !== 'undefined') {
      localStorage.setItem('initial_message', input)
    }
    router.push('/chat')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100" />

      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">🌿</div>
      <div className="absolute top-20 right-16 text-5xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>🍃</div>
      <div className="absolute bottom-20 left-20 text-6xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>🌱</div>
      <div className="absolute bottom-32 right-10 text-5xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}>🌾</div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">

        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-white/60 backdrop-blur-sm rounded-full shadow-lg mb-4 border border-green-200">
            <span className="text-5xl">🌿</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
            HomeCare AI
          </h1>
          <p className="text-green-800/70 mt-3 text-base font-medium">
            Natural home remedies • Ancient wisdom • Modern care
          </p>
          <p className="text-green-700/60 mt-1 text-sm italic">
            Nature heals what medicine cannot
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 w-full max-w-3xl">
          {symptoms.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSymptom(s.value)}
              className="group flex flex-col items-center justify-center p-5 bg-white/70 backdrop-blur-sm border border-green-200 rounded-3xl shadow-md hover:shadow-xl hover:bg-white hover:border-green-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {s.icon}
              </span>
              <span className="text-sm font-semibold text-green-800">
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <form
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
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
          >
            Heal
          </button>
        </form>

        <p className="text-xs text-green-800/60 mt-8 text-center max-w-md bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-green-200">
          For minor symptoms only • Not a substitute for medical advice
        </p>

      </div>
    </div>
  )
}
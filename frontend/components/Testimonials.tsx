'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Mother of 2',
    text: 'HomeCare AI saved my night! My baby had a cold and I got instant natural remedies. Amazing! 🌟',
    avatar: '👩',
    rating: 5,
  },
  {
    name: 'Ravi Kumar',
    role: 'IT Professional',
    text: 'Multi-language support is incredible. I ask in Telugu, get answers in Telugu. Game changer!',
    avatar: '👨',
    rating: 5,
  },
  {
    name: 'Anita Reddy',
    role: 'Grandma',
    text: 'Voice mode is perfect for me. I just talk and get remedies. Better than calling my doctor.',
    avatar: '👵',
    rating: 5,
  },
  {
    name: 'Suresh Mehta',
    role: 'Business Owner',
    text: 'The wellness tracker helps me stay on top of my health. Beautiful design, easy to use.',
    avatar: '🧑',
    rating: 5,
  },
  {
    name: 'Deepa Iyer',
    role: 'Teacher',
    text: 'Best free wellness app I have used. AI responses are actually helpful and safe.',
    avatar: '👩‍🏫',
    rating: 5,
  },
]

export default function Testimonials({ isDark }: { isDark: boolean }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="relative h-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className={`glass-card rounded-3xl p-8 h-full flex flex-col justify-center`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg`}>
                  {testimonials[current].avatar}
                </div>
                <div>
                  <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {testimonials[current].name}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    {testimonials[current].role}
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(testimonials[current].rating)].map((_, i) => (
                      <span key={i} className="text-yellow-500">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className={`text-lg italic ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                &ldquo;{testimonials[current].text}&rdquo;
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current
              ? 'w-8 bg-emerald-500'
              : `w-2 ${isDark ? 'bg-white/20' : 'bg-black/20'}`
            }`}
          />
        ))}
      </div>
    </div>
  )
}
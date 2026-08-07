'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { symptomsData, symptomCategories } from '@/lib/symptomData'

export default function SymptomsListPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const isDark = theme === 'dark'

  useEffect(() => setMounted(true), [])

  const allSymptoms = Object.values(symptomsData)
  const categories = ['all', ...Object.keys(symptomCategories)]

  const filtered = allSymptoms.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.shortDesc.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Symptom Guide
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              {allSymptoms.length} conditions covered
            </div>
          </div>
        </div>
        <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-4xl mx-auto p-4">

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search symptoms..."
            className={`w-full px-4 py-3 rounded-full text-sm outline-none backdrop-blur-sm border ${isDark ? 'bg-gray-800/70 text-emerald-100 placeholder:text-emerald-300/50 border-emerald-800' : 'bg-white/70 text-green-900 placeholder:text-green-600/60 border-green-200'}`}
          />
        </motion.div>

        {/* Categories */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                : isDark ? 'bg-gray-800/70 text-emerald-300 border border-emerald-800' : 'bg-white/70 text-green-800 border border-green-200'
              }`}
            >
              {cat === 'all' ? '📋 All' : cat}
            </button>
          ))}
        </motion.div>

        {/* Symptoms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((symptom, i) => (
            <motion.div
              key={symptom.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/symptoms/${symptom.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`backdrop-blur-sm border rounded-2xl p-5 shadow-md cursor-pointer transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 hover:bg-gray-800' : 'bg-white/70 border-green-200 hover:bg-white hover:border-green-400'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{symptom.icon}</div>
                    <div className="flex-1">
                      <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-emerald-400/70' : 'text-green-600/70'}`}>
                        {symptom.category}
                      </div>
                      <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                        {symptom.name}
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                        {symptom.shortDesc}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-green-50 text-green-700'}`}>
                          🌿 {symptom.remedies.length} remedies
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                          📖 Full guide
                        </span>
                      </div>
                    </div>
                    <div className={`text-2xl ${isDark ? 'text-emerald-500' : 'text-green-600'}`}>
                      →
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={`text-center py-16 ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>
            <div className="text-5xl mb-3">🔍</div>
            <p>No symptoms found</p>
          </div>
        )}

      </div>
    </div>
  )
}
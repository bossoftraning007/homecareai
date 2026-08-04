'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

const remedies = [
  {
    category: '🤧 Cold',
    remedies: [
      { title: 'Ginger Tea', desc: 'Boil ginger in water, add honey. Drink warm 3x daily.', for: 'Cold, cough, sore throat' },
      { title: 'Steam Inhalation', desc: 'Add few drops of eucalyptus in hot water. Cover head with towel and inhale.', for: 'Blocked nose, congestion' },
      { title: 'Turmeric Milk', desc: 'Warm milk with 1 tsp turmeric and honey before bed.', for: 'Cold, immunity boost' },
      { title: 'Tulsi Kadha', desc: 'Boil tulsi, ginger, pepper, cinnamon. Strain and drink.', for: 'Cold, cough, fever' },
    ]
  },
  {
    category: '🤒 Sore Throat',
    remedies: [
      { title: 'Salt Water Gargle', desc: '1 tsp salt in warm water. Gargle 3-4 times daily.', for: 'Throat pain, infection' },
      { title: 'Honey & Warm Water', desc: '2 tsp honey in warm water. Sip slowly.', for: 'Throat irritation' },
      { title: 'Ginger Honey Lozenge', desc: 'Chew small ginger piece with honey.', for: 'Cough, throat' },
    ]
  },
  {
    category: '🤕 Headache',
    remedies: [
      { title: 'Peppermint Oil', desc: 'Apply diluted peppermint oil on temples and massage.', for: 'Tension headache' },
      { title: 'Cool Compress', desc: 'Apply cool cloth on forehead for 15 min.', for: 'Any headache' },
      { title: 'Hydration', desc: 'Drink 2-3 glasses of water immediately.', for: 'Dehydration headache' },
      { title: 'Ginger Tea', desc: 'Fresh ginger tea can reduce headache.', for: 'Migraine' },
    ]
  },
  {
    category: '🤢 Acidity',
    remedies: [
      { title: 'Cold Milk', desc: 'Sip cold milk slowly (if not lactose intolerant).', for: 'Instant relief' },
      { title: 'Fennel Seeds', desc: 'Chew 1 tsp fennel seeds after meals.', for: 'Bloating, gas' },
      { title: 'Buttermilk', desc: 'Drink buttermilk with cumin and salt.', for: 'Acid reflux' },
      { title: 'Banana', desc: 'Eat a ripe banana.', for: 'Natural antacid' },
    ]
  },
  {
    category: '😷 Cough',
    remedies: [
      { title: 'Honey & Ginger', desc: '1 tsp honey + fresh ginger juice. Take 3x daily.', for: 'Dry & wet cough' },
      { title: 'Turmeric Milk', desc: 'Warm milk with turmeric before bed.', for: 'Cough, throat' },
      { title: 'Steam', desc: 'Inhale steam 10 min, 2x daily.', for: 'Congestion' },
    ]
  },
  {
    category: '😴 Constipation',
    remedies: [
      { title: 'Warm Water Morning', desc: 'Drink warm water with lemon on empty stomach.', for: 'Digestion boost' },
      { title: 'Soaked Raisins', desc: 'Soak 10 raisins overnight. Eat morning.', for: 'Bowel movement' },
      { title: 'Papaya', desc: 'Eat ripe papaya on empty stomach.', for: 'Constipation' },
      { title: 'Triphala', desc: '1 tsp triphala with warm water at night.', for: 'Regular digestion' },
    ]
  },
  {
    category: '🤮 Diarrhea',
    remedies: [
      { title: 'ORS at Home', desc: '1 tsp sugar + pinch salt in 1 glass water.', for: 'Dehydration' },
      { title: 'Rice with Curd', desc: 'Boiled rice with plain curd.', for: 'Firm stool' },
      { title: 'Banana', desc: 'Eat ripe banana - rich in potassium.', for: 'Recovery' },
      { title: 'Coconut Water', desc: 'Fresh coconut water throughout the day.', for: 'Rehydration' },
    ]
  },
  {
    category: '😰 Stress',
    remedies: [
      { title: 'Deep Breathing', desc: '4-7-8 technique: Inhale 4s, hold 7s, exhale 8s.', for: 'Instant calm' },
      { title: 'Chamomile Tea', desc: 'Warm chamomile tea before bed.', for: 'Relaxation' },
      { title: 'Warm Bath', desc: 'Add lavender oil to warm bath water.', for: 'Full body relax' },
      { title: 'Meditation', desc: '5-10 min daily meditation.', for: 'Long-term stress' },
    ]
  },
]

export default function LibraryPage() {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => setMounted(true), [])

  const filteredCategories = remedies.map(cat => ({
    ...cat,
    remedies: cat.remedies.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.for.toLowerCase().includes(search.toLowerCase()) ||
      cat.category.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.remedies.length > 0)

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Remedy Library
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Natural cures collection
            </div>
          </div>
        </div>
        <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-3xl mx-auto p-4">

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search remedies (e.g. ginger, cold, honey)..."
            className={`w-full px-4 py-3 rounded-full text-sm outline-none backdrop-blur-sm border ${isDark
              ? 'bg-gray-800/70 text-emerald-100 placeholder:text-emerald-300/50 border-emerald-800'
              : 'bg-white/70 text-green-900 placeholder:text-green-600/60 border-green-200'
            }`}
          />
        </motion.div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className={isDark ? 'text-emerald-300' : 'text-green-700'}>
              No remedies found for "{search}"
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredCategories.map((cat, i) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
                >
                  <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                    {cat.category}
                  </h2>
                  <div className="space-y-3">
                    {cat.remedies.map((r, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + j * 0.05 }}
                        className={`p-3 rounded-xl border ${isDark ? 'bg-gray-900/50 border-emerald-900' : 'bg-white/50 border-green-100'}`}
                      >
                        <div className={`font-bold text-sm mb-1 ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>
                          🌿 {r.title}
                        </div>
                        <div className={`text-sm mb-2 ${isDark ? 'text-emerald-100/90' : 'text-green-900'}`}>
                          {r.desc}
                        </div>
                        <div className={`text-xs italic ${isDark ? 'text-emerald-400/70' : 'text-green-600'}`}>
                          Good for: {r.for}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
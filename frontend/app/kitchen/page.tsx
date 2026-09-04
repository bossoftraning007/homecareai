'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'

type Remedy = {
  id: string
  title: string
  description: string
  ingredients: string[]
  ingredient_amounts: string[]
  preparation_steps: string[]
  uses: string[]
  prep_time: number
  difficulty: string
  category: string
  match_score?: number
  ingredients_user_has?: string[]
  ingredients_missing?: string[]
  missing_count?: number
}

const COMMON_INGREDIENTS = [
  'Turmeric', 'Ginger', 'Garlic', 'Honey', 'Lemon', 'Milk',
  'Tulsi (Basil)', 'Cinnamon', 'Clove', 'Black Pepper', 'Cumin',
  'Coriander', 'Fenugreek', 'Fennel', 'Ajwain', 'Coconut Oil',
  'Sesame Oil', 'Onion', 'Curd (Yogurt)', 'Aloe Vera', 'Salt',
]

const CONCERNS = [
  { value: 'cold', label: '🤧 Cold & Cough' },
  { value: 'immunity', label: '🛡️ Immunity' },
  { value: 'digestion', label: '🍽️ Digestion' },
  { value: 'stomach_ache', label: '😖 Stomach Ache' },
  { value: 'skin', label: '✨ Skin Care' },
  { value: 'hair', label: '💇 Hair Care' },
  { value: 'joint_pain', label: '🦴 Joint Pain' },
  { value: 'blood_sugar', label: '🩸 Blood Sugar' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

export default function KitchenPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [concern, setConcern] = useState<string>('')
  const [remedies, setRemedies] = useState<Remedy[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    )
  }

  const handleScan = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Select at least 1 ingredient!')
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`${API_URL}/api/kitchen-remedies/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          concern: concern || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setRemedies(data.remedies || [])
        if (data.remedies.length === 0) {
          toast('No matching remedies found. Try different ingredients!', { icon: '🔍' })
        } else {
          toast.success(`Found ${data.remedies.length} remedies!`, { icon: '🌿' })
        }
      } else {
        toast.error('Failed to find remedies')
        setRemedies(getDemoRemedies(selectedIngredients))
      }
    } catch {
      toast.error('Network error - showing demo')
      setRemedies(getDemoRemedies(selectedIngredients))
    } finally {
      setLoading(false)
    }
  }

  const getDemoRemedies = (ings: string[]): Remedy[] => {
    const ings_lower = ings.map(i => i.toLowerCase())
    const hasIng = (...needed: string[]) => needed.every(n => ings_lower.some(i => i.includes(n.toLowerCase()) || n.toLowerCase().includes(i)))

    const all: Remedy[] = [
      {
        id: '1', title: 'Golden Milk (Haldi Doodh)',
        description: 'Anti-inflammatory drink that boosts immunity and helps with cold and cough',
        ingredients: ['turmeric', 'milk', 'black pepper', 'honey'],
        ingredient_amounts: ['1 tsp', '1 cup', 'a pinch', '1 tsp'],
        preparation_steps: ['Heat milk in a saucepan', 'Add turmeric powder and a pinch of black pepper', 'Stir well and bring to gentle boil', 'Pour into cup, add honey when warm'],
        uses: ['cold', 'cough', 'immunity', 'inflammation', 'sleep'],
        prep_time: 5, difficulty: 'easy', category: 'drink',
        match_score: hasIng('turmeric', 'milk') ? 100 : 0,
        ingredients_user_has: ings_lower,
        ingredients_missing: [],
      },
      {
        id: '2', title: 'Ginger-Tulsi Tea',
        description: 'Powerful remedy for cold, cough, and sore throat',
        ingredients: ['ginger', 'tulsi', 'water', 'honey', 'lemon'],
        ingredient_amounts: ['1 inch', '5-6 leaves', '1.5 cups', '1 tsp', '1/2'],
        preparation_steps: ['Boil water in a pan', 'Add crushed ginger and tulsi leaves', 'Simmer for 5-7 minutes', 'Strain into cup', 'Add honey and lemon'],
        uses: ['cold', 'cough', 'sore_throat', 'immunity', 'congestion'],
        prep_time: 10, difficulty: 'easy', category: 'drink',
        match_score: hasIng('ginger', 'tulsi') ? 100 : 0,
      },
      {
        id: '3', title: 'Honey-Lemon Warm Water',
        description: 'Morning detox drink that aids digestion and boosts immunity',
        ingredients: ['honey', 'lemon', 'water'],
        ingredient_amounts: ['1 tbsp', '1/2', '1 cup'],
        preparation_steps: ['Heat water until warm', 'Squeeze fresh lemon juice', 'Add honey and stir', 'Drink on empty stomach in morning'],
        uses: ['digestion', 'immunity', 'weight_loss', 'detox'],
        prep_time: 3, difficulty: 'easy', category: 'drink',
        match_score: hasIng('honey', 'lemon') ? 100 : 0,
      },
      {
        id: '4', title: 'Ajwain (Carom Seeds) Decoction',
        description: 'Quick relief from stomach ache and acidity',
        ingredients: ['ajwain', 'water', 'lemon'],
        ingredient_amounts: ['1 tsp', '1 cup', 'few drops'],
        preparation_steps: ['Boil water and add ajwain', 'Simmer for 5 minutes', 'Strain and add lemon', 'Drink warm'],
        uses: ['stomach_ache', 'acidity', 'indigestion', 'gas'],
        prep_time: 7, difficulty: 'easy', category: 'decoction',
        match_score: hasIng('ajwain') ? 100 : 0,
      },
      {
        id: '5', title: 'Clove Oil for Toothache',
        description: 'Instant relief from tooth pain using kitchen clove',
        ingredients: ['clove'],
        ingredient_amounts: ['2-3 cloves'],
        preparation_steps: ['Crush 2-3 cloves to release oil', 'Place on affected tooth', 'Bite gently to release oil', 'Leave for 10-15 minutes'],
        uses: ['toothache', 'gum_pain', 'bad_breath'],
        prep_time: 2, difficulty: 'easy', category: 'oil',
        match_score: hasIng('clove') ? 100 : 0,
      },
    ]
    return all.filter(r => (r.match_score || 0) > 0).sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-teal-950'
      : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/80 border-emerald-800' : 'bg-white/80 border-emerald-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              Kitchen Pharmacy
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Remedies from your kitchen
            </div>
          </div>
        </div>
        <a href="/dashboard" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-emerald-200 text-emerald-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl shadow-lg text-center ${
            isDark
              ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-700'
              : 'bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300'
          }`}
        >
          <div className="text-4xl mb-2">🏠🍯🌿</div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            What's in your kitchen?
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
            Select ingredients you have. We'll show you what remedies you can make RIGHT NOW.
          </p>
        </motion.div>

        {/* Concern Filter */}
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800/70 border border-emerald-800' : 'bg-white border border-emerald-200'}`}>
          <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🎯 What are you trying to fix? (Optional)
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setConcern('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                !concern
                  ? 'bg-emerald-500 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Any
            </button>
            {CONCERNS.map(c => (
              <button
                key={c.value}
                onClick={() => setConcern(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  concern === c.value
                    ? 'bg-emerald-500 text-white'
                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredient Selector */}
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800/70 border border-emerald-800' : 'bg-white border border-emerald-200'}`}>
          <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🥘 Tap ingredients you have ({selectedIngredients.length} selected)
          </h3>
          <div className="flex flex-wrap gap-2">
            {COMMON_INGREDIENTS.map(ing => (
              <button
                key={ing}
                onClick={() => toggleIngredient(ing)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedIngredients.includes(ing)
                    ? 'bg-emerald-500 text-white shadow-md'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ing}
              </button>
            ))}
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={handleScan}
          disabled={loading || selectedIngredients.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
            loading || selectedIngredients.length === 0
              ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
          }`}
        >
          {loading ? '🔍 Scanning your kitchen...' : '🌿 Find Remedies'}
        </button>

        {/* Results */}
        {searched && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-5xl animate-bounce">🔍</div>
              </div>
            ) : remedies.length === 0 ? (
              <div className={`p-8 rounded-2xl text-center ${isDark ? 'bg-gray-800/50 border border-emerald-800' : 'bg-white border border-emerald-200'}`}>
                <div className="text-5xl mb-3">🤔</div>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  No remedies matched. Try selecting more ingredients!
                </p>
              </div>
            ) : (
              <>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ✨ {remedies.length} Remedies You Can Make
                </h3>
                {remedies.map(remedy => (
                  <motion.div
                    key={remedy.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white border-emerald-200'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {remedy.title}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                          {remedy.description}
                        </p>
                      </div>
                      {remedy.match_score && (
                        <div className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                          remedy.match_score >= 80 ? 'bg-emerald-500/20 text-emerald-500' :
                          remedy.match_score >= 50 ? 'bg-amber-500/20 text-amber-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {remedy.match_score}% match
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        ⏱️ {remedy.prep_time} min
                      </span>
                      <span className={`px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        📊 {remedy.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {remedy.category}
                      </span>
                    </div>

                    {remedy.ingredients_user_has && remedy.ingredients_user_has.length > 0 && (
                      <div className="mb-2">
                        <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Ingredients you have:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {remedy.ingredients_user_has.map((ing, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-medium">
                              ✓ {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {remedy.ingredients_missing && remedy.ingredients_missing.length > 0 && (
                      <div className="mb-2">
                        <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          You need:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {remedy.ingredients_missing.map((ing, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedId(expandedId === remedy.id ? null : remedy.id)}
                      className={`w-full mt-2 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}
                    >
                      {expandedId === remedy.id ? '🙈 Hide' : '📋 Show'} Recipe
                    </button>

                    <AnimatePresence>
                      {expandedId === remedy.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3"
                        >
                          <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-emerald-50/50'}`}>
                            <div className={`text-xs font-bold mb-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                              🥄 INGREDIENTS:
                            </div>
                            <ul className="text-sm space-y-1 mb-3">
                              {remedy.ingredients.map((ing, i) => (
                                <li key={i} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                  • {ing} {remedy.ingredient_amounts?.[i] && <span className="opacity-70">({remedy.ingredient_amounts[i]})</span>}
                                </li>
                              ))}
                            </ul>
                            <div className={`text-xs font-bold mb-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                              👨‍🍳 STEPS:
                            </div>
                            <ol className="text-sm space-y-1">
                              {remedy.preparation_steps.map((step, i) => (
                                <li key={i} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                  {i + 1}. {step}
                                </li>
                              ))}
                            </ol>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {remedy.uses.map((use, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">
                                  #{use.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        )}

        {/* CTA */}
        <div className={`p-4 rounded-2xl text-center ${isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
          <p className="text-sm">
            🌿 Your kitchen is your first pharmacy. Try one of these today!
          </p>
        </div>
      </div>
    </div>
  )
}

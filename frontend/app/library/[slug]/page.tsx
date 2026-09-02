'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type Article = {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  category: string
  tags: string[]
  read_time: number
  views: number
  created_at: string
}

const FALLBACK_CONTENT: Record<string, Article> = {
  'benefits-of-bananas': {
    id: '1', slug: 'benefits-of-bananas',
    title: 'The Power of Bananas',
    summary: 'Bananas are packed with potassium, vitamin B6, and natural energy.',
    content: '## Why Bananas Are a Superfood\n\nBananas are one of the most consumed fruits worldwide.\n\n### Key Nutrients:\n- Potassium: 422mg (12% daily needs)\n- Vitamin B6: 25% daily needs\n- Fiber: 3g\n- Natural sugars for quick energy\n\n### Top 5 Benefits:\n\n**1. Heart Health**\nThe high potassium helps regulate blood pressure.\n\n**2. Instant Energy**\nPerfect pre-workout snack.\n\n**3. Digestive Health**\nRich in pectin and resistant starch.\n\n**4. Mood Enhancer**\nContains tryptophan which converts to serotonin.\n\n**5. Natural Sleep Aid**\nMagnesium and tryptophan promote relaxation.',
    category: 'nutrition', tags: ['fruits', 'energy'], read_time: 4, views: 1240,
    created_at: new Date().toISOString()
  },
  'sleep-hygiene-7-tips': {
    id: '2', slug: 'sleep-hygiene-7-tips',
    title: '7 Science-Backed Sleep Hygiene Tips',
    summary: 'Transform your sleep quality with proven strategies.',
    content: '## Why Sleep Hygiene Matters\n\nQuality sleep is the foundation of good health.\n\n### 1. Consistent Schedule\nGo to bed and wake up at the same time every day.\n\n### 2. Cool, Dark Environment\n65-68F is optimal temperature.\n\n### 3. The 10-3-2-1-0 Rule\n10h before bed: no caffeine. 3h: no food. 2h: no work. 1h: no screens. 0 snoozes.\n\n### 4. Wind-Down Routine\nBath, reading, or stretching 30-60 minutes before bed.\n\n### 5. Morning Sunlight\nNatural light within 30 minutes of waking.\n\n### 6. Exercise Regularly\n30 minutes daily improves sleep by 65%.\n\n### 7. Manage Racing Thoughts\nJournal worries 2 hours before bed.',
    category: 'sleep', tags: ['sleep', 'wellness'], read_time: 6, views: 2890,
    created_at: new Date().toISOString()
  },
  'home-remedies-for-cold': {
    id: '3', slug: 'home-remedies-for-cold',
    title: '12 Natural Home Remedies for Common Cold',
    summary: 'Evidence-based natural treatments to recover faster.',
    content: '## Beat the Common Cold Naturally\n\nThe common cold affects adults 2-3 times per year.\n\n### 1. Honey and Warm Water\nBest for sore throat. Mix 1-2 teaspoons in warm water.\n\n### 2. Ginger Tea\nBest for nausea and congestion.\n\n### 3. Steam Inhalation\nBest for congestion. Add eucalyptus oil to hot water.\n\n### 4. Salt Water Gargle\nBest for sore throat. 1/2 tsp salt in 8oz warm water.\n\n### 5. Chicken Soup\nReduces inflammation and improves mucus clearance.\n\n### 6. Garlic\nAllicin has antimicrobial properties.\n\n### 7. Vitamin C-Rich Foods\nCitrus, bell peppers, kiwi.\n\n### 8. Zinc Lozenges\nCan shorten colds by 40% if taken early.\n\n### 9. Rest and Hydration\nSleep 8+ hours, drink 10+ glasses.\n\n### 10. Turmeric Milk\nCurcumin reduces inflammation.\n\n### 11. Apple Cider Vinegar\nMix 1 tbsp in warm water.\n\n### 12. Peppermint Tea\nMenthol is a decongestant.',
    category: 'remedies', tags: ['cold', 'natural_remedies'], read_time: 8, views: 3450,
    created_at: new Date().toISOString()
  },
  'morning-routine-for-energy': {
    id: '4', slug: 'morning-routine-for-energy',
    title: 'Build a Morning Routine That Boosts Your Energy',
    summary: 'Science-backed morning habits to wake up energized.',
    content: '## The Energy-Boosting Morning Routine\n\n### The 60-Minute Power Morning\n\n**0-5 minutes: No Phone**\nResist checking emails.\n\n**5-15 minutes: Hydrate**\n16oz of water with lemon.\n\n**15-25 minutes: Move**\n5 min stretching, 10 min exercise.\n\n**25-35 minutes: Cold Shower**\n30-90 seconds cold water.\n\n**35-45 minutes: Healthy Breakfast**\nProtein, healthy fats, complex carbs.\n\n**45-55 minutes: Mindfulness**\n10 min meditation, 5 min journaling.\n\n**55-60 minutes: Plan Your Day**\nTop 3 priorities.\n\n### Why This Works:\n- Cortisol management\n- Blood sugar stability\n- Mental clarity\n- Habit stacking',
    category: 'wellness', tags: ['morning', 'habits'], read_time: 7, views: 1890,
    created_at: new Date().toISOString()
  },
  'benefits-of-walking': {
    id: '12', slug: 'benefits-of-walking',
    title: 'Why Walking 30 Minutes a Day Changes Everything',
    summary: 'The simplest exercise that transforms health and longevity.',
    content: '## Walking: The Miracle Exercise\n\nYou do not need a gym. Just 30 minutes and a pair of shoes.\n\n### What 30 Minutes Daily Does:\n\n**After 1 week**: Better sleep, improved mood\n**After 1 month**: 2-3 lb weight loss, lower BP\n**After 6 months**: 35% lower heart disease risk\n**After 1 year**: 3-7 years longer life!\n\n### How to Start:\n\n**Week 1**: 10 min, 3x/week\n**Week 2**: 15 min, 4x/week\n**Week 3**: 20 min, 5x/week\n**Week 4**: 30 min, 5x/week\n\n### Make It More Effective:\n- Add intervals (3 min normal, 1 min brisk)\n- Use your arms\n- Walk uphill\n- Add light weights\n- Practice good form',
    category: 'exercise', tags: ['walking', 'cardio'], read_time: 7, views: 2567,
    created_at: new Date().toISOString()
  },
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [slug, setSlug] = useState<string>('')

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    params.then(p => {
      setSlug(p.slug)
      loadArticle(p.slug)
    })
  }, [mounted, params])

  const loadArticle = async (slug: string) => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('health_articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (data) {
        setArticle(data as Article)
        await supabase
          .from('health_articles')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', data.id)
        if (user) {
          await supabase.from('article_views').insert({ user_id: user.id, article_id: data.id })
          const { data: bm } = await supabase
            .from('article_bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('article_id', data.id)
            .single()
          if (bm) {
            setBookmarked(true)
            setBookmarkId(bm.id)
          }
        }
      } else {
        setArticle(FALLBACK_CONTENT[slug] || null)
      }
    } catch {
      setArticle(FALLBACK_CONTENT[slug] || null)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async () => {
    if (!user || !article) {
      toast.error('Login to bookmark')
      return
    }
    if (bookmarked && bookmarkId) {
      await supabase.from('article_bookmarks').delete().eq('id', bookmarkId)
      setBookmarked(false)
      setBookmarkId(null)
      toast.success('Bookmark removed')
    } else {
      const { data } = await supabase
        .from('article_bookmarks')
        .insert({ user_id: user.id, article_id: article.id })
        .select()
        .single()
      if (data) {
        setBookmarked(true)
        setBookmarkId(data.id)
        toast.success('Bookmarked!', { icon: '🔖' })
      }
    }
  }

  const toggleSpeech = () => {
    if (!article) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const plainText = article.content
      .replace(/###? /g, '')
      .replace(/\*\*/g, '')
      .replace(/\n/g, '. ')
    const utterance = new SpeechSynthesisUtterance(plainText)
    utterance.rate = 0.9
    utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-emerald-50'}`}>
        <div className="text-5xl animate-bounce">⏳</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-emerald-50'}`}>
        <div className="text-center">
          <div className="text-6xl mb-3">📭</div>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Article not found</h2>
          <a href="/library" className="text-emerald-500 underline">← Back to Library</a>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 to-teal-100'}`}>
      <Toaster position="top-center" />

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/80 border-emerald-800' : 'bg-white/80 border-emerald-200'}`}>
        <a href="/library" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-emerald-200 text-emerald-700'}`}>
          ← Library
        </a>
        <div className="flex gap-2">
          <button
            onClick={toggleSpeech}
            className={`text-sm px-3 py-2 rounded-full border ${
              isSpeaking
                ? 'bg-red-500 text-white border-red-500'
                : isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-emerald-200 text-emerald-700'
            }`}
          >
            {isSpeaking ? '⏸️ Stop' : '🔊 Listen'}
          </button>
          <button
            onClick={toggleBookmark}
            className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-emerald-200 text-emerald-700'}`}
          >
            {bookmarked ? '🔖' : '🏷️'}
          </button>
        </div>
      </div>

      <article className="max-w-3xl mx-auto p-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 shadow-lg ${isDark ? 'bg-gray-800/70 border border-emerald-800' : 'bg-white border border-emerald-200'}`}
        >
          <div className="flex items-center gap-2 mb-3 text-xs">
            <span className={`px-2 py-1 rounded-full ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
              {article.category.replace('_', ' ')}
            </span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              ⏱️ {article.read_time} min read
            </span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              👁️ {article.views} views
            </span>
          </div>

          <h1 className={`text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {article.title}
          </h1>

          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {article.summary}
          </p>

          <div className="space-y-2">
            {article.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className={`text-2xl font-bold mt-6 mb-3 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{line.replace('## ', '')}</h2>
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className={`text-xl font-bold mt-4 mb-2 ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>{line.replace('### ', '')}</h3>
              }
              if (line.startsWith('- ')) {
                return <li key={i} className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{line.replace('- ', '')}</li>
              }
              if (line.match(/^\d+\./)) {
                return <li key={i} className={`ml-4 list-decimal ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{line.replace(/^\d+\.\s*/, '')}</li>
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className={`font-bold mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{line.replace(/\*\*/g, '')}</p>
              }
              if (line.trim() === '') return <br key={i} />
              return <p key={i} className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{line.replace(/\*\*/g, '')}</p>
            })}
          </div>
        </motion.div>

        <div className="mt-6 space-y-3">
          <div className={`p-4 rounded-2xl border-l-4 ${isDark ? 'bg-cyan-900/30 border-cyan-500' : 'bg-cyan-50 border-cyan-400'}`}>
            <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
              📚 KEEP LEARNING
            </div>
            <p className={`text-sm ${isDark ? 'text-cyan-200' : 'text-cyan-800'}`}>
              Track your sleep, mood, and wellness to apply what you learned.
            </p>
            <a href="/dashboard" className="inline-block mt-2 text-sm font-semibold text-cyan-600 underline">
              Go to Dashboard →
            </a>
          </div>

          <a href="/library" className={`block w-full text-center py-3 rounded-xl font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>
            ← Browse More Articles
          </a>
        </div>
      </article>
    </div>
  )
}

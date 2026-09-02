'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  is_featured: boolean
  created_at: string
}

const CATEGORIES = [
  { key: 'all', label: 'All', icon: '📚', color: 'emerald' },
  { key: 'nutrition', label: 'Nutrition', icon: '🍎', color: 'green' },
  { key: 'sleep', label: 'Sleep', icon: '😴', color: 'indigo' },
  { key: 'mental_health', label: 'Mental Health', icon: '🧠', color: 'pink' },
  { key: 'exercise', label: 'Exercise', icon: '🏃', color: 'orange' },
  { key: 'remedies', label: 'Remedies', icon: '🌿', color: 'emerald' },
  { key: 'conditions', label: 'Conditions', icon: '🩺', color: 'red' },
  { key: 'prevention', label: 'Prevention', icon: '🛡️', color: 'blue' },
  { key: 'wellness', label: 'Wellness', icon: '✨', color: 'purple' },
]

// Fallback articles for guest/offline mode
const FALLBACK_ARTICLES: Article[] = [
  {
    id: '1', slug: 'benefits-of-bananas', title: 'The Power of Bananas: Nature\'s Perfect Snack',
    summary: 'Discover why this humble fruit is packed with potassium, vitamin B6, and natural energy for your daily life.',
    content: '', category: 'nutrition', tags: ['fruits', 'energy'], read_time: 4, views: 1240, is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2', slug: 'sleep-hygiene-7-tips', title: '7 Science-Backed Sleep Hygiene Tips That Actually Work',
    summary: 'Transform your sleep quality with these proven strategies from sleep researchers.',
    content: '', category: 'sleep', tags: ['sleep', 'wellness'], read_time: 6, views: 2890, is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3', slug: 'home-remedies-for-cold', title: '12 Natural Home Remedies for Common Cold',
    summary: 'Evidence-based natural treatments to help you recover faster from a cold.',
    content: '', category: 'remedies', tags: ['cold', 'natural_remedies'], read_time: 8, views: 3450, is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4', slug: 'morning-routine-for-energy', title: 'Build a Morning Routine That Boosts Your Energy All Day',
    summary: 'Science-backed morning habits to wake up energized, focused, and ready.',
    content: '', category: 'wellness', tags: ['morning', 'habits'], read_time: 7, views: 1890, is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '5', slug: 'understanding-blood-pressure', title: 'Understanding Blood Pressure: A Complete Guide',
    summary: 'Learn to monitor, interpret, and manage your blood pressure at home with confidence.',
    content: '', category: 'conditions', tags: ['blood_pressure', 'cardiovascular'], read_time: 9, views: 1567, is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '6', slug: 'benefits-of-meditation', title: 'How 10 Minutes of Daily Meditation Transforms Your Brain',
    summary: 'The neuroscience behind meditation and how it reduces stress, improves focus.',
    content: '', category: 'mental_health', tags: ['meditation', 'stress'], read_time: 8, views: 2103, is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '7', slug: 'hydration-importance', title: 'Why Hydration Is the Most Underrated Health Hack',
    summary: 'How drinking enough water transforms your energy, skin, brain, and overall health.',
    content: '', category: 'nutrition', tags: ['hydration', 'water'], read_time: 6, views: 1789, is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '8', slug: 'desk-exercises', title: '5-Minute Desk Exercises to Relieve Tension',
    summary: 'Quick movements you can do at work to prevent stiffness and improve posture.',
    content: '', category: 'exercise', tags: ['desk', 'posture'], read_time: 7, views: 1456, is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '9', slug: 'managing-anxiety-naturally', title: '5 Natural Techniques to Manage Anxiety in the Moment',
    summary: 'Evidence-based tools to calm your mind when anxiety strikes, without medication.',
    content: '', category: 'mental_health', tags: ['anxiety', 'stress'], read_time: 8, views: 2234, is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '10', slug: 'healthy-gut-tips', title: '10 Simple Ways to Improve Your Gut Health Starting Today',
    summary: 'Your gut affects everything from immunity to mood. Here is how to keep it thriving.',
    content: '', category: 'nutrition', tags: ['gut_health', 'digestion'], read_time: 9, views: 1678, is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '11', slug: 'myths-about-flu-shots', title: '7 Common Myths About Flu Shots Debunked by Science',
    summary: 'Separate fact from fiction about one of the most important preventive health measures.',
    content: '', category: 'prevention', tags: ['flu', 'vaccines'], read_time: 6, views: 1345, is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '12', slug: 'benefits-of-walking', title: 'Why Walking 30 Minutes a Day Changes Everything',
    summary: 'The simplest, most underrated exercise that transforms your health, mood, and longevity.',
    content: '', category: 'exercise', tags: ['walking', 'cardio'], read_time: 7, views: 2567, is_featured: false,
    created_at: new Date().toISOString()
  },
]

export default function LibraryPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const [showSearch, setShowSearch] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadArticles()
    if (user) loadBookmarks()
  }, [mounted, user, selectedCategory, searchQuery])

  const loadArticles = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('health_articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
      }

      const { data, error } = await query.limit(50)

      if (data && data.length > 0) {
        setArticles(data as Article[])
      } else if (!searchQuery && selectedCategory === 'all') {
        setArticles(FALLBACK_ARTICLES)
      } else {
        setArticles([])
      }
    } catch (err) {
      console.error('Library load error:', err)
      if (!searchQuery && selectedCategory === 'all') {
        setArticles(FALLBACK_ARTICLES)
      } else {
        setArticles([])
      }
    } finally {
      setLoading(false)
    }
  }

  const loadBookmarks = async () => {
    if (!user) return
    const { data } = await supabase
      .from('article_bookmarks')
      .select('article_id')
      .eq('user_id', user.id)
    if (data) {
      setBookmarked(new Set(data.map(b => b.article_id)))
    }
  }

  const toggleBookmark = async (articleId: string) => {
    if (!user) {
      toast.error('Login to bookmark articles')
      return
    }

    if (bookmarked.has(articleId)) {
      await supabase
        .from('article_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId)
      setBookmarked(prev => {
        const next = new Set(prev)
        next.delete(articleId)
        return next
      })
      toast.success('Bookmark removed')
    } else {
      await supabase
        .from('article_bookmarks')
        .insert({ user_id: user.id, article_id: articleId })
      setBookmarked(prev => new Set(prev).add(articleId))
      toast.success('Bookmarked!', { icon: '🔖' })
    }
  }

  const openArticle = (slug: string) => {
    window.location.href = `/library/${slug}`
  }

  const featured = articles.filter(a => a.is_featured)
  const displayArticles = articles.filter(a => !a.is_featured)

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
          <span className="text-2xl">📚</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              Health Library
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Curated by AI · Updated daily
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-emerald-200 text-emerald-700'}`}
          >
            🔍
          </button>
          <a href="/dashboard" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-emerald-200 text-emerald-700'}`}>
            🏠
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.input
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, conditions..."
              className={`w-full px-4 rounded-xl border outline-none ${
                isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          )}
        </AnimatePresence>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat.key
                  ? isDark ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg'
                  : isDark ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ⭐ Featured
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featured.slice(0, 2).map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isDark={isDark}
                  isBookmarked={bookmarked.has(article.id)}
                  onOpen={() => openArticle(article.slug)}
                  onBookmark={() => toggleBookmark(article.id)}
                  featured
                />
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div>
          <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {selectedCategory === 'all' ? '📖 All Articles' : `${CATEGORIES.find(c => c.key === selectedCategory)?.icon} ${CATEGORIES.find(c => c.key === selectedCategory)?.label}`}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl animate-bounce">⏳</div>
            </div>
          ) : displayArticles.length === 0 && articles.filter(a => !a.is_featured).length === 0 ? (
            <div className={`text-center py-12 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-emerald-800' : 'bg-white/50 border-emerald-200'}`}>
              <div className="text-5xl mb-3">🔍</div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {searchQuery ? 'No articles found' : 'No articles in this category yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(displayArticles.length > 0 ? displayArticles : articles).map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isDark={isDark}
                  isBookmarked={bookmarked.has(article.id)}
                  onOpen={() => openArticle(article.slug)}
                  onBookmark={() => toggleBookmark(article.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Health Tip of the Day */}
        <div className={`p-4 rounded-2xl border-l-4 ${
          isDark ? 'bg-cyan-900/30 border-cyan-500' : 'bg-cyan-50 border-cyan-400'
        }`}>
          <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
            💡 DID YOU KNOW?
          </div>
          <p className={`text-sm ${isDark ? 'text-cyan-200' : 'text-cyan-800'}`}>
            Only <strong>23% of adults worldwide</strong> get the recommended 7+ hours of sleep per night. (WHO 2023)
          </p>
        </div>
      </div>
    </div>
  )
}

function ArticleCard({
  article,
  isDark,
  isBookmarked,
  onOpen,
  onBookmark,
  featured = false,
}: {
  article: Article
  isDark: boolean
  isBookmarked: boolean
  onOpen: () => void
  onBookmark: () => void
  featured?: boolean
}) {
  const cat = CATEGORIES.find(c => c.key === article.category)
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`backdrop-blur-md border rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
        featured
          ? isDark ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-600' : 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-400'
          : isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/80 border-emerald-200'
      }`}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
          {cat?.icon} {cat?.label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onBookmark()
          }}
          className="text-lg"
        >
          {isBookmarked ? '🔖' : '🏷️'}
        </button>
      </div>
      <h3 className={`font-bold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {article.title}
      </h3>
      <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {article.summary}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          ⏱️ {article.read_time} min · 👁️ {article.views}
        </span>
        <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
          Read →
        </span>
      </div>
    </motion.div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type Favorite = {
  id?: string
  content: string
  date?: string
  created_at?: string
}

const FAV_KEY = 'homecare_favorites'

export default function FavoritesPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (user) {
      loadFromCloud()
    } else {
      loadFromLocal()
    }
  }, [mounted, user])

  const loadFromCloud = async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setFavorites(data.map(f => ({
        id: f.id,
        content: f.content,
        created_at: f.created_at,
      })))
    }
    setLoading(false)
  }

  const loadFromLocal = () => {
    const saved = localStorage.getItem(FAV_KEY)
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch { }
    }
    setLoading(false)
  }

  const removeFavorite = async (item: Favorite, index: number) => {
    if (!confirm('Remove from favorites?')) return

    if (user && item.id) {
      await supabase.from('favorites').delete().eq('id', item.id)
    } else {
      const updated = favorites.filter((_, i) => i !== index)
      localStorage.setItem(FAV_KEY, JSON.stringify(updated))
    }

    setFavorites(favorites.filter((_, i) => i !== index))
    toast.success('Removed!', { icon: '🗑️' })
  }

  const copyFavorite = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied!', { icon: '📋' })
  }

  const clearAll = async () => {
    if (!confirm('Delete ALL favorites?')) return

    if (user) {
      await supabase.from('favorites').delete().eq('user_id', user.id)
    } else {
      localStorage.removeItem(FAV_KEY)
    }

    setFavorites([])
    toast.success('All cleared!', { icon: '🗑️' })
  }

  const exportFavorites = () => {
    const text = favorites.map((f, i) => {
      const date = f.created_at || f.date || new Date().toISOString()
      return `#${i + 1} - ${new Date(date).toLocaleString()}\n\n${f.content}\n\n---\n`
    }).join('\n')

    const blob = new Blob([`HomeCare AI - My Favorite Remedies\n\n${text}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `homecare-favorites-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported!', { icon: '📤' })
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark
        ? 'bg-gray-900/70 border-emerald-900'
        : 'bg-white/70 border-green-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              My Favorites
            </div>
            <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              {user && <span className="text-blue-500">☁️</span>}
              {favorites.length} saved remedies
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {favorites.length > 0 && (
            <>
              <button
                onClick={exportFavorites}
                title="Export"
                className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}
              >
                📤
              </button>
              <button
                onClick={clearAll}
                title="Clear all"
                className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-red-800 text-red-400' : 'bg-white/70 border-green-200 text-red-600'}`}
              >
                🗑️
              </button>
            </>
          )}
          <button
            onClick={() => router.push('/chat')}
            className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}
          >
            💬
          </button>
          <a
            href="/"
            className={`text-sm px-3 py-2 rounded-full border transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}
          >
            🏠
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⏳</div>
            <p className={isDark ? 'text-emerald-300' : 'text-green-700'}>Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">⭐</div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              No favorites yet!
            </h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Save your favorite remedies by clicking the ⭐ button on any AI response
            </p>
            {!user && (
              <p className={`text-xs mb-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                💡 Login to sync favorites across devices!
              </p>
            )}
            <button
              onClick={() => router.push('/chat')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
            >
              Start Chatting 🌿
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4 py-4">
            {!user && (
              <div className={`p-3 rounded-xl text-center text-sm ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
                💡 <a href="/login" className="underline font-semibold">Login</a> to sync favorites across devices!
              </div>
            )}
            <AnimatePresence>
              {favorites.map((fav, i) => (
                <motion.div
                  key={fav.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark
                    ? 'bg-gray-800/70 border-emerald-800'
                    : 'bg-white/70 border-green-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                      {user && <span className="text-blue-500">☁️</span>}
                      ⭐ Saved on {new Date(fav.created_at || fav.date || Date.now()).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyFavorite(fav.content)}
                        className={`text-sm ${isDark ? 'text-emerald-300 hover:text-emerald-100' : 'text-green-700 hover:text-green-900'}`}
                      >
                        📋
                      </button>
                      <button
                        onClick={() => removeFavorite(fav, i)}
                        className={`text-sm ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className={`text-sm leading-relaxed prose-message ${isDark ? 'text-emerald-100' : 'text-green-900'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {fav.content}
                    </ReactMarkdown>
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
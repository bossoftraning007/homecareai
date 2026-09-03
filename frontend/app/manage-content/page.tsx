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
  image_url: string | null
  read_time: number
  views: number
  is_featured: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

const ADMIN_EMAILS = ['bossoftraning007@gmail.com']

const CATEGORIES = [
  { key: 'nutrition', label: 'Nutrition', icon: '🍎' },
  { key: 'sleep', label: 'Sleep', icon: '😴' },
  { key: 'mental_health', label: 'Mental Health', icon: '🧠' },
  { key: 'exercise', label: 'Exercise', icon: '🏃' },
  { key: 'remedies', label: 'Remedies', icon: '🌿' },
  { key: 'conditions', label: 'Conditions', icon: '🩺' },
  { key: 'prevention', label: 'Prevention', icon: '🛡️' },
  { key: 'wellness', label: 'Wellness', icon: '✨' },
  { key: 'news', label: 'Health News', icon: '📰' },
]

const EMPTY_ARTICLE = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: 'wellness',
  tags: [] as string[],
  image_url: '',
  read_time: 5,
  is_featured: false,
  is_published: true,
}

export default function ManageContentPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<typeof EMPTY_ARTICLE>(EMPTY_ARTICLE)
  const [tagInput, setTagInput] = useState('')

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    checkAdminAndLoad()
  }, [mounted, user])

  const checkAdminAndLoad = async () => {
    setLoading(true)
    try {
      // Check if current user is admin
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const userEmail = user.email?.toLowerCase()
      if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        // Also check admin_users table for dynamic admins
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('email, is_active')
          .eq('email', userEmail)
          .eq('is_active', true)
          .single()
        setIsAdmin(!!adminRecord || ADMIN_EMAILS.includes(userEmail || ''))
      } else {
        setIsAdmin(true)
      }

      await loadArticles()
    } catch (err) {
      console.error('Admin check error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from('health_articles')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(200)

    if (data) setArticles(data as Article[])
  }

  const filteredArticles = articles.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.summary.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (filterCategory !== 'all' && a.category !== filterCategory) return false
    if (filterStatus === 'published' && !a.is_published) return false
    if (filterStatus === 'draft' && a.is_published) return false
    return true
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 80)
  }

  const openNewArticle = () => {
    setForm(EMPTY_ARTICLE)
    setEditingId(null)
    setTagInput('')
    setShowForm(true)
  }

  const openEditArticle = (article: Article) => {
    setForm({
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      content: article.content,
      category: article.category,
      tags: article.tags || [],
      image_url: article.image_url || '',
      read_time: article.read_time,
      is_featured: article.is_featured,
      is_published: article.is_published,
    })
    setEditingId(article.id)
    setTagInput('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.summary || !form.content) {
      toast.error('Title, summary, and content are required!')
      return
    }

    const slug = form.slug || generateSlug(form.title)
    const tagsArray = tagInput
      ? tagInput.split(',').map(t => t.trim()).filter(Boolean)
      : form.tags

    const readTime = Math.max(1, Math.ceil(form.content.split(/\s+/).length / 200))

    const articleData = {
      slug,
      title: form.title,
      summary: form.summary,
      content: form.content,
      category: form.category,
      tags: tagsArray,
      image_url: form.image_url || null,
      read_time: readTime,
      is_featured: form.is_featured,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
      author_email: user?.email,
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('health_articles')
          .update(articleData)
          .eq('id', editingId)
        if (error) throw error
        toast.success('Article updated!', { icon: '✅' })
      } else {
        const { error } = await supabase
          .from('health_articles')
          .insert(articleData)
        if (error) throw error
        toast.success('Article created!', { icon: '🎉' })
      }
      setShowForm(false)
      loadArticles()
    } catch (err: any) {
      toast.error(`Failed: ${err.message || 'unknown error'}`)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      const { error } = await supabase.from('health_articles').delete().eq('id', id)
      if (error) throw error
      toast.success('Article deleted', { icon: '🗑️' })
      loadArticles()
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('health_articles')
        .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      toast.success(currentStatus ? 'Unpublished' : 'Published!', { icon: currentStatus ? '🙈' : '✅' })
      loadArticles()
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`)
    }
  }

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('health_articles')
        .update({ is_featured: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      toast.success(currentStatus ? 'Removed from featured' : 'Marked as featured!', { icon: '⭐' })
      loadArticles()
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`)
    }
  }

  if (!mounted) return null

  if (loading && !articles.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-emerald-50'}`}>
        <div className="text-center">
          <div className="text-5xl animate-bounce">⚙️</div>
          <p className={`mt-3 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Loading content manager...</p>
        </div>
      </div>
    )
  }

  // Access denied
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-emerald-50'}`}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-3">🔒</div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Login Required</h1>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Please login with your admin account to access the Content Manager.
          </p>
          <a href="/login" className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold">
            🔐 Go to Login
          </a>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-emerald-50'}`}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-3">🚫</div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Access Denied</h1>
          <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            You ({user.email}) are not authorized to access the Content Manager.
          </p>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Only admin accounts can manage articles.
          </p>
          <a href="/dashboard" className={`inline-block px-6 py-3 rounded-xl font-bold ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>
            ← Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.is_published).length,
    drafts: articles.filter(a => !a.is_published).length,
    featured: articles.filter(a => a.is_featured).length,
    totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900'
      : 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Content Manager
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Admin · {user.email}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/library" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            👁️ View Library
          </a>
          <a href="/dashboard" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            🏠
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: 'Total', value: stats.total, icon: '📚', color: 'blue' },
            { label: 'Published', value: stats.published, icon: '✅', color: 'emerald' },
            { label: 'Drafts', value: stats.drafts, icon: '📝', color: 'amber' },
            { label: 'Featured', value: stats.featured, icon: '⭐', color: 'purple' },
            { label: 'Total Views', value: stats.totalViews, icon: '👁️', color: 'pink' },
          ].map((stat, i) => (
            <div key={i} className={`p-3 rounded-xl ${isDark ? 'bg-slate-800/70 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              <div className="text-xl">{stat.icon}</div>
              <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/70 border border-slate-700' : 'bg-white border border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search articles..."
              className={`flex-1 px-4 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200'}`}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
            <button
              onClick={openNewArticle}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md"
            >
              + New Article
            </button>
          </div>
        </div>

        {/* Articles Table */}
        <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800/70 border border-slate-700' : 'bg-white border border-slate-200'}`}>
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No articles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-slate-900' : 'bg-slate-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Article</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Category</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Status</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Views</th>
                    <th className={`px-4 py-3 text-right text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => {
                    const cat = CATEGORIES.find(c => c.key === article.category)
                    return (
                      <tr key={article.id} className={`border-t ${isDark ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <td className="px-4 py-3">
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {article.is_featured && <span className="text-yellow-500 mr-1">⭐</span>}
                            {article.title}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} truncate max-w-md`}>
                            {article.summary}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {cat?.icon} {cat?.label || article.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {article.is_published ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500 font-semibold">
                              ✓ Published
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 font-semibold">
                              📝 Draft
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {article.views || 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => togglePublish(article.id, article.is_published)}
                              className={`text-xs px-2 py-1 rounded-lg ${
                                article.is_published
                                  ? isDark ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                                  : isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                              }`}
                              title={article.is_published ? 'Unpublish' : 'Publish'}
                            >
                              {article.is_published ? '🙈' : '✅'}
                            </button>
                            <button
                              onClick={() => toggleFeatured(article.id, article.is_featured)}
                              className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
                              title="Toggle Featured"
                            >
                              {article.is_featured ? '⭐' : '☆'}
                            </button>
                            <button
                              onClick={() => window.open(`/library/${article.slug}`, '_blank')}
                              className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                              title="View"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => openEditArticle(article)}
                              className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(article.id, article.title)}
                              className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'}`}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Article Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-3xl rounded-2xl p-6 my-8 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}
            >
              <h3 className={`font-bold text-2xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingId ? '✏️ Edit Article' : '📝 New Article'}
              </h3>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value) })}
                    placeholder="e.g., Benefits of Blueberries"
                    className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                    className={`w-full p-3 rounded-xl border font-mono text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Summary * (1-2 sentences)
                  </label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    placeholder="Brief description of the article..."
                    rows={2}
                    className={`w-full p-3 rounded-xl border resize-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://..."
                      className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g., sleep, wellness, mental_health"
                    defaultValue={form.tags.join(', ')}
                    className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Content * (Markdown supported: ## heading, **bold**, - lists)
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder={`## Introduction\n\nWrite your article here...\n\n### Subsection\n\n- Point 1\n- Point 2`}
                    rows={12}
                    className={`w-full p-3 rounded-xl border resize-none font-mono text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                  <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {form.content.split(/\s+/).filter(Boolean).length} words · ~{Math.max(1, Math.ceil(form.content.split(/\s+/).filter(Boolean).length / 200))} min read
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      ✓ Published
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      ⭐ Featured
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold"
                >
                  {editingId ? '💾 Update Article' : '🚀 Publish Article'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

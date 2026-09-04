'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '@/lib/useAuth'

const ADMIN_EMAIL = 'bossoftraning007@gmail.com'
const ADMIN_SECRET = 'PQjtStLZHnGYWSLR5ox_1cp75t20GOXeZk_xjfisfGo'

type Article = {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  category: string
  tags: string[]
  read_time: number
  author: string
  image_url: string | null
  author_email: string | null
  is_featured: boolean
  is_published: boolean
  views: number
  created_at: string
  updated_at: string
}

type Category = {
  key: string
  label: string
  icon: string
}

const DEFAULT_CATEGORIES: Category[] = [
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-admin-secret': ADMIN_SECRET,
  }
}

export default function ManageContentPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [saving, setSaving] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'wellness',
    tagsInput: '',
    read_time: 5,
    author: 'HomeCare AI',
    image_url: '',
    is_featured: false,
    is_published: true,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (user && user.email === ADMIN_EMAIL) {
      setAuthorized(true)
      loadCategories()
      loadArticles()
    } else {
      setAuthorized(false)
      setLoading(false)
    }
  }, [mounted, user])

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories`, { headers: getHeaders() })
      const data = await res.json()
      if (data.success && data.categories) {
        setCategories(data.categories)
      }
    } catch {
      // Use defaults
    }
  }

  const loadArticles = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/articles`, { headers: getHeaders() })
      const data = await res.json()
      if (data.success) {
        setArticles(data.articles || [])
      } else {
        toast.error('Failed to load articles')
      }
    } catch (err) {
      toast.error('Backend not reachable')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      summary: '',
      content: '',
      category: 'wellness',
      tagsInput: '',
      read_time: 5,
      author: 'HomeCare AI',
      image_url: '',
      is_featured: false,
      is_published: true,
    })
    setEditingArticle(null)
  }

  const openCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (article: Article) => {
    setEditingArticle(article)
    setForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      tagsInput: (article.tags || []).join(', '),
      read_time: article.read_time || 5,
      author: article.author || 'HomeCare AI',
      image_url: article.image_url || '',
      is_featured: article.is_featured,
      is_published: article.is_published,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.summary.trim()) {
      toast.error('Title, summary, and content are required')
      return
    }

    setSaving(true)
    try {
      const tags = form.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content,
        category: form.category,
        tags,
        read_time: form.read_time,
        author: form.author,
        image_url: form.image_url || null,
        author_email: user?.email || null,
        is_featured: form.is_featured,
        is_published: form.is_published,
      }

      let res, data
      if (editingArticle) {
        res = await fetch(`${API_BASE}/api/admin/articles/${editingArticle.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`${API_BASE}/api/admin/articles`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        })
      }

      data = await res.json()
      if (data.success) {
        toast.success(editingArticle ? 'Article updated!' : 'Article created!')
        setShowForm(false)
        resetForm()
        loadArticles()
      } else {
        toast.error(data.detail || 'Save failed')
      }
    } catch (err) {
      toast.error('Network error')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Article deleted')
        setArticles(prev => prev.filter(a => a.id !== id))
      } else {
        toast.error(data.detail || 'Delete failed')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/articles/${id}/toggle-publish`, {
        method: 'PATCH',
        headers: getHeaders(),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.is_published ? 'Published!' : 'Unpublished')
        setArticles(prev => prev.map(a => a.id === id ? { ...a, is_published: data.is_published } : a))
      } else {
        toast.error(data.detail || 'Toggle failed')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleToggleFeatured = async (article: Article) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ is_featured: !article.is_featured }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.article.is_featured ? 'Featured!' : 'Unfeatured')
        setArticles(prev => prev.map(a => a.id === article.id ? { ...a, is_featured: data.article.is_featured } : a))
      }
    } catch {
      toast.error('Network error')
    }
  }

  if (!mounted) return null

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Login Required</h1>
          <p className="text-gray-400 mb-6">Please log in to access Content Manager.</p>
          <a href="/login" className="inline-block px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-2">Content Manager is restricted to administrators.</p>
          <p className="text-xs text-gray-500 mb-6">Signed in as: {user.email}</p>
          <a href="/" className="inline-block px-6 py-3 rounded-lg bg-[#1a1a1a] text-white font-semibold hover:bg-[#222]">
            Go Home
          </a>
        </div>
      </div>
    )
  }

  const filtered = articles.filter(a => {
    if (filterCat !== 'all' && a.category !== filterCat) return false
    if (filterStatus === 'published' && !a.is_published) return false
    if (filterStatus === 'draft' && a.is_published) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
    }
    return true
  })

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.is_published).length,
    drafts: articles.filter(a => !a.is_published).length,
    featured: articles.filter(a => a.is_featured).length,
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-gray-400 hover:text-white text-sm">← Admin</a>
            <span className="text-2xl">📝</span>
            <div>
              <div className="font-bold">Content Manager</div>
              <div className="text-xs text-gray-500">Health Library Articles · Admin: {user.email}</div>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
          >
            + New Article
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} color="emerald" />
          <StatCard label="Published" value={stats.published} color="green" />
          <StatCard label="Drafts" value={stats.drafts} color="amber" />
          <StatCard label="Featured" value={stats.featured} color="purple" />
        </div>

        {/* Filters */}
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search title, summary, tags..."
              className="flex-1 px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500"
            />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All categories</option>
              {categories.map(c => (
                <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
            <button
              onClick={loadArticles}
              className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-gray-300 text-sm hover:bg-[#222]"
            >
              ↻ Refresh
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Showing {filtered.length} of {articles.length} articles
          </div>
        </div>

        {/* Articles Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl animate-bounce mb-3">⏳</div>
              <p className="text-gray-400 text-sm">Loading articles from database...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-400">No articles found</p>
            <button
              onClick={openCreate}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold"
            >
              Create your first article
            </button>
          </div>
        ) : (
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0a0a0a] sticky top-0">
                  <tr>
                    <th className="text-left p-3 text-gray-400 font-medium">Article</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Category</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Views</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Updated</th>
                    <th className="text-right p-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(article => {
                    const cat = categories.find(c => c.key === article.category)
                    return (
                      <tr key={article.id} className="border-t border-[#1a1a1a] hover:bg-[#1a1a1a]/40">
                        <td className="p-3 max-w-xs">
                          <div className="font-semibold line-clamp-1">{article.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{article.summary}</div>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {article.tags.slice(0, 3).map((t, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-gray-400">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 whitespace-nowrap">
                            {cat?.icon} {cat?.label || article.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${
                              article.is_published
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {article.is_published ? '● Live' : '○ Draft'}
                            </span>
                            {article.is_featured && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 w-fit">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-gray-400">{article.views || 0}</td>
                        <td className="p-3 text-gray-500 text-xs">
                          {new Date(article.updated_at || article.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <button
                              onClick={() => handleTogglePublish(article.id)}
                              className={`text-xs px-2 py-1 rounded ${
                                article.is_published
                                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                              title={article.is_published ? 'Unpublish' : 'Publish'}
                            >
                              {article.is_published ? '⏸' : '▶'}
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(article)}
                              className={`text-xs px-2 py-1 rounded ${
                                article.is_featured
                                  ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
                              }`}
                              title={article.is_featured ? 'Remove featured' : 'Mark featured'}
                            >
                              {article.is_featured ? '⭐' : '☆'}
                            </button>
                            <a
                              href={`/library/${article.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                              title="Preview"
                            >
                              👁
                            </a>
                            <button
                              onClick={() => openEdit(article)}
                              className="text-xs px-2 py-1 rounded bg-[#1a1a1a] text-gray-300 hover:bg-[#222]"
                              title="Edit"
                            >
                              ✏
                            </button>
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              title="Delete"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Article Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget && !saving) {
                setShowForm(false)
                resetForm()
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111111] border border-[#1a1a1a] rounded-2xl max-w-3xl w-full my-8"
            >
              <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between sticky top-0 bg-[#111111] z-10 rounded-t-2xl">
                <h2 className="text-xl font-bold">
                  {editingArticle ? '✏️ Edit Article' : '📝 Create New Article'}
                </h2>
                <button
                  onClick={() => { setShowForm(false); resetForm() }}
                  disabled={saving}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., 10 Natural Ways to Lower Blood Pressure"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Summary * (1-2 sentences)</label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    placeholder="A short, compelling description shown on the library card..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Content * (Markdown supported)</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Write your article here. You can use Markdown:&#10;## Headings&#10;**bold**, *italic*&#10;- bullet points&#10;1. numbered lists&#10;[link](url)"
                    rows={12}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500 resize-y"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {form.content.length} characters · ~{Math.max(1, Math.ceil(form.content.split(/\s+/).length / 200))} min read
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500"
                      required
                    >
                      {categories.map(c => (
                        <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Read time (minutes)</label>
                    <input
                      type="number"
                      value={form.read_time}
                      onChange={(e) => setForm({ ...form, read_time: parseInt(e.target.value) || 5 })}
                      min={1}
                      max={60}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={form.tagsInput}
                    onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
                    placeholder="hydration, water, health"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="HomeCare AI"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Image URL (optional)</label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                    <span className="text-sm text-gray-300">Publish immediately</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded accent-purple-500"
                    />
                    <span className="text-sm text-gray-300">Mark as featured</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#1a1a1a] sticky bottom-0 bg-[#111111] -mx-6 px-6 -mb-6 pb-6">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm() }}
                    disabled={saving}
                    className="flex-1 py-3 rounded-lg bg-[#1a1a1a] text-gray-300 font-medium hover:bg-[#222] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : (editingArticle ? '💾 Update Article' : '✨ Create Article')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  }
  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}
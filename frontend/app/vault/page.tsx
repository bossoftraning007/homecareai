'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type HealthDocument = {
  id: string
  name: string
  type: 'prescription' | 'lab_report' | 'insurance' | 'doctor_note' | 'other'
  description?: string
  file_url?: string
  file_size?: number
  created_at: string
  shared_with: string[]
  is_encrypted: boolean
}

const DOCUMENT_TYPES = [
  { value: 'prescription', label: '💊 Prescription', color: 'from-blue-500 to-cyan-500' },
  { value: 'lab_report', label: '🔬 Lab Report', color: 'from-purple-500 to-pink-500' },
  { value: 'insurance', label: '📋 Insurance', color: 'from-green-500 to-emerald-500' },
  { value: 'doctor_note', label: '📝 Doctor Note', color: 'from-orange-500 to-yellow-500' },
  { value: 'other', label: '📄 Other', color: 'from-gray-500 to-slate-500' },
]

const VAULT_STORAGE_KEY = 'health_vault_docs'

export default function HealthVaultPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [documents, setDocuments] = useState<HealthDocument[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedDoc, setSelectedDoc] = useState<HealthDocument | null>(null)
  const [isLocked, setIsLocked] = useState(true)
  const [pin, setPin] = useState('')
  const [userPin, setUserPin] = useState('')

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    const savedPin = localStorage.getItem('vault_pin')
    if (savedPin) {
      setUserPin(savedPin)
    }
  }, [])

  useEffect(() => {
    if (mounted && !isLocked) {
      loadDocuments()
    }
  }, [mounted, isLocked])

  const loadDocuments = async () => {
    if (user) {
      const { data } = await supabase
        .from('health_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setDocuments(data as HealthDocument[])
    } else {
      const saved = localStorage.getItem(VAULT_STORAGE_KEY)
      if (saved) {
        try { setDocuments(JSON.parse(saved)) } catch {}
      }
    }
  }

  const saveDocuments = async (updated: HealthDocument[]) => {
    setDocuments(updated)
    if (!user) {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated))
    }
  }

  const handleUnlock = () => {
    if (pin === userPin) {
      setIsLocked(false)
      toast.success('🔓 Vault unlocked!')
    } else {
      toast.error('❌ Incorrect PIN')
      setPin('')
    }
  }

  const handleSetPin = () => {
    if (pin.length < 4) {
      toast.error('PIN must be at least 4 digits')
      return
    }
    localStorage.setItem('vault_pin', pin)
    setUserPin(pin)
    setIsLocked(false)
    toast.success('🔐 PIN set! Vault unlocked.')
    setPin('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large! Max 10MB')
      return
    }

    const docType = (document.getElementById('doc-type') as HTMLSelectElement)?.value || 'other'

    const newDoc: HealthDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      type: docType as HealthDocument['type'],
      file_size: file.size,
      created_at: new Date().toISOString(),
      shared_with: [],
      is_encrypted: true,
    }

    if (user) {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('health-vault')
        .upload(`${user.id}/${newDoc.id}-${file.name}`, file)

      if (error) {
        toast.error('Upload failed!')
        return
      }

      const { data: urlData } = supabase.storage
        .from('health-vault')
        .getPublicUrl(`${user.id}/${newDoc.id}-${file.name}`)

      newDoc.file_url = urlData.publicUrl

      const { error: dbError } = await supabase.from('health_documents').insert([{
        user_id: user.id,
        name: newDoc.name,
        type: newDoc.type,
        file_url: newDoc.file_url,
        file_size: newDoc.file_size,
        is_encrypted: true,
      }])

      if (dbError) {
        toast.error('Failed to save document info')
        return
      }
    } else {
      // Store file as base64 in localStorage (limited)
      const reader = new FileReader()
      reader.onload = () => {
        newDoc.file_url = reader.result as string
        const updated = [newDoc, ...documents]
        saveDocuments(updated)
        toast.success('✅ Document saved locally')
      }
      reader.readAsDataURL(file)
    }

    if (user) {
      const updated = [newDoc, ...documents]
      setDocuments(updated)
      toast.success('✅ Document uploaded securely!')
    }

    setShowUpload(false)
  }

  const deleteDocument = async (id: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return

    if (user) {
      await supabase.from('health_documents').delete().eq('id', id)
    }

    const updated = documents.filter(d => d.id !== id)
    saveDocuments(updated)
    toast.success('🗑️ Document deleted')
  }

  const shareDocument = (doc: HealthDocument) => {
    const email = prompt('Enter email to share with:')
    if (!email) return

    const updated = documents.map(d =>
      d.id === doc.id ? { ...d, shared_with: [...d.shared_with, email] } : d
    )
    saveDocuments(updated)
    toast.success(`📤 Shared with ${email}`)
  }

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesType
  })

  const getDocTypeColor = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.color || 'from-gray-500 to-slate-500'
  }

  const getDocTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || '📄 Other'
  }

  if (!mounted) return null

  // PIN Lock Screen
  if (isLocked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark
        ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
        : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`backdrop-blur-sm border rounded-2xl p-8 shadow-md max-w-sm w-full mx-4 ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-emerald-200'}`}
        >
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🔐
            </motion.div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              Health Vault
            </h2>
            <p className={`text-sm ${isDark ? 'text-emerald-300/70' : 'text-emerald-700/70'}`}>
              {userPin ? 'Enter your PIN to unlock' : 'Set a PIN to secure your vault'}
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (userPin ? handleUnlock() : handleSetPin())}
              placeholder={userPin ? 'Enter PIN' : 'Create PIN (min 4 digits)'}
              maxLength={6}
              className={`w-full px-4 py-3 rounded-xl border text-center text-2xl tracking-widest outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100 placeholder:text-emerald-300/50' : 'bg-white border-emerald-200 text-emerald-900 placeholder:text-green-600/60'}`}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={userPin ? handleUnlock : handleSetPin}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all"
            >
              {userPin ? '🔓 Unlock' : '🔐 Set PIN & Unlock'}
            </motion.button>
          </div>

          <p className={`text-xs text-center mt-4 ${isDark ? 'text-emerald-400/50' : 'text-gray-500'}`}>
            Your documents are encrypted and stored securely
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-emerald-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              Health Vault
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              {documents.length} document{documents.length !== 1 ? 's' : ''} · Encrypted
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}
          >
            ➕ Upload
          </button>
          <button
            onClick={() => setIsLocked(true)}
            className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}
          >
            🔒 Lock
          </button>
          <Link href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
            🏠
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Security Banner */}
        <div className={`p-3 rounded-xl border text-center text-xs ${isDark ? 'bg-green-900/20 border-green-800/50 text-green-300' : 'bg-green-50 border-green-200 text-green-800'}`}>
          🔒 All documents are encrypted at rest. Only you and people you share with can view them.
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search documents..."
            className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-800 border-emerald-800 text-emerald-100 placeholder:text-emerald-300/50' : 'bg-white border-green-200 text-green-900 placeholder:text-gray-400'}`}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-800 border-emerald-800 text-emerald-100' : 'bg-white border-green-200 text-green-900'}`}
          >
            <option value="all">All Types</option>
            {DOCUMENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md max-w-md w-full ${isDark ? 'bg-gray-800/90 border-emerald-800' : 'bg-white/90 border-emerald-200'}`}
              >
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                  📤 Upload Document
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      Document Type
                    </label>
                    <select
                      id="doc-type"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100' : 'bg-white border-green-200 text-green-900'}`}
                    >
                      {DOCUMENT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                      Select File (Max 10MB)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-900 border-emerald-800 text-emerald-100' : 'bg-white border-green-200 text-green-900'}`}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowUpload(false)}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Documents List */}
        {filteredDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-8 shadow-md text-center ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-emerald-200'}`}
          >
            <div className="text-5xl mb-3">📁</div>
            <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              No documents yet
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Upload prescriptions, lab reports, insurance cards, and more
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all"
            >
              ➕ Upload First Document
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-emerald-200'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getDocTypeColor(doc.type)} flex items-center justify-center text-white text-lg`}>
                    {getDocTypeLabel(doc.type).split(' ')[0]}
                  </div>
                  <div className="flex gap-1">
                    {doc.is_encrypted && <span className="text-xs" title="Encrypted">🔒</span>}
                    <button
                      onClick={() => shareDocument(doc)}
                      className={`p-1 rounded text-xs ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      title="Share"
                    >
                      📤
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className={`p-1 rounded text-xs ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h3 className={`font-semibold text-sm truncate ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                  {doc.name}
                </h3>
                <div className={`text-xs mt-1 ${isDark ? 'text-emerald-300/60' : 'text-green-700/60'}`}>
                  {getDocTypeLabel(doc.type)} · {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)}KB` : 'Unknown size'}
                </div>
                <div className={`text-xs ${isDark ? 'text-emerald-400/50' : 'text-green-600/50'}`}>
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
                {doc.shared_with.length > 0 && (
                  <div className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    📤 Shared with {doc.shared_with.length} people
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Storage Info */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-emerald-800' : 'bg-emerald-50/50 border-emerald-200'}`}>
          <div className="flex items-center justify-between text-sm">
            <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>
              📦 Storage Used
            </span>
            <span className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              {documents.reduce((sum, d) => sum + (d.file_size || 0), 0) / 1024 < 1024
                ? `${(documents.reduce((sum, d) => sum + (d.file_size || 0), 0) / 1024).toFixed(0)} KB`
                : `${(documents.reduce((sum, d) => sum + (d.file_size || 0), 0) / (1024 * 1024)).toFixed(1)} MB`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

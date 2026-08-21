'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type UserRole = {
  id: string
  user_id: string
  email: string
  full_name: string
  role: 'owner' | 'admin' | 'caregiver' | 'viewer'
  permissions: string[]
  created_at: string
}

const ROLES = [
  {
    value: 'owner',
    label: '👑 Owner',
    description: 'Full access to all data and settings',
    color: 'from-purple-500 to-indigo-600',
    permissions: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'manage_settings', 'view_sos', 'view_health', 'view_medications'],
  },
  {
    value: 'admin',
    label: '🛡️ Admin',
    description: 'Can manage users and view all data',
    color: 'from-blue-500 to-cyan-600',
    permissions: ['view_all', 'edit_all', 'manage_users', 'view_sos', 'view_health', 'view_medications'],
  },
  {
    value: 'caregiver',
    label: '💚 Caregiver',
    description: 'Can view health data and receive alerts',
    color: 'from-green-500 to-emerald-600',
    permissions: ['view_health', 'view_medications', 'view_sos', 'receive_alerts'],
  },
  {
    value: 'viewer',
    label: '👁️ Viewer',
    description: 'Read-only access to shared data',
    color: 'from-gray-500 to-slate-600',
    permissions: ['view_health'],
  },
]

const PERMISSION_LABELS: Record<string, string> = {
  view_all: 'View All Data',
  edit_all: 'Edit All Data',
  delete_all: 'Delete Data',
  manage_users: 'Manage Users',
  manage_settings: 'Manage Settings',
  view_sos: 'View SOS Alerts',
  view_health: 'View Health Data',
  view_medications: 'View Medications',
  receive_alerts: 'Receive Alerts',
}

export default function AccessControlPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [loading, setLoading] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    if (user) {
      loadUserRoles()
    }
  }, [user])

  const loadUserRoles = async () => {
    if (!user) return

    const { data: profile } = await supabase
      .from('caregiver_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      setUserRoles([{
        id: profile.id,
        user_id: profile.user_id,
        email: user.email || '',
        full_name: profile.full_name || user.email || '',
        role: profile.role || 'viewer',
        permissions: profile.permissions || [],
        created_at: profile.created_at || new Date().toISOString(),
      }])
    }
  }

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) {
      toast.error('Enter an email address')
      return
    }

    setLoading(true)
    try {
      const selectedRole = ROLES.find(r => r.value === inviteRole)
      if (!selectedRole) return

      const { error } = await supabase.from('user_invites').insert([{
        inviter_id: user!.id,
        invitee_email: inviteEmail,
        role: inviteRole,
        permissions: selectedRole.permissions,
        status: 'pending',
      }])

      if (error) {
        toast.error('Failed to send invite')
        return
      }

      toast.success(`📨 Invite sent to ${inviteEmail}`)
      setInviteEmail('')
      setShowInvite(false)
    } catch {
      toast.error('Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    const roleConfig = ROLES.find(r => r.value === newRole)
    if (!roleConfig) return

    const { error } = await supabase
      .from('caregiver_profiles')
      .update({ role: newRole, permissions: roleConfig.permissions })
      .eq('user_id', userId)

    if (error) {
      toast.error('Failed to update role')
      return
    }

    setUserRoles(prev =>
      prev.map(u => u.user_id === userId ? { ...u, role: newRole as any, permissions: roleConfig.permissions } : u)
    )
    toast.success('✅ Role updated!')
  }

  const removeUser = async (userId: string) => {
    if (!confirm('Remove this user? They will lose all access.')) return

    const { error } = await supabase
      .from('caregiver_profiles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      toast.error('Failed to remove user')
      return
    }

    setUserRoles(prev => prev.filter(u => u.user_id !== userId))
    toast.success('User removed')
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-950'
      : 'bg-gradient-to-br from-purple-50 via-white to-indigo-50'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-purple-900' : 'bg-white/70 border-purple-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
              Access Control
            </div>
            <div className={`text-xs ${isDark ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
              {userRoles.length} user{userRoles.length !== 1 ? 's' : ''} with access
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInvite(true)}
            className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-purple-800 text-purple-300' : 'bg-white/70 border-purple-200 text-purple-700'}`}
          >
            ➕ Invite
          </button>
          <Link href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-purple-800 text-purple-300' : 'bg-white/70 border-purple-200 text-purple-700'}`}>
            🏠
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Privacy Shield Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>Privacy Shield Active</h3>
              <p className={`text-sm ${isDark ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                Control exactly who can see your health data and what they can do with it.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Roles Overview */}
        <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-purple-800' : 'bg-white/70 border-purple-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
            👥 Users & Roles
          </h2>

          {/* Invite Form */}
          {showInvite && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-4 rounded-xl border border-purple-200"
            >
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>Invite New User</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email address"
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-purple-800 text-purple-100' : 'bg-white border-purple-200 text-purple-900'}`}
                  required
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-purple-800 text-purple-100' : 'bg-white border-purple-200 text-purple-900'}`}
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowInvite(false)} className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium">Cancel</button>
                  <button type="submit" onClick={sendInvite} disabled={loading} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          {userRoles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">👤</div>
              <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
                No users yet
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                Invite family members or caregivers to share access
              </p>
              <button
                onClick={() => setShowInvite(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 shadow-md transition-all"
              >
                ➕ Invite First User
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userRoles.map(userRole => {
                const roleConfig = ROLES.find(r => r.value === userRole.role) || ROLES[3]
                return (
                  <motion.div
                    key={userRole.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/50 border-purple-900' : 'bg-white/50 border-purple-100'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleConfig.color} flex items-center justify-center text-white font-bold`}>
                          {userRole.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-semibold ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
                            {userRole.full_name}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                            {userRole.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${roleConfig.color} text-white`}>
                          {roleConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {userRole.permissions.map(perm => (
                        <span
                          key={perm}
                          className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-700'}`}
                        >
                          {PERMISSION_LABELS[perm] || perm}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    {userRole.user_id !== user?.id && (
                      <div className="flex gap-2">
                        <select
                          value={userRole.role}
                          onChange={(e) => updateUserRole(userRole.user_id, e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-gray-900 border-purple-800 text-purple-100' : 'bg-white border-purple-200 text-purple-900'}`}
                        >
                          {ROLES.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeUser(userRole.user_id)}
                          className="px-3 py-2 rounded-lg bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Roles Explanation */}
        <div className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md ${isDark ? 'bg-gray-800/70 border-purple-800' : 'bg-white/70 border-purple-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
            📖 Role Permissions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLES.map(role => (
              <div key={role.value} className={`p-3 rounded-xl border ${isDark ? 'bg-gray-900/50 border-purple-900' : 'bg-white/50 border-purple-100'}`}>
                <div className={`flex items-center gap-2 mb-2`}>
                  <span className={`text-lg font-bold px-2 py-1 rounded-lg bg-gradient-to-r ${role.color} text-white`}>
                    {role.label}
                  </span>
                </div>
                <p className={`text-xs mb-2 ${isDark ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                  {role.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map(perm => (
                    <span key={perm} className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-50 text-purple-600'}`}>
                      {PERMISSION_LABELS[perm] || perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

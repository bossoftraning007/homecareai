"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/useAuth"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Plus, AlertCircle, CheckCircle2, Clock, X, Heart, Activity } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://homecareai-backend.onrender.com"

const RELATIONSHIPS = [
  { value: "self", label: "Self", icon: "👤" },
  { value: "spouse", label: "Spouse", icon: "💑" },
  { value: "child", label: "Child", icon: "🧒" },
  { value: "parent", label: "Parent", icon: "👴" },
  { value: "sibling", label: "Sibling", icon: "👫" },
  { value: "grandparent", label: "Grandparent", icon: "👵" },
  { value: "other", label: "Other", icon: "👥" },
]

const COLORS = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "rose", label: "Rose", class: "bg-rose-500" },
  { value: "emerald", label: "Emerald", class: "bg-emerald-500" },
  { value: "amber", label: "Amber", class: "bg-amber-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
]

export default function FamilyPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [warRoom, setWarRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    loadFamily()
  }, [user, authLoading])

  async function loadFamily() {
    try {
      if (!user) return
      setLoading(true)
      const { data } = await axios.get(`${API_URL}/api/family/war-room`, {
        headers: { "x-user-id": user.id },
      })
      setWarRoom(data)
    } catch (e) {
      console.error(e)
      toast.error("Failed to load family data")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading family war room...</p>
        </div>
      </div>
    )
  }

  const members = warRoom?.members || []
  const alerts = warRoom?.alerts || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="w-10 h-10 text-blue-600" />
              Family Health War Room
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Monitor your entire family's health in one place
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Family Members"
            value={warRoom?.total_members || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Healthy"
            value={warRoom?.healthy || 0}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            label="Warnings"
            value={warRoom?.warnings || 0}
            icon={AlertCircle}
            color="amber"
          />
          <StatCard
            label="Critical"
            value={warRoom?.critical || 0}
            icon={AlertCircle}
            color="rose"
          />
        </div>

        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              Active Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map((alert: any, i: number) => (
                <AlertCard key={i} alert={alert} />
              ))}
            </div>
          </motion.div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Family Members</h2>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                No family members yet. Add your first member to start monitoring.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member: any) => (
                <MemberCard key={member.id} member={member} onDelete={loadFamily} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <AddMemberModal
            onClose={() => setShowAdd(false)}
            onAdded={() => {
              setShowAdd(false)
              loadFamily()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-5 text-white shadow-lg`}>
      <Icon className="w-7 h-7 opacity-80 mb-2" />
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  )
}

function AlertCard({ alert }: any) {
  const severityStyles: any = {
    critical: "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
    warning: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
    info: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  }
  const iconColors: any = {
    critical: "text-rose-600",
    warning: "text-amber-600",
    info: "text-blue-600",
  }
  return (
    <div className={`border-l-4 ${severityStyles[alert.severity] || severityStyles.info} rounded-lg p-4 flex items-center gap-3`}>
      <AlertCircle className={`w-5 h-5 ${iconColors[alert.severity] || iconColors.info} flex-shrink-0`} />
      <div className="flex-1">
        <div className="font-semibold text-slate-900 dark:text-white">
          {alert.member_name} — {alert.title}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">{alert.description}</div>
      </div>
      <span className="text-xs font-semibold uppercase text-slate-500">{alert.severity}</span>
    </div>
  )
}

function MemberCard({ member, onDelete }: any) {
  const { user } = useAuth()
  const summary = member.health_summary || {}
  const score = summary.health_score
  const initials = member.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
  const rel = RELATIONSHIPS.find(r => r.value === member.relationship)
  const colorClass = COLORS.find(c => c.value === member.avatar_color)?.class || "bg-blue-500"

  async function handleDelete() {
    if (!confirm(`Remove ${member.full_name}?`)) return
    if (!user) return
    try {
      await axios.delete(`${API_URL}/api/family/${member.id}`, {
        headers: { "x-user-id": user.id },
      })
      toast.success("Member removed")
      onDelete()
    } catch {
      toast.error("Failed to remove")
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
            {initials}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{member.full_name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{rel?.icon} {rel?.label || "Other"}</div>
          </div>
        </div>
        <button onClick={handleDelete} className="text-slate-400 hover:text-rose-500">
          <X className="w-4 h-4" />
        </button>
      </div>
      {score != null && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Heart className="w-4 h-4" /> Health
          </span>
          <span className={`font-bold ${
            score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-rose-600"
          }`}>
            {score}/100
          </span>
        </div>
      )}
      {summary.last_logged && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last log</span>
          <span>{summary.last_logged}</span>
        </div>
      )}
      {summary.alerts && summary.alerts.length > 0 && (
        <div className="mt-2 text-xs text-amber-600 font-semibold flex items-center gap-1">
          <Activity className="w-3 h-3" /> {summary.alerts.length} alert{summary.alerts.length > 1 ? "s" : ""}
        </div>
      )}
    </motion.div>
  )
}

function AddMemberModal({ onClose, onAdded }: any) {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [relationship, setRelationship] = useState("child")
  const [email, setEmail] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [color, setColor] = useState("blue")
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name.trim()) {
      toast.error("Name required")
      return
    }
    if (!user) return
    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/family`, {
        full_name: name,
        relationship,
        member_email: email || null,
        date_of_birth: dob || null,
        gender: gender || null,
        avatar_color: color,
      }, { headers: { "x-user-id": user.id } })
      toast.success("Member added")
      onAdded()
    } catch (e) {
      toast.error("Failed to add member")
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Add Family Member</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="e.g., Priya Sharma"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
            <div className="grid grid-cols-4 gap-2">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRelationship(r.value)}
                  className={`p-2 rounded-lg border text-sm ${
                    relationship === r.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  <div className="text-xl">{r.icon}</div>
                  <div className="text-xs">{r.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="member@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Avatar Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-9 h-9 rounded-full ${c.class} ${
                    color === c.value ? "ring-4 ring-offset-2 ring-blue-500" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Member"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

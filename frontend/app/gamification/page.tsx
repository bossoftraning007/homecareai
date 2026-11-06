"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/useAuth"
import axios from "axios"
import { motion } from "framer-motion"
import { Trophy, Flame, Star, Medal, BarChart3, Bell, Share2, User } from "lucide-react"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://homecareai-backend.onrender.com"

const AVATAR_GRADIENTS = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-teal-500",
  "from-emerald-500 to-lime-500",
  "from-rose-500 to-orange-500",
  "from-indigo-500 to-purple-500",
]

const CHALLENGES = [
  { id: "daily_log", title: "Log Your Health", desc: "Log wellness data today", xp: 20, icon: "📊" },
  { id: "daily_vital", title: "Track Vitals", desc: "Log a vital sign", xp: 25, icon: "💓" },
  { id: "symptom_check", title: "Symptom Tracker", desc: "Use Symptom Time Machine", xp: 30, icon: "🔍" },
  { id: "remedy_try", title: "Try a Remedy", desc: "Log a kitchen remedy", xp: 15, icon: "🌿" },
  { id: "weekly_streak", title: "7-Day Streak", desc: "Maintain weekly consistency", xp: 100, icon: "🔥" },
]

export default function GamifiedDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    loadProfile()
    loadLeaderboard()
  }, [user, authLoading])

  async function loadProfile() {
    if (!user) return
    try {
      const { data } = await axios.get(`${API_URL}/api/gamification/profile`, {
        headers: { "x-user-id": user.id },
      })
      setProfile(data)
    } catch (e) {
      console.error("Failed to load gamification profile", e)
    } finally {
      setLoading(false)
    }
  }

  async function loadLeaderboard() {
    if (!user) return
    try {
      const { data } = await axios.get(`${API_URL}/api/gamification/leaderboard`, {
        headers: { "x-user-id": user.id },
      })
      setLeaderboard(data.leaderboard || [])
    } catch (e) {
      console.error("Failed to load leaderboard", e)
    }
  }

  async function completeChallenge(challengeId: string) {
    if (!user) return
    if (completedToday.has(challengeId)) return
    try {
      const { data } = await axios.post(`${API_URL}/api/gamification/complete-challenge`, {
        challenge_id: challengeId,
      }, {
        headers: { "x-user-id": user.id },
      })
      setCompletedToday(prev => new Set([...prev, challengeId]))
      setProfile((prev: any) => ({
        ...prev,
        total_xp: (prev?.total_xp || 0) + (data.xp_gained || 0),
      }))
      if (data.level_up) {
        animateLevelUp()
      }
    } catch (e) {
      console.error("Failed to complete challenge", e)
    }
  }

  function animateLevelUp() {
    const confetti = document.createElement("div")
    confetti.innerHTML = "🎉".repeat(50)
    confetti.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;font-size:24px;text-align:center"
    document.body.appendChild(confetti)
    setTimeout(() => confetti.remove(), 3000)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-400">Loading your health journey...</p>
        </div>
      </div>
    )
  }

  const xp = profile?.total_xp || 0
  const levelName = profile?.level_name || "Bronze"
  const levelIndex = profile?.level_index || 0
  const xpToNext = profile?.xp_to_next_level || 1000
  const xpPercent = profile?.xp_percent || 0
  const streak = profile?.current_streak || 0
  const badges = profile?.badges || []

  const avatarGradient = AVATAR_GRADIENTS[levelIndex % AVATAR_GRADIENTS.length]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with avatar + stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-2xl font-bold shadow-xl`}
            >
              {user?.email?.split("@")[0]?.slice(0, 2).toUpperCase()}
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Health Warrior
              </h1>
              <p className="text-slate-400">Level {levelName} • {xp.toLocaleString()} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/gamification/leaderboard")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              Leaderboard
            </button>
            <button
              onClick={() => router.push("/notifications")}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              <Bell className="w-5 h-5 text-blue-400" />
            </button>
          </div>
        </motion.div>

        {/* XP Progress Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1 }}
          className="bg-slate-800 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-bold">Level {levelName}</span>
            </div>
            <span className="text-sm text-slate-400">
              {xp % 1000}/{1000} XP to {LEVELS[levelIndex + 1] || "MORE"}
            </span>
          </div>
          <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {Math.round(xpPercent)}%
            </div>
          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-400">
            {LEVELS.map((lvl, i) => (
              <div key={lvl} className={`text-center ${i === levelIndex ? "text-white font-bold" : ""}`}>
                {lvl}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Streak + Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 text-center shadow-xl"
          >
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-3xl font-bold">{streak}</div>
            <div className="text-sm text-orange-100">Day Streak</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 text-center shadow-xl"
          >
            <BarChart3 className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
            <div className="text-3xl font-bold">{xp.toLocaleString()}</div>
            <div className="text-sm text-blue-100">Total XP</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-center shadow-xl"
          >
            <Medal className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
            <div className="text-3xl font-bold">{badges.length}</div>
            <div className="text-sm text-emerald-100">Badges</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-4 text-center shadow-xl cursor-pointer"
            onClick={() => router.push("/goals")}
          >
            <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
            <div className="text-3xl font-bold">🏆</div>
            <div className="text-sm text-pink-100">Goals</div>
          </motion.div>
        </div>

        {/* Badges showcase */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              Your Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge: string, i: number) => (
                <motion.div
                  key={badge}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg"
                >
                  🏆 {badge}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Daily Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Daily Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHALLENGES.map((c, i) => {
              const completed = completedToday.has(c.id)
              return (
                <motion.button
                  key={c.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => completeChallenge(c.id)}
                  disabled={completed}
                  className={`p-4 rounded-xl text-left transition-all ${
                    completed
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500"
                      : "bg-slate-700 hover:bg-slate-600 border border-slate-600"
                  }}`}
                >
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <h3 className="font-bold">{c.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{c.desc}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">+{c.xp} XP</span>
                  </div>
                  {completed && (
                    <div className="mt-2 text-xs text-emerald-400 font-bold">✓ COMPLETED</div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Leaderboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Top Warriors
            </span>
            <button
              onClick={() => router.push("/gamification/leaderboard")}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All →
            </button>
          </h2>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  i === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black" :
                  i === 1 ? "bg-gradient-to-r from-gray-300 to-gray-400 text-black" :
                  i === 2 ? "bg-gradient-to-r from-amber-700 to-orange-600 text-black" :
                  "bg-slate-700 text-slate-400"
                }`}>
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                  {u.name?.split(" ").map((n: string) => n[0]).join("") || "??"}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-slate-400">{u.level}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{u.xp.toLocaleString()}</div>
                  <div className="text-xs text-orange-400">🔥{u.streak}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {[
            { icon: "💬", label: "Chat AI", href: "/chat" },
            { icon: "🔍", label: "Symptom Check", href: "/symptom-timeline" },
            { icon: "🌿", label: "Kitchen Remedies", href: "/kitchen" },
            { icon: "📊", label: "My Journey", href: "/journey" },
            { icon: "👨‍👩‍👧", label: "My Family", href: "/family" },
          ].map((action) => (
            <motion.button
              key={action.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(action.href)}
              className="py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-center transition-all"
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <div className="text-sm font-medium">{action.label}</div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

const LEVELS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]

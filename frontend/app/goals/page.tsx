'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

type Goal = {
  id: string
  goal_type: string
  target_value: number
  current_streak: number
  longest_streak: number
  xp_points: number
  level: string
  is_active: boolean
}

const GOAL_TEMPLATES = [
  { type: 'water', label: 'Drink Water', unit: 'glasses', target: 8, icon: '💧', color: 'blue' },
  { type: 'sleep', label: 'Sleep Well', unit: 'hours', target: 8, icon: '💤', color: 'indigo' },
  { type: 'steps', label: 'Daily Steps', unit: 'steps', target: 10000, icon: '🚶', color: 'green' },
  { type: 'mood_log', label: 'Log Mood', unit: 'days', target: 1, icon: '😊', color: 'pink' },
  { type: 'exercise', label: 'Exercise', unit: 'minutes', target: 30, icon: '🏃', color: 'orange' },
  { type: 'meds', label: 'Take Meds', unit: 'doses', target: 1, icon: '💊', color: 'purple' },
]

const LEVEL_THRESHOLDS = [
  { name: 'Bronze', icon: '🥉', min: 0, color: 'amber' },
  { name: 'Silver', icon: '🥈', min: 200, color: 'gray' },
  { name: 'Gold', icon: '🥇', min: 500, color: 'yellow' },
  { name: 'Diamond', icon: '💎', min: 1000, color: 'cyan' },
]

const BADGES = [
  { name: 'Hydration Hero', icon: '💧', desc: '7-day water streak', requirement: 7, goalType: 'water' },
  { name: 'Sleep Master', icon: '😴', desc: '14 days of 7+ hours sleep', requirement: 14, goalType: 'sleep' },
  { name: 'Step Champion', icon: '🚶', desc: '30-day step goal', requirement: 30, goalType: 'steps' },
  { name: 'Mood Tracker', icon: '😊', desc: '30 days of mood logs', requirement: 30, goalType: 'mood_log' },
  { name: 'Fitness Fanatic', icon: '🏋️', desc: '60 days of exercise', requirement: 60, goalType: 'exercise' },
  { name: 'Medication Pro', icon: '💊', desc: '30 days of perfect adherence', requirement: 30, goalType: 'meds' },
]

export default function GoalsPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof GOAL_TEMPLATES[0] | null>(null)
  const [targetValue, setTargetValue] = useState(8)
  const [showShareModal, setShowShareModal] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  const [freezesAvailable, setFreezesAvailable] = useState(1)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadGoals()
  }, [mounted, user])

  const loadGoals = async () => {
    if (!user) {
      setGoals(getDemoGoals())
      setTotalXP(450)
      setFreezesAvailable(2)
      return
    }

    const { data } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (data) {
      setGoals(data as Goal[])
      setTotalXP(data.reduce((sum, g) => sum + (g.xp_points || 0), 0))
    }

    const { data: freezeData } = await supabase
      .from('streak_freezes')
      .select('freezes_available')
      .eq('user_id', user.id)
      .single()

    if (freezeData) setFreezesAvailable(freezeData.freezes_available)
  }

  const getDemoGoals = (): Goal[] => [
    { id: '1', goal_type: 'water', target_value: 8, current_streak: 5, longest_streak: 12, xp_points: 50, level: 'Bronze', is_active: true },
    { id: '2', goal_type: 'sleep', target_value: 8, current_streak: 3, longest_streak: 7, xp_points: 30, level: 'Bronze', is_active: true },
    { id: '3', goal_type: 'mood_log', target_value: 1, current_streak: 12, longest_streak: 25, xp_points: 120, level: 'Bronze', is_active: true },
    { id: '4', goal_type: 'exercise', target_value: 30, current_streak: 0, longest_streak: 5, xp_points: 25, level: 'Bronze', is_active: true },
  ]

  const currentLevel = LEVEL_THRESHOLDS.slice().reverse().find(l => totalXP >= l.min) || LEVEL_THRESHOLDS[0]
  const nextLevel = LEVEL_THRESHOLDS.find(l => l.min > totalXP)
  const xpToNext = nextLevel ? nextLevel.min - totalXP : 0
  const progressToNext = nextLevel ? ((totalXP - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100

  const handleAddGoal = async () => {
    if (!selectedTemplate) return

    const goal = {
      user_id: user?.id,
      goal_type: selectedTemplate.type,
      target_value: targetValue,
      current_streak: 0,
      longest_streak: 0,
      xp_points: 0,
      level: 'Bronze',
      is_active: true,
    }

    if (user) {
      await supabase.from('health_goals').upsert(goal, { onConflict: 'user_id,goal_type' })
    }

    loadGoals()
    setShowAddModal(false)
    setSelectedTemplate(null)
    toast.success(`${selectedTemplate.label} goal added!`, { icon: selectedTemplate.icon })
  }

  const handleUseFreeze = async () => {
    if (freezesAvailable <= 0) {
      toast.error('No freezes available!')
      return
    }

    if (user) {
      await supabase
        .from('streak_freezes')
        .update({ freezes_available: freezesAvailable - 1 })
        .eq('user_id', user.id)
    }

    setFreezesAvailable(freezesAvailable - 1)
    toast.success('❄️ Streak freeze used!', { icon: '❄️' })
  }

  const getGoalTemplate = (type: string) => GOAL_TEMPLATES.find(g => g.type === type)

  const earnedBadges = BADGES.filter(b => {
    const goal = goals.find(g => g.goal_type === b.goalType)
    return goal && goal.current_streak >= b.requirement
  })

  const handleShare = (platform: string) => {
    toast.success(`Sharing to ${platform}!`, { icon: '🎉' })
    setShowShareModal(false)
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-yellow-950 to-orange-950'
      : 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/80 border-yellow-900' : 'bg-white/80 border-yellow-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
              Health Goals
            </div>
            <div className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
              Build healthy habits
            </div>
          </div>
        </div>
        <a href="/dashboard" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-yellow-800 text-yellow-300' : 'bg-white/70 border-yellow-200 text-yellow-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-md border rounded-2xl p-5 shadow-lg bg-gradient-to-br ${
            isDark
              ? 'from-yellow-900/40 to-orange-900/40 border-yellow-700'
              : 'from-yellow-100 to-orange-100 border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className={`text-xs font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                YOUR LEVEL
              </div>
              <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentLevel.icon} {currentLevel.name}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                TOTAL XP
              </div>
              <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {totalXP}
              </div>
            </div>
          </div>

          {nextLevel && (
            <>
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Progress to {nextLevel.icon} {nextLevel.name}
                </span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {xpToNext} XP to go
                </span>
              </div>
              <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500`}
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUseFreeze}
              disabled={freezesAvailable <= 0}
              className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                freezesAvailable > 0
                  ? 'bg-cyan-500 text-white'
                  : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
              }`}
            >
              ❄️ Use Streak Freeze ({freezesAvailable})
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white"
            >
              📤 Share Progress
            </button>
          </div>
        </motion.div>

        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-md border rounded-2xl p-4 shadow-lg ${isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-300'}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <h3 className={`font-bold ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
              Daily Challenge
            </h3>
          </div>
          <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
            Walk <strong>2,000 extra steps today</strong> to earn <strong>20 bonus XP</strong>!
          </p>
          <div className="mt-2 h-2 rounded-full bg-purple-200 overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: '60%' }}></div>
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            1,200 / 2,000 steps
          </div>
        </motion.div>

        {/* Goals List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🎯 Your Active Goals
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className={`text-center py-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-yellow-800' : 'bg-white/50 border-yellow-200'}`}>
                <div className="text-4xl mb-2">🎯</div>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>No goals yet. Add your first!</p>
              </div>
            ) : (
              goals.map((goal) => {
                const template = getGoalTemplate(goal.goal_type)
                if (!template) return null
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`backdrop-blur-md border rounded-2xl p-4 shadow-lg ${isDark ? 'bg-gray-800/70 border-yellow-800' : 'bg-white/80 border-yellow-200'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-3xl">{template.icon}</div>
                      <div className="flex-1">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {template.label}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Target: {goal.target_value} {template.unit}/day
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-orange-500">
                          {goal.current_streak}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          🔥 streak
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        Best: {goal.longest_streak} days
                      </span>
                      <span className={`px-2 py-1 rounded-full ${isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                        +{goal.xp_points} XP
                      </span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🏆 Badges
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {BADGES.map((badge) => {
              const earned = earnedBadges.some(b => b.name === badge.name)
              return (
                <div
                  key={badge.name}
                  className={`p-3 rounded-xl text-center border ${
                    earned
                      ? isDark ? 'bg-yellow-900/30 border-yellow-600' : 'bg-yellow-50 border-yellow-400'
                      : isDark ? 'bg-gray-800/30 border-gray-700 opacity-50' : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className={`text-3xl ${earned ? '' : 'grayscale'}`}>{badge.icon}</div>
                  <div className={`text-xs font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {badge.name}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {badge.desc}
                  </div>
                  {earned && <div className="text-xs text-yellow-500 font-bold mt-1">EARNED</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Choose a Goal
              </h3>

              {!selectedTemplate ? (
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TEMPLATES.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => {
                        setSelectedTemplate(t)
                        setTargetValue(t.target)
                      }}
                      className={`p-3 rounded-xl text-center border ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                    >
                      <div className="text-2xl mb-1">{t.icon}</div>
                      <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.label}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{selectedTemplate.icon}</div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTemplate.label}
                    </div>
                  </div>
                  <label className={`text-sm font-semibold mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Daily target ({selectedTemplate.unit})
                  </label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 rounded-xl border mb-4 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddGoal}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className={`font-bold text-lg mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🎉 Share Your Progress!
              </h3>
              <p className={`text-sm text-center mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                I just hit {currentLevel.name} level with {totalXP} XP on HomeCare AI! 🏆
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['WhatsApp', 'Instagram', 'Twitter', 'Facebook'].map(p => (
                  <button
                    key={p}
                    onClick={() => handleShare(p)}
                    className="py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { useTheme } from "next-themes"
import Link from "next/link"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { useAuth } from "@/lib/useAuth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://homecareai-backend.onrender.com"

type Milestone = {
  id?: string
  title: string
  description: string
  expected_day: number
  expected_hour: number
  improvement_percent: number
  status: string
}

type RecoveryPlan = {
  id: string
  title: string
  symptom: string
  remedy: string
  severity: number
  status: string
  started_at: string
  expected_completion: string
  completed_at?: string
}

type Progress = {
  percent_complete: number
  severity_improvement: number
  current_phase: string
  logs_count: number
  avg_severity: number
  avg_energy: number
  trend: string
}

const SYMPTOMS = [
  { value: "cold", label: "Cold", icon: "🤧" },
  { value: "cough", label: "Cough", icon: "😷" },
  { value: "headache", label: "Headache", icon: "🤕" },
  { value: "fever", label: "Fever", icon: "🌡️" },
  { value: "sore_throat", label: "Sore Throat", icon: "😖" },
  { value: "nausea", label: "Nausea", icon: "🤢" },
  { value: "indigestion", label: "Indigestion", icon: "😣" },
  { value: "fatigue", label: "Fatigue", icon: "😴" },
  { value: "body_pain", label: "Body Pain", icon: "💪" },
  { value: "stress", label: "Stress", icon: "😰" },
]

const REMEDIES = [
  { value: "honey_lemon", label: "Honey Lemon Tea", icon: "🍯" },
  { value: "ginger_tea", label: "Ginger Tea", icon: "🫚" },
  { value: "turmeric_milk", label: "Turmeric Milk", icon: "🥛" },
  { value: "steam_inhalation", label: "Steam Inhalation", icon: "♨️" },
  { value: "peppermint_tea", label: "Peppermint Tea", icon: "🌿" },
  { value: "salt_water_gargle", label: "Salt Water Gargle", icon: "🧂" },
  { value: "hydration", label: "Hydration", icon: "💧" },
  { value: "rest", label: "Rest", icon: "😴" },
  { value: "fennel_tea", label: "Fennel Tea", icon: "🌱" },
  { value: "chamomile_tea", label: "Chamomile Tea", icon: "🌼" },
  { value: "meditation", label: "Meditation", icon: "🧘" },
  { value: "deep_breathing", label: "Deep Breathing", icon: "🫁" },
  { value: "green_tea", label: "Green Tea", icon: "🍵" },
]

export default function RecoveryPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [plans, setPlans] = useState<RecoveryPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<RecoveryPlan | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Create form state
  const [selectedSymptom, setSelectedSymptom] = useState("")
  const [selectedRemedy, setSelectedRemedy] = useState("")
  const [severity, setSeverity] = useState(3)
  const [prediction, setPrediction] = useState<any>(null)

  // Log form state
  const [logSeverity, setLogSeverity] = useState(3)
  const [logEnergy, setLogEnergy] = useState(3)
  const [logNotes, setLogNotes] = useState("")
  const [logRemedyTaken, setLogRemedyTaken] = useState(true)

  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      loadPlans()
    }
  }, [mounted, user])

  useEffect(() => {
    if (selectedPlan) {
      loadPlanDetails(selectedPlan.id)
    }
  }, [selectedPlan])

  const getAuthHeaders = () => {
    return user?.id ? { "x-user-id": user.id } : {}
  }

  const loadPlans = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/recovery/plans`, {
        headers: getAuthHeaders(),
      })
      setPlans(res.data.plans || [])
    } catch {
      // Silently fail for now
    }
  }

  const loadPlanDetails = async (planId: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/recovery/plans/${planId}`, {
        headers: getAuthHeaders(),
      })
      setMilestones(res.data.milestones || [])
      setProgress(res.data.progress || null)
    } catch {
      toast.error("Failed to load plan details")
    }
  }

  const handlePredict = async () => {
    if (!selectedSymptom || !selectedRemedy) {
      toast.error("Please select symptom and remedy")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/recovery/predict`, {
        symptom: selectedSymptom,
        remedy: selectedRemedy,
        severity,
      })
      setPrediction(res.data)
    } catch {
      toast.error("Failed to generate prediction")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async () => {
    if (!selectedSymptom || !selectedRemedy) {
      toast.error("Please select symptom and remedy")
      return
    }

    setLoading(true)
    try {
      await axios.post(
        `${API_URL}/api/recovery/plans`,
        {
          symptom: selectedSymptom,
          remedy: selectedRemedy,
          severity,
        },
        { headers: getAuthHeaders() }
      )
      toast.success("Recovery plan created!")
      setShowCreateForm(false)
      setPrediction(null)
      setSelectedSymptom("")
      setSelectedRemedy("")
      setSeverity(3)
      loadPlans()
    } catch {
      toast.error("Failed to create plan")
    } finally {
      setLoading(false)
    }
  }

  const handleAddLog = async () => {
    if (!selectedPlan) return

    try {
      await axios.post(
        `${API_URL}/api/recovery/plans/${selectedPlan.id}/log`,
        {
          symptom_severity: logSeverity,
          energy_level: logEnergy,
          notes: logNotes,
          remedy_taken: logRemedyTaken,
        },
        { headers: getAuthHeaders() }
      )
      toast.success("Log added!")
      setLogNotes("")
      loadPlanDetails(selectedPlan.id)
    } catch {
      toast.error("Failed to add log")
    }
  }

  const handleCompletePlan = async () => {
    if (!selectedPlan) return

    try {
      await axios.post(
        `${API_URL}/api/recovery/plans/${selectedPlan.id}/complete`,
        {},
        { headers: getAuthHeaders() }
      )
      toast.success("Plan completed! Great job!")
      loadPlans()
      setSelectedPlan(null)
    } catch {
      toast.error("Failed to complete plan")
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return "📈"
      case "worsening":
        return "📉"
      case "stable":
        return "➡️"
      default:
        return "🔄"
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "Stabilization":
        return "from-yellow-500 to-orange-500"
      case "Early Recovery":
        return "from-orange-500 to-amber-500"
      case "Active Healing":
        return "from-amber-500 to-green-500"
      case "Regeneration":
        return "from-green-500 to-emerald-500"
      case "Final Recovery":
        return "from-emerald-500 to-teal-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  if (!mounted) return null

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950"
          : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100"
      }`}
    >
      <Toaster position="top-center" />

      {/* Header */}
      <div
        className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${
          isDark ? "bg-gray-900/70 border-emerald-900" : "bg-white/70 border-green-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧬</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? "text-emerald-200" : "text-green-800"}`}>
              Live Health Twin
            </div>
            <div className={`text-xs ${isDark ? "text-emerald-300/70" : "text-green-700/70"}`}>
              Predictive Recovery Timeline
            </div>
          </div>
        </div>
        <Link
          href="/"
          className={`text-sm px-3 py-2 rounded-full border ${
            isDark
              ? "bg-gray-800/70 border-emerald-800 text-emerald-300"
              : "bg-white/70 border-green-200 text-green-700"
          }`}
        >
          🏠
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {!user && (
          <div
            className={`p-3 rounded-xl text-center text-sm ${
              isDark ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-50 text-yellow-700"
            }`}
          >
            💡{" "}
            <Link href="/login" className="underline font-semibold">
              Login
            </Link>{" "}
            to track your recovery progress!
          </div>
        )}

        {/* Create New Plan Button */}
        {user && !showCreateForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
              isDark
                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700"
            }`}
          >
            + Start New Recovery Plan
          </motion.button>
        )}

        {/* Create Plan Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${
                isDark ? "bg-gray-800/70 border-emerald-800" : "bg-white/70 border-green-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                  Create Recovery Plan
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setPrediction(null)
                  }}
                  className={`text-sm px-3 py-1 rounded-full ${
                    isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  Cancel
                </button>
              </div>

              {/* Symptom Selection */}
              <div className="mb-4">
                <label className={`text-sm font-medium mb-2 block ${isDark ? "text-emerald-300" : "text-green-700"}`}>
                  What symptom are you experiencing?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SYMPTOMS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedSymptom(s.value)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        selectedSymptom === s.value
                          ? isDark
                            ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                            : "bg-green-600 text-white ring-2 ring-green-400"
                          : isDark
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <div className="text-xl">{s.icon}</div>
                      <div className="text-xs mt-1">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Remedy Selection */}
              <div className="mb-4">
                <label className={`text-sm font-medium mb-2 block ${isDark ? "text-emerald-300" : "text-green-700"}`}>
                  What remedy will you use?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {REMEDIES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setSelectedRemedy(r.value)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        selectedRemedy === r.value
                          ? isDark
                            ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                            : "bg-green-600 text-white ring-2 ring-green-400"
                          : isDark
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <div className="text-xl">{r.icon}</div>
                      <div className="text-xs mt-1">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Slider */}
              <div className="mb-4">
                <label className={`text-sm font-medium mb-2 block ${isDark ? "text-emerald-300" : "text-green-700"}`}>
                  Severity (1=Mild, 5=Severe): {severity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>Mild</span>
                  <span>Severe</span>
                </div>
              </div>

              {/* Predict Button */}
              <button
                onClick={handlePredict}
                disabled={loading || !selectedSymptom || !selectedRemedy}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 disabled:opacity-50"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 disabled:opacity-50"
                }`}
              >
                {loading ? "⏳ Analyzing..." : "🔮 Preview Recovery Timeline"}
              </button>

              {/* Prediction Result */}
              {prediction && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl ${
                    isDark ? "bg-gray-900/50 border border-emerald-900" : "bg-white/50 border border-green-100"
                  }`}
                >
                  <h3 className={`font-bold mb-2 ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                    📊 Predicted Recovery Timeline
                  </h3>
                  <div className={`text-sm mb-3 ${isDark ? "text-emerald-300" : "text-green-700"}`}>
                    Expected recovery: <strong>{prediction.total_days} days</strong> ({prediction.total_hours} hours)
                  </div>

                  {/* Milestones Preview */}
                  <div className="space-y-2 mb-4">
                    {prediction.milestones.map((m: Milestone, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            isDark ? "bg-emerald-900 text-emerald-300" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                            {m.title}
                          </div>
                          <div className={`text-xs ${isDark ? "text-emerald-400" : "text-green-600"}`}>
                            Day {m.expected_day}, {m.expected_hour}h — {m.improvement_percent}% improvement
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleCreatePlan}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isDark
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 disabled:opacity-50"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 disabled:opacity-50"
                    }`}
                  >
                    {loading ? "⏳ Creating..." : "✅ Start This Recovery Plan"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Plans List */}
        {plans.length > 0 && !selectedPlan && (
          <div className="space-y-4">
            <h2 className={`text-lg font-bold ${isDark ? "text-emerald-200" : "text-green-800"}`}>
              Your Recovery Plans
            </h2>
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedPlan(plan)}
                className={`backdrop-blur-sm border rounded-2xl p-4 shadow-md cursor-pointer transition-all ${
                  isDark ? "bg-gray-800/70 border-emerald-800 hover:border-emerald-600" : "bg-white/70 border-green-200 hover:border-green-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                      {plan.title}
                    </div>
                    <div className={`text-sm ${isDark ? "text-emerald-400" : "text-green-600"}`}>
                      Started {new Date(plan.started_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.status === "active"
                        ? isDark
                          ? "bg-emerald-900/50 text-emerald-300"
                          : "bg-green-100 text-green-700"
                        : plan.status === "completed"
                        ? isDark
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                        : isDark
                        ? "bg-gray-700 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Selected Plan Details with Timeline */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedPlan(null)
                loadPlans()
              }}
              className={`text-sm px-3 py-2 rounded-full ${
                isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"
              }`}
            >
              ← Back to Plans
            </button>

            {/* Plan Header */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${
                isDark ? "bg-gray-800/70 border-emerald-800" : "bg-white/70 border-green-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                    {selectedPlan.title}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-emerald-400" : "text-green-600"}`}>
                    Started {new Date(selectedPlan.started_at).toLocaleDateString()}
                  </p>
                </div>
                {selectedPlan.status === "active" && (
                  <button
                    onClick={handleCompletePlan}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${
                      isDark
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    ✅ Mark Complete
                  </button>
                )}
              </div>

              {/* Progress Overview */}
              {progress && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    className={`p-3 rounded-xl text-center ${
                      isDark ? "bg-gray-900/50 border border-emerald-900" : "bg-white/50 border border-green-100"
                    }`}
                  >
                    <div className="text-2xl mb-1">{getTrendIcon(progress.trend)}</div>
                    <div className={`text-lg font-bold ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                      {progress.percent_complete}%
                    </div>
                    <div className={`text-xs ${isDark ? "text-emerald-400" : "text-green-600"}`}>Time Progress</div>
                  </div>
                  <div
                    className={`p-3 rounded-xl text-center ${
                      isDark ? "bg-gray-900/50 border border-emerald-900" : "bg-white/50 border border-green-100"
                    }`}
                  >
                    <div className="text-2xl mb-1">💪</div>
                    <div className={`text-lg font-bold ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                      {progress.severity_improvement}%
                    </div>
                    <div className={`text-xs ${isDark ? "text-emerald-400" : "text-green-600"}`}>Symptom Relief</div>
                  </div>
                  <div
                    className={`p-3 rounded-xl text-center ${
                      isDark ? "bg-gray-900/50 border border-emerald-900" : "bg-white/50 border border-green-100"
                    }`}
                  >
                    <div className="text-2xl mb-1">📝</div>
                    <div className={`text-lg font-bold ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                      {progress.logs_count}
                    </div>
                    <div className={`text-xs ${isDark ? "text-emerald-400" : "text-green-600"}`}>Logs</div>
                  </div>
                  <div
                    className={`p-3 rounded-xl text-center ${
                      isDark ? "bg-gray-900/50 border border-emerald-900" : "bg-white/50 border border-green-100"
                    }`}
                  >
                    <div className="text-2xl mb-1">⚡</div>
                    <div className={`text-lg font-bold ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                      {progress.avg_energy}/5
                    </div>
                    <div className={`text-xs ${isDark ? "text-emerald-400" : "text-green-600"}`}>Avg Energy</div>
                  </div>
                </div>
              )}

              {/* Current Phase */}
              {progress && (
                <div className="mt-4">
                  <div className={`text-sm font-medium mb-2 ${isDark ? "text-emerald-300" : "text-green-700"}`}>
                    Current Phase: {progress.current_phase}
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percent_complete}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${getPhaseColor(progress.current_phase)}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Recovery Timeline */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${
                isDark ? "bg-gray-800/70 border-emerald-800" : "bg-white/70 border-green-200"
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                🧬 Recovery Timeline
              </h3>

              <div className="relative">
                {/* Timeline Line */}
                <div
                  className={`absolute left-6 top-0 bottom-0 w-0.5 ${
                    isDark ? "bg-emerald-800" : "bg-green-200"
                  }`}
                />

                {/* Milestones */}
                <div className="space-y-4">
                  {milestones.map((milestone, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 relative"
                    >
                      {/* Timeline Dot */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg z-10 ${
                          milestone.status === "reached"
                            ? isDark
                              ? "bg-emerald-600 text-white"
                              : "bg-green-600 text-white"
                            : milestone.status === "missed"
                            ? isDark
                              ? "bg-red-900 text-red-300"
                              : "bg-red-100 text-red-700"
                            : isDark
                            ? "bg-gray-700 text-gray-400"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {milestone.status === "reached" ? "✅" : milestone.status === "missed" ? "❌" : i + 1}
                      </div>

                      {/* Milestone Content */}
                      <div
                        className={`flex-1 p-3 rounded-xl ${
                          milestone.status === "reached"
                            ? isDark
                              ? "bg-emerald-900/30 border border-emerald-800"
                              : "bg-green-50 border border-green-200"
                            : isDark
                            ? "bg-gray-900/30 border border-gray-700"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`font-semibold ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                            {milestone.title}
                          </div>
                          <div className={`text-xs ${isDark ? "text-emerald-400" : "text-green-600"}`}>
                            Day {milestone.expected_day}
                          </div>
                        </div>
                        <div className={`text-sm mt-1 ${isDark ? "text-emerald-300/80" : "text-green-700/80"}`}>
                          {milestone.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? "bg-emerald-900/50 text-emerald-300" : "bg-green-100 text-green-700"
                            }`}
                          >
                            {milestone.improvement_percent}% improvement
                          </div>
                          {milestone.status === "reached" && (
                            <div
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isDark ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              Reached!
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Log Form */}
            {selectedPlan.status === "active" && (
              <div
                className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md ${
                  isDark ? "bg-gray-800/70 border-emerald-800" : "bg-white/70 border-green-200"
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-emerald-200" : "text-green-800"}`}>
                  📝 Log Today&apos;s Progress
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-medium mb-2 block ${isDark ? "text-emerald-300" : "text-green-700"}`}>
                      Symptom Severity Today (1=Better, 5=Worse): {logSeverity}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={logSeverity}
                      onChange={(e) => setLogSeverity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  <div>
                    <label className={`text-sm font-medium mb-2 block ${isDark ? "text-emerald-300" : "text-green-700"}`}>
                      Energy Level (1=Low, 5=High): {logEnergy}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={logEnergy}
                      onChange={(e) => setLogEnergy(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  <div>
                    <label className={`text-sm font-medium mb-2 block ${isDark ? "text-emerald-300" : "text-green-700"}`}>
                      Notes (optional)
                    </label>
                    <textarea
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="How are you feeling today?"
                      className={`w-full p-3 rounded-xl border resize-none h-20 ${
                        isDark
                          ? "bg-gray-900/50 border-emerald-900 text-emerald-100 placeholder:text-emerald-500"
                          : "bg-white/50 border-green-200 text-green-900 placeholder:text-green-400"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remedyTaken"
                      checked={logRemedyTaken}
                      onChange={(e) => setLogRemedyTaken(e.target.checked)}
                      className="w-4 h-4 accent-green-600"
                    />
                    <label
                      htmlFor="remedyTaken"
                      className={`text-sm ${isDark ? "text-emerald-300" : "text-green-700"}`}
                    >
                      I took my remedy today
                    </label>
                  </div>

                  <button
                    onClick={handleAddLog}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isDark
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700"
                    }`}
                  >
                    💾 Save Log
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {plans.length === 0 && !showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-8 shadow-md text-center ${
              isDark ? "bg-gray-800/70 border-emerald-800" : "bg-white/70 border-green-200"
            }`}
          >
            <div className="text-5xl mb-3">🧬</div>
            <h3 className={`font-semibold text-lg mb-2 ${isDark ? "text-emerald-200" : "text-green-800"}`}>
              No Recovery Plans Yet
            </h3>
            <p className={`text-sm mb-4 ${isDark ? "text-emerald-300/70" : "text-green-700/70"}`}>
              Start your first recovery plan to track your healing journey with AI-powered predictions.
            </p>
            <Link
              href="#"
              onClick={() => setShowCreateForm(true)}
              className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
            >
              🚀 Start Your First Plan
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

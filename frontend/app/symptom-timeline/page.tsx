'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/useAuth'

type Question = {
  q: string
  type: 'text' | 'yes_no' | 'scale' | 'multiple_choice'
}

type Analysis = {
  likely_causes: string[]
  confidence_scores: Record<string, number>
  recommendations: string[]
  timeline_events: { event: string; impact: string }[]
  red_flags: string[]
  severity: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

const SUGGESTIONS = [
  'I have a headache',
  'I have a fever',
  'I have a cough',
  'Stomach pain',
  'Feeling tired',
]

export default function SymptomTimelinePage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [stage, setStage] = useState<'input' | 'questions' | 'analysis' | 'emergency'>('input')
  const [symptom, setSymptom] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [emergency, setEmergency] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  const startSession = async () => {
    if (!symptom.trim()) {
      toast.error('Please describe your symptom')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/symptom-timeline/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id && { 'x-user-id': user.id }),
        },
        body: JSON.stringify({ symptom }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.emergency) {
          setEmergency(data.red_flags)
          setStage('emergency')
        } else {
          setSessionId(data.session_id)
          setQuestions(data.questions)
          setCurrentQ(0)
          setProgress(0)
          setStage('questions')
        }
      } else {
        // Demo mode
        runDemoSession()
      }
    } catch {
      runDemoSession()
    } finally {
      setLoading(false)
    }
  }

  const runDemoSession = () => {
    // Local demo flow
    const demoQuestions = getDemoQuestions(symptom)
    if (demoQuestions.length === 0) {
      runDemoAnalysis([])
    } else {
      setSessionId('demo-' + Date.now())
      setQuestions(demoQuestions)
      setCurrentQ(0)
      setProgress(0)
      setStage('questions')
    }
  }

  const getDemoQuestions = (sym: string): Question[] => {
    const s = sym.toLowerCase()
    if (s.includes('headache')) {
      return [
        { q: 'When did the headache start?', type: 'text' },
        { q: 'Where is the pain? (front, back, sides, all over)', type: 'text' },
        { q: 'Rate the pain (1-10)', type: 'scale' },
        { q: 'How many hours did you sleep last night?', type: 'text' },
        { q: 'Have you been drinking enough water?', type: 'yes_no' },
        { q: 'Are you feeling stressed?', type: 'yes_no' },
        { q: 'Have you eaten in the last 4 hours?', type: 'yes_no' },
      ]
    }
    return [
      { q: 'When did this start?', type: 'text' },
      { q: 'Rate the severity (1-10)', type: 'scale' },
      { q: 'How is your sleep?', type: 'text' },
      { q: 'Are you stressed?', type: 'yes_no' },
      { q: 'Are you eating and drinking well?', type: 'yes_no' },
    ]
  }

  const runDemoAnalysis = (answers: string[]) => {
    const analysis: Analysis = {
      likely_causes: [],
      confidence_scores: {},
      recommendations: [],
      timeline_events: [],
      red_flags: [],
      severity: 'mild',
    }

    const ansText = answers.join(' ').toLowerCase()
    const sym = symptom.toLowerCase()

    if (sym.includes('headache')) {
      const sleepMatch = answers.find(a => a.match(/\d+/) && answers.indexOf(a) < 5)
      if (sleepMatch) {
        const hrs = parseInt(sleepMatch.match(/\d+/)?.[0] || '7')
        if (hrs < 6) {
          analysis.likely_causes.push('Insufficient sleep causing headache')
          analysis.confidence_scores['Insufficient sleep'] = 85
          analysis.timeline_events.push({ event: `Slept only ${hrs} hours`, impact: 'high' })
          analysis.recommendations.push('Aim for 7-9 hours of sleep tonight')
        }
      }
      if (ansText.includes('no') && ansText.includes('water')) {
        analysis.likely_causes.push('Dehydration')
        analysis.confidence_scores['Dehydration'] = 70
        analysis.timeline_events.push({ event: 'Insufficient water intake', impact: 'medium' })
        analysis.recommendations.push('Drink at least 8 glasses of water today')
      }
      if (ansText.includes('yes') && ansText.includes('stress')) {
        analysis.likely_causes.push('Stress-induced tension headache')
        analysis.confidence_scores['Stress-induced tension headache'] = 65
        analysis.timeline_events.push({ event: 'Reported feeling stressed', impact: 'high' })
        analysis.recommendations.push('Try 10 minutes of deep breathing or meditation')
      }
      if (ansText.includes('no') && ansText.includes('eaten')) {
        analysis.likely_causes.push('Skipped meal / low blood sugar')
        analysis.confidence_scores['Skipped meal / low blood sugar'] = 55
        analysis.timeline_events.push({ event: 'No recent meal', impact: 'medium' })
        analysis.recommendations.push('Eat a balanced meal with protein and carbs')
      }
    }

    if (analysis.likely_causes.length === 0) {
      analysis.likely_causes.push('Multiple factors - need more data')
      analysis.confidence_scores['Multiple factors'] = 40
    }

    analysis.recommendations.push('Track this symptom daily to identify patterns')
    analysis.recommendations.push('Consult a doctor if symptoms persist for more than 3 days')

    const sevMatch = answers.find(a => a.match(/^[6-9]|10$/))
    if (sevMatch) analysis.severity = 'moderate'
    if (sevMatch && parseInt(sevMatch) >= 8) analysis.severity = 'moderate'

    setAnalysis(analysis)
    setStage('analysis')
  }

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please answer the question')
      return
    }
    setLoading(true)
    try {
      if (sessionId && !sessionId.startsWith('demo-')) {
        const res = await fetch(`${API_URL}/api/symptom-timeline/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || '',
          },
          body: JSON.stringify({
            session_id: sessionId,
            question: questions[currentQ].q,
            answer: currentAnswer,
            question_type: questions[currentQ].type,
            question_index: currentQ,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.complete) {
            setAnalysis(data.analysis)
            setStage('analysis')
          } else {
            setQuestions([questions[currentQ], data.question])
            setCurrentQ(currentQ + 1)
            setProgress(((currentQ + 1) / (data.total_questions || questions.length)) * 100)
            setCurrentAnswer('')
          }
        } else {
          fallbackAnswer()
        }
      } else {
        fallbackAnswer()
      }
    } catch {
      fallbackAnswer()
    } finally {
      setLoading(false)
    }
  }

  const fallbackAnswer = () => {
    const nextQ = currentQ + 1
    setProgress((nextQ / questions.length) * 100)
    if (nextQ >= questions.length) {
      // Collect all answers and run demo
      const allAnswers: string[] = [currentAnswer]
      // We need to track answers - for demo use state
      runDemoAnalysisWithCurrent(allAnswers)
    } else {
      setCurrentQ(nextQ)
      setCurrentAnswer('')
    }
  }

  const answersCollected: string[] = []  // Unused but needed to keep TS happy
  const runDemoAnalysisWithCurrent = (prev: string[]) => {
    const all = [...prev, currentAnswer]
    runDemoAnalysis(all)
  }

  const reset = () => {
    setStage('input')
    setSymptom('')
    setSessionId(null)
    setQuestions([])
    setCurrentQ(0)
    setCurrentAnswer('')
    setAnalysis(null)
    setEmergency([])
    setProgress(0)
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100'
    }`}>
      <Toaster position="top-center" />

      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/80 border-blue-800' : 'bg-white/80 border-blue-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏰</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              Symptom Time Machine
            </div>
            <div className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Find the root cause
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {stage !== 'input' && (
            <button onClick={reset} className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-blue-800 text-blue-300' : 'bg-white/70 border-blue-200 text-blue-700'}`}>
              🔄 New
            </button>
          )}
          <a href="/dashboard" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-blue-800 text-blue-300' : 'bg-white/70 border-blue-200 text-blue-700'}`}>
            🏠
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Disclaimer */}
        {stage !== 'emergency' && (
          <div className={`p-3 rounded-xl text-xs ${isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
            ⚠️ <strong>Not a diagnosis.</strong> This tool helps identify possible root causes. Always consult a doctor for serious symptoms.
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* INPUT STAGE */}
          {stage === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className={`p-6 rounded-2xl shadow-lg text-center ${isDark ? 'bg-gray-800/70 border border-blue-800' : 'bg-white border border-blue-200'}`}>
                <div className="text-5xl mb-3">🔍</div>
                <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  What's bothering you?
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Describe your symptom. We'll ask smart follow-up questions to find the root cause.
                </p>
              </div>

              <div className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800/70 border border-blue-800' : 'bg-white border border-blue-200'}`}>
                <textarea
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  placeholder="e.g., I have a headache, I feel tired all the time, my stomach hurts..."
                  rows={3}
                  className={`w-full p-3 rounded-xl border resize-none ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSymptom(s)}
                      className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startSession}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg"
              >
                {loading ? '⏳ Starting...' : '🔍 Analyze My Symptom'}
              </button>
            </motion.div>
          )}

          {/* EMERGENCY */}
          {stage === 'emergency' && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-2xl bg-red-500/20 border-2 border-red-500 text-center"
            >
              <div className="text-7xl mb-3">🚨</div>
              <h2 className="text-3xl font-black text-red-500 mb-3">EMERGENCY</h2>
              <p className="text-red-400 mb-4">
                Your symptom suggests a medical emergency. <strong>Call 108 (India) or your local emergency number immediately.</strong>
              </p>
              <a href="tel:108" className="inline-block bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-xl mb-3">
                📞 CALL 108 NOW
              </a>
              <button onClick={reset} className="block w-full text-red-400 underline mt-2">
                Continue with non-emergency analysis
              </button>
            </motion.div>
          )}

          {/* QUESTIONS STAGE */}
          {stage === 'questions' && questions[currentQ] && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  YOUR SYMPTOM
                </div>
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {symptom}
                </div>
              </div>

              <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${progress}%` }}></div>
              </div>
              <div className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Question {currentQ + 1} of {questions.length}
              </div>

              <div className={`p-6 rounded-2xl shadow-lg ${isDark ? 'bg-gray-800/70 border border-blue-800' : 'bg-white border border-blue-200'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {questions[currentQ].q}
                </h3>

                {questions[currentQ].type === 'yes_no' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {['Yes', 'No'].map(ans => (
                      <button
                        key={ans}
                        onClick={() => {
                          setCurrentAnswer(ans)
                          setTimeout(submitAnswer, 100)
                        }}
                        className={`py-4 rounded-xl text-lg font-bold ${
                          ans === 'Yes'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {ans}
                      </button>
                    ))}
                  </div>
                ) : questions[currentQ].type === 'scale' ? (
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentAnswer || 5}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="w-full"
                    />
                    <div className={`text-center text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentAnswer || 5} / 10
                    </div>
                    <button
                      onClick={submitAnswer}
                      className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold"
                    >
                      Next →
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      autoFocus
                      className={`w-full p-3 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                    />
                    <button
                      onClick={submitAnswer}
                      className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ANALYSIS STAGE */}
          {stage === 'analysis' && analysis && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className={`p-5 rounded-2xl shadow-lg ${
                analysis.severity === 'severe' ? 'bg-red-500/20 border-2 border-red-500' :
                analysis.severity === 'moderate' ? 'bg-amber-500/20 border-2 border-amber-500' :
                isDark ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-emerald-50 border border-emerald-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      SEVERITY
                    </div>
                    <div className={`text-3xl font-black ${
                      analysis.severity === 'severe' ? 'text-red-500' :
                      analysis.severity === 'moderate' ? 'text-amber-500' :
                      'text-emerald-500'
                    }`}>
                      {analysis.severity.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Initial symptom</div>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{symptom}</div>
                  </div>
                </div>
              </div>

              {/* Likely Causes */}
              <div className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800/70 border border-blue-800' : 'bg-white border border-blue-200'}`}>
                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  🎯 Likely Root Causes
                </h3>
                <div className="space-y-2">
                  {analysis.likely_causes.map((cause, i) => {
                    const conf = analysis.confidence_scores[cause] || 0
                    return (
                      <div key={i} className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {cause}
                          </span>
                          <span className={`text-xs font-bold ${conf >= 70 ? 'text-emerald-500' : conf >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                            {conf}%
                          </span>
                        </div>
                        <div className={`h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full rounded-full ${conf >= 70 ? 'bg-emerald-500' : conf >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${conf}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Timeline */}
              {analysis.timeline_events.length > 0 && (
                <div className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800/70 border border-blue-800' : 'bg-white border border-blue-200'}`}>
                  <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ⏰ Timeline of Contributing Events
                  </h3>
                  <div className="space-y-2">
                    {analysis.timeline_events.map((evt, i) => (
                      <div key={i} className={`p-3 rounded-xl border-l-4 ${
                        evt.impact === 'high' ? isDark ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-400' :
                        isDark ? 'bg-amber-900/20 border-amber-500' : 'bg-amber-50 border-amber-400'
                      }`}>
                        <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {evt.event}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Impact: {evt.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800/70 border border-blue-800' : 'bg-white border border-blue-200'}`}>
                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  💡 Recommended Actions
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={reset}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold"
              >
                🔄 Analyze Another Symptom
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

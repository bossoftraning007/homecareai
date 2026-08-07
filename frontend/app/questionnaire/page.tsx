'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { questionnaires, buildDetailedQuery, type Question } from '@/lib/questionnaires'
import { translations, type Language } from '@/lib/translations'

export default function QuestionnairePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [language, setLanguage] = useState<Language>('en')

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('homecare_language') as Language
    if (savedLang && translations[savedLang]) setLanguage(savedLang)
  }, [])

  const symptoms = Object.entries(questionnaires)
  const questionnaire = selectedSymptom ? questionnaires[selectedSymptom] : null
  const question = questionnaire?.questions[currentQuestion]
  const totalQuestions = questionnaire?.questions.length || 0
  const progress = totalQuestions ? ((currentQuestion + 1) / totalQuestions) * 100 : 0

  const getQuestionText = (q: Question) => {
    if (language === 'te') return q.question_te || q.question
    if (language === 'hi') return q.question_hi || q.question
    return q.question
  }

  const handleAnswer = (option: string) => {
    if (!question) return

    if (question.type === 'multi') {
      const current = (answers[question.id] as string[]) || []
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option]
      setAnswers({ ...answers, [question.id]: updated })
    } else {
      setAnswers({ ...answers, [question.id]: option })
      // Auto-advance for single choice
      setTimeout(() => {
        if (currentQuestion < totalQuestions - 1) {
          setCurrentQuestion(currentQuestion + 1)
        }
      }, 300)
    }
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitQuestionnaire()
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else {
      setSelectedSymptom(null)
      setAnswers({})
      setCurrentQuestion(0)
    }
  }

  const submitQuestionnaire = () => {
    if (!selectedSymptom) return

    const query = buildDetailedQuery(selectedSymptom, answers, language)
    localStorage.setItem('initial_message', query)
    toast.success('Getting personalized advice...', { icon: '🌿' })
    setTimeout(() => router.push('/chat'), 500)
  }

  const skipToChat = () => {
    if (!selectedSymptom) return
    const label = questionnaires[selectedSymptom].label
    localStorage.setItem('initial_message', `I have ${label}`)
    router.push('/chat')
  }

  const canProceed = question ? !!answers[question.id] : false

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950'
      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
    }`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/70 border-emerald-900' : 'bg-white/70 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <div>
            <div className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              Guided Assessment
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
              Personalized AI advice
            </div>
          </div>
        </div>
        <a href="/" className={`text-sm px-3 py-2 rounded-full border ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}>
          🏠
        </a>
      </div>

      <div className="max-w-2xl mx-auto p-4">

        {!selectedSymptom ? (
          // Symptom Selection Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`text-center mb-6 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
              <div className="text-5xl mb-3">🎯</div>
              <h2 className="text-2xl font-bold mb-2">What's bothering you?</h2>
              <p className={`text-sm ${isDark ? 'text-emerald-300/70' : 'text-green-700/70'}`}>
                Select a symptom for detailed guidance
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {symptoms.map(([key, q]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedSymptom(key)
                    setCurrentQuestion(0)
                    setAnswers({})
                  }}
                  className={`p-6 rounded-2xl shadow-md border transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 hover:bg-gray-800' : 'bg-white/70 border-green-200 hover:bg-white'}`}
                >
                  <div className="text-4xl mb-2">{q.icon}</div>
                  <div className={`text-sm font-semibold ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                    {language === 'te' && q.label_te ? q.label_te :
                     language === 'hi' && q.label_hi ? q.label_hi :
                     q.label}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className={`mt-6 p-4 rounded-xl border text-center text-sm ${isDark ? 'bg-emerald-900/30 border-emerald-800 text-emerald-200' : 'bg-white/50 border-green-200 text-green-800'}`}>
              💡 Answering questions helps AI give better personalized advice
            </div>
          </motion.div>
        ) : question ? (
          // Question Screen
          <div>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className={`text-sm ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>
                  Question {currentQuestion + 1} of {totalQuestions}
                </div>
                <div className={`text-2xl`}>{questionnaire?.icon}</div>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-green-100'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`backdrop-blur-sm border rounded-2xl p-6 shadow-md mb-4 ${isDark ? 'bg-gray-800/70 border-emerald-800' : 'bg-white/70 border-green-200'}`}
              >
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-emerald-200' : 'text-green-800'}`}>
                  {getQuestionText(question)}
                </h3>

                {question.type === 'multi' && (
                  <p className={`text-xs mb-3 ${isDark ? 'text-emerald-400/70' : 'text-green-600'}`}>
                    💡 Select all that apply
                  </p>
                )}

                <div className="space-y-2">
                  {question.options.map((option) => {
                    const isSelected = question.type === 'multi'
                      ? ((answers[question.id] as string[]) || []).includes(option)
                      : answers[question.id] === option

                    return (
                      <motion.button
                        key={option}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(option)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                          ? isDark
                            ? 'bg-emerald-900/60 border-emerald-500 text-emerald-100'
                            : 'bg-green-50 border-green-500 text-green-900'
                          : isDark
                            ? 'bg-gray-900/50 border-emerald-900 text-emerald-200 hover:border-emerald-700'
                            : 'bg-white/50 border-green-200 text-green-800 hover:border-green-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-600'
                            : isDark ? 'border-emerald-700' : 'border-green-300'
                          }`}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className="text-sm font-medium">{option}</span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className={`flex-1 py-3 rounded-xl font-semibold border shadow-md transition-all ${isDark ? 'bg-gray-800/70 border-emerald-800 text-emerald-300' : 'bg-white/70 border-green-200 text-green-700'}`}
              >
                ← Back
              </button>

              {question.type === 'multi' || currentQuestion === totalQuestions - 1 ? (
                <button
                  onClick={currentQuestion === totalQuestions - 1 ? submitQuestionnaire : handleNext}
                  disabled={!canProceed}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all"
                >
                  {currentQuestion === totalQuestions - 1 ? '✨ Get Advice' : 'Next →'}
                </button>
              ) : null}
            </div>

            {/* Skip Option */}
            <button
              onClick={skipToChat}
              className={`w-full mt-3 py-2 text-xs ${isDark ? 'text-emerald-400/70 hover:text-emerald-300' : 'text-green-700/70 hover:text-green-800'}`}
            >
              Skip questions → General advice
            </button>
          </div>
        ) : null}

      </div>
    </div>
  )
}
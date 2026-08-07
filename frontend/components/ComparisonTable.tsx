'use client'
import { motion } from 'framer-motion'

const features = [
  { feature: 'AI-Powered Responses', us: true, others: 'Some' },
  { feature: '10 Indian Languages', us: true, others: false },
  { feature: 'Voice Assistant', us: true, others: false },
  { feature: 'Cloud Sync', us: true, others: 'Paid' },
  { feature: 'Wellness Tracker', us: true, others: false },
  { feature: 'Symptom Guide', us: true, others: 'Basic' },
  { feature: 'Emergency Contacts', us: true, others: false },
  { feature: 'Multi-device', us: true, others: 'Paid' },
  { feature: 'PWA Install', us: true, others: false },
  { feature: '100% Free', us: true, others: false },
]

export default function ComparisonTable({ isDark }: { isDark: boolean }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className={`glass-card rounded-3xl overflow-hidden`}>
        {/* Header */}
        <div className={`grid grid-cols-3 gap-4 p-6 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
          <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Features</div>
          <div className="text-center">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600`}>
              🌿 HomeCare AI
            </div>
          </div>
          <div className={`text-center font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            Others
          </div>
        </div>

        {/* Rows */}
        {features.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`grid grid-cols-3 gap-4 p-4 border-b transition-colors ${isDark
              ? 'border-white/5 hover:bg-white/5'
              : 'border-black/5 hover:bg-black/5'
            }`}
          >
            <div className={`font-medium text-sm ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
              {row.feature}
            </div>
            <div className="text-center">
              {row.us === true ? (
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white">
                  ✓
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white">
                  ✕
                </div>
              )}
            </div>
            <div className={`text-center text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              {row.others === true ? (
                <span className="text-emerald-500">✓</span>
              ) : row.others === false ? (
                <span className="text-red-500">✕</span>
              ) : (
                row.others
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
'use client'
import { motion } from 'framer-motion'

export default function BlobBackground({ isDark }: { isDark: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Big Blob 1 */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className={`absolute top-0 -left-40 w-[600px] h-[600px] rounded-full blur-3xl animate-blob ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-300/40'}`}
      />

      {/* Big Blob 2 */}
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className={`absolute top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-blob ${isDark ? 'bg-teal-500/20' : 'bg-teal-300/40'}`}
        style={{ animationDelay: '2s' }}
      />

      {/* Big Blob 3 */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className={`absolute bottom-0 left-1/3 w-[700px] h-[700px] rounded-full blur-3xl animate-blob ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-300/30'}`}
        style={{ animationDelay: '4s' }}
      />

      {/* Grid Overlay */}
      <div
        className={`absolute inset-0 opacity-[0.02] ${isDark ? 'bg-white' : 'bg-black'}`}
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'

export function KeyboardShortcutsHelp() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = () => setShow((s) => !s)
    window.addEventListener('show-shortcuts', handler)
    return () => window.removeEventListener('show-shortcuts', handler)
  }, [])

  if (!show) return null

  const shortcuts = [
    { key: 'H', desc: 'Home' },
    { key: 'C', desc: 'AI Chat' },
    { key: 'T', desc: 'Tracker' },
    { key: 'M', desc: 'Medications' },
    { key: 'I', desc: 'Insights' },
    { key: 'V', desc: 'Health Vault' },
    { key: 'E', desc: 'Emergency' },
    { key: 'P', desc: 'Profile' },
    { key: '/', desc: 'Focus Search' },
    { key: '?', desc: 'Toggle shortcuts help' },
    { key: 'Esc', desc: 'Close dialogs' },
  ]

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShow(false)}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">{s.key}</kbd>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShow(false)}
          className="mt-5 w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

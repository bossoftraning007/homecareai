'use client'
import { useState } from 'react'

export function NotificationBell() {
  const [count] = useState(0)
  return <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
    <span className="text-xl">B</span>
    {count > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">{count}</span>}
  </button>
}

export function NotificationPreferences() {
  return <div className="space-y-4">
    <h3 className="font-bold text-sm">Notification Preferences</h3>
  </div>
}

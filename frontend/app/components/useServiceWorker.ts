'use client'
import { useEffect } from 'react'

export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('[SW] Registration succeeded:', reg.scope)
        })
        .catch(err => {
          console.error('[SW] Registration failed:', err)
        })
    }
  }, [])
}

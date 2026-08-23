'use client'
import { useEffect, useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type ShortcutMap = {
  [key: string]: {
    action: () => void
    description: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
  }
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const shortcut = shortcuts[key]
      if (!shortcut) return

      const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
      const altMatch = shortcut.alt ? e.altKey : !e.altKey

      if (ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault()
        shortcut.action()
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function useGlobalShortcuts() {
  const router = useRouter()
  const shortcuts: ShortcutMap = {
    h: { action: () => router.push('/'), description: 'Go to Home' },
    c: { action: () => router.push('/chat'), description: 'Open AI Chat' },
    t: { action: () => router.push('/tracker'), description: 'Open Tracker' },
    m: { action: () => router.push('/medications'), description: 'Open Medications' },
    i: { action: () => router.push('/insights'), description: 'Open Insights' },
    v: { action: () => router.push('/vault'), description: 'Open Health Vault' },
    e: { action: () => router.push('/emergency'), description: 'Open Emergency' },
    p: { action: () => router.push('/profile'), description: 'Open Profile' },
    '/': {
      action: () => {
        const el = document.querySelector<HTMLInputElement>('input[placeholder*="search" i]')
        if (el) el.focus()
      },
      description: 'Focus search',
    },
    '?': {
      action: () => window.dispatchEvent(new CustomEvent('show-shortcuts')),
      description: 'Show shortcuts',
      shift: true,
    },
  }
  useKeyboardShortcuts(shortcuts)
}

export function useSwipeNavigation(pages: string[]) {
  const router = useRouter()
  const startX = useRef(0)
  const endX = useRef(0)
  const [dir, setDir] = useState<'left' | 'right' | null>(null)

  const idx = pages.findIndex((p) => typeof window !== 'undefined' && window.location.pathname === p)

  const onStart = useCallback((e: TouchEvent) => { startX.current = e.touches[0].clientX }, [])
  const onMove = useCallback((e: TouchEvent) => {
    endX.current = e.touches[0].clientX
    const d = startX.current - endX.current
    if (Math.abs(d) > 30) setDir(d > 0 ? 'left' : 'right')
  }, [])

  const onEnd = useCallback(() => {
    const d = startX.current - endX.current
    if (Math.abs(d) > 80) {
      if (d > 0 && idx < pages.length - 1) router.push(pages[idx + 1])
      else if (d < 0 && idx > 0) router.push(pages[idx - 1])
    }
    setDir(null); startX.current = 0; endX.current = 0
  }, [idx, pages, router])

  useEffect(() => {
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
    }
  }, [onStart, onMove, onEnd])

  return { swipeDirection: dir, currentPageIndex: idx, totalPages: pages.length }
}

export function useResponsiveData() {
  const [cfg, setCfg] = useState({
    imageQuality: 'medium' as 'low' | 'medium' | 'high',
    maxItemsPerPage: 15,
    enableAnimations: true,
    enableCharts: true,
    preloadData: false,
  })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const mobile = w < 768
      const lowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4
      const conn = (navigator as any).connection
      const slow = conn?.effectiveType === '2g' || conn?.effectiveType === '3g'
      setCfg({
        imageQuality: mobile ? (slow ? 'low' : 'medium') : 'high',
        maxItemsPerPage: mobile ? 10 : lowEnd ? 15 : 25,
        enableAnimations: !mobile && !lowEnd,
        enableCharts: !mobile || w >= 640,
        preloadData: !mobile && !slow,
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return cfg
}

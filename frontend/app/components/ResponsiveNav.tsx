'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

type NavItem = {
  id: string
  label: string
  icon: string
  href: string
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'H', href: '/' },
  { id: 'chat', label: 'Chat', icon: 'C', href: '/chat' },
  { id: 'emergency', label: 'SOS', icon: 'S', href: '/emergency' },
  { id: 'profile', label: 'Profile', icon: 'P', href: '/profile' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMobile) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const isEmergency = item.id === 'emergency'

          return (
            <a
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[56px] rounded-2xl transition-all ${
                isEmergency
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                  : isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-gray-400'
              }`}
              style={{ minWidth: 56, minHeight: 56 }}
            >
              {isEmergency && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-red-500"
                />
              )}
              <span className="relative z-10 text-lg font-bold">{item.icon}</span>
              <span className="relative z-10 text-[10px] font-medium mt-0.5">{item.label}</span>
              {isActive && !isEmergency && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-500"
                />
              )}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

export function DesktopSidebar() {
  const pathname = usePathname()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  if (!isDesktop) return null

  const sidebarItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'H', href: '/' },
    { id: 'chat', label: 'AI Chat', icon: 'C', href: '/chat' },
    { id: 'tracker', label: 'Tracker', icon: 'T', href: '/tracker' },
    { id: 'medications', label: 'Medications', icon: 'M', href: '/medications' },
    { id: 'insights', label: 'Insights', icon: 'I', href: '/insights' },
    { id: 'vault', label: 'Health Vault', icon: 'V', href: '/vault' },
    { id: 'emergency', label: 'Emergency', icon: 'E', href: '/emergency' },
    { id: 'caregiver', label: 'Caregiver', icon: 'G', href: '/caregiver' },
    { id: 'profile', label: 'Profile', icon: 'P', href: '/profile' },
    { id: 'admin', label: 'Admin', icon: 'A', href: '/admin' },
  ]

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 z-40 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">H</span>
          <div>
            <div className="font-bold text-sm">HomeCare AI</div>
            <div className="text-[10px] text-gray-500">Health Dashboard</div>
          </div>
        </div>
      </div>

      <nav className="p-2 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>
    </aside>
  )
}

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth
      if (width < 768) setBreakpoint('mobile')
      else if (width < 1024) setBreakpoint('tablet')
      else setBreakpoint('desktop')
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint,
  }
}

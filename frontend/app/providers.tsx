'use client'
import { ThemeProvider } from 'next-themes'
import OfflineIndicator from './components/OfflineIndicator'
import { useServiceWorker } from './components/useServiceWorker'
import { PushNotificationManager } from './components/PushNotificationManager'

export function Providers({ children }: { children: React.ReactNode }) {
  useServiceWorker()
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <OfflineIndicator />
      <PushNotificationManager />
      {children}
    </ThemeProvider>
  )
}
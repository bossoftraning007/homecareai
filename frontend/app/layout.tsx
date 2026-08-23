import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { MobileBottomNav, DesktopSidebar } from './components/ResponsiveNav'
import { AppLevelHooks } from './components/AppHooks'

export const metadata: Metadata = {
  title: 'HomeCare AI - Natural Home Remedies',
  description: 'AI-powered natural home care assistant. Get safe home remedies, ancient wisdom, and know when to see a doctor.',
  keywords: 'home remedies, natural medicine, health AI, wellness, ayurveda',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HomeCare AI',
  },
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
    shortcut: '/logo.svg',
  },
  openGraph: {
    title: 'HomeCare AI - Natural Wellness',
    description: 'Natural home remedies powered by AI',
    type: 'website',
    url: 'https://homecareai.vercel.app',
    siteName: 'HomeCare AI',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#22c55e' },
    { media: '(prefers-color-scheme: dark)', color: '#22c55e' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.svg" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Providers>
          <DesktopSidebar />
          <AppLevelHooks />
          <main id="main-content" className="min-h-screen pb-20 lg:pb-0 lg:ml-64">
            {children}
          </main>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  )
}

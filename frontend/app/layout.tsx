import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

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
  openGraph: {
    title: 'HomeCare AI 🌿',
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
    { media: '(prefers-color-scheme: light)', color: '#065f46' },
    { media: '(prefers-color-scheme: dark)', color: '#022c22' },
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
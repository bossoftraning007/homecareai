import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HomeCare AI - Natural Home Remedies',
  description: 'AI-powered natural home care assistant. Get safe home remedies, ancient wisdom, and know when to see a doctor.',
  keywords: 'home remedies, natural medicine, health AI, wellness, ayurveda',
  openGraph: {
    title: 'HomeCare AI 🌿',
    description: 'Natural home remedies powered by AI',
    type: 'website',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#065f46',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HomeCare AI',
  description: 'Safe home care guidance for minor symptoms',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
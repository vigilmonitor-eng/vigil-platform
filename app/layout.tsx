import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VIGIL — Global Intelligence Platform',
  description: 'Real-time geopolitical, market, cyber and climate intelligence',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

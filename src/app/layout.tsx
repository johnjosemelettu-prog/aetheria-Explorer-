"use client"

import type { Metadata, Viewport } from 'next'
import './globals.css'
import { cn } from '@/lib/utils'
import { LayoutContent } from '@/components/layout/LayoutContent' // Import the new LayoutContent component
// Assuming ErrorBoundary is located at '@/components/ErrorBoundary'
import ErrorBoundary from '@/components/ErrorBoundary' // Import ErrorBoundary

export const metadata: Metadata = {
  title: 'Aetheria: Your Smart Travel Companion',
  description:
    'Aetheria - Generate personalized itineraries, explore destinations in VR, and navigate with AR.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Aetheria',
  },
}

export const viewport: Viewport = {
  themeColor: '#2639E6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <ErrorBoundary> {/* Wrap LayoutContent with ErrorBoundary */}
          <LayoutContent>
            {children}
          </LayoutContent>
        </ErrorBoundary>
      </body>
    </html>
  )
}

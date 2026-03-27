import type { Metadata, Viewport } from 'next'
import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { FirebaseClientProvider } from '@/firebase'
import { I18nProvider } from '@/lib/i18n'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Aetheria: Your Smart Travel Companion',
  description:
    'Aetheria - Generate personalized itineraries, explore destinations in VR, and navigate with AR.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Aetheria',
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
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
    <html lang="en" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
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
      <body className={cn('font-body antialiased')} suppressHydrationWarning>
        <ErrorBoundary>
          <FirebaseClientProvider>
            <ThemeProvider>
              <I18nProvider>
                <div className="flex flex-col min-h-screen">
                  {children}
                  <Toaster />
                </div>
              </I18nProvider>
            </ThemeProvider>
          </FirebaseClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

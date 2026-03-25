"use client"

import { FirebaseClientProvider } from '@/firebase'
import { I18nProvider } from '@/lib/i18n'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { PlatformIdentifier } from '@/components/layout/PlatformIdentifier'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <FirebaseClientProvider>
        <ThemeProvider>
          <I18nProvider>
            <PlatformIdentifier />
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </FirebaseClientProvider>
    </SidebarProvider>
  )
}

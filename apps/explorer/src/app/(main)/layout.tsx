
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

const Header = dynamic(() => import('@/components/layout/Header').then(m => m.Header), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer').then(m => m.Footer), { ssr: false });
const TravelBot = dynamic(() => import('@/components/layout/TravelBot').then(m => m.TravelBot), { ssr: false });

/**
 * MainLayout re-architected to include a persistent Explorer Sidebar.
 * Ensuring the content area is fully scrollable and mobile-safe.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <AppSidebar />
        <SidebarInset className="flex flex-col bg-transparent relative">
          <Header />
          <main className="flex-1 pt-28 lg:pt-32 px-4 sm:px-8 pb-24 overflow-y-auto overflow-x-hidden">
            <div className="container mx-auto max-w-7xl min-h-full">
              {children}
            </div>
          </main>
          <TravelBot />
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

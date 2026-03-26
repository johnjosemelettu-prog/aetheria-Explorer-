
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Separator } from '@/components/ui/separator';

const Header = dynamic(() => import('@/components/layout/Header').then(m => m.Header), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer').then(m => m.Footer), { ssr: false });
const TravelBot = dynamic(() => import('@/components/layout/TravelBot').then(m => m.TravelBot), { ssr: false });

/**
 * MainLayout re-architected to avoid hydration mismatches by rendering the container
 * structure on both server and client. Dynamic children (Header/Footer) handle
 * their own SSR exclusion via next/dynamic.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 md:pt-28 lg:pt-32">
        <div className="container mx-auto px-2 md:px-4 mb-8 md:mb-12 opacity-30">
          <Separator className="bg-border/60" />
        </div>
        {children}
      </main>
      <TravelBot />
      <Footer />
    </div>
  );
}

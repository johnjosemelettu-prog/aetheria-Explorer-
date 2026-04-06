'use client';

import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18next-config';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Root layout MUST always return <html> and <body>.
  // Returning null or anything else will cause hydration errors.
  return (
    <html lang={mounted && i18n?.language ? i18n.language : 'en'} className={inter.variable}>
      <body className="font-sans antialiased">
        {mounted && i18n ? (
          <I18nextProvider i18n={i18n}>
            {children}
          </I18nextProvider>
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        )}
      </body>
    </html>
  );
}

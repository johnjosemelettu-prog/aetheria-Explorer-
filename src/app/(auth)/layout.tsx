
'use client';

import React from 'react';

/**
 * AuthLayout re-architected to maintain a stable DOM structure between server and client,
 * preventing Next.js 15 hydration disruptions while ensuring children render correctly.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      {children}
    </div>
  );
}


import React from 'react';
import { TripWrappedClient } from '@/components/trips/TripWrappedClient';

/**
 * Trip Wrapped re-architected for Next.js 15 Static Export.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  // Essential for pre-rendering dynamic routes during Capacitor export.
  return [{ tripId: 'default' }];
}

export default function Page() {
  return <TripWrappedClient />;
}

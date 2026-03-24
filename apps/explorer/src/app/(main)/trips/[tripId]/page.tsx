
import React from 'react';
import { TripDetailClient } from '@/components/trips/TripDetailClient';

/**
 * Trip Detail re-architected for Next.js 15 Static Export.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  // Pre-renders a default dynamic segment for the static build pipeline.
  return [{ tripId: 'default' }];
}

export default function Page() {
  return <TripDetailClient />;
}

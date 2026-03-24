
import React from 'react';
import { EventDetailClient } from '@/components/events/EventDetailClient';

/**
 * Event Page re-architected for Next.js 15 Static Export.
 * Removing 'use client' from the entry page allows for generateStaticParams.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  // Provides a default node for static pre-rendering in the Monorepo architecture.
  return [{ eventId: 'default' }];
}

export default function Page() {
  return <EventDetailClient />;
}

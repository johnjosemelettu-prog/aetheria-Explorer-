'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCallback } from 'react';

export type SubscriptionTier = 'free' | 'pathfinder' | 'sovereign' | 'legend';

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  includedIn: SubscriptionTier[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, { name: string, price: number, description: string, badge: string }> = {
  free: {
    name: 'Explorer (Free)',
    price: 0,
    description: 'Basic access to plan and manage your journey.',
    badge: 'Basic',
  },
  pathfinder: {
    name: 'Pathfinder',
    price: 19.99,
    description: 'Enhanced navigation and local insights for the active traveler.',
    badge: 'Plus',
  },
  sovereign: {
    name: 'Sovereign',
    price: 49.99,
    description: 'Deep cultural synthesis and visual AI assistance.',
    badge: 'Pro',
  },
  legend: {
    name: 'Legend',
    price: 99.99,
    description: 'The ultimate luxury experience with full AI capability and VIP services.',
    badge: 'Ultra',
  }
};

// Define which features require which minimum tier
// We use the feature IDs corresponding to the dashboard links
export const FEATURE_REQUIREMENTS: Record<string, SubscriptionTier[]> = {
  // Free Features
  'itinerary-generator': ['free', 'pathfinder', 'sovereign', 'legend'],
  'marketplace': ['free', 'pathfinder', 'sovereign', 'legend'],
  'store': ['free', 'pathfinder', 'sovereign', 'legend'],
  'booking': ['free', 'pathfinder', 'sovereign', 'legend'],
  'wallet': ['free', 'pathfinder', 'sovereign', 'legend'],
  'budget-synthesis': ['free', 'pathfinder', 'sovereign', 'legend'],
  'journal': ['free', 'pathfinder', 'sovereign', 'legend'],
  
  // Pathfinder Features
  'pathfinder': ['pathfinder', 'sovereign', 'legend'],
  'guide': ['pathfinder', 'sovereign', 'legend'],
  'ar-wayfinding': ['pathfinder', 'sovereign', 'legend'],
  'local-legends': ['pathfinder', 'sovereign', 'legend'],
  
  // Sovereign Features
  'vision-hub': ['sovereign', 'legend'],
  'scanner': ['sovereign', 'legend'], // alias for vision-hub
  'cultural-pulse': ['sovereign', 'legend'],
  'audio-guide': ['sovereign', 'legend'],
  'heritage-mirror': ['sovereign', 'legend'],
  'mood-synthesis': ['sovereign', 'legend'],
  
  // Legend Features
  'video-teaser': ['legend'],
  'postcard-studio': ['legend'],
  'digital-tailor': ['legend'],
  'translator': ['legend'],
};

/**
 * Hook to determine if the user has an active premium trip pass.
 * Logic: Checks the most recently updated itinerary for its subscription tier.
 */
export function usePremiumStatus() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const tripsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(1));
    },
    [user, firestore]
  );
  
  const { data: trips, isLoading: isTripsLoading } = useCollection(tripsQuery);
  const activeTrip = trips?.[0];
  
  const activeTier = ((activeTrip?.subscriptionTier as string)?.toLowerCase() || 'free') as SubscriptionTier;
  
  // Backwards compatibility
  const premiumTiers = ['voyager', 'pathfinder', 'sovereign', 'legend'];
  const hasPremiumPass = premiumTiers.includes(activeTier);

  const checkAccess = useCallback((featurePathOrId: string) => {
    const key = featurePathOrId.replace('/', '');
    const allowedTiers = FEATURE_REQUIREMENTS[key];
    if (!allowedTiers) return false; // If not defined, default to closed
    return allowedTiers.includes(activeTier);
  }, [activeTier]);

  return { 
    hasPremiumPass, 
    activeTier, 
    activeTrip,
    checkAccess,
    isLoading: isUserLoading || isTripsLoading 
  };
}

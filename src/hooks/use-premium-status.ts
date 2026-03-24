'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

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
  
  const activeTier = (activeTrip?.subscriptionTier as string) || 'free';
  
  // Tiers eligible for premium features
  const premiumTiers = ['voyager', 'pathfinder', 'sovereign', 'legend'];
  const hasPremiumPass = premiumTiers.includes(activeTier.toLowerCase());

  return { 
    hasPremiumPass, 
    activeTier, 
    activeTrip, 
    isLoading: isUserLoading || isTripsLoading 
  };
}


'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar as CalendarIcon, Plane, ChevronLeft, Sparkles, Trash2, Wifi, AlertTriangle, ArrowRight } from 'lucide-react';
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function TripDetailClient() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);

  const tripRef = useMemoFirebase(
    () => (user && firestore && tripId ? doc(firestore, 'userProfiles', user.uid, 'itineraries', tripId) : null),
    [user, firestore, tripId]
  );
  const { data: trip, isLoading } = useDoc(tripRef);

  if (!hasMounted || isLoading) return <div className="p-12"><Skeleton className="h-[600px] w-full rounded-[3rem]" /></div>;
  if (!trip) return <div className="p-12 text-center">{t('trips.detail.tripNotFound')}</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] px-3">{trip.subscriptionTier?.toUpperCase() || 'STANDARD'} {t('trips.detail.passSuffix')}</Badge>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase italic">{trip.name}</h1>
          <div className="flex items-center gap-6 text-slate-400 font-bold uppercase tracking-widest text-xs">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {trip.destination}</span>
            <span className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary" /> {trip.startDate} — {trip.endDate}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <ItineraryDisplay 
            itinerary={trip.dailyPlans ? { itinerarySummary: trip.itinerarySummary, dailyPlans: trip.dailyPlans } : null} 
            itineraryId={tripId} 
            members={trip.members || []} 
            isLoading={false} 
            isRefining={false} 
            onRefine={() => {}}
            tripVibe={trip.vibe}
          />
        </div>
        <aside className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-3xl p-8 bg-white">
            <h3 className="font-headline font-black text-xl mb-4 text-slate-900">{t('trips.detail.protocolNode')}</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('trips.detail.targetVibe')}</p>
                <p className="font-bold text-slate-900 italic">"{trip.vibe || t('trips.detail.standardExploration')}"</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

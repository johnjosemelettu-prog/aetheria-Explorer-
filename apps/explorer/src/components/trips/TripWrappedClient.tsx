
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, Download, ChevronLeft, Loader2, Trophy, Leaf, Wallet, Zap, Quote, Compass } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { generateTripWrapped, type TripWrappedOutput } from '@/ai/flows/generate-trip-wrapped-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';

export function TripWrappedClient() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { language } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(true);
  const [wrapped, setWrapped] = useState<TripWrappedOutput | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => { setHasMounted(true); }, []);

  const tripRef = useMemoFirebase(
    () => (user && firestore && tripId ? doc(firestore, 'userProfiles', user.uid, 'itineraries', tripId) : null),
    [user, firestore, tripId]
  );
  const { data: trip } = useDoc(tripRef);

  useEffect(() => {
    async function getWrapped() {
      if (!trip || !hasMounted || tripId === 'default') return;
      try {
        const data = await generateTripWrapped({
          tripName: trip.name,
          destination: trip.destination,
          itinerarySummary: trip.itinerarySummary || trip.description || "",
          totalSpend: 1200,
          carbonOffset: 0.45, 
          milestones: trip.dailyPlans?.map((d: any) => d.theme) || [],
          language: currentLang
        });
        setWrapped(data);
      } catch (err) {
        console.error("Wrapped error:", err);
      } finally { setIsGenerating(false); }
    }
    getWrapped();
  }, [trip, hasMounted, currentLang, tripId]);

  if (!hasMounted || isGenerating) return <div className="p-12"><Skeleton className="h-[600px] w-full rounded-[3rem]" /></div>;
  if (!wrapped) return <div className="p-12 text-center">{t('trips.wrapped.synthesisFailed')}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-12">
      <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[3rem] bg-gradient-to-br from-primary to-indigo-900 text-white p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10"><Trophy className="h-64 w-64" /></div>
        <div className="relative z-10 space-y-8 text-center">
          <Badge className="bg-white/20 text-white border-none font-bold uppercase tracking-widest text-[10px] px-3">{t('trips.wrapped.seasonOdyssey')}</Badge>
          <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-none italic uppercase">{wrapped.vibeTitle}</h1>
          <p className="text-2xl font-bold italic leading-relaxed opacity-80 max-w-2xl mx-auto">"{wrapped.vibeDescription}"</p>
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/10">
            <div className="text-center"><p className="text-4xl font-black">{wrapped.stats.daysCount}</p><p className="text-[10px] font-black uppercase text-slate-400">{t('trips.wrapped.days')}</p></div>
            <div className="text-center"><p className="text-4xl font-black">{wrapped.stats.carbonImpact}</p><p className="text-[10px] font-black uppercase text-slate-400">{t('trips.wrapped.carbon')}</p></div>
            <div className="text-center"><p className="text-4xl font-black">{wrapped.stats.spendVibe}</p><p className="text-[10px] font-black uppercase text-slate-400">{t('trips.wrapped.spend')}</p></div>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10 font-bold h-12 px-8">
            <Link href="/trips">{t('trips.wrapped.returnToCommandCenter')}</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

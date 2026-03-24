'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Sparkles, 
  Share2, 
  Download, 
  ChevronLeft, 
  Loader2, 
  Trophy, 
  Leaf, 
  Wallet, 
  Zap,
  Quote,
  Compass
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { generateTripWrapped, type TripWrappedOutput } from '@/ai/flows/generate-trip-wrapped-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

export function TripWrappedClient() {
  const { tripId } = useParams() as { tripId: string };
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  
  const [isGenerating, setIsGenerating] = useState(true);
  const [wrapped, setWrapped] = useState<TripWrappedOutput | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const tripRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid, 'itineraries', tripId) : null),
    [user, firestore, tripId]
  );
  const { data: trip } = useDoc(tripRef);

  const transactionsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'transactions') : null),
    [user, firestore]
  );
  const { data: transactions } = useCollection(transactionsQuery);

  useEffect(() => {
    async function getWrapped() {
      if (!trip || !transactions || !hasMounted) return;
      
      try {
        const totalSpend = transactions.reduce((acc, t) => acc + (t.type === 'debit' ? t.amount : 0), 0);
        const milestones = trip.dailyPlans?.map((d: any) => d.theme) || [];
        
        const data = await generateTripWrapped({
          tripName: trip.name,
          destination: trip.destination,
          itinerarySummary: trip.itinerarySummary || trip.description,
          totalSpend,
          carbonOffset: 0.45, 
          milestones,
          language: currentLang
        });
        setWrapped(data);
      } catch (e) {
        toast({ variant: 'destructive', title: "Synthesis Failed", description: "The memory core is unstable." });
      } finally {
        setIsGenerating(false);
      }
    }
    getWrapped();
  }, [trip, transactions, hasMounted, currentLang, toast]);

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-12 flex justify-between items-center">
          <Button asChild variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">
            <Link href={`/trips/${tripId}`}><ChevronLeft className="mr-2 h-4 w-4" /> Back to Odyssey</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-bold"><Download className="mr-2 h-4 w-4" /> Save Gallery</Button>
            <Button className="rounded-xl font-black shadow-lg shadow-primary/20"><Share2 className="mr-2 h-4 w-4" /> Post Wrapped</Button>
          </div>
        </header>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-32 gap-8 opacity-50">
            <div className="relative w-32 h-32">
              <Loader2 className="w-full h-full animate-spin text-primary" strokeWidth={1} />
              <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black font-headline tracking-tighter uppercase italic">Synthesizing Your Legacy</h2>
              <p className="text-slate-400 font-medium">Analyzing milestones, vibes, and molecular footprints...</p>
            </div>
          </div>
        ) : wrapped ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Hero Vibe Card */}
            <Card className="border-none shadow-2xl rounded-[3rem] bg-gradient-to-br from-primary to-indigo-900 text-white overflow-hidden relative p-12">
              <div className="absolute top-0 right-0 p-12 opacity-10"><Compass className="h-64 w-64" /></div>
              <div className="relative z-10 space-y-10">
                <div className="space-y-2">
                  <Badge className="bg-white/20 text-white border-none font-bold uppercase tracking-widest text-[10px] px-3">2026 Season Odyssey</Badge>
                  <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-none italic uppercase">
                    {wrapped.vibeTitle}
                  </h1>
                </div>
                <div className="p-8 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 max-w-2xl">
                  <p className="text-2xl font-bold italic leading-relaxed">"{wrapped.vibeDescription}"</p>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-primary">
                  <Zap className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-4xl font-black font-headline">{wrapped.stats.daysCount}</p>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Days of Immersion</p>
                </div>
              </Card>
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-emerald-500">
                  <Leaf className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-4xl font-black font-headline">{wrapped.stats.carbonImpact}</p>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Molecular Impact</p>
                </div>
              </Card>
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-amber-500">
                  <Wallet className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-4xl font-black font-headline">{wrapped.stats.spendVibe}</p>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Financial DNA</p>
                </div>
              </Card>
            </div>

            {/* Milestone Card */}
            <Card className="border-none shadow-xl rounded-[3rem] bg-white text-slate-900 overflow-hidden group">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="relative h-64 md:h-auto md:w-1/2 overflow-hidden bg-slate-100">
                  <Image src="https://picsum.photos/seed/milestone/800/800" alt="Milestone" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute bottom-6 left-6 bg-accent text-slate-900 font-black">TOP MILESTONE</Badge>
                </div>
                <div className="p-12 md:w-1/2 flex flex-col justify-center space-y-6">
                  <h3 className="text-4xl font-black font-headline tracking-tighter leading-tight italic uppercase">{wrapped.topMilestone}</h3>
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <p className="text-slate-500 font-medium leading-relaxed">
                    This node represented the peak of your odyssey, synthesized through deep cultural immersion and high-fidelity discovery.
                  </p>
                </div>
              </div>
            </Card>

            {/* Poetic Closing */}
            <div className="text-center space-y-8 py-20">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary mb-10">
                <Quote className="h-10 w-10 opacity-40" />
              </div>
              <h4 className="text-3xl md:text-5xl font-black font-headline italic tracking-tight leading-tight max-w-2xl mx-auto">
                {wrapped.shareablePoem}
              </h4>
              <p className="text-primary font-black uppercase tracking-[0.4em] text-xs">— YOUR JOURNEY RECODED</p>
            </div>

            <footer className="pt-20 border-t border-white/5 flex flex-col items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Trophy className="h-6 w-6" /></div>
                <p className="font-headline font-black text-xl">+1,000 Legacy XP Earned</p>
              </div>
              <Button asChild className="h-16 px-12 rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 bg-white text-slate-900 hover:bg-slate-200">
                <Link href="/dashboard">Return to Command Center</Link>
              </Button>
            </footer>
          </div>
        ) : null}
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Moon, 
  Sun, 
  Droplets, 
  Coffee, 
  Plane, 
  Loader2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { getJetLagLogic, type JetLagLogicOutput } from '@/ai/flows/jet-lag-logic-flow';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function JetLagPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [hasMounted, setHasMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<JetLagLogicOutput | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const flightsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'userProfiles', user.uid, 'flightBookings'), orderBy('bookedAt', 'desc'), limit(1)) : null),
    [user, firestore]
  );
  const { data: flights, isLoading: isFlightsLoading } = useCollection(flightsQuery);
  const activeFlight = flights?.[0];

  const handleGenerate = async () => {
    if (!activeFlight) {
      toast({ variant: 'destructive', title: "No Flight Data", description: "Please book a flight to generate a recovery plan." });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    try {
      const data = await getJetLagLogic({
        departureCity: activeFlight.departureAirportCode,
        arrivalCity: activeFlight.arrivalAirportCode,
        departureDateTime: activeFlight.departureDateTime,
        arrivalDateTime: activeFlight.arrivalDateTime,
        language: currentLang,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Logic Error", description: "The circadian engine is drifting. Try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Circadian Optimizer</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Jet Lag Logic
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Eliminate exhaustion before you land. Our AI synthesizes a molecular-level recovery plan based on your flight physics.
        </p>
      </header>

      {!activeFlight && !isFlightsLoading ? (
        <Card className="border-2 border-dashed rounded-[3rem] p-12 text-center opacity-40 grayscale flex flex-col items-center">
          <Plane className="h-20 w-20 mb-6" />
          <h2 className="text-3xl font-black font-headline uppercase tracking-tighter">No Active Flights</h2>
          <p className="max-w-xs mt-2 font-medium">Book a flight in the Booking Hub to unlock personalized circadian optimization.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-headline flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" /> Flight Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-slate-500">{activeFlight?.departureAirportCode || '---'}</p>
                    <p className="text-2xl font-black font-headline">DEP</p>
                  </div>
                  <ArrowRight className="text-primary h-6 w-6" />
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-slate-500">{activeFlight?.arrivalAirportCode || '---'}</p>
                    <p className="text-2xl font-black font-headline">ARR</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-bold">{activeFlight?.departureDateTime?.split('T')[0] || 'Scheduled'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-bold">Transit Logic Active</span>
                  </div>
                </div>
                <Button 
                  onClick={handleGenerate} 
                  className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" 
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <><Zap className="mr-2 h-5 w-5" /> Generate Logic</>}
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
                Our logic is based on <strong>bioluminescent protocols</strong> and light-exposure therapy to minimize cortisol spikes during transition.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            {isGenerating ? (
              <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-[2.5rem]" />
                <Skeleton className="h-96 w-full rounded-[2.5rem]" />
              </div>
            ) : result ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[2rem] bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
                      <Sun className="h-10 w-10" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black font-headline text-slate-900">{result.strategy}</h3>
                      <p className="text-lg font-bold text-slate-400">Time Zone Shift: {Math.abs(result.timeDifference)} Hours</p>
                    </div>
                  </div>
                  <Badge className="h-10 px-6 rounded-full bg-slate-900 text-white font-black uppercase text-xs tracking-widest">Protocol Active</Badge>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-4">
                    <Clock className="h-4 w-4" /> 24-Hour Recovery Chronology
                  </h4>
                  {result.schedule.map((step, i) => (
                    <div key={i} className="group relative flex gap-6 p-6 rounded-3xl bg-white shadow-lg border border-transparent hover:border-primary/20 transition-all">
                      <div className="flex flex-col items-center">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 font-black font-headline text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                          {step.time}
                        </div>
                        <div className="h-full w-px bg-slate-100 group-last:hidden mt-4" />
                      </div>
                      <div className="space-y-2 py-2">
                        <h5 className="text-xl font-black text-slate-900">{step.action}</h5>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-[2rem] border-none shadow-xl bg-slate-900 text-white p-8">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Biological Logic
                    </CardTitle>
                    <ul className="space-y-4">
                      {result.proTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card className="rounded-[2rem] border-none shadow-xl bg-primary text-white p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><Droplets className="h-24 w-24" /></div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60 mb-4">Hydration Alert</CardTitle>
                    <p className="text-2xl font-black font-headline leading-tight">Increase fluid intake by 50% for the next 12 hours.</p>
                    <p className="mt-4 text-xs font-bold text-white/40">Molecular equilibrium restores faster with higher cellular hydration during altitude transitions.</p>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center text-center opacity-20 grayscale py-20">
                <Zap className="h-32 w-32 mb-4 mx-auto" />
                <p className="text-3xl font-black font-headline uppercase tracking-tighter">Chronology Pending</p>
                <p className="max-w-xs mx-auto text-sm font-bold mt-2">Initialize flight analysis to synthesize your circadian recovery protocol.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

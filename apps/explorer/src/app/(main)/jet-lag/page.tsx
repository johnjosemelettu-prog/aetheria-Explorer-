
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Sun, 
  Droplets, 
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
        arrivalDateTime: activeFlight.arrivalDateTime || new Date().toISOString(),
        language: currentLang,
      });
      setResult(data);
      toast({ title: "Logic Resolved!", description: "Your circadian recovery plan is ready." });
    } catch (err) {
      toast({ variant: 'destructive', title: "Logic Error" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Circadian Optimizer</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Jet Lag Logic
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Eliminate exhaustion before you land. Our AI synthesizes a molecular-level recovery plan based on your flight physics.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" /> Flight Node
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              {activeFlight ? (
                <>
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-slate-500">{activeFlight.departureAirportCode}</p>
                      <p className="text-2xl font-black font-headline">DEP</p>
                    </div>
                    <ArrowRight className="text-primary h-6 w-6" />
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-slate-500">{activeFlight.arrivalAirportCode}</p>
                      <p className="text-2xl font-black font-headline">ARR</p>
                    </div>
                  </div>
                  <Button onClick={handleGenerate} className="w-full h-14 rounded-2xl font-black" disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="animate-spin" /> : <><Zap className="mr-2 h-5 w-5" /> Generate Logic</>}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-slate-500 italic">No flight detected.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
                <h3 className="text-2xl font-black font-headline uppercase italic tracking-tighter mb-6">{result.strategy}</h3>
                <div className="space-y-6">
                  {result.schedule.map((step, i) => (
                    <div key={i} className="flex gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100">
                      <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                        {step.time}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{step.action}</p>
                        <p className="text-xs text-slate-500 font-medium italic">"{step.description}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center opacity-20 grayscale py-20">
              <Clock className="h-32 w-32 mb-4 mx-auto" />
              <p className="text-3xl font-black font-headline uppercase tracking-tighter">Chronology Pending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

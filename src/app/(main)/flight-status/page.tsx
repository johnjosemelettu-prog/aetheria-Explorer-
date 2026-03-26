'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Navigation,
  Globe,
  AlertTriangle,
  FileText,
  Heart,
  Compass,
  Download,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { synthesizeClaimNode, type ClaimOutput } from '@/ai/flows/synthesize-claim-node-flow';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function FlightStatusPage() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [isSimulatingDelay, setIsSimulatingDelay] = useState(false);
  const [claimResult, setClaimResult] = useState<ClaimOutput | null>(null);
  const [isSynthesizingClaim, setIsSynthesizingClaim] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const flightsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'flightBookings'), orderBy('bookedAt', 'desc'), limit(5));
    },
    [user, firestore]
  );
  const { data: flights, isLoading } = useCollection(flightsQuery);

  const handleSynthesizeClaim = async (flight: any) => {
    if (!user) return;
    setIsSynthesizingClaim(true);
    try {
      const data = await synthesizeClaimNode({
        flightNumber: flight.flightNumber || flight.id,
        airlineName: flight.airlineName,
        delayDurationMinutes: 180, // Simulated 3 hour delay
        passengerName: user.displayName || 'Aetheria Explorer',
        language: currentLang
      });
      setClaimResult(data);
    } catch (e) {
      toast({ variant: 'destructive', title: "Logic Failure", description: "The legal grid is unreachable. Try again." });
    } finally {
      setIsSynthesizingClaim(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">{t('header.flightStatus')}</Badge>
          <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
            Logistics Radar
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-xl">
            Real-time telemetry for your transitions. Live status board for air, rail, and sea with terminal discovery intelligence.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Globe className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Sync</p>
            <p className="text-[10px] font-black text-slate-900 uppercase">All Nodes Operational</p>
          </div>
        </div>
      </header>

      {/* Disruption Simulation Trigger (For Testing) */}
      <div className="mb-12 flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => setIsSimulatingDelay(!isSimulatingDelay)}
          className={cn(
            "rounded-full h-12 px-8 font-black uppercase tracking-widest text-[10px] border-2",
            isSimulatingDelay ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-400 border-slate-100"
          )}
        >
          <AlertTriangle className="mr-2 h-4 w-4" /> 
          {isSimulatingDelay ? "Disruption Simulation: ACTIVE" : "Simulate Temporal Disruption"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-[2.5rem]" />
          <Skeleton className="h-48 w-full rounded-[2.5rem]" />
        </div>
      ) : flights && flights.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-10">
            {flights.map((flight) => (
              <div key={flight.id} className="space-y-6">
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-primary/5 transition-all duration-500">
                  <div className="flex flex-col lg:flex-row items-stretch">
                    <div className={cn(
                      "p-10 flex flex-col justify-between lg:w-80 flex-shrink-0 transition-colors duration-700",
                      isSimulatingDelay ? "bg-red-600 text-white" : "bg-slate-900 text-white"
                    )}>
                      <div>
                        <Badge className={cn(
                          "border-none font-bold uppercase text-[9px] mb-4 px-3",
                          isSimulatingDelay ? "bg-white text-red-600 animate-pulse" : "bg-primary text-white"
                        )}>
                          {isSimulatingDelay ? "Disruption Detected" : "On Schedule"}
                        </Badge>
                        <h3 className="text-4xl font-black font-headline tracking-tighter uppercase italic">{flight.flightNumber}</h3>
                        <p className={cn("font-bold uppercase tracking-widest text-[10px] mt-1", isSimulatingDelay ? "text-red-100" : "text-slate-400")}>
                          {flight.airlineName}
                        </p>
                      </div>
                      <div className="mt-10">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isSimulatingDelay ? "text-red-200" : "text-slate-500")}>
                          Gate / Terminal
                        </p>
                        <p className={cn("text-3xl font-black font-headline uppercase", isSimulatingDelay ? "text-white" : "text-primary")}>T4 - G12</p>
                      </div>
                    </div>

                    <div className="flex-1 p-10 flex flex-col md:flex-row items-center justify-between gap-12">
                      <div className="flex items-center gap-12 w-full md:w-auto">
                        <div className="text-center md:text-left">
                          <p className="text-5xl font-black font-headline text-slate-900 leading-none uppercase">{flight.departureAirportCode}</p>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Departure</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full h-px bg-slate-100 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                              <Plane className={cn("h-5 w-5", isSimulatingDelay ? "text-red-600 animate-bounce" : "text-primary")} />
                            </div>
                          </div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">In Transit</p>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-5xl font-black font-headline text-slate-900 leading-none uppercase">{flight.arrivalAirportCode}</p>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Arrival</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 w-full md:w-auto justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-12">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-slate-300" />
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Arrival</p>
                              <p className={cn("font-bold uppercase", isSimulatingDelay ? "text-red-600" : "text-slate-900")}>
                                {isSimulatingDelay ? "+3H DELAY" : "14:30 PM"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification</p>
                              <p className="font-bold text-slate-900 uppercase">Confirmed</p>
                            </div>
                          </div>
                        </div>
                        <Button asChild className="h-14 px-8 rounded-2xl font-black shadow-xl uppercase italic tracking-tighter">
                          <Link href={`/ar-wayfinding?target=${flight.arrivalAirportCode}`}>Terminal Map <Navigation className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {isSimulatingDelay && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-700">
                    <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 group hover:shadow-2xl transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                          <FileText className="h-7 w-7" />
                        </div>
                        <Zap className="h-5 w-5 text-accent animate-pulse" />
                      </div>
                      <h4 className="text-xl font-black font-headline text-slate-900">Synthesize Claim</h4>
                      <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">AI analyzes local mandates to synthesize a high-fidelity compensation claim node.</p>
                      <Button onClick={() => handleSynthesizeClaim(flight)} disabled={isSynthesizingClaim} className="w-full mt-6 rounded-xl font-bold h-11 bg-slate-900 text-white shadow-lg">
                        {isSynthesizingClaim ? <Loader2 className="animate-spin" /> : "Initiate Synthesis"}
                      </Button>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 group hover:shadow-2xl transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-inner">
                          <Heart className="h-7 w-7" />
                        </div>
                      </div>
                      <h4 className="text-xl font-black font-headline text-slate-900">Lounge Node</h4>
                      <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Restore your biological equilibrium with verified lounge nodes nearby.</p>
                      <Button asChild variant="outline" className="w-full mt-6 rounded-xl font-bold h-11 border-2 border-amber-100 text-amber-600 hover:bg-amber-50">
                        <Link href="/booking">Search Stays</Link>
                      </Button>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 group hover:shadow-2xl transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                          <Compass className="h-7 w-7" />
                        </div>
                      </div>
                      <h4 className="text-xl font-black font-headline text-slate-900">Layover Odyssey</h4>
                      <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Turn downtime into discovery with a mission designed for your delay window.</p>
                      <Button asChild variant="outline" className="w-full mt-6 rounded-xl font-bold h-11 border-2 border-blue-100 text-blue-600 hover:bg-blue-50">
                        <Link href="/layover-odyssey">Launch Odyssey</Link>
                      </Button>
                    </Card>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-30 grayscale">
          <Plane className="h-32 w-32 text-primary" />
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">No Active Signals</h2>
            <p className="text-lg font-medium text-slate-500 max-sm mx-auto">Book a flight to initialize real-time logistics monitoring.</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-2 h-12 px-8 font-bold">
            <Link href="/booking">Visit Booking Hub</Link>
          </Button>
        </div>
      )}

      {/* Claim Synthesis Modal */}
      <Dialog open={!!claimResult} onOpenChange={(o) => !o && setClaimResult(null)}>
        <DialogContent className="rounded-[3rem] max-w-3xl overflow-hidden p-0 border-none shadow-2xl">
          <DialogTitle className="sr-only">Claim Synthesis Result</DialogTitle>
          {claimResult && (
            <div className="flex flex-col">
              <CardHeader className="p-10 bg-slate-900 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck className="h-32 w-32 text-primary" /></div>
                <Badge className="bg-primary text-white border-none font-bold uppercase mb-4 px-3">Synthesis Complete</Badge>
                <CardTitle className="text-4xl font-black font-headline italic tracking-tighter uppercase leading-tight">
                  Disruption <br />Manifest Resolved
                </CardTitle>
                <CardDescription className="text-slate-400 text-lg mt-2">Compensation nodes identified based on global mandates.</CardDescription>
              </CardHeader>
              
              <ScrollArea className="max-h-[60vh] bg-white p-10">
                <div className="space-y-8">
                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Est. Compensation</p>
                      <Badge className="bg-emerald-100 text-emerald-700 font-black px-3 py-1 border-none">{claimResult.legalReference}</Badge>
                    </div>
                    <p className="text-5xl font-black font-headline text-emerald-600">{claimResult.estimatedCompensation}</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Claim Manifest Text</label>
                    <div className="p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 italic text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {claimResult.claimLetter}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Next Response Nodes</label>
                    <div className="grid grid-cols-1 gap-2">
                      {claimResult.nextSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 text-primary text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <CardFooter className="p-8 bg-slate-50 border-t border-slate-100 gap-4">
                <Button className="flex-1 h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                  <Download className="mr-2 h-5 w-5" /> Download Manifest
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl font-bold border-2" onClick={() => setClaimResult(null)}>
                  <X className="mr-2 h-5 w-5" /> Close Node
                </Button>
              </CardFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer className="mt-24 pt-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12 items-center opacity-60">
        <div className="space-y-4">
          <h4 className="text-xl font-black font-headline text-slate-900 flex items-center gap-2 uppercase italic">
            <Zap className="h-5 w-5 text-primary" /> Precision Telemetry
          </h4>
          <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
            Monitoring air and maritime nodes with a <span className="text-primary">1.2s latency tolerance</span>. All signals are verified against proprietary Guardian Grid nodes.
          </p>
        </div>
        <div className="flex justify-end gap-12 text-center md:text-right">
          <div className="space-y-1">
            <p className="text-2xl font-black font-headline text-slate-900">99.9%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black font-headline text-slate-900">Global</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

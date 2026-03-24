
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Signal, 
  QrCode, 
  Wallet, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Wifi,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { generateEsimPlan, type GenerateEsimPlanOutput } from '@/ai/flows/generate-esim-plan-flow';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';

export default function EsimPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [hasMounted, setHasMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [plan, setPlan] = useState<GenerateEsimPlanOutput | null>(null);
  const [activeEsim, setActiveEsim] = useState<any>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const itineraryQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(1));
    },
    [user, firestore]
  );
  const { data: trips, isLoading: isItineraryLoading } = useCollection(itineraryQuery);

  const activeTrip = trips?.[0];

  const esimsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'esims'), orderBy('createdAt', 'desc'), limit(1));
    },
    [user, firestore]
  );
  const { data: esims } = useCollection(esimsQuery);

  useEffect(() => {
    if (esims?.[0] && esims[0].status === 'active') {
      setActiveEsim(esims[0]);
    }
  }, [esims]);

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);
  const usdWallet = wallets?.find(w => w.currency === 'USD');

  const handleSynthesizePlan = async () => {
    if (!activeTrip) return;
    setIsGenerating(true);
    try {
      const duration = differenceInDays(parseISO(activeTrip.endDate), parseISO(activeTrip.startDate)) || 7;
      const data = await generateEsimPlan({
        destination: activeTrip.destination,
        durationDays: duration,
        language: currentLang,
      });
      setPlan(data);
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: "Synthesis Error", 
        description: "Linguistic node offline." 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivate = async () => {
    if (!user || !plan || !usdWallet || !firestore) return;

    if (usdWallet.balance < plan.priceUsd) {
      toast({ 
        variant: 'destructive', 
        title: "Insufficient Balance", 
        description: `Authorization requires $${plan.priceUsd} in your USD node.` 
      });
      return;
    }

    setIsActivating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(-plan.priceUsd),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit',
        category: 'service',
        amount: plan.priceUsd,
        currency: 'USD',
        description: `eSIM Activation: ${plan.planName}`,
        timestamp: serverTimestamp()
      });

      const esimsRef = collection(firestore, 'userProfiles', user.uid, 'esims');
      const esimData = {
        ...plan,
        status: 'active',
        activationCode: `LPA:1$${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        createdAt: serverTimestamp(),
      };
      addDocumentNonBlocking(esimsRef, esimData);

      setActiveEsim(esimData);
      setPlan(null);
      toast({ title: "Activation Resolved", description: "Your digital connectivity node is now active." });
    } catch (e) {
      toast({ 
        variant: 'destructive', 
        title: "Activation Error", 
        description: "Protocol failure. Please try again." 
      });
    } finally {
      setIsActivating(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Aura Connectivity Node</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Global eSIM
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Instant high-fidelity connectivity synthesized for your destination node.
        </p>
      </header>

      {activeEsim ? (
        <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-10 relative overflow-hidden max-w-3xl mx-auto animate-in fade-in zoom-in duration-700">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Signal className="h-48 w-48 text-primary" /></div>
          <div className="relative z-10 space-y-8 text-center">
            <div className="mx-auto h-24 w-24 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <CheckCircle2 className="h-14 w-14" />
            </div>
            <h2 className="text-4xl font-black font-headline leading-tight italic uppercase">System Connected</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 py-6">
              <div className="bg-white p-4 rounded-3xl shadow-2xl">
                <QrCode className="h-40 w-40 text-slate-900" />
              </div>
              <div className="space-y-4 flex-1 max-w-xs">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-left">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Activation Token</p>
                  <p className="font-mono text-sm font-black text-primary break-all">{activeEsim.activationCode}</p>
                </div>
                <p className="text-slate-400 text-xs font-medium text-left leading-relaxed">Scan this node with your device to install the co-branded data plan.</p>
              </div>
            </div>

            <Button asChild variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/5 font-bold">
              <Link href="/dashboard">Return to Command Hub</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Globe className="h-6 w-6" /></div>
              <div>
                <h3 className="text-2xl font-black font-headline text-slate-900 uppercase italic tracking-tighter">Target Destination</h3>
                <p className="text-slate-500 font-medium leading-relaxed mt-2">
                  {activeTrip ? `Ready for your ${activeTrip.destination} Odyssey.` : "No active trip node detected."}
                </p>
              </div>
              <Button 
                onClick={handleSynthesizePlan} 
                disabled={isGenerating || !activeTrip} 
                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <><Wifi className="mr-2 h-5 w-5" /> Synthesize Plan</>}
              </Button>
            </Card>

            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
                Aetheria x Airalo nodes are pre-verified for high-speed 5G connectivity upon arrival at your destination node.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {isGenerating ? (
              <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-[2.5rem]" />
                <Skeleton className="h-48 w-full rounded-[2.5rem]" />
              </div>
            ) : plan ? (
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                <CardHeader className="bg-primary p-10 text-white relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><Wifi className="h-32 w-32" /></div>
                  <Badge className="bg-white/20 text-white border-none font-bold uppercase mb-4 px-3">Synthesis Resolved</Badge>
                  <CardTitle className="text-4xl font-black font-headline leading-tight italic uppercase">{plan.planName}</CardTitle>
                  <CardDescription className="text-primary-foreground/80 font-bold uppercase tracking-widest text-xs mt-2">{plan.providerName}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-10 py-6 border-y border-slate-50">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Data Node Capacity</p>
                      <p className="text-5xl font-black font-headline text-slate-900">{plan.dataLimitGb} GB</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Authorization Fee</p>
                      <p className="text-5xl font-black font-headline text-primary">${plan.priceUsd.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Plan Highlights</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleActivate} 
                    disabled={isActivating}
                    className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xl shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
                  >
                    {isActivating ? <Loader2 className="animate-spin h-6 w-6" /> : <><Zap className="mr-2 h-6 w-6" /> Authorize & Install</>}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col justify-center text-center opacity-20 grayscale py-32 gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
                  <Signal className="h-40 w-40 text-primary relative mx-auto" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-black font-headline uppercase tracking-tighter italic">Connectivity Node Pending</p>
                  <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Initialize trajectory scan to view localized data plans.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Leaf, 
  Zap, 
  Wallet, 
  CheckCircle2, 
  Loader2, 
  Plane, 
  ShieldCheck, 
  TrendingDown,
  Info,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment, query, orderBy } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { calculateCarbonFootprint, type CalculateCarbonFootprintOutput } from '@/ai/flows/calculate-carbon-footprint-flow';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function CarbonSynthesisPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isCalculating, setIsCalculating] = useState(false);
  const [isOffsetting, setIsOffsetting] = useState(false);
  const [analysis, setAnalysis] = useState<CalculateCarbonFootprintOutput | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const flightsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'flightBookings');
    },
    [user, firestore]
  );
  const { data: flights } = useCollection(flightsQuery);

  const walletsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'wallets');
    },
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);
  const usdWallet = wallets?.find(w => w.currency === 'USD');

  const totalKm = useMemo(() => {
    return (flights?.length || 0) * 3500;
  }, [flights]);

  const handleAnalyze = async () => {
    if (totalKm === 0) {
      toast({ title: "No Travel Data", description: "Book an aviation node to initialize impact radar." });
      return;
    }
    setIsCalculating(true);
    try {
      const data = await calculateCarbonFootprint({
        travelType: 'flight',
        distanceKm: totalKm,
        language: currentLang,
      });
      setAnalysis(data);
    } catch (err) {
      toast({ variant: 'destructive', title: "Analysis Failed", description: "The environmental engine is offline. Try again." });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleOffset = async () => {
    if (!user || !analysis || !usdWallet || !firestore) return;
    
    if (usdWallet.balance < analysis.offsetCostUsd) {
      toast({ variant: 'destructive', title: "Insufficient Balance", description: "Add funds to your USD wallet to offset your footprint." });
      return;
    }

    setIsOffsetting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(-analysis.offsetCostUsd),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit',
        category: 'offset',
        amount: analysis.offsetCostUsd,
        currency: 'USD',
        description: `Carbon Offset: ${analysis.co2Tons.toFixed(2)} Tons CO2`,
        timestamp: serverTimestamp()
      });

      toast({
        title: "Footprint Resolved!",
        description: `Successfully offset ${analysis.co2Tons.toFixed(2)} tons of CO2. Thank you for traveling responsibly!`,
      });
      setAnalysis(null);
    } catch (e) {
      toast({ variant: 'destructive', title: "Transaction Failed", description: "Could not process offset payment." });
    } finally {
      setIsOffsetting(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Impact Synthesis</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Carbon Synthesis
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Molecular tracking node for environmental equilibrium.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Leaf className="h-32 w-32" /></div>
            <CardHeader className="p-10 pb-4 relative z-10">
              <CardTitle className="text-xl font-headline font-black uppercase tracking-tighter">Impact Radar</CardTitle>
              <CardDescription className="text-emerald-100 font-medium opacity-80">Trajectory impact analysis.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-5xl font-black font-headline leading-none">{totalKm.toLocaleString()}</p>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">KM Traveled</p>
                </div>
                <Progress value={Math.min((totalKm / 50000) * 100, 100)} className="bg-white/20 h-2" />
              </div>

              <Button 
                onClick={handleAnalyze} 
                className="w-full h-14 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-black text-lg shadow-xl"
                disabled={isCalculating}
              >
                {isCalculating ? <Loader2 className="animate-spin" /> : <><Zap className="mr-2 h-5 w-5" /> Calculate Molecular Debt</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] p-8 bg-white">
            <h3 className="text-sm font-black font-headline text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Wallet className="h-4 w-4 text-emerald-600" /> Wallet Balance
            </h3>
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">USD Account</span>
              <span className="text-xl font-black text-slate-900">${usdWallet?.balance.toFixed(2) || '0.00'}</span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {isCalculating ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-6 opacity-50">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
              <p className="font-headline text-2xl font-black animate-pulse uppercase tracking-tighter">Analyzing Atmosphere Data...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-950 text-white p-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingDown className="h-32 w-32 text-primary" /></div>
                <div className="relative z-10 space-y-8">
                  <div>
                    <Badge className="bg-primary text-white border-none font-bold uppercase mb-4 px-3">Synthesis Result</Badge>
                    <h2 className="text-5xl font-black font-headline leading-tight italic">
                      {analysis.co2Tons.toFixed(2)} <span className="text-2xl text-slate-500 uppercase font-black">Tons CO2</span>
                    </h2>
                    <p className="text-slate-400 font-medium text-lg mt-2">{analysis.equivalentImpact}</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 italic text-sm text-slate-300 leading-relaxed font-medium">
                    "{analysis.explanation}"
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-8">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2">Offset Required</p>
                      <p className="text-4xl font-black font-headline text-emerald-400">${analysis.offsetCostUsd.toFixed(2)}</p>
                    </div>
                    <Button 
                      onClick={handleOffset} 
                      disabled={isOffsetting}
                      className="h-16 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      {isOffsetting ? <Loader2 className="animate-spin h-6 w-6" /> : <><ShieldCheck className="mr-2 h-6 w-6" /> Authorize Offset</>}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center text-center opacity-20 grayscale py-20">
              <Leaf className="h-32 w-32 mb-4 mx-auto" />
              <p className="text-3xl font-black font-headline uppercase tracking-tighter">Synthesis Pending</p>
              <p className="max-w-xs mx-auto text-sm font-bold mt-2 leading-relaxed">Initialize impact radar to calculate your molecular environmental footprint.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

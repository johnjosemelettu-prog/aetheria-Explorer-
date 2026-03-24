
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Sparkles, 
  Loader2, 
  ArrowRightLeft, 
  PieChart, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc, serverTimestamp } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { generateBudgetAdvice, type BudgetAdviceOutput } from '@/ai/flows/generate-budget-advice-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

export default function BudgetSynthesisPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [advice, setAdvice] = useState<BudgetAdviceOutput | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const itinerariesQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(1));
    },
    [user, firestore]
  );
  const { data: trips } = useCollection(itinerariesQuery);
  const activeTrip = trips?.[0];

  const transactionsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'transactions'), orderBy('timestamp', 'desc'), limit(20));
    },
    [user, firestore]
  );
  const { data: transactions } = useCollection(transactionsQuery);

  const currentSpend = useMemo(() => {
    return transactions?.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0) || 0;
  }, [transactions]);

  const handleSynthesize = async () => {
    if (!activeTrip || !user) return;
    
    setIsAnalyzing(true);
    try {
      const remainingDays = Math.max(1, differenceInDays(parseISO(activeTrip.endDate), new Date()));
      const totalBudget = activeTrip.budget === 'high' ? 5000 : activeTrip.budget === 'medium' ? 2000 : 1000;

      const result = await generateBudgetAdvice({
        totalBudget,
        currentSpend,
        remainingDays,
        itinerarySummary: activeTrip.itinerarySummary || activeTrip.name,
        recentTransactions: transactions?.map(t => ({ description: t.description, amount: t.amount, category: t.category })) || [],
        language: currentLang
      });
      setAdvice(result);
    } catch (e) {
      toast({ variant: 'destructive', title: "Synthesis Error", description: "The Financial Oracle is unavailable. Try again later." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSyncSwaps = async () => {
    if (!activeTrip || !advice || !user || !firestore) return;
    setIsSyncing(true);
    try {
      const tripRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', activeTrip.id);
      
      updateDocumentNonBlocking(tripRef, {
        itinerarySummary: `${activeTrip.itinerarySummary || ''} [BUDGET UPDATE]: ${advice.optimizationStrategy}`,
        dailyAllowance: advice.dailyAllowanceRemaining,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Journey Synchronized",
        description: "The Financial Oracle's advice has been encoded into your master itinerary.",
      });
      setAdvice(null);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Molecular Financial Hub</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          {t('header.budgetSynthesis')}
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          {t('dashboard.shortDesc.budget')}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><PieChart className="h-32 w-32" /></div>
            <CardHeader className="p-8 pb-4 relative z-10">
              <CardTitle className="text-xl font-headline font-black uppercase tracking-tighter italic">{t('wallet.overviewTab')}</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Real-time expenditure tracking.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8 relative z-10">
              <div>
                <p className="text-5xl font-black font-headline text-primary">${currentSpend.toFixed(2)}</p>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2">Total Debits Synthesized</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase">Budget Velocity</span>
                  <span className="text-white">Active</span>
                </div>
                <Progress value={Math.min((currentSpend / 2000) * 100, 100)} className="h-2 bg-white/5" />
              </div>

              <Button 
                onClick={handleSynthesize} 
                disabled={isAnalyzing || !activeTrip}
                className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-lg shadow-xl"
              >
                {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <><Zap className="mr-2 h-5 w-5" /> Invoke Oracle</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] p-8 bg-white">
            <h3 className="font-headline font-black text-xl mb-6 text-slate-900 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Active Journey
            </h3>
            {activeTrip ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Destination</p>
                  <p className="font-bold text-slate-900">{activeTrip.destination}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Pass Tier</p>
                  <p className="font-black text-primary uppercase text-xs tracking-widest">{activeTrip.subscriptionTier || 'Free'} PASS</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No active odyssey detected.</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-8">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-6 opacity-50">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-headline text-2xl font-black animate-pulse uppercase tracking-tighter">Synchronizing Ledger Data...</p>
            </div>
          ) : advice ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className={cn(
                  "p-10 text-white",
                  advice.status === 'over_budget' ? "bg-red-600" : "bg-emerald-600"
                )}>
                  <div className="flex justify-between items-center">
                    <div>
                      <Badge className="bg-white/20 text-white border-none font-bold uppercase mb-4 px-3">Oracle Verdict</Badge>
                      <h2 className="text-5xl font-black font-headline leading-tight uppercase italic">{advice.status.replace('_', ' ')}</h2>
                    </div>
                    {advice.status === 'over_budget' ? <AlertTriangle className="h-16 w-16" /> : <ShieldCheck className="h-16 w-16" />}
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">New Daily Allowance</p>
                      <p className="text-5xl font-black font-headline text-slate-900">${advice.dailyAllowanceRemaining.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Adjusted for remaining journey duration.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 italic text-sm text-slate-600 font-medium leading-relaxed">
                      "{advice.optimizationStrategy}"
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-black font-headline text-slate-900 flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-primary" /> Strategic Itinerary Swaps
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {advice.smartSwaps.map((swap, i) => (
                        <Card key={i} className="rounded-3xl border-none shadow-lg bg-slate-50 overflow-hidden group hover:shadow-xl transition-all">
                          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 space-y-2">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Original Plan</p>
                              <p className="text-lg font-bold text-slate-400 line-through">{swap.originalPlan}</p>
                            </div>
                            <ArrowRightLeft className="text-primary h-6 w-6 hidden md:block" />
                            <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-start">
                                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Oracle Suggestion</p>
                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px]">Save ${swap.estimatedSaving}</Badge>
                              </div>
                              <p className="text-lg font-black text-slate-900">{swap.suggestedSwap}</p>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{swap.reasoning}"</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button onClick={handleSyncSwaps} disabled={isSyncing} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl">
                    {isSyncing ? <Loader2 className="animate-spin mr-2" /> : <><ArrowUpRight className="mr-2 h-5 w-5" /> Sync Swaps to Itinerary</>}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-32 opacity-20 grayscale gap-6">
              <TrendingUp className="h-32 w-32 text-primary" />
              <div className="space-y-2">
                <h2 className="text-3xl font-black font-headline uppercase tracking-tighter">Oracle Silent</h2>
                <p className="max-w-xs mx-auto text-sm font-bold">Invoke the oracle to synthesize your financial data and optimize your journey.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

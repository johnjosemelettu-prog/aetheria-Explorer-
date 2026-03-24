
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Loader2, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingUp,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment, query, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { searchInsurance, type InsurancePlan } from '@/ai/flows/search-insurance-flow';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function InsurancePage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [hasMounted, setHasMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [recommendation, setRecommendation] = useState('');
  
  const [destination, setDestination] = useState('Paris, France');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [age, setAge] = useState('28');

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);
  const usdWallet = wallets?.find(w => w.currency === 'USD');

  const policiesQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'userProfiles', user.uid, 'insurancePolicies'), orderBy('createdAt', 'desc')) : null),
    [user, firestore]
  );
  const { data: activePolicies, isLoading: isPoliciesLoading } = useCollection(policiesQuery);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSearching(true);
    setPlans([]);
    try {
      const result = await searchInsurance({
        destination,
        startDate,
        endDate,
        travelerAge: parseInt(age),
        language: currentLang
      });
      setPlans(result.availablePlans);
      setRecommendation(result.recommendation);
    } catch (err) {
      toast({ variant: 'destructive', title: "Search Error", description: "The grid node is offline." });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAuthorize = async (plan: InsurancePlan) => {
    if (!user || !usdWallet || !firestore) return;

    if (usdWallet.balance < plan.price) {
      toast({ variant: 'destructive', title: "Insufficient Assets", description: `Authorization requires $${plan.price} in your USD node.` });
      return;
    }

    setIsBooking(plan.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, { balance: increment(-plan.price), updatedAt: serverTimestamp() }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit',
        category: 'insurance',
        amount: plan.price,
        currency: 'USD',
        description: `Insurance Policy: ${plan.name} via ${plan.provider}`,
        timestamp: serverTimestamp()
      });

      const policyRef = doc(collection(firestore, 'userProfiles', user.uid, 'insurancePolicies'));
      setDocumentNonBlocking(policyRef, {
        id: policyRef.id,
        userId: user.uid,
        planName: plan.name,
        provider: plan.provider,
        coverageLimit: plan.coverageLimit,
        price: plan.price,
        status: 'active',
        effectiveDate: startDate,
        expiryDate: endDate,
        destination,
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        createdAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "Coverage Active", description: "The Sentinel Shield has been initialized." });
      setPlans([]);
    } catch (err) {
      toast({ variant: 'destructive', title: "Authorization Error", description: "Node settlement interrupted." });
    } finally {
      setIsBooking(null);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Guardian Infrastructure</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Sentinel Shield
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          High-fidelity protection protocols synthesized for international odysseys.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-headline font-black uppercase tracking-tighter italic">Search Protection</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Define trajectory for risk synthesis.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Destination Node</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input value={destination} onChange={e => setDestination(e.target.value)} className="rounded-xl h-12 bg-slate-50 border-none font-bold pl-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Explorer Age</label>
                    <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="rounded-xl h-12 bg-slate-50 border-none font-bold text-center" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Window</label>
                    <div className="h-12 flex items-center justify-center rounded-xl bg-slate-100 font-black text-slate-400 text-[10px] uppercase tracking-tighter">7 DAYS</div>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSearch()} disabled={isSearching} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all">
                {isSearching ? <Loader2 className="animate-spin" /> : <><Search className="mr-2 h-5 w-5" /> Synthesize Plans</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
            <h3 className="font-headline font-black text-xl mb-6 text-slate-900 flex items-center gap-2 italic">
              <ShieldCheck className="h-6 w-6 text-emerald-600" /> Active Nodes
            </h3>
            {isPoliciesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : activePolicies && activePolicies.length > 0 ? (
              <div className="space-y-4">
                {activePolicies.map(policy => (
                  <div key={policy.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 leading-none truncate uppercase tracking-tighter italic">{policy.planName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Ref: {policy.confirmationCode}</p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[8px] uppercase px-2 py-0.5">ACTIVE</Badge>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[9px] font-black uppercase text-slate-400 border-t border-slate-200 pt-3">
                      <span>{policy.effectiveDate} &rarr; {policy.expiryDate}</span>
                      <span className="text-emerald-600 font-black">${policy.price} PAID</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 opacity-30 grayscale flex flex-col items-center gap-4">
                <ShieldAlert className="h-12 w-12 text-slate-400" />
                <p className="text-xs font-black uppercase tracking-widest text-center">No protection nodes found.</p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-8">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-8 opacity-50">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <Loader2 className="w-full h-full animate-spin text-primary" strokeWidth={1} />
                <Shield className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
              </div>
              <h3 className="text-3xl font-black font-headline uppercase tracking-tighter italic">Mapping Global Risk...</h3>
            </div>
          ) : plans.length > 0 ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <Alert className="border-none shadow-xl bg-slate-900 text-white rounded-[2rem] p-8 overflow-hidden relative group max-w-4xl mx-auto">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Zap className="h-32 w-32 text-primary" /></div>
                <div className="relative z-10 flex gap-6 items-start">
                  <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white flex-shrink-0 shadow-lg"><TrendingUp className="h-8 w-8" /></div>
                  <div>
                    <AlertTitle className="text-2xl font-black font-headline tracking-tighter uppercase mb-2">Architect Recommendation</AlertTitle>
                    <AlertDescription className="text-slate-400 text-lg font-medium italic leading-relaxed">"{recommendation}"</AlertDescription>
                  </div>
                </div>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <Card key={plan.id} className={cn(
                    "border-none shadow-xl rounded-[2.5rem] bg-white flex flex-col hover:shadow-2xl transition-all duration-500 group",
                    plan.name.toLowerCase().includes('elite') && "ring-4 ring-primary ring-offset-4"
                  )}>
                    <CardHeader className="p-8 pb-4 text-center">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <ShieldCheck className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-xl font-black font-headline uppercase tracking-tight leading-none mb-1">{plan.name}</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{plan.provider}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 flex-grow space-y-6">
                      <div className="text-center">
                        <p className="text-4xl font-black font-headline text-slate-900">${plan.price}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400">Total Premium</p>
                      </div>
                      <ul className="space-y-3">
                        {plan.benefits.slice(0, 4).map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> {b}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                      <Button 
                        onClick={() => handleAuthorize(plan)} 
                        disabled={!!isBooking}
                        className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/10"
                      >
                        {isBooking === plan.id ? <Loader2 className="animate-spin h-5 w-5" /> : "Authorize Node"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-32 opacity-20 grayscale gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
                <ShieldCheck className="h-40 w-40 text-primary relative mx-auto" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black font-headline uppercase tracking-tighter italic">Sentinel Idle</h2>
                <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Initialize a trajectory scan to view high-fidelity protection nodes.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

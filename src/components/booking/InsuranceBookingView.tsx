'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { 
  ShieldCheck, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Wallet, 
  Zap, 
  Sparkles, 
  User, 
  Fingerprint, 
  ShieldAlert, 
  ChevronRight, 
  Shield, 
  MapPin, 
  TrendingUp 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { searchInsurance, type InsurancePlan } from '@/ai/flows/search-insurance-flow'
import { useFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase'
import { collection, doc, serverTimestamp, increment, query, orderBy } from 'firebase/firestore'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const insuranceSearchSchema = z.object({
  destination: z.string().min(2, 'Required'),
  age: z.coerce.number().min(18).max(100),
})

export default function InsuranceBookingView({ usdWallet }: { usdWallet: any }) {
  const { toast } = useToast()
  const { user, firestore } = useFirebase()
  const { t, language } = useTranslation()
  
  const [searchResults, setSearchResults] = useState<InsurancePlan[] | null>(null)
  const [recommendation, setRecommendation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState<string | null>(null)
  const [step, setStep] = useState<'search' | 'success'>('search')

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true) }, []);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof insuranceSearchSchema>>({
    resolver: zodResolver(insuranceSearchSchema),
    defaultValues: { destination: '', age: 28 },
  })

  async function onSubmit(values: z.infer<typeof insuranceSearchSchema>) {
    setIsLoading(true); 
    setSearchResults(null);
    setStep('search');
    try {
      const result = await searchInsurance({
        destination: values.destination,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        travelerAge: values.age,
        language: currentLang
      });
      setSearchResults(result.availablePlans);
      setRecommendation(result.recommendation);
    } finally { setIsLoading(false); }
  }

  async function handleAuthorize(plan: InsurancePlan) {
    if (!user || !firestore || !usdWallet) {
      toast({
        variant: 'destructive',
        title: 'Connection Node Offline',
        description: 'Authentication or database node is currently unreachable.',
      });
      return;
    }
    
    if (usdWallet.balance < plan.price) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: `Need $${plan.price} in your USD node.` });
      return;
    }

    setIsBooking(plan.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const bookingData = {
        userId: user.uid, planName: plan.name, provider: plan.provider,
        price: plan.price, status: 'active',
        effectiveDate: format(new Date(), 'yyyy-MM-dd'),
        expiryDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        createdAt: serverTimestamp()
      };

      const policyRef = doc(collection(firestore, 'userProfiles', user.uid, 'insurancePolicies'));
      setDocumentNonBlocking(policyRef, bookingData, { merge: true });
      
      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, { balance: increment(-plan.price), updatedAt: serverTimestamp() }, { merge: true });
      
      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit', category: 'insurance', amount: plan.price, currency: 'USD',
        description: `Insurance: ${plan.name} via ${plan.provider}`, timestamp: serverTimestamp()
      });

      setStep('success');
      toast({ title: "Coverage Active", description: "Your journey is now protected." });
    } finally { setIsBooking(null); }
  }

  if (!hasMounted) return <Skeleton className="h-[400px] w-full" />;

  if (step === 'success') {
    return (
      <Card className="mx-auto max-w-2xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldCheck className="h-40 w-40 text-primary" /></div>
          <div className="relative z-10">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center mb-6 shadow-lg"><CheckCircle2 className="h-12 w-12 text-primary" /></div>
            <CardTitle className="text-4xl font-black font-headline tracking-tighter">Sentinel Node Active!</CardTitle>
            <CardDescription className="text-slate-400 mt-2 text-lg font-medium">Your travel insurance is confirmed and synchronized.</CardDescription>
          </div>
        </div>
        <CardFooter className="p-10 bg-white"><Button asChild className="w-full h-14 rounded-2xl font-black shadow-xl shadow-primary/20"><Link href="/insurance">Manage Protection</Link></Button></CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 items-end gap-6 md:grid-cols-4">
              <FormField control={form.control} name="destination" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel className="font-bold">Destination</FormLabel><FormControl><Input placeholder="City" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel className="font-bold">Age</FormLabel><FormControl><Input type="number" placeholder="Years" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
              )} />
              <Button type="submit" className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Search className="mr-2 h-5 w-5" /> Search Protection</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchResults && (
        <div className="space-y-10">
          <Alert className="border-none shadow-xl bg-slate-900 text-white rounded-[2rem] p-8 overflow-hidden relative group max-w-4xl mx-auto">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Zap className="h-32 w-32 text-primary" /></div>
            <div className="relative z-10 flex gap-6 items-start">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white flex-shrink-0 shadow-lg"><Sparkles className="h-8 w-8" /></div>
              <div>
                <AlertTitle className="text-xl font-black font-headline tracking-tighter uppercase mb-2">Protocol Recommendation</AlertTitle>
                <AlertDescription className="text-slate-400 text-sm font-medium italic leading-relaxed">"{recommendation}"</AlertDescription>
              </div>
            </div>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {searchResults.map((plan) => (
              <Card key={plan.id} className="border-none shadow-xl rounded-[2rem] bg-white group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col">
                <CardHeader className="p-8 pb-4 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-black font-headline text-slate-900">{plan.name}</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{plan.provider}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-grow space-y-6">
                  <div className="text-center">
                    <p className="text-4xl font-black font-headline text-slate-900">${plan.price}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400">Total Premium</p>
                  </div>
                  <ul className="space-y-3">
                    {plan.benefits.slice(0, 3).map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button 
                    className="w-full h-12 rounded-xl font-black" 
                    onClick={() => handleAuthorize(plan)}
                    disabled={!!isBooking}
                  >
                    {isBooking === plan.id ? <Loader2 className="animate-spin" /> : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

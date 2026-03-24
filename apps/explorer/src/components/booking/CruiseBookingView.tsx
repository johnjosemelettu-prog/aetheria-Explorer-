'use client'

import { useState } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Ship, Search, Sailboat, CheckCircle2, Loader2, Wallet, ShieldCheck, X, Sparkles, User, Fingerprint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { searchCruises, type Cruise } from '@/ai/flows/search-cruises-flow'
import { useFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase'
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow'
import { Label } from '@/components/ui/label'

const cruiseSchema = z.object({
  destination: z.string().min(2, 'Required'),
  departureMonth: z.string().min(7, 'YYYY-MM'),
  passengers: z.coerce.number().min(1),
})

export default function CruiseBookingView({ usdWallet }: { usdWallet: any }) {
  const { toast } = useToast()
  const { user, firestore } = useFirebase()
  const { t, language } = useTranslation()
  
  const [searchResults, setSearchResults] = useState<Cruise[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null)
  const [step, setStep] = useState<'search' | 'details' | 'success'>('search')
  const [isBooking, setIsBooking] = useState(false)
  const [passengerNames, setPassengerNames] = useState<string[]>([''])

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof cruiseSchema>>({
    resolver: zodResolver(cruiseSchema),
    defaultValues: { destination: '', departureMonth: new Date().toISOString().slice(0, 7), passengers: 2 },
  })

  async function onSubmit(values: z.infer<typeof cruiseSchema>) {
    setIsLoading(true); setSearchResults(null);
    try { 
      const results = await searchCruises(values); 
      setSearchResults(results); 
      setPassengerNames(Array(values.passengers).fill(''));
    } finally { setIsLoading(false); }
  }

  const handleSelectCruise = (cruise: Cruise) => {
    setSelectedCruise(cruise);
    setStep('details');
  };

  const updatePassengerName = (index: number, name: string) => {
    const newNames = [...passengerNames];
    newNames[index] = name;
    setPassengerNames(newNames);
  };

  async function handleFinalAuthorize() {
    if (!user || !selectedCruise || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Connection Node Offline',
        description: 'Authentication or database node is currently unreachable.',
      });
      return;
    }
    
    if (passengerNames.some(n => !n.trim())) {
      toast({ variant: 'destructive', title: 'Details Required', description: 'Names are needed for the voyage manifest.' });
      return;
    }

    const passengers = form.getValues('passengers');
    const totalPrice = selectedCruise.pricePerPerson * passengers;
    
    if (!usdWallet || usdWallet.balance < totalPrice) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: `Need $${totalPrice}.` });
      return;
    }
    setIsBooking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const bookingData = {
        userId: user.uid, cruiseLineName: selectedCruise.cruiseLine, shipName: selectedCruise.name, departurePort: selectedCruise.destination, 
        durationDays: selectedCruise.durationDays, totalPrice, currency: 'USD',
        passengers: passengerNames,
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed', bookedAt: new Date().toISOString(),
      };
      setDocumentNonBlocking(doc(collection(firestore, 'userProfiles', user.uid, 'cruiseBookings')), bookingData, { merge: true });
      setDocumentNonBlocking(doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD'), { balance: increment(-totalPrice), updatedAt: serverTimestamp() }, { merge: true });
      addDocumentNonBlocking(collection(firestore, 'userProfiles', user.uid, 'transactions'), { type: 'debit', category: 'booking', amount: totalPrice, currency: 'USD', description: `Cruise: ${selectedCruise.name}`, timestamp: serverTimestamp() });
      setDocumentNonBlocking(doc(firestore, 'userProfiles', user.uid, 'loyalty', 'status'), { points: increment(1000), updatedAt: serverTimestamp() }, { merge: true });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'cruise',
          bookingDetails: bookingData,
          language: currentLang
        });
      } catch (err) {}

      setStep('success');
      setSearchResults(null);
      toast({ title: "Voyage Secured", description: "Bon voyage!" });
    } finally { setIsBooking(false); }
  }

  if (step === 'success' && selectedCruise) {
    return (
      <Card className="mx-auto max-w-2xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-indigo-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><Ship className="h-40 w-40" /></div>
          <div className="relative z-10">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center mb-6"><CheckCircle2 className="h-12 w-12 text-white" /></div>
            <CardTitle className="text-4xl font-black font-headline tracking-tighter">Ocean Bound!</CardTitle>
            <CardDescription className="text-white/80 mt-2 text-lg font-medium">You are booked on the {selectedCruise.name}.</CardDescription>
          </div>
        </div>
        <CardFooter className="p-10 bg-white"><Button asChild className="w-full h-14 rounded-2xl font-black shadow-xl"><Link href="/trips">My Journeys</Link></Button></CardFooter>
      </Card>
    );
  }

  if (step === 'details' && selectedCruise) {
    const passengers = form.getValues('passengers');
    const totalPrice = selectedCruise.pricePerPerson * passengers;
    const canAfford = usdWallet && usdWallet.balance >= totalPrice;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-4 duration-500">
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-indigo-950 text-white p-8">
              <CardTitle className="text-2xl font-black font-headline flex items-center gap-3">
                <Fingerprint className="h-6 w-6 text-primary" /> Voyage Manifest
              </CardTitle>
              <CardDescription className="text-slate-400">Complete traveler details for maritime boarding.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {passengerNames.map((name, i) => (
                <div key={i} className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4" /> Guest 0{i + 1}
                  </Label>
                  <Input 
                    placeholder="Full Passport Name" 
                    value={name} 
                    onChange={(e) => updatePassengerName(i, e.target.value)} 
                    className="h-12 rounded-xl border-slate-200"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
            <h3 className="font-headline font-black text-xl mb-6 text-slate-900 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-indigo-600" /> Payment Node
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-black uppercase text-slate-400">Smart Wallet Assets (USD)</span>
                <span className="font-headline font-black text-xl text-slate-900">${usdWallet?.balance.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-xs font-black uppercase text-indigo-600">Grand Total Voyage</span>
                <span className="font-headline font-black text-xl text-indigo-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        <aside className="lg:col-span-5">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden sticky top-24">
            <div className="relative h-48 w-full">
              {selectedCruise.image && <Image src={selectedCruise.image.imageUrl} alt="Ship" fill className="object-cover opacity-60" />}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <CardTitle className="text-3xl font-black font-headline leading-tight">{selectedCruise.name}</CardTitle>
                <CardDescription className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">{selectedCruise.cruiseLine}</CardDescription>
              </div>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/10">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Duration</p>
                  <p className="font-bold">{selectedCruise.durationDays} Days</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Departure</p>
                  <p className="font-bold">{selectedCruise.destination}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Secure protocol active. Your booking is protected by Aura Journey Assurance.</p>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 gap-3">
              <Button variant="ghost" className="flex-1 font-bold text-white/40 hover:text-white" onClick={() => setStep('search')}>Back</Button>
              <Button 
                className="flex-[2] h-14 rounded-2xl font-black text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl"
                disabled={!canAfford || isBooking || passengerNames.some(n => !n.trim())}
                onClick={handleFinalAuthorize}
              >
                {isBooking ? <Loader2 className="animate-spin" /> : "Confirm Voyage"}
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
              <FormField control={form.control} name="destination" render={({ field }) => (
                <FormItem><FormLabel className="font-bold">{t('cruises.destinationLabel')}</FormLabel><FormControl><Input placeholder={t('cruises.destinationPlaceholder')} {...field} className="rounded-xl h-12" /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="departureMonth" render={({ field }) => (
                <FormItem><FormLabel className="font-bold">{t('cruises.monthLabel')}</FormLabel><FormControl><Input type="month" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
              )} />
              <Button type="submit" className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 bg-indigo-500 hover:bg-indigo-600 text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Search className="mr-2 h-5 w-5" /> {t('cruises.searchButton')}</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchResults && (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((cruise) => (
            <Card key={cruise.id} className="overflow-hidden border-none shadow-xl rounded-[2rem] group flex flex-col bg-white">
              {cruise.image && (
                <div className="relative h-56 w-full overflow-hidden">
                  <Image src={cruise.image.imageUrl} alt={cruise.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <CardHeader className="p-8 pb-4"><CardTitle className="text-2xl font-black font-headline text-slate-900 leading-tight">{cruise.name}</CardTitle><CardDescription className="flex items-center gap-2 font-bold text-indigo-500 uppercase tracking-widest text-[10px]"><Sailboat className="h-3.5 w-3.5"/> {cruise.cruiseLine}</CardDescription></CardHeader>
              <CardContent className="px-8 pb-4 flex-grow"><p className="text-sm font-medium text-slate-500 mb-4">{cruise.durationDays} days in {cruise.destination}</p><div className="flex items-baseline gap-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('cruises.from')}</span><span className="text-3xl font-black font-headline text-slate-900">${cruise.pricePerPerson}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">/ PERSON</span></div></CardContent>
              <CardFooter className="p-8 pt-0"><Button className="w-full h-12 rounded-xl font-black bg-slate-900 text-white hover:bg-indigo-600" onClick={() => handleSelectCruise(cruise)}>Select Cabin</Button></CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

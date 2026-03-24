'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { Train, Search, Loader2, CheckCircle2, Clock, Wallet, Zap, ArrowRight, ShieldCheck, X, Sparkles, User, Fingerprint, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { searchTrains, type TrainOption } from '@/ai/flows/search-trains-flow';
import { useFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { availableLanguages, useTranslation } from '@/lib/i18n';
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const trainSchema = z.object({
  tripType: z.enum(['oneWay', 'roundTrip']),
  from: z.string().min(2, 'Required'),
  to: z.string().min(2, 'Required'),
  departureDate: z.date(),
  returnDate: z.date().optional(),
  passengers: z.coerce.number().min(1).max(10),
}).refine(data => {
  if (data.tripType === 'roundTrip' && !data.returnDate) return false;
  return true;
}, {
  message: "Return date required.",
  path: ["returnDate"]
});

export default function TrainBookingView({ usdWallet }: { usdWallet: any }) {
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const { t, language } = useTranslation();
  
  const [searchResults, setSearchResults] = useState<TrainOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainOption | null>(null);
  const [step, setStep] = useState<'search' | 'details' | 'success'>('search');
  const [isBooking, setIsBooking] = useState(false);
  const [passengerNames, setPassengerNames] = useState<string[]>(['']);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof trainSchema>>({
    resolver: zodResolver(trainSchema),
    defaultValues: { tripType: 'roundTrip', from: '', to: '', departureDate: new Date(), passengers: 1 },
  });

  const tripType = form.watch('tripType');

  async function onSubmit(values: z.infer<typeof trainSchema>) {
    setIsLoading(true);
    setSearchResults(null);
    try {
      const results = await searchTrains({ 
        from: values.from, 
        to: values.to, 
        date: format(values.departureDate, 'yyyy-MM-dd'),
        returnDate: values.tripType === 'roundTrip' && values.returnDate ? format(values.returnDate, 'yyyy-MM-dd') : undefined,
        passengers: values.passengers 
      });
      setSearchResults(results);
      setPassengerNames(Array(values.passengers).fill(''));
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectTrain = (train: TrainOption) => {
    setSelectedTrain(train);
    setStep('details');
  };

  const updatePassengerName = (index: number, name: string) => {
    const newNames = [...passengerNames];
    newNames[index] = name;
    setPassengerNames(newNames);
  };

  async function handleFinalAuthorize() {
    if (!user || !firestore || !selectedTrain) {
      toast({
        variant: 'destructive',
        title: 'Connection Node Offline',
        description: 'Authentication or database node is currently unreachable.',
      });
      return;
    }
    
    if (passengerNames.some(n => n.trim().length < 3)) {
      toast({ variant: 'destructive', title: 'Details Required', description: 'Enter full names for all passengers.' });
      return;
    }

    if (!usdWallet || usdWallet.balance < selectedTrain.price) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: `Need $${selectedTrain.price}.` });
      return;
    }

    setIsBooking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const bookingData = {
        userId: user.uid,
        operatorName: selectedTrain.operator,
        trainType: selectedTrain.type,
        departureStation: form.getValues('from'),
        arrivalStation: form.getValues('to'),
        departureTime: selectedTrain.departureTime,
        arrivalTime: selectedTrain.arrivalTime,
        travelDate: format(form.getValues('departureDate'), 'yyyy-MM-dd'),
        returnDate: form.getValues('tripType') === 'roundTrip' && form.getValues('returnDate') ? format(form.getValues('returnDate')!, 'yyyy-MM-dd') : null,
        totalPrice: selectedTrain.price,
        currency: 'USD',
        seatClass: selectedTrain.class,
        passengers: passengerNames,
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed',
        bookedAt: new Date().toISOString(),
      };

      setDocumentNonBlocking(doc(collection(firestore, 'userProfiles', user.uid, 'trainBookings')), bookingData, { merge: true });
      setDocumentNonBlocking(doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD'), { balance: increment(-selectedTrain.price), updatedAt: serverTimestamp() }, { merge: true });
      addDocumentNonBlocking(collection(firestore, 'userProfiles', user.uid, 'transactions'), {
        type: 'debit',
        category: 'booking',
        amount: selectedTrain.price,
        currency: 'USD',
        description: `Train: ${selectedTrain.operator} for ${passengerNames[0]}`,
        timestamp: serverTimestamp()
      });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'train',
          bookingDetails: bookingData,
          language: currentLang
        });
      } catch (err) {}

      setStep('success');
      setSearchResults(null);
      toast({ title: "Track Secured", description: "Your train journey is confirmed." });
    } finally {
      setIsBooking(false);
    }
  }

  if (step === 'success' && selectedTrain) {
    return (
      <Card className="mx-auto max-w-2xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><Train className="h-40 w-40" /></div>
          <div className="relative z-10">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-primary flex items-center justify-center mb-6"><CheckCircle2 className="h-12 w-12 text-white" /></div>
            <CardTitle className="text-4xl font-black font-headline tracking-tighter">Tickets Issued!</CardTitle>
            <CardDescription className="text-slate-400 mt-2 text-lg font-medium">Your train journey is confirmed and synced.</CardDescription>
          </div>
        </div>
        <CardFooter className="p-10 bg-white"><Button asChild className="w-full h-14 rounded-2xl font-black shadow-xl"><Link href="/trips">View My Journeys</Link></Button></CardFooter>
      </Card>
    );
  }

  if (step === 'details' && selectedTrain) {
    const canAfford = usdWallet && usdWallet.balance >= selectedTrain.price;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-4 duration-500">
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-2xl font-black font-headline flex items-center gap-3">
                <Fingerprint className="h-6 w-6 text-primary" /> Manifest Entry
              </CardTitle>
              <CardDescription className="text-slate-400">Complete traveler details for rail security.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {passengerNames.map((name, i) => (
                <div key={i} className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4" /> Passenger 0{i + 1}
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
              <Wallet className="h-6 w-6 text-accent" /> Multicurrency Logic
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-black uppercase text-slate-400">Available USD</span>
                <span className="font-headline font-black text-xl text-slate-900">${usdWallet?.balance.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950 text-white">
                <span className="text-xs font-black uppercase text-slate-500">Total Ticket Cost</span>
                <span className="font-headline font-black text-xl text-primary">${selectedTrain.price.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        <aside className="lg:col-span-5">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden sticky top-24">
            <CardHeader className="bg-slate-50 p-8">
              <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] mb-4">Rail Summary</Badge>
              <CardTitle className="text-3xl font-black font-headline text-slate-900 leading-tight">{selectedTrain.operator}</CardTitle>
              <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{selectedTrain.type} Service</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-12 py-6 border-y border-slate-100">
                <div className="text-center">
                  <p className="text-2xl font-black font-headline text-slate-900">{selectedTrain.departureTime}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DEP</p>
                </div>
                <ArrowRight className="text-primary h-6 w-6" />
                <div className="text-center">
                  <p className="text-2xl font-black font-headline text-slate-900">{selectedTrain.arrivalTime}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ARR</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Zap className="h-5 w-5 text-primary" />
                  <p className="text-sm font-bold text-slate-700">{selectedTrain.class}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Tickets are issued instantly and stored in your profile for offline terminal access.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 gap-3">
              <Button variant="ghost" className="flex-1 font-bold" onClick={() => setStep('search')}>Back</Button>
              <Button 
                className="flex-[2] h-14 rounded-2xl font-black text-lg bg-slate-900 text-white shadow-xl"
                disabled={!canAfford || isBooking || passengerNames.some(n => n.trim().length < 3)}
                onClick={handleFinalAuthorize}
              >
                {isBooking ? <Loader2 className="animate-spin" /> : "Authorize Journey"}
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex justify-center">
                <Tabs value={tripType} onValueChange={(v: any) => form.setValue('tripType', v)} className="w-fit">
                  <TabsList className="bg-slate-100 rounded-xl p-1 h-12">
                    <TabsTrigger value="roundTrip" className="rounded-lg font-bold px-6">Round Trip</TabsTrigger>
                    <TabsTrigger value="oneWay" className="rounded-lg font-bold px-6">One Way</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-4">
                <FormField control={form.control} name="from" render={({ field }) => (
                  <FormItem><FormLabel className="font-bold">Origin</FormLabel><FormControl><Input placeholder="City" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="to" render={({ field }) => (
                  <FormItem><FormLabel className="font-bold">Destination</FormLabel><FormControl><Input placeholder="City" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="departureDate" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel className="font-bold">Departure</FormLabel>
                    <Popover><PopoverTrigger asChild><Button variant={'outline'} className="w-full justify-start text-left font-normal rounded-xl h-12 border-slate-200"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'LLL dd, y') : <span>Select</span>}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} /></PopoverContent>
                    </Popover>
                  </FormItem>
                )} />
                {tripType === 'roundTrip' ? (
                  <FormField control={form.control} name="returnDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel className="font-bold">Return</FormLabel>
                      <Popover><PopoverTrigger asChild><Button variant={'outline'} className="w-full justify-start text-left font-normal rounded-xl h-12 border-slate-200"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'LLL dd, y') : <span>Select</span>}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < form.getValues('departureDate')} /></PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                ) : (
                  <Button type="submit" className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 bg-slate-900 text-white" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Search className="mr-2 h-5 w-5" /> Search Trains</>}
                  </Button>
                )}
              </div>
              {tripType === 'roundTrip' && (
                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 bg-slate-900 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Search className="mr-2 h-5 w-5" /> Search Trains</>}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchResults && (
        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          {searchResults.map((train) => (
            <Card key={train.id} className="overflow-hidden border-none shadow-xl rounded-[2rem] bg-white group hover:border-primary transition-all duration-500">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8 flex-1">
                  <div className="bg-slate-100 p-6 rounded-3xl text-slate-900 group-hover:bg-primary group-hover:text-white transition-colors"><Train className="h-10 w-10" /></div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl font-black font-headline text-slate-900">{train.operator}</CardTitle>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold uppercase text-[9px]">{train.type}</Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-bold text-slate-400 pt-1">
                      <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {train.departureTime} &rarr; {train.arrivalTime}</div>
                      <div className="flex items-center gap-2 text-primary"><Zap className="h-4 w-4" /> {train.class}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right"><p className="text-4xl font-black font-headline text-slate-900">${train.price}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Fare</p></div>
                  <Button className="rounded-2xl h-14 px-10 font-black text-lg" onClick={() => handleSelectTrain(train)}>Select Seat</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

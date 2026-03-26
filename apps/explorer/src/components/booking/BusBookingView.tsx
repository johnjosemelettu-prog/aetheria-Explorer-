'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Bus, Search, Loader2, CheckCircle2, Clock, Wallet, Wifi, ShieldCheck, X, Sparkles, User, Fingerprint, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { searchBuses, type BusOption } from '@/ai/flows/search-buses-flow';
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

const busSchema = z.object({
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

export default function BusBookingView({ usdWallet }: { usdWallet: any }) {
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const { t, language } = useTranslation();
  
  const [searchResults, setSearchResults] = useState<BusOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusOption | null>(null);
  const [step, setStep] = useState<'search' | 'details' | 'success'>('search');
  const [isBooking, setIsBooking] = useState(false);
  const [passengerNames, setPassengerNames] = useState<string[]>(['']);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof busSchema>>({
    resolver: zodResolver(busSchema),
    defaultValues: { tripType: 'roundTrip', from: '', to: '', departureDate: new Date(), passengers: 1 },
  });

  const tripType = form.watch('tripType');

  async function onSubmit(values: z.infer<typeof busSchema>) {
    setIsLoading(true);
    setSearchResults(null);
    setStep('search');
    try {
      const results = await searchBuses({
        from: values.from,
        to: values.to,
        date: format(values.departureDate, 'yyyy-MM-dd'),
        passengers: values.passengers,
        language: currentLang
      });
      setSearchResults(results);
      setPassengerNames(Array(values.passengers).fill(''));
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectBus = (bus: BusOption) => {
    setSelectedBus(bus);
    setStep('details');
  };

  const updatePassengerName = (index: number, name: string) => {
    const newNames = [...passengerNames];
    newNames[index] = name;
    setPassengerNames(newNames);
  };

  async function handleFinalAuthorize() {
    if (!user || !firestore || !selectedBus) {
      toast({
        variant: 'destructive',
        title: 'Connection Node Offline',
        description: 'Authentication or database node is currently unreachable.',
      });
      return;
    }
    
    if (passengerNames.some(n => !n.trim())) {
      toast({ variant: 'destructive', title: 'Manifest Required', description: 'Names are needed for boarding.' });
      return;
    }

    if (!usdWallet || usdWallet.balance < selectedBus.price) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: `Need $${selectedBus.price}.` });
      return;
    }

    setIsBooking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const bookingData = {
        userId: user.uid,
        providerName: selectedBus.provider,
        departureCity: form.getValues('from'),
        arrivalCity: form.getValues('to'),
        departureTime: selectedBus.departureTime,
        arrivalTime: selectedBus.arrivalTime,
        travelDate: format(form.getValues('departureDate'), 'yyyy-MM-dd'),
        returnDate: form.getValues('tripType') === 'roundTrip' && form.getValues('returnDate') ? format(form.getValues('returnDate')!, 'yyyy-MM-dd') : null,
        totalPrice: selectedBus.price,
        currency: 'USD',
        seatType: selectedBus.seatType,
        passengers: passengerNames,
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed',
        bookedAt: new Date().toISOString(),
      };

      const busRef = doc(collection(firestore, 'userProfiles', user.uid, 'busBookings'));
      setDocumentNonBlocking(busRef, bookingData, { merge: true });
      
      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, { 
        balance: increment(-selectedBus.price), 
        updatedAt: serverTimestamp() 
      }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit',
        category: 'booking',
        amount: selectedBus.price,
        currency: 'USD',
        description: `Bus: ${selectedBus.provider} for ${passengerNames[0]}`,
        timestamp: serverTimestamp()
      });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'bus',
          bookingDetails: bookingData,
          language: currentLang
        });
      } catch (err) {}

      setStep('success');
      setSearchResults(null);
      toast({ title: "Seat Secured", description: "Your coach is ready." });
    } finally {
      setIsBooking(false);
    }
  }

  if (step === 'success' && selectedBus) {
    return (
      <Card className="mx-auto max-w-2xl border-none shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-emerald-600 p-6 md:p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10"><Bus className="h-24 w-24 md:h-40 md:w-40" /></div>
          <div className="relative z-10">
            <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-white/20 flex items-center justify-center mb-4 md:mb-6"><CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-white" /></div>
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-black font-headline tracking-tighter">Ready for Boarding!</CardTitle>
            <CardDescription className="text-white/80 mt-2 text-base md:text-lg font-medium">Your coach seat is confirmed.</CardDescription>
          </div>
        </div>
        <CardFooter className="p-6 md:p-10 bg-white"><Button asChild className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black shadow-xl"><Link href="/trips">My Journeys</Link></Button></CardFooter>
      </Card>
    );
  }

  if (step === 'details' && selectedBus) {
    const canAfford = usdWallet && usdWallet.balance >= selectedBus.price;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 animate-in slide-in-from-bottom-4 duration-500">
        <div className="lg:col-span-7 space-y-6 md:space-y-8">
          <Card className="border-none shadow-xl rounded-[1.5rem] md:rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-emerald-900 text-white p-6 md:p-8">
              <CardTitle className="text-xl md:text-2xl font-black font-headline flex items-center gap-3">
                <Fingerprint className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Manifest Entry
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs md:text-sm">Specify names for all passengers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
              {passengerNames.map((name, i) => (
                <div key={i} className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2 text-sm md:text-base">
                    <User className="h-4 w-4" /> Passenger 0{i + 1}
                  </Label>
                  <Input 
                    placeholder="Full Name" 
                    value={name} 
                    onChange={(e) => updatePassengerName(i, e.target.value)} 
                    className="h-10 md:h-12 rounded-lg md:rounded-xl border-slate-200"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-6 md:p-8">
            <h3 className="font-headline font-black text-lg md:text-xl mb-4 md:mb-6 text-slate-900 flex items-center gap-2">
              <Wallet className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" /> Payment Node
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400">Available Funds</span>
                <span className="font-headline font-black text-lg md:text-xl text-slate-900">${usdWallet?.balance.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-black uppercase text-emerald-600">Total Fare</span>
                <span className="font-headline font-black text-lg md:text-xl text-emerald-600">${selectedBus.price.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        <aside className="lg:col-span-5">
          <Card className="border-none shadow-2xl rounded-[2rem] md:rounded-[3rem] bg-white overflow-hidden sticky top-24">
            <CardHeader className="bg-emerald-50 p-6 md:p-8">
              <Badge className="bg-emerald-600 text-white border-none font-bold uppercase tracking-widest text-[8px] md:text-[9px] mb-3 md:mb-4 w-fit">Coach Review</Badge>
              <CardTitle className="text-2xl md:text-3xl font-black font-headline text-slate-900">{selectedBus.provider}</CardTitle>
              <CardDescription className="font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-1">{selectedBus.seatType}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-6 md:gap-12 py-4 md:py-6 border-y border-slate-100">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-black font-headline text-slate-900">{selectedBus.departureTime}</p>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">DEP</p>
                </div>
                <ArrowRight className="text-emerald-600 h-5 w-5 md:h-6 md:w-6" />
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-black font-headline text-slate-900">{selectedBus.arrivalTime}</p>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">ARR</p>
                </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-slate-600">
                  <Wifi className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
                  <span>WiFi & Power Onboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed">Securing your seat earns you +250 Explorer Points.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 md:p-8 pt-0 gap-3">
              <Button variant="ghost" className="flex-1 font-bold h-10 md:h-12" onClick={() => setStep('search')}>Back</Button>
              <Button 
                className="flex-[2] h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200"
                disabled={!canAfford || isBooking || passengerNames.some(n => !n.trim())}
                onClick={handleFinalAuthorize}
              >
                {isBooking ? <Loader2 className="animate-spin" /> : "Confirm Seat"}
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10">
      <Card className="border-none shadow-xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-6 md:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
              <div className="flex justify-center">
                <Tabs value={tripType} onValueChange={(v: any) => form.setValue('tripType', v)} className="w-full md:w-fit">
                  <TabsList className="bg-slate-100 rounded-xl p-1 h-12 w-full md:w-fit">
                    <TabsTrigger value="roundTrip" className="flex-1 md:flex-none rounded-lg font-bold px-4 md:px-6 text-xs md:text-sm">Round Trip</TabsTrigger>
                    <TabsTrigger value="oneWay" className="flex-1 md:flex-none rounded-lg font-bold px-4 md:px-6 text-xs md:text-sm">One Way</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 items-end gap-4 md:gap-6 md:grid-cols-4">
                <FormField control={form.control} name="from" render={({ field }) => (
                  <FormItem><FormLabel className="font-bold text-xs md:text-sm">Origin</FormLabel><FormControl><Input placeholder="City" {...field} className="rounded-lg md:rounded-xl h-10 md:h-12" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="to" render={({ field }) => (
                  <FormItem><FormLabel className="font-bold text-xs md:text-sm">Destination</FormLabel><FormControl><Input placeholder="City" {...field} className="rounded-lg md:rounded-xl h-10 md:h-12" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="departureDate" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel className="font-bold text-xs md:text-sm">Departure</FormLabel>
                    <Popover><PopoverTrigger asChild><Button variant={'outline'} className="w-full justify-start text-left font-normal rounded-lg md:rounded-xl h-10 md:h-12 border-slate-200 text-xs md:text-sm"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'LLL dd, y') : <span>Select</span>}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} /></PopoverContent>
                    </Popover>
                  </FormItem>
                )} />
                {tripType === 'roundTrip' ? (
                  <FormField control={form.control} name="returnDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel className="font-bold text-xs md:text-sm">Return</FormLabel>
                      <Popover><PopoverTrigger asChild><Button variant={'outline'} className="w-full justify-start text-left font-normal rounded-lg md:rounded-xl h-10 md:h-12 border-slate-200 text-xs md:text-sm"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'LLL dd, y') : <span>Select</span>}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < form.getValues('departureDate')} /></PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                ) : (
                  <Button type="submit" className="h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-emerald-200 bg-emerald-600 text-white" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Search className="mr-2 h-5 w-5" /> Search Coaches</>}
                  </Button>
                )}
              </div>
              {tripType === 'roundTrip' && (
                <Button type="submit" className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-emerald-200 bg-emerald-600 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Search className="mr-2 h-5 w-5" /> Search Coaches</>}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchResults && (
        <div className="grid grid-cols-1 gap-4 md:gap-6 max-w-4xl mx-auto">
          {searchResults.map((bus) => (
            <Card key={bus.id} className="overflow-hidden border-none shadow-xl rounded-[1.5rem] md:rounded-[2rem] bg-white group hover:border-emerald-500 transition-all duration-500">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="flex items-center gap-4 md:gap-8 flex-1 w-full">
                  <div className="bg-emerald-50 p-4 md:p-6 rounded-2xl md:rounded-3xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0"><Bus className="h-6 w-6 md:h-10 md:w-10" /></div>
                  <div className="space-y-1 md:space-y-2">
                    <CardTitle className="text-lg md:text-2xl font-black font-headline text-slate-900">{bus.provider}</CardTitle>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {bus.amenities.map(a => <Badge key={a} variant="outline" className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter">{a}</Badge>)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[10px] md:text-sm font-bold text-slate-400 pt-1">
                      <div className="flex items-center gap-2"><Clock className="h-3 w-3 md:h-4 md:w-4" /> {bus.departureTime} &rarr; {bus.arrivalTime}</div>
                      <div className="flex items-center gap-2 text-emerald-600"><ShieldCheck className="h-3 w-3 md:h-4 md:w-4" /> {bus.seatType}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right"><p className="text-2xl md:text-4xl font-black font-headline text-slate-900">${bus.price}</p><p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Price</p></div>
                  <Button className="rounded-xl md:rounded-2xl h-12 md:h-14 px-6 md:px-10 font-black text-sm md:text-lg" onClick={() => handleSelectBus(bus)}>Select Seat</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

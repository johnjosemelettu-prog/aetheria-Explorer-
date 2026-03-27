'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  Plane,
  Calendar as CalendarIcon,
  Search,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Wallet,
  User,
  Fingerprint,
  Coffee,
  Clock
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { searchFlights, type Flight } from '@/ai/flows/search-flights-flow'
import { useFirebase, setDocumentNonBlocking, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase'
import { collection, serverTimestamp, doc, increment } from 'firebase/firestore'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { availableLanguages, useTranslation } from '@/lib/i18n'

const flightBookingSchema = z.object({
  tripType: z.enum(['oneWay', 'roundTrip']),
  from: z.string().min(2, 'Please enter a departure location.'),
  to: z.string().min(2, 'Please enter an arrival location.'),
  departureDate: z.date(),
  returnDate: z.date().optional(),
  passengers: z.coerce.number().min(1, 'At least one passenger is required.'),
}).refine(data => {
  if (data.tripType === 'roundTrip' && !data.returnDate) return false;
  if (data.tripType === 'roundTrip' && data.returnDate && data.returnDate < data.departureDate) return false;
  return true;
}, {
  message: "Return date must be after departure.",
  path: ["returnDate"]
});

export default function FlightBookingView({ usdWallet }: { usdWallet: any }) {
  const [searchResults, setSearchResults] = useState<Flight[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [step, setStep] = useState<'search' | 'details' | 'success'>('search')
  const [isBooking, setIsBooking] = useState<string | null>(null)
  const [passengerNames, setPassengerNames] = useState<string[]>([''])
  const [includePriority, setIncludePriority] = useState(false)

  const PRIORITY_PRICE = 25;
  const { toast } = useToast()
  const { t, language } = useTranslation()
  const { user, firestore } = useFirebase()

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof flightBookingSchema>>({
    resolver: zodResolver(flightBookingSchema),
    defaultValues: {
      tripType: 'roundTrip',
      from: '',
      to: '',
      departureDate: new Date(),
      passengers: 1,
    },
  })

  const tripType = form.watch('tripType');

  const updatePassengerName = (index: number, name: string) => {
    const newNames = [...passengerNames];
    newNames[index] = name;
    setPassengerNames(newNames);
  };

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setStep('details');
    setPassengerNames(Array(form.getValues('passengers')).fill(''));
  };

  const onSubmit = async (values: z.infer<typeof flightBookingSchema>) => {
    setIsLoading(true);
    setSearchResults(null);
    try {
      const results = await searchFlights({
        from: values.from,
        to: values.to,
        departureDate: format(values.departureDate, 'yyyy-MM-dd'),
        returnDate: values.tripType === 'roundTrip' && values.returnDate ? format(values.returnDate, 'yyyy-MM-dd') : undefined,
        passengers: values.passengers,
        language: currentLang
      });
      setSearchResults(results);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Search Failed', description: 'The aviation grid is offline.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!user || !firestore || !selectedFlight) {
      toast({ variant: 'destructive', title: 'Identity Node Offline', description: 'Auth node required for booking.' });
      return;
    }

    if (passengerNames.some(n => n.trim().length < 3)) {
      toast({ variant: 'destructive', title: 'Details Incomplete', description: 'Please enter full legal names for all passengers.' });
      return;
    }

    const finalPrice = includePriority ? selectedFlight.price + PRIORITY_PRICE : selectedFlight.price;

    if (!usdWallet || usdWallet.balance < finalPrice) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: `Need $${finalPrice} in your USD node.` });
      return;
    }

    setIsBooking(selectedFlight.id)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const bookingData = {
        userId: user.uid,
        airlineName: selectedFlight.airline,
        flightNumber: selectedFlight.id,
        departureAirportCode: selectedFlight.from,
        arrivalAirportCode: selectedFlight.to,
        departureDateTime: format(form.getValues('departureDate'), 'yyyy-MM-dd'),
        returnDateTime: form.getValues('tripType') === 'roundTrip' && form.getValues('returnDate') ? format(form.getValues('returnDate')!, 'yyyy-MM-dd') : null,
        totalPrice: finalPrice,
        currency: 'USD',
        passengers: passengerNames,
        isPriorityPackage: includePriority,
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed',
        bookedAt: new Date().toISOString(),
      };

      const flightBookingRef = doc(collection(firestore, 'userProfiles', user.uid, 'flightBookings'));
      setDocumentNonBlocking(flightBookingRef, bookingData, { merge: true });

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, { balance: increment(-finalPrice), updatedAt: serverTimestamp() }, { merge: true });

      const transactionRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transactionRef, {
        type: 'debit', category: 'booking', amount: finalPrice, currency: 'USD',
        description: `Flight: ${selectedFlight.airline}${includePriority ? ' (Priority)' : ''}`,
        timestamp: serverTimestamp()
      });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'flight',
          bookingDetails: bookingData,
          language: currentLang
        });
      } catch (err) {}

      setStep('success');
      toast({ title: 'Flight Confirmed', description: 'Safe travels!' });
    } finally {
      setIsBooking(null);
    }
  }

  if (step === 'success' && selectedFlight) {
    return (
        <Card className="mx-auto max-w-2xl border-none shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-primary p-6 md:p-10 text-primary-foreground text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10"><Plane className="h-24 w-24 md:h-40 md:w-40 rotate-12" /></div>
            <div className="relative z-10">
              <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-white/20 flex items-center justify-center mb-4 md:mb-6 shadow-lg"><CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-white" /></div>
              <CardTitle className="text-3xl md:text-4xl font-black font-headline tracking-tighter">Flight Secured!</CardTitle>
              <CardDescription className="text-white/80 mt-2 text-base md:text-lg font-medium">Your wings are secured for {selectedFlight.to}.</CardDescription>
            </div>
          </div>
          <CardFooter className="p-6 md:p-10 bg-white space-y-4">
            <Button asChild className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black shadow-xl shadow-primary/20"><Link href="/trips">View My Journeys</Link></Button>
          </CardFooter>
        </Card>
    );
  }

  if (step === 'details' && selectedFlight) {
    const finalPrice = includePriority ? selectedFlight.price + PRIORITY_PRICE : selectedFlight.price;
    const canAfford = usdWallet && usdWallet.balance >= finalPrice;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6 md:p-8">
                <CardTitle className="text-xl md:text-2xl font-black font-headline flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Manifest Verification
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">Enter names exactly as they appear on passports.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                {passengerNames.map((name, i) => (
                    <div key={i} className="space-y-2">
                      <Label className="font-bold text-slate-700 flex items-center gap-2 text-sm md:text-base">
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

            <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-indigo-50/50 border-2 border-dashed border-indigo-200 overflow-hidden group hover:bg-indigo-50 transition-all cursor-pointer" onClick={() => setIncludePriority(!includePriority)}>
              <CardContent className="p-5 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shrink-0", includePriority ? "bg-primary text-white" : "bg-white text-primary shadow-sm")}>
                    <Coffee className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black font-headline text-slate-900">Priority Odyssey Pack</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">Lounge Access + AI Concierge Priority + 250 Bonus Points.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <p className="text-xl md:text-2xl font-black text-primary">$25</p>
                  <Checkbox checked={includePriority} onCheckedChange={(v) => setIncludePriority(!!v)} className="h-6 w-6 rounded-lg border-indigo-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white p-6 md:p-8">
              <h3 className="font-headline font-black text-lg md:text-xl mb-4 md:mb-6 text-slate-900 flex items-center gap-2">
                <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Authorization Node
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Smart Wallet Assets (USD)</span>
                  <span className="font-headline font-black text-lg md:text-xl text-slate-900">${usdWallet?.balance.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/5 border border-primary/10">
                  <span className="text-[10px] font-black uppercase text-primary">Required Node Assets</span>
                  <span className="font-headline font-black text-lg md:text-xl text-primary">${finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          <aside className="lg:col-span-5 space-y-6 md:space-y-8">
            <Card className="border-none shadow-2xl rounded-2xl md:rounded-[3rem] bg-slate-900 text-white overflow-hidden sticky top-24">
              <CardHeader className="p-6 md:p-8 pb-3 md:pb-4">
                <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] mb-3 md:mb-4">Trajectory Review</Badge>
                <CardTitle className="text-2xl md:text-3xl font-black font-headline uppercase tracking-tighter italic">{selectedFlight.airline}</CardTitle>
                <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">{selectedFlight.from} &rarr; {selectedFlight.to}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0 space-y-6">
                <div className="py-4 md:py-6 border-y border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center text-primary"><Clock className="h-4 w-4 md:h-5 md:w-5" /></div>
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration</p>
                      <p className="font-bold text-sm md:text-base">{selectedFlight.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</p>
                    <p className="font-bold text-sm md:text-base">{selectedFlight.stops === 0 ? 'Non-Stop' : `${selectedFlight.stops} Stops`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
                  <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-emerald-400 shrink-0" />
                  <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">Secure protocol active. Your booking is protected by Aetheria Journey Assurance.</p>
                </div>
              </CardContent>
              <CardFooter className="p-6 md:p-8 pt-0 gap-3">
                <Button variant="ghost" className="flex-1 text-white hover:bg-white/5 font-bold text-sm" onClick={() => setStep('search')}>Back</Button>
                <Button
                    className="flex-[2] h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                    disabled={!canAfford || !!isBooking || passengerNames.some(n => n.trim().length < 3)}
                    onClick={handleBookNow}
                >
                  {isBooking ? <Loader2 className="animate-spin" /> : "Authorize & Pay"}
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
    );
  }

  return (
      <div className="space-y-6 md:space-y-10">
        <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-5 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
                <div className="flex justify-center">
                  <Tabs value={tripType} onValueChange={(v: any) => form.setValue('tripType', v)} className="w-full sm:w-fit">
                    <TabsList className="bg-slate-100 rounded-xl p-1 h-11 md:h-12 w-full sm:w-auto">
                      <TabsTrigger value="roundTrip" className="flex-1 sm:flex-none rounded-lg font-bold px-4 md:px-6 text-xs md:text-sm">Round Trip</TabsTrigger>
                      <TabsTrigger value="oneWay" className="flex-1 sm:flex-none rounded-lg font-bold px-4 md:px-6 text-xs md:text-sm">One Way</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-1 items-end gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-5">
                  <FormField control={form.control} name="from" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold text-sm md:text-base">Origin</FormLabel><FormControl><Input placeholder="JFK" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="to" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold text-sm md:text-base">Destination</FormLabel><FormControl><Input placeholder="HND" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="departureDate" render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel className="font-bold text-sm md:text-base">Departure</FormLabel>
                        <Popover><PopoverTrigger asChild><Button variant={'outline'} className="w-full justify-start text-left font-normal rounded-xl h-12 border-slate-200"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'LLL dd, y') : <span>Select Node</span>}</Button></PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} /></PopoverContent>
                        </Popover>
                      </FormItem>
                  )} />
                  {tripType === 'roundTrip' && (
                      <FormField control={form.control} name="returnDate" render={({ field }) => (
                          <FormItem className="flex flex-col"><FormLabel className="font-bold text-sm md:text-base">Return</FormLabel>
                            <Popover><PopoverTrigger asChild><Button variant={'outline'} className="w-full justify-start text-left font-normal rounded-xl h-12 border-slate-200"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'LLL dd, y') : <span>Select Node</span>}</Button></PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (form.getValues('departureDate') || new Date())} /></PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                      )} />
                  )}
                  <FormField control={form.control} name="passengers" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold text-sm md:text-base">Guests</FormLabel><FormControl><Input type="number" min="1" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
                  )} />
                  <Button type="submit" className={cn("h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-primary/20", tripType === 'oneWay' ? "lg:col-span-2" : "lg:col-span-5")} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                    Search Connections
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {(isLoading || searchResults) && (
            <div className="mt-10 md:mt-16 space-y-6 md:space-y-8 animate-in fade-in duration-500">
              <h2 className="text-xl md:text-2xl font-black font-headline text-slate-900 uppercase tracking-tight">Available Nodes</h2>
              <div className="space-y-4 max-w-4xl mx-auto">
                {searchResults && searchResults.map((flight) => (
                    <Card key={flight.id} className="border-none shadow-md rounded-2xl md:rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-500">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center">
                          <div className="p-5 md:p-8 flex-1 flex items-center gap-4 md:gap-8">
                            <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors shrink-0"><Plane className="h-6 w-6 md:h-8 md:w-8" /></div>
                            <div className="space-y-1">
                              <p className="font-black text-lg md:text-xl text-slate-900 leading-tight group-hover:text-primary transition-colors uppercase italic tracking-tighter">{flight.airline}</p>
                              <div className="flex items-center gap-2 md:gap-3 text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
                                <span>{flight.from}</span>
                                <ArrowRight className="h-3 w-3 text-primary" />
                                <span>{flight.to}</span>
                              </div>
                            </div>
                          </div>
                          <div className="px-5 md:px-8 py-3 md:py-4 border-y md:border-y-0 md:border-x border-slate-100 flex flex-row md:flex-col items-center justify-between md:justify-center min-w-[150px] bg-slate-50/50">
                            <div className="text-center">
                              <p className="font-black text-slate-900 text-sm md:text-base">{flight.duration}</p>
                              <Badge variant="secondary" className="bg-white text-slate-500 border border-slate-100 font-bold uppercase text-[8px] md:text-[9px] mt-1">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</Badge>
                            </div>
                            <div className="flex flex-col items-end md:items-center gap-1 md:mt-2">
                              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Economy</p>
                            </div>
                          </div>
                          <div className="p-5 md:p-8 flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto">
                            <div className="text-left md:text-right">
                              <p className="text-2xl md:text-3xl font-black font-headline text-primary">${flight.price}</p>
                              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Node Price</p>
                            </div>
                            <Button className="rounded-xl md:rounded-2xl h-11 md:h-14 px-6 md:px-10 font-black text-sm md:text-base bg-slate-900 text-white hover:bg-emerald-600 shadow-xl shadow-slate-200 active:scale-95 transition-all" onClick={() => handleSelectFlight(flight)}>
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </div>
        )}
      </div>
  )
}

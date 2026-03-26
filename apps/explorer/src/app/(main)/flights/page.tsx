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
  Sparkles,
  Zap,
  ArrowUpRight,
  Loader2,
  Wallet,
  AlertTriangle
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
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { searchFlights, type Flight } from '@/ai/flows/search-flights-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { useFirebase, setDocumentNonBlocking, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase'
import { collection, serverTimestamp, doc, increment } from 'firebase/firestore'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export default function FlightBookingPage() {
  const [searchResults, setSearchResults] = useState<Flight[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [bookedFlight, setBookedFlight] = useState<Flight | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const { toast } = useToast()
  const { t, language } = useTranslation()
  const { user, firestore } = useFirebase()

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  )
  const { data: wallets } = useCollection(walletsQuery)
  const usdWallet = wallets?.find(w => w.currency === 'USD')

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

  const handleSelectFlight = async (flight: Flight) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please sign in to book a flight.' });
      return;
    }

    if (!usdWallet || usdWallet.balance < flight.price) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `You need $${flight.price} in your USD node.`,
      });
      return;
    }

    setIsBooking(flight.id);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const bookingData = {
        userId: user.uid,
        airlineName: flight.airline,
        flightNumber: flight.id, 
        departureAirportCode: flight.from,
        arrivalAirportCode: flight.to,
        departureDateTime: format(form.getValues('departureDate'), 'yyyy-MM-dd'), 
        returnDateTime: form.getValues('tripType') === 'roundTrip' && form.getValues('returnDate') ? format(form.getValues('returnDate')!, 'yyyy-MM-dd') : null,
        totalPrice: flight.price,
        currency: 'USD',
        numberOfPassengers: form.getValues('passengers'),
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed',
        bookedAt: new Date().toISOString(),
      };

      const flightBookingRef = doc(collection(firestore, 'userProfiles', user.uid, 'flightBookings'));
      setDocumentNonBlocking(flightBookingRef, bookingData, { merge: true });
      
      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, { balance: increment(-flight.price), updatedAt: serverTimestamp() }, { merge: true });
      
      const transactionRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transactionRef, {
        type: 'debit',
        category: 'booking',
        amount: flight.price,
        currency: 'USD',
        description: `Flight: ${flight.airline} (${flight.from} → ${flight.to})`,
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

      setBookedFlight(flight)
      setIsSuccess(true)
      setSearchResults(null)
      toast({ title: 'Flight Confirmed' });
    } finally {
      setIsBooking(null);
    }
  }

  async function onSubmit(values: z.infer<typeof flightBookingSchema>) {
    setIsLoading(true)
    setSearchResults(null)
    setIsSuccess(false)
    try {
      const results = await searchFlights({
        from: values.from,
        to: values.to,
        departureDate: format(values.departureDate, 'yyyy-MM-dd'),
        returnDate: values.tripType === 'roundTrip' && values.returnDate ? format(values.returnDate, 'yyyy-MM-dd') : undefined,
        passengers: values.passengers,
        language: currentLang
      })
      setSearchResults(results)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Search Failed', description: 'The aviation grid is offline.'})
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasMounted) return <div className="container mx-auto px-4 py-12"><Skeleton className="h-screen w-full" /></div>

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-5xl text-slate-900 italic uppercase">
          {t('header.flights') || 'Aviation Hub'}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Explore high-fidelity flight paths synthesized for your journey.</p>
      </div>

      {!isSuccess && (
        <Card className="mx-auto mt-12 max-w-4xl border-none shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary p-10 text-white relative">
            <div className="absolute top-0 right-0 p-10 opacity-10"><Plane className="h-32 w-32 rotate-12" /></div>
            <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter relative z-10">Search Global Aviation</CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="flex justify-center">
              <Tabs value={tripType} onValueChange={(v: any) => form.setValue('tripType', v)} className="w-fit">
                <TabsList className="bg-slate-100 rounded-xl p-1 h-12">
                  <TabsTrigger value="roundTrip" className="rounded-lg font-bold px-6">Round Trip</TabsTrigger>
                  <TabsTrigger value="oneWay" className="rounded-lg font-bold px-6">One Way</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 items-end gap-6 md:grid-cols-2 lg:grid-cols-5">
                <FormField control={form.control} name="from" render={({ field }) => (
                  <FormItem><FormLabel className="font-bold">Origin</FormLabel><FormControl><Input placeholder="JFK" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="to" render={({ field }) => (
                  <FormItem><FormLabel className="font-bold">Destination</FormLabel><FormControl><Input placeholder="HND" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="departureDate" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel className="font-bold">Departure</FormLabel>
                    <Popover><PopoverTrigger asChild><Button variant={'outline'} className="w-full justify-start text-left font-normal rounded-xl h-12 border-slate-200"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'LLL dd, y') : <span>Select Node</span>}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} /></PopoverContent>
                    </Popover>
                  </FormItem>
                )} />
                {tripType === 'roundTrip' && (
                  <FormField control={form.control} name="returnDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel className="font-bold">Return</FormLabel>
                      <Popover><PopoverTrigger asChild><Button variant={'outline'} className="w-full justify-start text-left font-normal rounded-xl h-12 border-slate-200"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'LLL dd, y') : <span>Select Node</span>}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (form.getValues('departureDate') || new Date())} /></PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={form.control} name="passengers" render={({ field }) => (
                  <FormItem><FormLabel className="font-bold">Guests</FormLabel><FormControl><Input type="number" min="1" {...field} className="rounded-xl h-12" /></FormControl></FormItem>
                )} />
                <Button type="submit" className={cn("h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20", tripType === 'oneWay' ? "lg:col-span-2" : "lg:col-span-5")} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                  Search Connections
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isSuccess && bookedFlight && (
        <Card className="mx-auto mt-12 max-w-2xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-primary p-10 text-primary-foreground text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10"><Plane className="h-40 w-40 rotate-12" /></div>
            <div className="relative z-10">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center mb-6 shadow-lg"><CheckCircle2 className="h-12 w-12 text-white" /></div>
              <CardTitle className="text-4xl font-black font-headline tracking-tighter">Flight Secured!</CardTitle>
              <CardDescription className="text-white/80 mt-2 text-lg font-medium">Your wings are secured for {bookedFlight.to}.</CardDescription>
            </div>
          </div>
          <CardFooter className="p-10 bg-white space-y-4">
            <Button asChild className="w-full h-14 rounded-2xl font-black shadow-xl shadow-primary/20"><Link href="/trips">View My Journeys</Link></Button>
          </CardFooter>
        </Card>
      )}

      {(isLoading || searchResults) && (
        <div className="mt-16 space-y-8 animate-in fade-in duration-500">
          <h2 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tight">Available Nodes</h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {searchResults && searchResults.map((flight) => (
              <Card key={flight.id} className="border-none shadow-md rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-500">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="p-8 flex-1 flex items-center gap-8">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors"><Plane className="h-8 w-8" /></div>
                      <div className="space-y-1"><p className="font-black text-xl text-slate-900">{flight.airline}</p><div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><span>{flight.from}</span><ArrowRight className="h-3 w-3 text-primary" /><span>{flight.to}</span></div></div>
                    </div>
                    <div className="px-8 py-4 md:py-0 border-y md:border-y-0 md:border-x border-slate-100 flex flex-col items-center justify-center min-w-[150px]">
                      <p className="font-black text-slate-900">{flight.duration}</p>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold uppercase text-[9px] mt-1">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</Badge>
                    </div>
                    <div className="p-8 flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                      <div className="text-right"><p className="text-3xl font-black font-headline text-slate-900">${flight.price}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Node Price</p></div>
                      <Button className="rounded-xl h-12 px-8 font-black" onClick={() => handleSelectFlight(flight)}>
                        {t('flights.bookButton') || "Book Now"}
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

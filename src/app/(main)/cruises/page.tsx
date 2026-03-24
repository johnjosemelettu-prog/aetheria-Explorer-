'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Ship,
  Search,
  Sailboat,
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { searchCruises, type Cruise } from '@/ai/flows/search-cruises-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { useFirebase, setDocumentNonBlocking, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase'
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow'

const cruiseBookingSchema = z.object({
  destination: z.string().min(2, 'Please enter a destination.'),
  departureMonth: z.string().min(7, 'Please enter a valid month (YYYY-MM).'),
  passengers: z.coerce.number().min(1, 'At least one passenger is required.'),
})

export default function CruiseBookingPage() {
  const [searchResults, setSearchResults] = useState<Cruise[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [bookedCruise, setBookedCruise] = useState<Cruise | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const { toast } = useToast()
  const { t, language } = useTranslation()
  const { user, firestore } = useFirebase()

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const walletsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'wallets');
    },
    [user, firestore]
  )
  const { data: wallets } = useCollection(walletsQuery)
  const usdWallet = wallets?.find(w => w.currency === 'USD')

  const form = useForm<z.infer<typeof cruiseBookingSchema>>({
    resolver: zodResolver(cruiseBookingSchema),
    defaultValues: {
      destination: '',
      departureMonth: '', 
      passengers: 2,
    },
  })

  useEffect(() => {
    if (hasMounted) {
      form.reset({
        ...form.getValues(),
        departureMonth: new Date().toISOString().slice(0, 7)
      })
    }
  }, [hasMounted, form])

  const handleSelectCruise = async (cruise: Cruise) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please sign in to book a cruise.' });
      return;
    }

    const passengersCount = form.getValues('passengers');
    const totalPrice = cruise.pricePerPerson * passengersCount;

    if (!usdWallet || usdWallet.balance < totalPrice) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `Your USD wallet ($${usdWallet?.balance.toFixed(2) || '0.00'}) does not have enough funds for this $${totalPrice} booking.`,
      });
      return;
    }

    setIsBooking(cruise.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const bookingData = {
        userId: user.uid,
        cruiseLineName: cruise.cruiseLine,
        shipName: cruise.name,
        cabinNumber: 'TBD',
        departurePort: cruise.destination, 
        arrivalPort: cruise.destination,
        departureDate: new Date().toISOString().split('T')[0],
        durationDays: cruise.durationDays,
        totalPrice: totalPrice,
        currency: 'USD',
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed',
        numberOfGuests: passengersCount,
        bookedAt: new Date().toISOString(),
      };

      const cruiseBookingRef = doc(collection(firestore, 'userProfiles', user.uid, 'cruiseBookings'));
      setDocumentNonBlocking(cruiseBookingRef, bookingData, { merge: true });

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(-totalPrice),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const transactionRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transactionRef, {
        type: 'debit',
        category: 'booking',
        amount: totalPrice,
        currency: 'USD',
        description: `Cruise: ${cruise.name} (${cruise.cruiseLine})`,
        timestamp: serverTimestamp()
      });

      const loyaltyRef = doc(firestore, 'userProfiles', user.uid, 'loyalty', 'status');
      setDocumentNonBlocking(loyaltyRef, {
        points: increment(1000),
        updatedAt: serverTimestamp()
      }, { merge: true });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'cruise',
          bookingDetails: bookingData,
          language: currentLang
        });
      } catch (err) {}

      setBookedCruise(cruise)
      setIsSuccess(true)
      setSearchResults(null)

      toast({
        title: 'Voyage Secured',
        description: `Booked on ${cruise.name}.`,
      })
    } catch (e) {
      toast({ variant: 'destructive', title: 'Transaction Error', description: 'Failed to process cruise booking payment.' });
    } finally {
      setIsBooking(null);
    }
  }

  async function onSubmit(values: z.infer<typeof cruiseBookingSchema>) {
    setIsLoading(true)
    setSearchResults(null)
    setIsSuccess(false)
    try {
      const results = await searchCruises({ ...values, language: currentLang })
      setSearchResults(results)
    } catch (error) {
       toast({ variant: 'destructive', title: 'Search Failed', description: 'Maritime node offline.'})
    } finally {
        setIsLoading(false)
    }
  }

  if (!hasMounted) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[600px] w-full" /></div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Cruises
        </h1>
        <p className="mt-4 text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Secure high-fidelity maritime nodes for your next oceanic odyssey.
        </p>
      </div>

      {!isSuccess && (
        <Card className="mx-auto mt-12 max-w-4xl border-none shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-indigo-500 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Ship className="h-32 w-32 rotate-12" />
            </div>
            <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter relative z-10">Explore Global Voyages</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 items-end gap-6 md:grid-cols-3"
              >
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">Target Region</FormLabel>
                      <FormControl>
                        <Input placeholder="Caribbean" {...field} className="rounded-xl h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departureMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">Month</FormLabel>
                      <FormControl>
                          <Input type="month" {...field} className="rounded-xl h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passengers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">Guests</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} className="rounded-xl h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full md:col-span-3 h-14 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 bg-indigo-500 hover:bg-indigo-600 text-white" disabled={isLoading}>
                  <Search className="mr-2 h-5 w-5" /> Explore Voyages
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isSuccess && bookedCruise && (
        <Card className="mx-auto mt-12 max-w-2xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-indigo-600 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10"><Ship className="h-40 w-40" /></div>
            <div className="relative z-10">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center mb-6 shadow-lg"><CheckCircle2 className="h-12 w-12 text-white" /></div>
              <CardTitle className="text-4xl font-black font-headline tracking-tighter">Ocean Bound!</CardTitle>
              <CardDescription className="text-white/80 mt-2 text-lg font-medium">
                You're confirmed for the {bookedCruise.name}.
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-10 space-y-8 bg-white">
            <div className="flex justify-between items-center bg-slate-50 p-8 rounded-[2rem] border border-dashed border-slate-200">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Ship className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-black text-xl text-slate-900">{bookedCruise.cruiseLine}</p>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{bookedCruise.durationDays} Days in {bookedCruise.destination}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bonus Point Reward</p>
                <p className="text-indigo-600 font-black text-2xl">+1000 PTS</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-black font-headline text-lg text-slate-900">Maritime Intelligence</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Your voyage is now linked to your master itinerary. Unlock port discovery tools and offline audio guides for every stop.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-tighter text-slate-600">
                  <Zap className="h-4 w-4 text-primary" /> Port Heritage Stories
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-tighter text-slate-600">
                  <Zap className="h-4 w-4 text-primary" /> Smart Currency Wallet
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-10 pt-0 gap-4 bg-white">
            <Button asChild variant="outline" className="flex-1 rounded-2xl h-14 font-black border-2">
              <Link href="/trips">My Journeys</Link>
            </Button>
            <Button asChild className="flex-[2] rounded-2xl h-14 font-black text-lg shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/subscription">
                Get Ultimate Pass <ArrowUpRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      {(isLoading || searchResults) && (
        <div className="mt-16 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">Voyages Found</h2>
            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
              <Wallet className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-black text-indigo-600">WALLET: ${usdWallet?.balance.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
             {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="rounded-[2rem] overflow-hidden border-none shadow-lg">
                        <Skeleton className="h-56 w-full" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardFooter>
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </CardFooter>
                    </Card>
                ))
            ) :
            searchResults && searchResults.length > 0 ? (
              searchResults.map((cruise) => (
                <Card key={cruise.id} className="overflow-hidden border-none shadow-xl rounded-[2rem] group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col bg-white">
                  {cruise.image && (
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={cruise.image.imageUrl}
                        alt={cruise.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        data-ai-hint={cruise.image.imageHint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-white/90 text-indigo-600 border-none font-black uppercase tracking-widest text-[9px] py-1 px-3">Luxury Choice</Badge>
                    </div>
                  )}
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black font-headline text-slate-900 leading-tight">{cruise.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1 font-bold text-indigo-500 uppercase tracking-widest text-[10px]">
                      <Sailboat className="h-3.5 w-3.5"/> {cruise.cruiseLine}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-4 flex-grow">
                     <p className="text-sm font-medium text-slate-500 leading-relaxed">{cruise.durationDays} days in {cruise.destination}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FROM</span>
                      <span className="text-3xl font-black font-headline text-slate-900">${cruise.pricePerPerson}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">/ person</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Button
                      className="w-full h-12 rounded-xl font-black bg-slate-900 text-white hover:bg-indigo-600 transition-all shadow-lg"
                      onClick={() => handleSelectCruise(cruise)}
                      disabled={!!isBooking}
                    >
                      {isBooking === cruise.id ? <Loader2 className="animate-spin" /> : <><Ship className="mr-2 h-4 w-4" /> Secure Cabin</>}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 md:col-span-3">
                  <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-2xl font-black font-headline text-slate-400 uppercase tracking-tighter">No Voyages Found</p>
                  <p className="text-slate-400 mt-2 font-medium">Try adjusting your destination or departure month.</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

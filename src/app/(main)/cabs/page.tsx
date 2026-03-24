
'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  Car,
  Calendar as CalendarIcon,
  Search,
  Users,
  Star,
  Zap,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Wallet,
  AlertTriangle,
  Clock,
  MapPin
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { searchCabs } from '@/ai/flows/search-cabs-flow'
import type { CabOption } from '@/ai/flows/cab-schemas'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { useFirebase, setDocumentNonBlocking, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase'
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore'
import Link from 'next/link'
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow'

const cabSearchSchema = z.object({
  pickup: z.string().min(2, 'Please enter a pickup location.'),
  destination: z.string().min(2, 'Please enter a destination.'),
  date: z.date(),
  time: z.string().min(1, 'Please select a time.'),
  passengers: z.coerce.number().min(1).max(8),
})

export default function CabBookingPage() {
  const [searchResults, setSearchResults] = useState<CabOption[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [bookedCab, setBookedCab] = useState<CabOption | null>(null)
  const { toast } = useToast()
  const { t, language } = useTranslation()
  const { user, firestore } = useFirebase()
  const [hasMounted, setHasMounted] = useState(false)

  const currentLangName = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, [])

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  )
  const { data: wallets } = useCollection(walletsQuery)
  const usdWallet = wallets?.find(w => w.currency === 'USD')

  const form = useForm<z.infer<typeof cabSearchSchema>>({
    resolver: zodResolver(cabSearchSchema),
    defaultValues: {
      pickup: '',
      destination: '',
      date: new Date(),
      time: '12:00',
      passengers: 1,
    },
  })

  async function onSubmit(values: z.infer<typeof cabSearchSchema>) {
    setIsLoading(true)
    setSearchResults(null)
    setIsSuccess(false)
    try {
      const results = await searchCabs({
        pickupLocation: values.pickup,
        destination: values.destination,
        date: format(values.date, 'yyyy-MM-dd'),
        time: values.time,
        passengers: values.passengers,
        language: currentLangName
      })
      setSearchResults(results)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Search Error",
        description: "Ground node communication failed.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleBookCab(cab: CabOption) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please sign in to book a cab.' });
      return;
    }

    if (!usdWallet || usdWallet.balance < cab.price) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Funds',
        description: `Your USD wallet is below the fare of $${cab.price}.`,
      });
      return;
    }

    setIsBooking(cab.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const bookingData = {
        userId: user.uid,
        pickupLocationName: form.getValues('pickup'),
        dropoffLocationName: form.getValues('destination'),
        pickupDateTime: format(form.getValues('date'), 'yyyy-MM-dd') + ' ' + form.getValues('time'),
        estimatedFare: cab.price,
        currency: 'USD',
        vehicleType: cab.type,
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed',
        bookedAt: new Date().toISOString(),
      };

      const bookingsRef = collection(firestore, 'userProfiles', user.uid, 'cabBookings');
      const newBookingRef = doc(bookingsRef);
      setDocumentNonBlocking(newBookingRef, bookingData, { merge: true });

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(-cab.price),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit',
        category: 'booking',
        amount: cab.price,
        currency: 'USD',
        description: `Cab Ride to ${form.getValues('destination')}`,
        timestamp: serverTimestamp()
      });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'cab',
          bookingDetails: bookingData,
          language: currentLangName
        });
      } catch (err) {}

      setBookedCab(cab)
      setIsSuccess(true)
      setSearchResults(null)
      toast({ title: "Ride Secured" })
    } catch (e) {
      toast({ variant: 'destructive', title: 'Payment Failed' });
    } finally {
      setIsBooking(null);
    }
  }

  if (!hasMounted) return <Skeleton className="h-screen w-full" />

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Cabs
        </h1>
        <p className="mt-4 text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Secure high-fidelity ground transport from any node.
        </p>
      </div>

      {!isSuccess && (
        <Card className="mx-auto mt-12 max-w-4xl border-none shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-yellow-500 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Car className="h-32 w-32 rotate-12" /></div>
            <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter">Search Ground Nodes</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 items-end gap-6 md:grid-cols-2 lg:grid-cols-5"
              >
                <FormField
                  control={form.control}
                  name="pickup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Origin</FormLabel>
                      <FormControl>
                        <Input placeholder="Pickup" {...field} className="rounded-xl h-12" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="Dropoff" {...field} className="rounded-xl h-12" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-bold">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className="w-full justify-start text-left font-normal rounded-xl h-12 border-slate-200"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'LLL dd, y') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="rounded-xl h-12" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="h-14 rounded-2xl font-black text-lg bg-yellow-500 hover:bg-yellow-600 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <Search />} Search
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isSuccess && bookedCab && (
        <Card className="mx-auto mt-12 max-w-2xl border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
          <div className="bg-yellow-500 p-10 text-white text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 mb-4" />
            <CardTitle className="text-4xl font-black font-headline">Ride Secured!</CardTitle>
          </div>
          <CardFooter className="p-10 bg-white space-y-4">
            <Button asChild className="w-full h-14 rounded-2xl font-black shadow-xl"><Link href="/trips">My Journeys</Link></Button>
          </CardFooter>
        </Card>
      )}

      {(isLoading || searchResults) && (
        <div className="mt-16 space-y-10 max-w-4xl mx-auto">
          <h2 className="text-3xl font-black font-headline text-slate-900 uppercase">Rides Found</h2>
          {searchResults?.map((cab) => (
            <Card key={cab.id} className="overflow-hidden border-none shadow-xl rounded-[2rem] bg-white group hover:border-primary transition-all">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                  <div className="bg-primary/10 p-6 rounded-3xl text-primary"><Car className="h-10 w-10" /></div>
                  <div>
                    <CardTitle className="text-2xl font-black">{cab.type}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {cab.capacity} Seats</span>
                      <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /> {cab.driverRating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-4xl font-black font-headline text-slate-900">${cab.price}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Total</p>
                  </div>
                  <Button className="rounded-2xl h-14 px-10 font-black text-lg" onClick={() => handleBookCab(cab)} disabled={!!isBooking}>
                    {isBooking === cab.id ? <Loader2 className="animate-spin" /> : 'Confirm Ride'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  UtensilsCrossed,
  Calendar as CalendarIcon,
  Search,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowUpRight,
  Loader2,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { useFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase'
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow'

const diningBookingSchema = z.object({
  location: z.string().min(2, 'Please enter a location.'),
  date: z.date(),
  time: z.string().min(1, 'Please select a time.'),
  guests: z.coerce.number().min(1, 'At least one guest is required.'),
  cuisine: z.string().optional(),
})

const placeholderRestaurants = [
  {
    id: 'restaurant-1',
    name: 'The Golden Spoon',
    cuisine: 'Fine Dining',
    rating: 4.9,
    image: PlaceHolderImages.find((img) => img.id === 'restaurant-1'),
  },
  {
    id: 'restaurant-2',
    name: 'The Daily Grind Cafe',
    cuisine: 'Cafe',
    rating: 4.6,
    image: PlaceHolderImages.find((img) => img.id === 'restaurant-2'),
  },
  {
    id: 'restaurant-3',
    name: 'Urban Eats',
    cuisine: 'Modern',
    rating: 4.7,
    image: PlaceHolderImages.find((img) => img.id === 'restaurant-3'),
  },
]

type Restaurant = (typeof placeholderRestaurants)[0]

export default function DiningBookingPage() {
  const [searchResults, setSearchResults] = useState<typeof placeholderRestaurants | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [bookedRestaurant, setBookedRestaurant] = useState<Restaurant | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const { toast } = useToast()
  const { t, language } = useTranslation()
  const { user, firestore } = useFirebase()

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const form = useForm<z.infer<typeof diningBookingSchema>>({
    resolver: zodResolver(diningBookingSchema),
    defaultValues: {
      location: '',
      date: new Date(),
      time: '19:00',
      guests: 2,
      cuisine: '',
    },
  })

  function onSubmit(values: z.infer<typeof diningBookingSchema>) {
    setIsLoading(true)
    setTimeout(() => {
      setSearchResults(placeholderRestaurants)
      setIsSuccess(false)
      setIsLoading(false)
    }, 1000)
  }

  async function handleBookNow(restaurant: Restaurant) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Identity Required', description: 'Please sign in to book a table.' });
      return;
    }

    setIsBooking(restaurant.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const bookingData = {
        userId: user.uid,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        bookingDate: format(form.getValues('date'), 'yyyy-MM-dd'),
        bookingTime: form.getValues('time'),
        numberOfGuests: form.getValues('guests'),
        specialRequests: '',
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed',
        bookedAt: new Date().toISOString(),
      };

      const bookingsRef = collection(firestore, 'userProfiles', user.uid, 'diningTableBookings');
      const newBookingRef = doc(bookingsRef);
      setDocumentNonBlocking(newBookingRef, bookingData, { merge: true });

      const loyaltyRef = doc(firestore, 'userProfiles', user.uid, 'loyalty', 'status');
      setDocumentNonBlocking(loyaltyRef, {
        points: increment(100),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const itinerariesRef = collection(firestore, 'userProfiles', user.uid, 'itineraries');
      const newItineraryRef = doc(itinerariesRef);
      setDocumentNonBlocking(newItineraryRef, {
        name: `Dining in ${form.getValues('location')}`,
        destination: form.getValues('location'),
        startDate: format(form.getValues('date'), 'yyyy-MM-dd'),
        endDate: format(form.getValues('date'), 'yyyy-MM-dd'),
        status: 'active',
        subscriptionTier: 'free',
        userId: user.uid,
        ownerId: user.uid,
        members: [user.uid],
        isGeneratedByAI: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'dining',
          bookingDetails: bookingData,
          language: currentLang
        });
        toast({
          title: "Odyssey Kit Updated",
          description: "Table confirmation and culinary guide sent to your inbox.",
        });
      } catch (err) {
        console.warn("AI Email synthesis failed.", err);
      }

      setBookedRestaurant(restaurant)
      setIsSuccess(true)
      setSearchResults(null)

      toast({
        title: t('dining.toast.successTitle' as any) || 'Table Secured',
        description: t('dining.toast.successDescription' as any, { restaurantName: restaurant.name }) || `Reservation at ${restaurant.name} confirmed.`,
      })
    } catch (e) {
      toast({ variant: 'destructive', title: 'Reservation Failed', description: 'Could not secure your table.' });
    } finally {
      setIsBooking(null);
    }
  }

  if (!hasMounted) return <Skeleton className="h-screen w-full" />;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Dining
        </h1>
        <p className="mt-4 text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          {t('dining.subtitle')}
        </p>
      </div>

      {!isSuccess && (
        <Card className="mx-auto mt-12 max-w-4xl border-none shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-orange-500 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <UtensilsCrossed className="h-32 w-32 rotate-12" />
            </div>
            <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter relative z-10">{t('dining.searchTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 items-end gap-6 md:grid-cols-2 lg:grid-cols-4"
              >
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">{t('dining.locationLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('dining.locationPlaceholder')} {...field} className="rounded-xl h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">{t('dining.cuisineLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Sushi" {...field} className="rounded-xl h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-bold text-slate-700">{t('dining.dateLabel')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-left font-normal rounded-xl h-12 border-slate-200',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, 'LLL dd, y')
                              ) : (
                                <span>{t('dining.pickDate')}</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">{t('dining.timeLabel')}</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl h-12">
                              <SelectValue placeholder={t('dining.timeLabel')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="18:00">6:00 PM</SelectItem>
                            <SelectItem value="19:00">7:00 PM</SelectItem>
                            <SelectItem value="20:00">8:00 PM</SelectItem>
                            <SelectItem value="21:00">9:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">{t('dining.guestsLabel')}</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} className="rounded-xl h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full lg:col-span-4 h-14 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <><Search className="mr-2 h-5 w-5" /> Reserve Table</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isSuccess && bookedRestaurant && (
        <Card className="mx-auto mt-12 max-w-2xl border-none shadow-2xl overflow-hidden animate-in zoom-in duration-500 rounded-[2.5rem]">
          <div className="bg-orange-600 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <UtensilsCrossed className="h-40 w-40 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-4xl font-black font-headline tracking-tighter">{t('dining.toast.successTitle' as any) || 'Table Secured'}</CardTitle>
              <CardDescription className="text-white/80 mt-2 text-lg font-medium">
                {t('dining.toast.successDescription' as any, { restaurantName: bookedRestaurant.name }) || `Reservation at ${bookedRestaurant.name} confirmed.`}
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-10 space-y-8 bg-white">
            <div className="flex justify-between items-center bg-slate-50 p-8 rounded-[2rem] border border-dashed border-slate-200">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                  <UtensilsCrossed className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-black text-xl text-slate-900">{bookedRestaurant.name}</p>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{format(form.getValues('date'), 'MMM dd')} at {form.getValues('time')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rewards</p>
                <p className="text-orange-600 font-black text-2xl">+100 PTS</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-black font-headline text-lg text-slate-900">Taste More with AI</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Unlock the Menu Explorer and Local Insider to find hidden culinary gems around {form.getValues('location')}.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-tighter text-slate-600">
                  <Zap className="h-4 w-4 text-primary" /> AI Menu Explorer
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-tighter text-slate-600">
                  <Zap className="h-4 w-4 text-primary" /> Street Food Roulette
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-10 pt-0 gap-4 bg-white">
            <Button asChild variant="outline" className="flex-1 rounded-2xl h-14 font-black border-2">
              <Link href="/trips">My Journeys</Link>
            </Button>
            <Button asChild className="flex-[2] rounded-2xl h-14 font-black text-lg shadow-xl shadow-orange-200 bg-slate-900 text-white hover:bg-slate-800">
              <Link href="/subscription">
                Get Discovery Pass <ArrowUpRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      {(isLoading || searchResults) && (
        <div className="mt-16 space-y-10">
          <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">
            {t('dining.resultsTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="rounded-[2rem] overflow-hidden border-none shadow-lg">
                  <Skeleton className="h-56 w-full" />
                  <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                </Card>
              ))
            ) : searchResults?.map((restaurant) => (
              <Card key={restaurant.id} className="overflow-hidden border-none shadow-xl rounded-[2rem] group flex flex-col bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col bg-white">
                <div className="relative h-56 w-full overflow-hidden">
                  {restaurant.image && <Image src={restaurant.image.imageUrl} alt={restaurant.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" data-ai-hint={restaurant.image.imageHint} />}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest"><Star className="h-3 w-3 fill-accent text-accent" /> {restaurant.rating} Rated</div>
                </div>
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black font-headline text-slate-900 leading-tight">{restaurant.name}</CardTitle>
                  <CardDescription className="font-bold text-orange-500 uppercase tracking-widest text-[10px]">{restaurant.cuisine}</CardDescription>
                </CardHeader>
                <CardFooter className="p-8 pt-0">
                  <Button className="w-full h-12 rounded-xl font-black bg-slate-900 text-white hover:bg-orange-600" onClick={() => handleBookNow(restaurant)}>Reserve Table</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

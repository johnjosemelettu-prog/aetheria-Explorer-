'use client'

import { useState } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { UtensilsCrossed, Search, Star, CheckCircle2, Loader2, X, ShieldCheck, Sparkles, Clock, Users, Calendar as CalendarIcon, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { searchRestaurants, type Restaurant } from '@/ai/flows/search-restaurants-flow'
import { useFirebase, setDocumentNonBlocking } from '@/firebase'
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { availableLanguages, useTranslation } from '@/lib/i18n'
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

const diningSchema = z.object({
  location: z.string().min(2, 'Required'),
  guests: z.coerce.number().min(1),
  cuisine: z.string().optional(),
  date: z.date(),
  time: z.string().min(1, 'Required'),
})

export default function DiningBookingView() {
  const { toast } = useToast()
  const { user, firestore } = useFirebase()
  const { t, language } = useTranslation()
  const [searchResults, setSearchResults] = useState<Restaurant[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [reviewingTable, setReviewingTable] = useState<Restaurant | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof diningSchema>>({
    resolver: zodResolver(diningSchema),
    defaultValues: { location: '', guests: 2, cuisine: '', date: new Date(), time: '19:00' },
  })

  async function onSubmit(values: z.infer<typeof diningSchema>) {
    setIsLoading(true);
    setSearchResults(null);
    try {
      const results = await searchRestaurants({
        location: values.location,
        guests: values.guests,
        date: format(values.date, 'yyyy-MM-dd'),
        time: values.time,
        cuisine: values.cuisine
      });
      setSearchResults(results);
    } catch (e) {
      toast({ variant: 'destructive', title: "Search Interrupted", description: "The culinary grid is unreachable." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFinalAuthorize() {
    if (!user || !firestore || !reviewingTable) return;
    setIsBooking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const bookingData = {
        userId: user.uid, restaurantName: reviewingTable.name, 
        bookingDate: format(form.getValues('date'), 'yyyy-MM-dd'),
        bookingTime: form.getValues('time'),
        numberOfGuests: form.getValues('guests'), 
        bookingStatus: 'confirmed', bookedAt: new Date().toISOString(),
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      };
      setDocumentNonBlocking(doc(collection(firestore!, 'userProfiles', user.uid, 'diningTableBookings')), bookingData, { merge: true });
      setDocumentNonBlocking(doc(firestore!, 'userProfiles', user.uid, 'loyalty', 'status'), { points: increment(100), updatedAt: serverTimestamp() }, { merge: true });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'dining',
          bookingDetails: bookingData,
          language: currentLang
        });
      } catch (err) {}

      setIsSuccess(true); setSearchResults(null); setReviewingTable(null);
      toast({ title: "Table Secured", description: "Your culinary mission is confirmed." });
    } finally { setIsBooking(false); }
  }

  if (isSuccess) {
    return (
      <Card className="mx-auto max-w-2xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-orange-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><UtensilsCrossed className="h-40 w-40 rotate-12" /></div>
          <div className="relative z-10">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center mb-6"><CheckCircle2 className="h-12 w-12 text-white" /></div>
            <CardTitle className="text-4xl font-black font-headline tracking-tighter">Table Secured!</CardTitle>
            <CardDescription className="text-white/80 mt-2 text-lg font-medium">Your reservation is confirmed and synced.</CardDescription>
          </div>
        </div>
        <CardFooter className="p-10 bg-white"><Button asChild className="w-full h-14 rounded-2xl font-black shadow-xl shadow-orange-200 bg-slate-900 text-white"><Link href="/trips">My Journeys</Link></Button></CardFooter>
      </Card>
    );
  }

  if (reviewingTable) {
    return (
      <Card className="mx-auto max-w-3xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="bg-orange-50 text-white p-10 flex flex-row items-center justify-between">
          <div>
            <Badge className="bg-white/20 text-white font-black uppercase tracking-widest text-[9px] mb-2 px-3">Standard Procedure: Reservation</Badge>
            <CardTitle className="text-3xl font-black font-headline uppercase tracking-tighter">Confirm Table</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" onClick={() => setReviewingTable(null)}>
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="flex items-center justify-between p-8 rounded-[2rem] bg-orange-50 border-2 border-dashed border-orange-100">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-600"><UtensilsCrossed className="h-8 w-8" /></div>
              <div>
                <p className="font-black text-xl text-slate-900">{reviewingTable.name}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{form.getValues('guests')} Guests • {reviewingTable.cuisine}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-500 text-white border-none font-bold">COMPLIMENTARY</Badge>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Reservation Fee</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> Schedule Node</h4>
              <p className="text-sm font-bold text-accent">{format(form.getValues('date'), 'MMM dd')} at {form.getValues('time')}</p>
              <p className="text-xs text-slate-400">Arrive 10 minutes early to ensure high-fidelity service.</p>
            </div>
            <div className="p-6 rounded-3xl bg-orange-50 border border-orange-100 space-y-4">
              <h4 className="text-[10px] font-black uppercase text-orange-600 tracking-widest flex items-center gap-2"><Sparkles className="h-4 w-4" /> Culinary Intel</h4>
              <p className="text-sm font-medium text-slate-600">This reservation earns you <strong className="text-orange-600">+100 Explorer Points</strong> and unlocks the local Menu Explorer.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-10 pt-0 gap-4">
          <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black border-2" onClick={() => setReviewingTable(null)}>Cancel</Button>
          <Button 
            className="flex-[2] h-16 rounded-2xl font-black text-xl bg-orange-500 hover:bg-orange-600 text-white shadow-2xl shadow-orange-200" 
            disabled={isBooking}
            onClick={handleFinalAuthorize}
          >
            {isBooking ? <Loader2 className="animate-spin" /> : <><ShieldCheck className="mr-2 h-6 w-6" /> Confirm Reservation</>}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2 lg:grid-cols-5">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold text-slate-700">{t('dining.locationLabel')}</FormLabel>
                    <FormControl><Input placeholder={t('dining.locationPlaceholder')} {...field} className="rounded-xl h-12" /></FormControl>
                  </FormItem>
                )} />
                
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

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t('dining.timeLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-12">
                            <SelectValue placeholder="Time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="18:00">18:00</SelectItem>
                          <SelectItem value="19:00">19:00</SelectItem>
                          <SelectItem value="20:00">20:00</SelectItem>
                          <SelectItem value="21:00">21:00</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <><Search className="mr-2 h-5 w-5" /> {t('dining.searchButton')}</>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchResults && (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((restaurant) => (
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
                <Button className="w-full h-12 rounded-xl font-black bg-slate-900 text-white hover:bg-orange-600" onClick={() => setReviewingTable(restaurant)}>Reserve Table</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

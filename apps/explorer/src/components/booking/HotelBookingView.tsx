
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format, differenceInDays } from 'date-fns'
import { 
  BedDouble, 
  Calendar as CalendarIcon, 
  Search, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ArrowUpRight, 
  Loader2, 
  User, 
  FileText, 
  Wallet, 
  ShieldCheck, 
  X, 
  Bot, 
  ShieldAlert, 
  ArrowRight 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { searchHotels, type Hotel } from '@/ai/flows/search-hotels-flow'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { useFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase'
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const bookingSchema = z.object({
  destination: z.string().min(2, 'Please enter a destination.'),
  dates: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }),
  guests: z.coerce.number().min(1, 'At least one guest is required.'),
})

export default function HotelBookingView({ usdWallet }: { usdWallet: any }) {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { user, firestore } = useFirebase()
  
  const [searchResults, setSearchResults] = useState<Hotel[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [step, setStep] = useState<'search' | 'details' | 'success'>('search')
  const [isBooking, setIsBooking] = useState(false)
  const [leadGuestName, setLeadGuestName] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [includeConcierge, setIncludeConcierge] = useState(false)

  const CONCIERGE_PRICE = 15;
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      destination: '',
      dates: { from: new Date(), to: new Date(new Date().setDate(new Date().getDate() + 7)) },
      guests: 2,
    },
  })

  async function onSubmit(values: z.infer<typeof bookingSchema>) {
    if (!values.dates.from || !values.dates.to) {
        toast({ variant: 'destructive', title: "Temporal Node Missing", description: "Select check-in and check-out dates." });
        return;
    }
    setIsLoading(true)
    setSearchResults(null)
    setStep('search')
    try {
      const results = await searchHotels({
        destination: values.destination,
        startDate: format(values.dates.from, 'yyyy-MM-dd'),
        endDate: format(values.dates.to, 'yyyy-MM-dd'),
        guests: values.guests,
        language: currentLang
      });
      setSearchResults(results);
    } catch (e) {
      toast({ variant: 'destructive', title: "Search Failed", description: "Could not reach hotel nodes." });
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setStep('details');
    setLeadGuestName(user?.displayName || '');
  };

  const handleBookingConfirmed = async () => {
    if (!user || !firestore || !selectedHotel) return;
    
    const dates = form.getValues('dates');
    if (!dates.from || !dates.to) return;

    if (!leadGuestName.trim()) {
      toast({ variant: 'destructive', title: 'Details Required', description: 'Please provide a lead guest name.' });
      return;
    }

    const nights = Math.max(1, differenceInDays(dates.to, dates.from));
    const baseTotal = selectedHotel.price * nights;
    const finalTotal = includeConcierge ? baseTotal + CONCIERGE_PRICE : baseTotal;

    if (!usdWallet || usdWallet.balance < finalTotal) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your Smart Wallet node requires more liquidity.' });
      return;
    }

    setIsBooking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const pointsAwarded = nights * 100 + (includeConcierge ? 200 : 0);

      const bookingData = {
        userId: user.uid,
        hotelName: selectedHotel.name,
        hotelId: selectedHotel.id,
        roomType: 'deluxe',
        leadGuest: leadGuestName,
        specialRequests,
        checkInDate: format(dates.from, 'yyyy-MM-dd'),
        checkOutDate: format(dates.to, 'yyyy-MM-dd'),
        numberOfRooms: 1,
        numberOfGuests: form.getValues('guests'),
        totalPrice: finalTotal,
        isConciergePackIncluded: includeConcierge,
        currency: 'USD',
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed',
        bookedAt: new Date().toISOString(),
      };

      const hotelBookingRef = doc(collection(firestore, 'userProfiles', user.uid, 'hotelRoomBookings'));
      setDocumentNonBlocking(hotelBookingRef, bookingData, { merge: true });
      
      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, { balance: increment(-finalTotal), updatedAt: serverTimestamp() }, { merge: true });
      
      const transactionRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transactionRef, {
        type: 'debit',
        category: 'booking',
        amount: finalTotal,
        currency: 'USD',
        description: `Stay at ${selectedHotel.name}${includeConcierge ? ' (Concierge Pack)' : ''}`,
        timestamp: serverTimestamp()
      });
      
      const statusRef = doc(firestore, 'userProfiles', user.uid, 'loyalty', 'status');
      setDocumentNonBlocking(statusRef, { points: increment(pointsAwarded), updatedAt: serverTimestamp() }, { merge: true });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'hotel',
          bookingDetails: bookingData,
          language: currentLang
        });
      } catch (err) {}

      setStep('success');
      setSearchResults(null);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Booking Error', description: 'Failed to confirm reservation.' });
    } finally {
      setIsBooking(false);
    }
  }

  if (step === 'success' && selectedHotel) {
    return (
      <Card className="mx-auto max-w-2xl border-none shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-emerald-600 p-6 md:p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10"><BedDouble className="h-24 w-24 md:h-40 md:w-40" /></div>
          <div className="relative z-10">
            <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-white/20 flex items-center justify-center mb-4 md:mb-6 shadow-lg"><CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-white" /></div>
            <CardTitle className="text-3xl md:text-4xl font-black font-headline tracking-tighter">Stay Secured!</CardTitle>
            <CardDescription className="text-white/80 mt-2 text-base md:text-lg font-medium">{selectedHotel.name} is ready.</CardDescription>
          </div>
        </div>
        <CardFooter className="p-6 md:p-10 bg-white"><Button asChild className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black shadow-xl shadow-orange-200 bg-slate-900 text-white"><Link href="/trips">My Journeys</Link></Button></CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10">
      {step === 'search' && (
        <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-5 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 items-end gap-4 md:gap-6 md:grid-cols-4">
                <FormField control={form.control} name="destination" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold text-slate-700 text-sm md:text-base">{t('hotels.destinationLabel')}</FormLabel>
                    <FormControl><Input placeholder={t('hotels.destinationPlaceholder')} {...field} className="rounded-xl h-12" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dates" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-bold text-slate-700 text-sm md:text-base">{t('hotels.datesLabel')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild><Button variant={'outline'} className="w-full justify-start text-left font-normal rounded-xl h-12 border-slate-200"><CalendarIcon className="mr-2 h-4 w-4" />{field.value?.from ? format(field.value.from, 'LLL dd') : 'Select'} - {field.value?.to ? format(field.value.to, 'LLL dd') : 'Select'}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar 
                          mode="range" 
                          selected={{ from: field.value?.from, to: field.value?.to }} 
                          onSelect={field.onChange} 
                          numberOfMonths={1} 
                          className="md:hidden"
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} 
                        />
                        <Calendar 
                          mode="range" 
                          selected={{ from: field.value?.from, to: field.value?.to }} 
                          onSelect={field.onChange} 
                          numberOfMonths={2} 
                          className="hidden md:block"
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} 
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )} />
                <Button type="submit" className="h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-primary/20 bg-primary text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <><Search className="mr-2 h-5 w-5" /> {t('hotels.searchButton')}</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === 'search' && searchResults && (
        <div className="grid grid-cols-1 gap-6 md:gap-10 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden border-none shadow-xl rounded-2xl md:rounded-[2rem] group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col bg-white">
              <div className="relative h-48 md:h-56 w-full overflow-hidden">
                {hotel.image && (
                  <Image src={hotel.image.imageUrl} alt={hotel.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" data-ai-hint={hotel.image.imageHint} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest"><Star className="h-3 w-3 fill-accent text-accent" /> {hotel.rating} Rated</div>
              </div>
              <CardHeader className="p-5 md:p-8 pb-3 md:pb-4"><CardTitle className="text-xl md:text-2xl font-black font-headline text-slate-900 leading-tight">{hotel.name}</CardTitle></CardHeader>
              <CardContent className="px-5 md:px-8 pb-3 md:pb-4 flex-grow"><div className="flex items-baseline gap-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FROM</span><span className="text-2xl md:text-3xl font-black font-headline text-slate-900">${hotel.price}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">/ NIGHT</span></div></CardContent>
              <CardFooter className="p-5 md:p-8 pt-0"><Button className="w-full h-11 md:h-12 rounded-xl font-black bg-slate-900 text-white hover:bg-emerald-600" onClick={() => handleSelectHotel(hotel)}>Select Stay</Button></CardFooter>
            </Card>
          ))}
        </div>
      )}

      {step === 'details' && selectedHotel && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6 md:p-8">
                <CardTitle className="text-xl md:text-2xl font-black font-headline flex items-center gap-3">
                  <User className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Guest Details
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">Specify the lead guest and any requirements.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 text-sm md:text-base">Lead Guest Name</Label>
                  <Input placeholder="Full Legal Name" value={leadGuestName} onChange={(e) => setLeadGuestName(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2 text-sm md:text-base">
                    <FileText className="h-4 w-4" /> Special Requests (Optional)
                  </Label>
                  <Textarea placeholder="e.g. High floor, quiet room..." value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="rounded-xl border-slate-200" rows={4} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-amber-50/50 border-2 border-dashed border-amber-200 overflow-hidden group hover:bg-amber-50 transition-all cursor-pointer" onClick={() => setIncludeConcierge(!includeConcierge)}>
              <CardContent className="p-5 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shrink-0", includeConcierge ? "bg-amber-500 text-white" : "bg-white text-amber-500 shadow-sm")}>
                    <Bot className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black font-headline text-slate-900">Elite Concierge Pack</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">Late Checkout + Priority Ruth AI + Breakfast Upgrade.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <p className="text-xl md:text-2xl font-black text-amber-600">$15</p>
                  <Checkbox checked={includeConcierge} onCheckedChange={(v) => setIncludeConcierge(!!v)} className="h-6 w-6 rounded-lg border-amber-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-5 space-y-6 md:space-y-8">
            <Card className="border-none shadow-2xl rounded-2xl md:rounded-[3rem] bg-white overflow-hidden sticky top-24">
              <div className="relative h-40 md:h-48 w-full">
                {selectedHotel.image && <Image src={selectedHotel.image.imageUrl} alt="Hotel" fill className="object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 text-white">
                  <CardTitle className="text-xl md:text-2xl font-black font-headline">{selectedHotel.name}</CardTitle>
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-400 mt-1">
                    <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-current" /> {selectedHotel.rating} Rated
                  </div>
                </div>
              </div>
              <CardContent className="p-6 md:p-8 space-y-6">
                <Button className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isBooking} onClick={handleBookingConfirmed}>
                  {isBooking ? <Loader2 className="animate-spin" /> : "Confirm Stay"}
                </Button>
              </CardContent>

              <Alert className="border-none bg-blue-50 text-blue-900 rounded-2xl md:rounded-3xl p-4 md:p-6">
                <ShieldAlert className="h-5 w-5 text-blue-600" />
                <AlertTitle className="font-black font-headline uppercase text-[10px]">Protection Check</AlertTitle>
                <AlertDescription className="text-[10px] md:text-xs font-medium">Don't forget to synthesize a <strong>Shield Node</strong> for this stay.</AlertDescription>
                <Button asChild variant="link" className="p-0 h-auto text-blue-600 font-bold text-[10px] md:text-xs mt-2"><Link href="/insurance">Get Insurance <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
              </Alert>
            </Card>
          </aside>
        </div>
      )}
    </div>
  )
}

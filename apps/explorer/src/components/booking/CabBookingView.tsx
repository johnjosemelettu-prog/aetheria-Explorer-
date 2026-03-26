'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { Car, Search, Loader2, CheckCircle2, Clock, Users, Star, Wallet, ShieldCheck, X, Sparkles, MapPin, MapPinned, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { searchCabs } from '@/ai/flows/search-cabs-flow'
import type { CabOption } from '@/ai/flows/cab-schemas'
import { useFirebase, setDocumentNonBlocking, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase'
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { synthesizeBookingEmail } from '@/ai/flows/booking-confirmation-email-flow'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const cabSchema = z.object({
  pickup: z.string().min(2, 'Required'),
  destination: z.string().min(2, 'Required'),
  date: z.date(),
  time: z.string().min(1, 'Required'),
  passengers: z.coerce.number().min(1).max(8),
})

export default function CabBookingView({ usdWallet }: { usdWallet: any }) {
  const { toast } = useToast()
  const { user, firestore } = useFirebase()
  const { t, language } = useTranslation()

  const [searchResults, setSearchResults] = useState<CabOption[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCab, setSelectedCab] = useState<CabOption | null>(null)
  const [step, setStep] = useState<'search' | 'details' | 'success'>('search')
  const [isBooking, setIsBooking] = useState(false)
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof cabSchema>>({
    resolver: zodResolver(cabSchema),
    defaultValues: { pickup: '', destination: '', date: new Date(), time: '12:00', passengers: 1 },
  })

  async function onSubmit(values: z.infer<typeof cabSchema>) {
    setIsLoading(true); setSearchResults(null);
    try {
      const results = await searchCabs({ pickupLocation: values.pickup, destination: values.destination, date: format(values.date, 'yyyy-MM-dd'), time: values.time, passengers: values.passengers });
      setSearchResults(results);
      setPickupAddress(values.pickup);
      setDropoffAddress(values.destination);
    } finally { setIsLoading(false); }
  }

  const handleSelectCab = (cab: CabOption) => {
    setSelectedCab(cab);
    setStep('details');
  };

  async function handleFinalAuthorize() {
    if (!user || !firestore || !selectedCab) return;

    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      toast({ variant: 'destructive', title: 'Location Error', description: 'Exact addresses are required.' });
      return;
    }

    if (!usdWallet || usdWallet.balance < selectedCab.price) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: `Need $${selectedCab.price}.` });
      return;
    }

    setIsBooking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const bookingData = {
        userId: user.uid,
        pickupLocationName: pickupAddress,
        dropoffLocationName: dropoffAddress,
        pickupDateTime: format(form.getValues('date'), 'yyyy-MM-dd') + ' ' + form.getValues('time'),
        estimatedFare: selectedCab.price,
        currency: 'USD',
        vehicleType: selectedCab.type,
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingStatus: 'confirmed', bookedAt: new Date().toISOString(),
      };
      setDocumentNonBlocking(doc(collection(firestore, 'userProfiles', user.uid, 'cabBookings')), bookingData, { merge: true });
      setDocumentNonBlocking(doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD'), { balance: increment(-selectedCab.price), updatedAt: serverTimestamp() }, { merge: true });
      addDocumentNonBlocking(collection(firestore, 'userProfiles', user.uid, 'transactions'), { type: 'debit', category: 'booking', amount: selectedCab.price, currency: 'USD', description: `Cab: ${selectedCab.type} to ${dropoffAddress}`, timestamp: serverTimestamp() });

      try {
        await synthesizeBookingEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          bookingType: 'cab',
          bookingDetails: bookingData,
          language: currentLang
        });
      } catch (err) {}

      setStep('success');
      setSearchResults(null);
      toast({ title: "Ride Secured", description: "Your transport is dispatched." });
    } finally { setIsBooking(false); }
  }

  if (step === 'success' && selectedCab) {
    return (
        <Card className="mx-auto max-w-2xl border-none shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-yellow-500 p-6 md:p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10"><Car className="h-24 w-24 md:h-40 md:w-40 rotate-12" /></div>
            <div className="relative z-10">
              <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-white/20 flex items-center justify-center mb-4 md:mb-6"><CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-white" /></div>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-black font-headline tracking-tighter">Ride Secured!</CardTitle>
              <CardDescription className="text-white/80 mt-2 text-base md:text-lg font-medium">Your {selectedCab.type} is on the way.</CardDescription>
            </div>
          </div>
          <CardFooter className="p-6 md:p-10 bg-white"><Button asChild className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black shadow-xl"><Link href="/trips">My Journeys</Link></Button></CardFooter>
        </Card>
    );
  }

  if (step === 'details' && selectedCab) {
    const canAfford = usdWallet && usdWallet.balance >= selectedCab.price;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            <Card className="border-none shadow-xl rounded-[1.5rem] md:rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6 md:p-8">
                <CardTitle className="text-xl md:text-2xl font-black font-headline flex items-center gap-3">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Routing Verification
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs md:text-sm">Confirm specific addresses for accurate dispatch.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 text-sm md:text-base">{t('cabs.pickupLabel')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="h-10 md:h-12 rounded-lg md:rounded-xl pl-10 border-slate-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 text-sm md:text-base">{t('cabs.dropoffLabel')}</Label>
                  <div className="relative">
                    <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                        value={dropoffAddress}
                        onChange={(e) => setDropoffAddress(e.target.value)}
                        className="h-10 md:h-12 rounded-lg md:rounded-xl pl-10 border-slate-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-6 md:p-8">
              <h3 className="font-headline font-black text-lg md:text-xl mb-4 md:mb-6 text-slate-900 flex items-center gap-2">
                <Wallet className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" /> Smart Wallet Verification
              </h3>
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Available USD</span>
                  <span className="font-headline font-black text-lg md:text-xl text-slate-900">${usdWallet?.balance.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-yellow-50 border border-yellow-100">
                  <span className="text-[10px] font-black uppercase text-yellow-600">Estimated Fare</span>
                  <span className="font-headline font-black text-lg md:text-xl text-yellow-600">${selectedCab.price.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          <aside className="lg:col-span-5">
            <Card className="border-none shadow-2xl rounded-[2rem] md:rounded-[3rem] bg-white overflow-hidden sticky top-24">
              <CardHeader className="bg-yellow-50 p-6 md:p-8">
                <Badge className="bg-yellow-500 text-white border-none font-bold uppercase tracking-widest text-[8px] md:text-[9px] mb-3 md:mb-4 w-fit">Transport Node</Badge>
                <CardTitle className="text-2xl md:text-3xl font-black font-headline text-slate-900">{selectedCab.type} Ride</CardTitle>
                <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[9px] md:text-[10px] mt-1">Provider: Aura Dispatch</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-slate-300" />
                    <p className="text-xs md:text-sm font-bold text-slate-700">Capacity: {selectedCab.capacity} Explorers</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 md:h-5 md:w-5 text-accent fill-accent" />
                    <p className="text-xs md:text-sm font-bold text-slate-700">Driver Rating: {selectedCab.driverRating}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-emerald-600">
                    <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                    <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed">Identity verification required upon entry. Your dispatcher is waiting.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 md:p-8 pt-0 gap-3">
                <Button variant="ghost" className="flex-1 font-bold h-10 md:h-12" onClick={() => setStep('search')}>Back</Button>
                <Button
                    className="flex-[2] h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg bg-yellow-500 hover:bg-yellow-600 text-white shadow-xl shadow-yellow-200"
                    disabled={!canAfford || isBooking || !pickupAddress.trim() || !dropoffAddress.trim()}
                    onClick={handleFinalAuthorize}
                >
                  {isBooking ? <Loader2 className="animate-spin" /> : "Confirm Dispatch"}
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
                <div className="grid grid-cols-1 items-end gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-5">
                  <FormField control={form.control} name="pickup" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold text-slate-700 text-xs md:text-sm">{t('cabs.pickupLabel')}</FormLabel><FormControl><Input placeholder={t('cabs.pickupPlaceholder')} {...field} className="rounded-lg md:rounded-xl h-10 md:h-12 text-xs md:text-sm" /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="destination" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold text-slate-700 text-xs md:text-sm">{t('cabs.dropoffLabel')}</FormLabel><FormControl><Input placeholder={t('cabs.dropoffPlaceholder')} {...field} className="rounded-lg md:rounded-xl h-10 md:h-12 text-xs md:text-sm" /></FormControl></FormItem>
                  )} />

                  <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="font-bold text-slate-700 text-xs md:text-sm">{t('cabs.dateLabel')}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                      variant={'outline'}
                                      className={cn(
                                          'w-full justify-start text-left font-normal rounded-lg md:rounded-xl h-10 md:h-12 border-slate-200 text-xs md:text-sm',
                                          !field.value && 'text-muted-foreground'
                                      )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                        format(field.value, 'LLL dd, y')
                                    ) : (
                                        <span>{t('cabs.pickDate')}</span>
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
                            <FormLabel className="font-bold text-slate-700 text-xs md:text-sm">{t('cabs.timeLabel')}</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} className="rounded-lg md:rounded-xl h-10 md:h-12 text-xs md:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                  <Button type="submit" className="h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-yellow-200 bg-yellow-500 hover:bg-yellow-600 text-white" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><Search className="mr-2 h-5 w-5" /> {t('cabs.searchButton')}</>}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {searchResults && (
            <div className="grid grid-cols-1 gap-4 md:gap-6 max-w-4xl mx-auto">
              {searchResults.map((cab) => (
                  <Card key={cab.id} className="overflow-hidden border-none shadow-xl rounded-[1.5rem] md:rounded-[2rem] bg-white group hover:border-primary transition-all duration-500">
                    <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                        <div className="bg-primary/10 p-4 md:p-6 rounded-2xl md:rounded-3xl text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0"><Car className="h-6 w-6 md:h-10 md:w-10" /></div>
                        <div className="flex-1">
                          <CardTitle className="text-lg md:text-2xl font-black font-headline text-slate-900">{cab.type}</CardTitle>
                          <CardDescription className="flex items-center gap-4 md:gap-6 mt-1 md:mt-2 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">
                            <span className="flex items-center gap-1 md:gap-1.5"><Users className="h-3 w-3 md:h-4 md:w-4" /> {cab.capacity} SEATS</span>
                            <span className="flex items-center gap-1 md:gap-1.5"><Star className="h-3 w-3 md:h-4 md:w-4 fill-accent text-accent" /> {cab.driverRating} RATING</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="text-left md:text-right"><p className="text-2xl md:text-4xl font-black font-headline text-slate-900">${cab.price}</p><p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Total</p></div>
                        <Button className="rounded-xl md:rounded-2xl h-12 md:h-14 px-6 md:px-10 font-black text-sm md:text-lg" onClick={() => handleSelectCab(cab)}>Select Ride</Button>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}
      </div>
  )
}

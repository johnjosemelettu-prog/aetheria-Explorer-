'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, increment, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Plane, 
  BedDouble, 
  UtensilsCrossed, 
  Car, 
  Ship, 
  ChevronLeft, 
  Sparkles, 
  Wand2, 
  Trash2, 
  CalendarDays,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Zap,
  Wifi,
  Train,
  Bus
} from 'lucide-react';
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseISO, isWithinInterval } from 'date-fns';
import { synthesizeSubscriptionEmail } from '@/ai/flows/subscription-email-flow';

export function TripDetailClient() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const router = useRouter();
  const { t, language } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const tripRef = useMemoFirebase(
    () => (user && firestore && tripId ? doc(firestore, 'userProfiles', user.uid, 'itineraries', tripId) : null),
    [user, firestore, tripId]
  );
  const { data: trip, isLoading } = useDoc(tripRef);

  const flightsQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'flightBookings') : null), [user, firestore]);
  const hotelsQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'hotelRoomBookings') : null), [user, firestore]);
  const diningQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'diningTableBookings') : null), [user, firestore]);
  const cabsQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'cabBookings') : null), [user, firestore]);
  const cruisesQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'cruiseBookings') : null), [user, firestore]);
  const trainsQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'trainBookings') : null), [user, firestore]);
  const busesQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'busBookings') : null), [user, firestore]);

  const { data: allFlights } = useCollection(flightsQuery);
  const { data: allHotels } = useCollection(hotelsQuery);
  const { data: allDining } = useCollection(diningQuery);
  const { data: allCabs } = useCollection(cabsQuery);
  const { data: allCruises } = useCollection(cruisesQuery);
  const { data: allTrains } = useCollection(trainsQuery);
  const { data: allBuses } = useCollection(busesQuery);

  const filteredBookings = useMemo(() => {
    if (!trip || !hasMounted) return { flights: [], hotels: [], dining: [], cabs: [], cruises: [], trains: [], buses: [] };

    const start = parseISO(trip.startDate);
    const end = parseISO(trip.endDate);

    const isInRange = (dateStr: string) => {
      if (!dateStr) return false;
      try {
        const date = parseISO(dateStr.split('T')[0]);
        return isWithinInterval(date, { start, end });
      } catch (e) {
        return false;
      }
    };

    return {
      flights: allFlights?.filter(f => isInRange(f.departureDateTime)) || [],
      hotels: allHotels?.filter(h => isInRange(h.checkInDate)) || [],
      dining: allDining?.filter(d => isInRange(d.bookingDate)) || [],
      cabs: allCabs?.filter(c => isInRange(c.pickupDateTime)) || [],
      cruises: allCruises?.filter(c => isInRange(c.departureDate)) || [],
      trains: allTrains?.filter(t => isInRange(t.travelDate)) || [],
      buses: allBuses?.filter(b => isInRange(b.travelDate)) || [],
    };
  }, [trip, allFlights, allHotels, allDining, allCabs, allCruises, allTrains, allBuses, hasMounted]);

  const handleDeleteEntireTrip = () => {
    if (!user || !trip || !firestore) return;
    const docRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', tripId);
    
    if (trip.subscriptionTier && trip.subscriptionTier !== 'free') {
      try {
        synthesizeSubscriptionEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          tierName: trip.subscriptionTier.toUpperCase(),
          tripName: trip.name,
          type: 'cancellation',
          language: currentLang
        });
      } catch (e) {}
    }

    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Journey Deleted",
      description: "Successfully removed the itinerary from your library.",
    });
    router.push('/trips');
  };

  const handleDeleteAiPlan = () => {
    if (!user || !trip || !firestore) return;
    const docRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', tripId);
    updateDocumentNonBlocking(docRef, {
      dailyPlans: [],
      itinerarySummary: "",
      updatedAt: serverTimestamp(),
    });
    toast({
      title: "AI Plan Cleared",
      description: "The daily itinerary has been removed. You can now generate a new one.",
    });
  };

  if (!hasMounted || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[600px] w-full rounded-3xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-bold">Trip not found.</h2>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/trips">Back to My Trips</Link>
        </Button>
      </div>
    );
  }

  const isFree = !trip.subscriptionTier || trip.subscriptionTier === 'free';
  const hasDailyPlans = trip.dailyPlans && trip.dailyPlans.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="bg-slate-900 text-white pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-start mb-8">
            <Button asChild variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 -ml-4">
              <Link href="/trips"><ChevronLeft className="mr-2 h-4 w-4" /> Back to My Trips</Link>
            </Button>
            
            <div className="flex gap-2">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white/40 hover:text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest text-[10px]">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Journey
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{trip.name}" and all of its data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Keep Trip</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEntireTrip} className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-bold">
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={cn(
                  "font-black uppercase tracking-widest text-[10px] px-3",
                  isFree ? "bg-white/10 text-white/60" : "bg-primary text-white"
                )}>
                  {trip.subscriptionTier?.toUpperCase() || 'STANDARD'} PASS
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white/40 uppercase font-bold tracking-tighter py-0.5">
                  {trip.status === 'active' ? 'Active Journey' : 'Planning Phase'}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tight uppercase italic">{trip.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold uppercase tracking-widest text-xs">
                <span className="flex items-center gap-2 text-white"><MapPin className="h-4 w-4 text-primary" /> {trip.destination}</span>
                <span className="flex items-center gap-2 text-white"><CalendarIcon className="h-4 w-4 text-primary" /> {trip.startDate} — {trip.endDate}</span>
              </div>
            </div>
            
            {isFree && (
              <Button asChild size="lg" className="rounded-2xl h-14 px-8 font-black bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xl shadow-accent/20">
                <Link href="/subscription">
                  Upgrade this Trip <Wand2 className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-12">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-10"><Wifi className="h-20 w-20" /></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center"><Wifi className="h-6 w-6" /></div>
              <div>
                <h4 className="font-black font-headline text-lg">Connectivity Check</h4>
                <p className="text-sm text-blue-100 font-medium">Do you have data for {trip.destination}? Activate a local eSIM now.</p>
              </div>
            </div>
            <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl h-12 px-8">
              <Link href="/esim">Activate Global Data</Link>
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="itinerary" className="space-y-10">
          <TabsList className="bg-white/80 backdrop-blur-md shadow-xl border-none h-16 p-1.5 rounded-3xl">
            <TabsTrigger value="itinerary" className="rounded-[1.25rem] px-8 font-black text-sm uppercase tracking-tighter data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Sparkles className="mr-2 h-4 w-4" /> {t('trips.itineraryTab')}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-[1.25rem] px-8 font-black text-sm uppercase tracking-tighter data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Plane className="mr-2 h-4 w-4" /> {t('trips.bookingsTab')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                <ItineraryDisplay 
                  itinerary={hasDailyPlans ? { itinerarySummary: trip.itinerarySummary, dailyPlans: trip.dailyPlans || [] } : null} 
                  itineraryId={tripId} 
                  members={trip.members || []} 
                  isLoading={false} 
                  isRefining={false} 
                  onRefine={(req) => console.log('Refine:', req)}
                  tripVibe={trip.vibe}
                />
              </div>
              <aside className="lg:col-span-4 space-y-8">
                <Card className="border-none shadow-xl rounded-3xl p-8 bg-white">
                  <h3 className="font-headline font-black text-xl mb-4 text-slate-900">{t('trips.strategyTitle')}</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('trips.travelStyle')}</p>
                      <p className="font-bold text-slate-900 capitalize">{trip.travelStyle?.[0] || 'Flexible'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('trips.vibeIntent')}</p>
                      <p className="font-bold text-slate-900 italic">"{trip.vibe || 'Standard Exploration'}"</p>
                    </div>
                  </div>

                  {hasDailyPlans && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-400 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 font-bold transition-all">
                            <RotateCcw className="mr-2 h-4 w-4" /> {t('trips.clearAiPlan')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Clear Daily Itinerary?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the AI-generated daily plans and summaries for this trip. Your bookings and trip settings will remain.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAiPlan} className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-bold">
                              Clear Plan
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </Card>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="space-y-12">
              <section className="space-y-6">
                <h2 className="text-2xl font-black font-headline text-slate-900 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Plane className="h-5 w-5" />
                  </div>
                  {t('trips.bookings.flights')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBookings.flights.length ? filteredBookings.flights.map((f: any) => (
                    <BookingCard key={f.id} type="flight" data={f} collectionName="flightBookings" trip={trip} tripId={tripId} language={currentLang} />
                  )) : <NoBookingsCard type={t('trips.bookings.flights')} />}
                </div>
              </section>
              {/* Add more booking sections as needed... */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingCard({ type, data, collectionName, trip, tripId, language }: any) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const handleDelete = async () => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'userProfiles', user.uid, collectionName, data.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Booking Removed", description: "Your odyssey manifest has been updated." });
  };

  return (
    <Card className="border-none shadow-lg rounded-[2rem] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
      <CardHeader className="p-8 flex flex-row items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            {type === 'flight' ? <Plane className="h-5 w-5 text-primary" /> : <BedDouble className="h-5 w-5 text-emerald-600" />}
          </div>
          <div>
            <CardTitle className="text-lg font-black font-headline text-slate-900 truncate max-w-[200px]">{data.airlineName || data.hotelName}</CardTitle>
            <CardDescription className="text-[9px] font-black uppercase tracking-widest text-slate-400">CONFIRMATION: {data.confirmationCode}</CardDescription>
          </div>
        </div>
        <Badge className="bg-emerald-50 text-white font-black uppercase text-[9px] px-3 py-1 rounded-lg">{data.bookingStatus}</Badge>
      </CardHeader>
      <CardFooter className="p-8 pt-0">
        <Button variant="ghost" size="sm" className="w-full rounded-xl text-slate-300 hover:text-destructive font-bold" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Remove Booking
        </Button>
      </CardFooter>
    </Card>
  );
}

function NoBookingsCard({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/50 opacity-40 grayscale w-full">
      <AlertTriangle className="h-10 w-10 text-slate-300 mb-4" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">No {type} Found</p>
    </div>
  );
}

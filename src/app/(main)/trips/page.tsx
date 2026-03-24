
'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, ArrowRight, Sparkles, Plane, Trash2 } from 'lucide-react';
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

export default function MyTripsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const itinerariesQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc')) : null),
    [user, firestore]
  );
  const { data: itineraries, isLoading } = useCollection(itinerariesQuery);

  const handleDeleteTrip = (tripId: string, tripName: string) => {
    if (!user || !firestore) return;
    const tripRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', tripId);
    deleteDocumentNonBlocking(tripRef);
    toast({
      title: "Trip Deleted",
      description: `"${tripName}" has been successfully removed from your library.`,
    });
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Explorer's Library</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          {t('header.myTrips')}
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Manage your library of synthesized odysseys and confirmed bookings.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : itineraries && itineraries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {itineraries.map((trip) => {
            const tier = trip.subscriptionTier || 'free';
            return (
              <Card key={trip.id} className="group border-none shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white flex flex-col">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className={cn(
                      "font-black uppercase tracking-tighter text-[10px] px-3",
                      tier === 'free' ? "text-slate-400 border-slate-200" : "text-accent border-accent/20 bg-accent/5"
                    )}>
                      {tier.toUpperCase()} PASS
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black font-headline text-slate-900 truncate uppercase italic tracking-tighter">{trip.name}</CardTitle>
                  <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                    {trip.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 space-y-4 flex-grow">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {trip.startDate} — {trip.endDate}
                  </div>
                  <div className="pt-4 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none font-bold uppercase text-[9px]">
                      {trip.status?.toUpperCase() || 'DRAFT'}
                    </Badge>
                    {trip.isGeneratedByAI && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold uppercase text-[9px] flex items-center gap-1">
                        <Sparkles className="h-2 w-2" /> AI Generated
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0 gap-2">
                  <Button asChild className="flex-grow h-12 rounded-xl font-bold bg-slate-900 text-white hover:bg-primary transition-all">
                    <Link href={`/trips/${trip.id}`}>
                      View Odyssey <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/5 transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this journey?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the itinerary for "{trip.name}" and all associated AI plans. Bookings will remain in your profile but will no longer be linked to this trip.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTrip(trip.id, trip.name)} className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-bold">
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-30">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
            <Plane className="h-32 w-32 text-primary relative" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter italic">No Journeys Found</h2>
            <p className="text-lg font-medium text-slate-500 max-w-sm mx-auto">Initialize your first trajectory node to begin exploration.</p>
          </div>
          <Button asChild className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
            <Link href="/itinerary-generator">
              Plan New Trip <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

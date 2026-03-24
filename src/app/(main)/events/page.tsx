
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  Ticket,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function EventsDashboardPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Events where user is organizer or participant
  const eventsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'destinationEvents'), where('participantIds', 'array-contains', user.uid)) : null),
    [user, firestore]
  );
  
  const { data: events, isLoading } = useCollection(eventsQuery);

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Collaborative Discovery</Badge>
          <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
            {t('header.events' as any) || 'Destination Events'}
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-xl">
            Coordinate group tours, cultural meetups, and destination experiences with fellow explorers.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-2xl h-14 px-8 font-black shadow-2xl shadow-primary/20">
          <Link href="/events/create">
            <Plus className="mr-2 h-5 w-5" /> Organize Event
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-80 w-full rounded-[2.5rem]" />
            <Skeleton className="h-80 w-full rounded-[2.5rem]" />
            <Skeleton className="h-80 w-full rounded-[2.5rem]" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card key={event.id} className="group border-none shadow-xl rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white flex flex-col">
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/travel/600/400')] opacity-20 grayscale bg-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge className={cn(
                      "font-black uppercase text-[9px] px-3 py-1",
                      event.organizerId === user?.uid ? "bg-primary text-white" : "bg-slate-900 text-white"
                    )}>
                      {event.organizerId === user?.uid ? 'ORGANIZER' : 'ATTENDING'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-6 flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date</p>
                      <p className="text-sm font-bold text-slate-900">{event.startDateTime?.split('T')[0] || 'TBD'}</p>
                    </div>
                  </div>
                </div>
                <CardHeader className="px-8 pt-4 pb-2">
                  <CardTitle className="text-2xl font-black font-headline text-slate-900 truncate uppercase italic tracking-tighter">{event.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
                    <MapPin className="h-3 w-3" /> {event.location || 'Global Hub'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 flex-grow">
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed italic">"{event.description}"</p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {event.participantIds?.slice(0, 3).map((pid: string) => (
                        <div key={pid} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {event.participantIds?.length || 0} / {event.maxParticipants} Explorers
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="px-8 pb-8 pt-0">
                  <Button asChild variant="outline" className="w-full rounded-xl h-12 font-bold border-2 border-slate-100 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                    <Link href={`/events/${event.id}`}>
                      Manage Event <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-30 grayscale">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
              <Users className="h-32 w-32 text-primary relative" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter italic">No Events Found</h2>
              <p className="text-lg font-medium text-slate-500 max-w-sm mx-auto">You aren't organizing or attending any group events yet.</p>
            </div>
            <Button asChild variant="outline" className="rounded-xl border-2 h-12 px-8 font-bold">
              <Link href="/events/create">Host Your First Event</Link>
            </Button>
          </div>
        )}
      </div>

      <footer className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter italic leading-tight">Travel Better Together.</h3>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Coordinating group travel shouldn't be hard. Our events system allows you to pool funds, share AI invite cards, and synchronize schedules instantly.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm font-bold text-slate-700">AI-generated invite cards for every occasion.</p>
            </div>
          </div>
        </div>
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Ticket className="h-40 w-40 rotate-12" />
          </div>
          <h4 className="text-xl font-bold font-headline mb-6 relative z-10 uppercase italic tracking-tighter">Verified Explorers Only</h4>
          <div className="space-y-4 relative z-10">
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Backpacker events are exclusively for verified users. Organizers can set security levels and require "Proof of Arrival" via GPS to unlock private chat rooms and shared itineraries.
            </p>
            <Button asChild variant="link" className="p-0 h-auto text-primary font-black uppercase tracking-widest text-[10px]">
              <Link href="/terms" className="flex items-center gap-2">Community Guidelines <ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
      </footer>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Users, 
  Mail, 
  MapPin, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  Sparkles, 
  Plane, 
  BedDouble, 
  Car, 
  Loader2, 
  CheckCircle2, 
  Send,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Utensils,
  Calculator
} from 'lucide-react';
import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useMemoFirebase, 
  updateDocumentNonBlocking, 
  setDocumentNonBlocking,
  addDocumentNonBlocking
} from '@/firebase';
import { doc, collection, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ExpenseSplitter } from '@/components/events/ExpenseSplitter';

export function EventDetailClient() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [activeBookingType, setActiveBookingType] = useState<'flight' | 'hotel' | 'cab' | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const eventRef = useMemoFirebase(
    () => (eventId && user && firestore ? doc(firestore, 'destinationEvents', eventId) : null),
    [firestore, eventId, user]
  );
  const { data: event, isLoading: isEventLoading } = useDoc(eventRef);

  const inviteCardRef = useMemoFirebase(
    () => (eventId && user && firestore ? doc(firestore, 'destinationEvents', eventId, 'inviteCards', 'primary') : null),
    [firestore, eventId, user]
  );
  const { data: inviteCard } = useDoc(inviteCardRef);

  const handleInvite = async () => {
    if (!inviteEmail || !user || !event || !eventRef || !firestore) return;
    setIsInviting(true);
    try {
      const email = inviteEmail.trim().toLowerCase();
      updateDocumentNonBlocking(eventRef, {
        invitedEmails: arrayUnion(email),
        updatedAt: serverTimestamp(),
      });
      setInviteEmail('');
      toast({
        title: "Invitation Sent!",
        description: `Successfully sent an email invite to ${email}.`,
      });
    } catch (e) {
      toast({ variant: 'destructive', title: "Invite Failed" });
    } finally {
      setIsInviting(false);
    }
  };

  if (!hasMounted || isEventLoading) {
    return <div className="p-12"><Skeleton className="h-[600px] w-full rounded-[3rem]" /></div>;
  }

  if (!event) return <div className="p-12 text-center">Event not found.</div>;

  const isOrganizer = event.organizerId === user?.uid;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] px-3">{event.status}</Badge>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase italic">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold uppercase tracking-widest text-xs">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</span>
            <span className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary" /> {event.startDateTime?.replace('T', ' ')}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <Tabs defaultValue="participants" className="w-full">
              <TabsList className="bg-slate-50 border-b border-slate-100 p-2 h-14 w-full justify-start rounded-none">
                <TabsTrigger value="participants" className="rounded-xl font-bold px-6">Participants</TabsTrigger>
                <TabsTrigger value="expenses" className="rounded-xl font-bold px-6">Expense Splitter</TabsTrigger>
              </TabsList>
              <TabsContent value="participants" className="p-8 m-0 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.participantIds?.map((pid: string) => (
                    <div key={pid} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">{pid.substring(0, 2)}</div>
                      <p className="font-bold text-slate-900">Explorer {pid.substring(0, 4)}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="expenses" className="p-8 m-0 animate-in fade-in duration-500">
                <ExpenseSplitter event={event} language="English" />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        <aside className="lg:col-span-4">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white overflow-hidden aspect-[4/5] relative">
            {inviteCard ? (
              <>
                <Image src={inviteCard.imageUrl} alt="Invite" fill className="object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                <div className="absolute bottom-0 p-8 w-full space-y-4">
                  <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] px-3">AI Invite Node</Badge>
                  <h3 className="text-3xl font-black font-headline italic uppercase tracking-tighter">{event.name}</h3>
                  <p className="text-xs italic text-slate-400">"{inviteCard.description}"</p>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center opacity-20"><Sparkles className="h-16 w-16" /></div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

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
      toast({ variant: 'destructive', title: "Invite Failed", description: "Could not send invitation." });
    } finally {
      setIsInviting(false);
    }
  };

  const handleGroupBooking = async (type: 'flight' | 'hotel' | 'cab') => {
    if (!user || !event || !firestore) return;
    setIsBooking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const guestsCount = (event.participantIds?.length || 1);
      const basePrice = type === 'flight' ? 450 : type === 'hotel' ? 200 : 50;
      const totalPrice = basePrice * guestsCount;

      const commonData = {
        userId: user.uid,
        eventId: event.id,
        bookingStatus: 'confirmed',
        confirmationCode,
        totalPrice,
        currency: 'USD',
        bookedAt: new Date().toISOString(),
      };

      if (type === 'flight') {
        const flightRef = doc(collection(firestore, 'userProfiles', user.uid, 'flightBookings'));
        setDocumentNonBlocking(flightRef, {
          ...commonData,
          airlineName: 'Backpacker Global',
          flightNumber: 'BP' + Math.floor(Math.random() * 1000),
          departureAirportCode: 'ORG',
          arrivalAirportCode: 'DST',
          departureDateTime: event.startDateTime,
          numberOfPassengers: guestsCount,
        }, { merge: true });
      } else if (type === 'hotel') {
        const hotelRef = doc(collection(firestore, 'userProfiles', user.uid, 'hotelRoomBookings'));
        setDocumentNonBlocking(hotelRef, {
          ...commonData,
          hotelName: 'Explorer Boutique Hotel',
          hotelId: 'auto-gen-hotel',
          checkInDate: event.startDateTime.split('T')[0],
          checkOutDate: event.endDateTime?.split('T')[0] || event.startDateTime.split('T')[0],
          numberOfGuests: guestsCount,
        }, { merge: true });
      } else {
        const cabRef = doc(collection(firestore, 'userProfiles', user.uid, 'cabBookings'));
        setDocumentNonBlocking(cabRef, {
          ...commonData,
          vehicleType: 'Executive Van',
          pickupLocationName: 'Arrival Airport',
          dropoffLocationName: event.location,
          pickupDateTime: event.startDateTime,
          estimatedFare: totalPrice,
        }, { merge: true });
      }

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit',
        category: 'booking',
        amount: totalPrice,
        currency: 'USD',
        description: `Group ${type} for ${event.name}`,
        timestamp: serverTimestamp()
      });

      const loyaltyRef = doc(firestore, 'userProfiles', user.uid, 'loyalty', 'status');
      setDocumentNonBlocking(loyaltyRef, {
        points: increment(Math.floor(totalPrice / 10)),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Group Booking Secured!",
        description: `Successfully reserved ${type} services for the entire group.`,
      });
    } catch (e) {
      toast({ variant: 'destructive', title: "Booking Error", description: "Failed to process group reservation." });
    } finally {
      setIsBooking(false);
      setActiveBookingType(null);
    }
  };

  if (!hasMounted || isEventLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[600px] rounded-[2.5rem]" />
          <Skeleton className="h-[600px] rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-bold">Event not found.</h2>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const isOrganizer = event.organizerId === user?.uid;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="bg-slate-900 text-white pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button asChild variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 -ml-4 mb-8">
            <Link href="/events"><ChevronLeft className="mr-2 h-4 w-4" /> Back to All Events</Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-white font-black uppercase tracking-widest text-[10px]">
                  {event.status.toUpperCase()}
                </Badge>
                {isOrganizer && (
                  <Badge variant="outline" className="border-accent text-accent uppercase font-bold tracking-tighter">
                    Organizer Control
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tight uppercase italic">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold uppercase tracking-widest text-xs">
                <span className="flex items-center gap-2 text-white"><MapPin className="h-4 w-4 text-primary" /> {event.location}</span>
                <span className="flex items-center gap-2 text-white"><CalendarIcon className="h-4 w-4 text-primary" /> {event.startDateTime?.replace('T', ' ')}</span>
              </div>
            </div>
            {isOrganizer && (
              <Button asChild variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10 font-bold">
                <Link href={`/events/${eventId}/edit`}>Edit Event Details</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <Tabs defaultValue="participants" className="w-full">
                <div className="bg-slate-50 border-b border-slate-100 p-2 overflow-x-auto">
                  <TabsList className="bg-transparent h-12 inline-flex w-auto">
                    <TabsTrigger value="participants" className="rounded-xl font-bold px-6 whitespace-nowrap">
                      <Users className="mr-2 h-4 w-4" /> Participants
                    </TabsTrigger>
                    {isOrganizer && (
                      <TabsTrigger value="booking" className="rounded-xl font-bold px-6 whitespace-nowrap">
                        <CreditCard className="mr-2 h-4 w-4" /> Group Booking Hub
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="expenses" className="rounded-xl font-bold px-6 whitespace-nowrap">
                      <Calculator className="mr-2 h-4 w-4" /> AI Expense Splitter
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="participants" className="p-8 m-0 animate-in fade-in duration-500">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black font-headline text-slate-900">Confirmed Explorers</h3>
                      <Badge variant="secondary" className="font-bold text-[10px]">
                        {event.participantIds?.length || 0} / {event.maxParticipants}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {event.participantIds?.map((pid: string) => (
                        <div key={pid} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">
                            {pid.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{pid === user?.uid ? 'You (Organizer)' : `Explorer ${pid.substring(0, 4)}`}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmed Attendee</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {isOrganizer && (
                      <div className="pt-8 border-t border-slate-100 space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-black font-headline text-slate-900 flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" /> Invite via Email
                          </h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Send a stylish AI invitation to fellow explorers. They'll receive a link to join this specific destination event.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="traveler@example.com" 
                            className="h-12 rounded-xl flex-1" 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                          <Button 
                            onClick={handleInvite} 
                            disabled={isInviting || !inviteEmail.trim()} 
                            className="h-12 rounded-xl px-8 font-bold shadow-lg shadow-primary/20"
                          >
                            {isInviting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Invitation
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="booking" className="p-8 m-0 animate-in fade-in duration-500">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black font-headline text-slate-900 flex items-center gap-2 italic uppercase tracking-tighter">
                        <ShieldCheck className="h-6 w-6 text-emerald-500" /> Organizer Group Booking
                      </h3>
                      <p className="text-slate-500 font-medium">
                        As the organizer, you can secure travel and stays for all <strong>{event.participantIds?.length || 0} participants</strong> in a single transaction.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { type: 'flight', icon: Plane, label: 'Group Flights', price: 450, color: 'text-primary bg-primary/5' },
                        { type: 'hotel', icon: BedDouble, label: 'Hotel Rooms', price: 200, color: 'text-emerald-600 bg-emerald-50' },
                        { type: 'cab', icon: Car, label: 'Group Transport', price: 50, color: 'text-yellow-600 bg-yellow-50' }
                      ].map((item) => (
                        <Card key={item.type} className={cn(
                          "cursor-pointer border-2 transition-all rounded-3xl p-6 flex flex-col items-center text-center gap-4 hover:shadow-lg",
                          activeBookingType === item.type ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-100 bg-white"
                        )} onClick={() => setActiveBookingType(item.type as any)}>
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", item.color)}>
                            <item.icon className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase tracking-tighter italic">{item.label}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Est. ${item.price} / person</p>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {activeBookingType && (
                      <div className="p-8 rounded-[2rem] bg-slate-900 text-white animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                          <Sparkles className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 space-y-6">
                          <div>
                            <Badge className="bg-primary text-white border-none font-bold uppercase mb-2 px-3">Quote Summary</Badge>
                            <h4 className="text-3xl font-black font-headline italic uppercase tracking-tighter">Group {activeBookingType.charAt(0).toUpperCase() + activeBookingType.slice(1)} Reservation</h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/10">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unit Cost</p>
                              <p className="text-2xl font-black">${activeBookingType === 'flight' ? 450 : activeBookingType === 'hotel' ? 200 : 50}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Participants</p>
                              <p className="text-2xl font-black">x {event.participantIds?.length || 1}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Total Reservation Cost</p>
                              <p className="text-4xl font-black font-headline text-accent">
                                ${(activeBookingType === 'flight' ? 450 : activeBookingType === 'hotel' ? 200 : 50) * (event.participantIds?.length || 1)}
                              </p>
                            </div>
                            <Button 
                              onClick={() => handleGroupBooking(activeBookingType)} 
                              disabled={isBooking}
                              className="h-14 px-8 rounded-2xl font-black text-lg bg-white text-slate-900 hover:bg-slate-200 shadow-xl"
                            >
                              {isBooking ? <Loader2 className="animate-spin mr-2" /> : "Authorize & Book All"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="expenses" className="p-8 m-0 animate-in fade-in duration-500">
                  <ExpenseSplitter event={event} language={t('language' as any) || 'English'} />
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white space-y-6">
              <h3 className="text-xl font-black font-headline text-slate-900 flex items-center gap-2 italic uppercase tracking-tighter">
                <Utensils className="h-5 w-5 text-orange-500" /> Event Itinerary Detail
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed italic">
                "{event.description}"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Target Vibe</p>
                  <p className="font-bold text-slate-900">{event.vibe}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Meeting Point</p>
                  <p className="font-bold text-slate-900 truncate">{event.location}</p>
                </div>
              </div>
            </Card>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white overflow-hidden aspect-[4/5] relative flex flex-col">
              {inviteCard ? (
                <>
                  <Image src={inviteCard.imageUrl} alt="Invite Art" fill className="object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-0 p-8 w-full space-y-4">
                    <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] px-3">AI Synthesized Invitation</Badge>
                    <h3 className="text-3xl font-black font-headline leading-tight italic uppercase">{event.name}</h3>
                    <p className="text-xs italic text-slate-400 leading-relaxed">"{inviteCard.description}"</p>
                    <Button variant="outline" className="w-full rounded-xl border-white/20 text-white hover:bg-white/10 font-bold mt-4" onClick={() => {
                      const link = document.createElement('a');
                      link.href = inviteCard.imageUrl;
                      link.download = `invite-${event.name}.png`;
                      link.click();
                    }}>Download Visual Assets</Button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale gap-4">
                  <Sparkles className="h-16 w-16 text-primary" />
                  <p className="font-headline text-xl font-black uppercase tracking-tighter italic">Invite Art Missing</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Organizers can generate invite cards in the event edit screen.</p>
                </div>
              )}
            </Card>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Destination Assurance
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Group bookings made through Backpacker are automatically synchronized with each participant's individual itinerary. 
                Refunds for group cancellations are returned to the organizer's Smart Wallet instantly.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

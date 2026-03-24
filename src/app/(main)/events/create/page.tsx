
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Plus, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Sparkles, 
  Loader2, 
  ChevronLeft,
  Wand2,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { useUser, useFirestore, addDocumentNonBlocking, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateInviteCard } from '@/ai/flows/generate-invite-card-flow';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters.'),
  description: z.string().min(10, 'Please provide a more detailed description.'),
  location: z.string().min(2, 'Where is this happening?'),
  startDateTime: z.string().min(1, 'When does it start?'),
  maxParticipants: z.coerce.number().min(2).max(100),
  vibe: z.string().min(1, 'What is the vibe?'),
});

export default function CreateEventPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [inviteCard, setInviteCard] = useState<{ imageUrl: string; description: string } | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      startDateTime: '',
      maxParticipants: 10,
      vibe: 'Modern',
    },
  });

  const handleGenerateCard = async () => {
    const values = form.getValues();
    if (!values.name || !values.location) {
      toast({ variant: 'destructive', title: "Missing Info", description: "Enter an event name and location first." });
      return;
    }

    setIsGeneratingCard(true);
    try {
      const result = await generateInviteCard({
        eventName: values.name,
        location: values.location,
        vibe: values.vibe,
        language: currentLang,
      });
      setInviteCard(result);
      toast({ title: "Invite Card Generated!", description: "Check out the AI synthesis on the right." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Magic Failed", description: "The AI was unable to render your card. Please try again." });
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    if (!user || !firestore) return;
    setIsCreating(true);

    try {
      const eventRef = doc(collection(firestore, 'destinationEvents'));
      const eventData = {
        ...values,
        id: eventRef.id,
        organizerId: user.uid,
        participantIds: [user.uid],
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      setDocumentNonBlocking(eventRef, eventData, { merge: true });

      if (inviteCard) {
        const inviteRef = doc(firestore, 'destinationEvents', eventRef.id, 'inviteCards', 'primary');
        setDocumentNonBlocking(inviteRef, {
          id: 'primary',
          destinationEventId: eventRef.id,
          imageUrl: inviteCard.imageUrl,
          aiPromptUsed: values.vibe,
          description: inviteCard.description,
          organizerId: user.uid,
          participantIds: [user.uid],
          generatedAt: serverTimestamp(),
        }, { merge: true });
      }

      toast({ title: "Event Published!", description: "Your group event is now live." });
      router.push('/events');
    } catch (error) {
      toast({ variant: 'destructive', title: "Publication Error", description: "Failed to save event data." });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Button asChild variant="ghost" className="mb-8 hover:bg-slate-100 rounded-xl font-bold text-slate-500">
        <Link href="/events"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Events</Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-tighter text-[10px]">Event Architect</Badge>
            <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight leading-none">Synthesize New Event</h1>
            <p className="text-lg text-slate-500 font-medium">Define your group adventure and let AI handle the creative assets.</p>
          </div>

          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl">Event Logics</CardTitle>
              <CardDescription className="text-slate-400">Basic parameters for your destination meetup.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Event Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Sunset Rooftop Social" {...field} className="rounded-xl h-12" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Specific Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input placeholder="e.g. Paris, 3rd District" {...field} className="pl-10 rounded-xl h-12" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startDateTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Start Date & Time</FormLabel>
                          <FormControl><Input type="datetime-local" {...field} className="rounded-xl h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Event Description</FormLabel>
                        <FormControl><Textarea placeholder="What's the plan? Detail the itinerary..." rows={4} {...field} className="rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="maxParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Max Explorers</FormLabel>
                          <FormControl><Input type="number" {...field} className="rounded-xl h-12" /></FormControl>
                          <FormDescription>Capacity limit for the group.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vibe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Visual Vibe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input placeholder="e.g. Neon, Minimalist, Lush" {...field} className="pl-10 rounded-xl h-12" />
                            </div>
                          </FormControl>
                          <FormDescription>Used for AI Invite generation.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex gap-4">
                    <Button type="button" variant="outline" onClick={handleGenerateCard} disabled={isGeneratingCard} className="flex-1 h-14 rounded-2xl font-black border-2">
                      {isGeneratingCard ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                      Generate AI Invite
                    </Button>
                    <Button type="submit" disabled={isCreating} className="flex-[2] h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                      {isCreating ? <Loader2 className="animate-spin" /> : "Publish Event"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white overflow-hidden aspect-[4/5] relative flex flex-col justify-center items-center">
              {isGeneratingCard ? (
                <div className="text-center p-8 space-y-6">
                  <div className="relative w-32 h-32 mx-auto">
                    <Loader2 className="w-full h-full animate-spin text-primary opacity-20" />
                    <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-headline text-2xl font-black text-primary">Synthesis in Progress</p>
                    <p className="text-sm opacity-60 font-medium">Mixing visual DNA for your custom invitation...</p>
                  </div>
                </div>
              ) : inviteCard ? (
                <>
                  <Image src={inviteCard.imageUrl} alt="Invite Art" fill className="object-cover opacity-60 animate-in fade-in zoom-in duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-0 p-10 w-full text-left space-y-4">
                    <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px]">AI Generated Invite</Badge>
                    <h3 className="text-4xl font-black font-headline leading-tight">{form.watch('name') || 'Untitled Event'}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {form.watch('location')}</span>
                    </div>
                    <p className="text-xs italic text-slate-500 leading-relaxed max-w-sm">"{inviteCard.description}"</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-12 opacity-20 grayscale space-y-6">
                  <Globe className="h-24 w-24 mx-auto" />
                  <div className="space-y-2">
                    <p className="font-headline text-3xl font-black uppercase tracking-tighter">Your Creative Canvas</p>
                    <p className="text-sm font-bold">Fill in event details and hit 'Generate AI Invite' to synthesize high-fidelity visual assets.</p>
                  </div>
                </div>
              )}
            </Card>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Pro Tip
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Invite cards help increase engagement. Once published, your event will be discoverable by other verified Explorers who share your travel vibe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

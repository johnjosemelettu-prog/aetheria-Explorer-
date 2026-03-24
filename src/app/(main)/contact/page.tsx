'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Mail, 
  Phone, 
  Send, 
  Loader2, 
  MessageCircle, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight,
  Sparkles,
  Bot,
  Zap,
  ArrowUpRight,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().email('Please enter a valid email address.'),
  subject: z.string().min(1, 'Please select a topic.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSending, setIsSending] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const ticketsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'supportTickets'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
    },
    [user, firestore]
  );
  const { data: recentTickets } = useCollection(ticketsQuery);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof contactFormSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: "Identity Required", description: "Please sign in to submit a support node." });
      return;
    }

    setIsSending(true);
    try {
      const ticketsRef = collection(firestore, 'supportTickets');
      await addDocumentNonBlocking(ticketsRef, {
        userId: user.uid,
        userEmail: values.email,
        userName: values.name,
        subject: values.subject,
        message: values.message,
        status: 'open',
        priority: values.subject === 'billing' ? 'medium' : 'low',
        category: values.subject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Ticket Synthesized!",
        description: "Your support node has been live-synchronized with the Command Center.",
      });
      form.reset({ subject: '', message: '' });
    } catch (e) {
      toast({ variant: 'destructive', title: "Protocol Error", description: "Failed to transmit support data." });
    } finally {
      setIsSending(false);
    }
  }

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <header className="mb-20 text-center space-y-6">
        <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-[0.3em] py-1.5 px-4 text-[10px] rounded-full">Global Support Network</Badge>
        <h1 className="font-headline text-5xl font-black tracking-tighter md:text-8xl text-slate-900 leading-[0.85] italic uppercase">
          Open a <br />
          <span className="text-primary italic">Direct Node.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Stuck in transit or scaling an odyssey? Our support humanoids and AI agents are standing by.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-12">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-10 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10"><Zap className="h-40 w-40 text-primary" /></div>
              <div className="relative z-10">
                <CardTitle className="text-3xl font-black font-headline uppercase tracking-tighter italic">Support Hub</CardTitle>
                <CardDescription className="text-slate-400 font-medium text-lg mt-2">Submit your query to the Command Center.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 md:p-12">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Alex Doe" {...field} className="rounded-2xl h-14 bg-slate-50 border-none font-bold text-lg px-6 focus:ring-2 ring-primary transition-all" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="explorer@aetheria.ai" {...field} className="rounded-2xl h-14 bg-slate-50 border-none font-bold text-lg px-6 focus:ring-2 ring-primary transition-all" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol Area</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-2xl h-14 bg-slate-50 border-none font-bold text-lg px-6 focus:ring-2 ring-primary transition-all">
                              <SelectValue placeholder="Select a sector..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl shadow-2xl border-none p-2">
                            <SelectItem value="booking" className="rounded-xl p-3 font-bold">Booking & Reservations</SelectItem>
                            <SelectItem value="itinerary" className="rounded-xl p-3 font-bold">AI Itinerary Synthesis</SelectItem>
                            <SelectItem value="billing" className="rounded-xl p-3 font-bold">Trip Pass & Billing</SelectItem>
                            <SelectItem value="technical" className="rounded-xl p-3 font-bold">Technical Disruption</SelectItem>
                            <SelectItem value="other" className="rounded-xl p-3 font-bold">General Intelligence</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detail your request for the Aetheria team..."
                            rows={6}
                            {...field}
                            className="rounded-[2rem] bg-slate-50 border-none font-medium text-lg p-8 focus:ring-2 ring-primary transition-all resize-none shadow-inner"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-20 rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/30 group active:scale-95 transition-all" disabled={isSending}>
                    {isSending ? (
                      <><Loader2 className="mr-3 h-8 w-8 animate-spin" /> Synthesizing...</>
                    ) : (
                      <><Send className="mr-3 h-8 w-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Request</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {recentTickets && recentTickets.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black font-headline text-slate-900 flex items-center gap-3">
                <History className="h-6 w-6 text-primary" /> Active Nodes
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {recentTickets.map((ticket) => (
                  <Card key={ticket.id} className="border-none shadow-lg rounded-[2rem] bg-white p-6 group hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                          ticket.status === 'open' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tighter italic">{ticket.subject} Node</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {ticket.createdAt?.toDate ? format(ticket.createdAt.toDate(), 'PPP') : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "font-black uppercase text-[10px] px-3 py-1",
                        ticket.status === 'open' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      )}>{ticket.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-10">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[3rem] p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Sparkles className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center backdrop-blur-md shadow-xl">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black font-headline tracking-tight uppercase italic">Neural Link Active</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Ruth AI: Online 24/7</p>
                  </div>
                </div>
              </div>
              <p className="text-lg font-medium leading-relaxed opacity-90">
                Ruth can solve 92% of logistical queries instantly. Access your bookings and passes without human latency.
              </p>
              <Button variant="outline" className="w-full h-16 bg-white text-primary hover:bg-slate-50 border-none font-black text-lg rounded-2xl shadow-2xl" onClick={() => {
                const botBtn = document.querySelector('button[class*="h-16 w-16"]') as HTMLButtonElement;
                if (botBtn) botBtn.click();
              }}>
                Initialize Chat <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Dispatch Center', value: 'odyssey@aetheria.ai', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Tactical Hotline', value: '+1 (555) 0199', icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Command HQ', value: '77 Synthetic Way, San Francisco', icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' }
            ].map((node, idx) => (
              <Card key={idx} className="border-none shadow-lg rounded-[2rem] p-6 bg-white hover:bg-slate-50 transition-all duration-500 group border border-slate-50">
                <div className="flex items-center gap-6">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", node.bg, node.color)}>
                    <node.icon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{node.label}</p>
                    <p className="text-lg font-black text-slate-900 truncate uppercase italic tracking-tighter">{node.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

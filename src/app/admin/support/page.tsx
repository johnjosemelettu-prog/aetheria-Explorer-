'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Search, 
  Filter, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  MoreVertical,
  ShieldCheck,
  Zap,
  PhoneCall,
  User,
  History,
  Activity,
  Mic,
  Volume2
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SupportAdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);

  const ticketsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'supportTickets'), orderBy('createdAt', 'desc'), limit(50)) : null),
    [firestore]
  );
  const { data: tickets, isLoading: isTicketsLoading } = useCollection(ticketsQuery);

  const callsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'supportCalls'), orderBy('startTime', 'desc'), limit(20)) : null),
    [firestore]
  );
  const { data: pastCalls } = useCollection(callsQuery);

  useEffect(() => {
    let interval: any;
    if (activeCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const handleUpdateStatus = (ticketId: string, newStatus: string) => {
    if (!firestore) return;
    const ticketRef = doc(firestore, 'supportTickets', ticketId);
    updateDocumentNonBlocking(ticketRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    toast({ title: "Node Updated", description: `Ticket status set to ${newStatus}.` });
  };

  const handleSimulateCall = () => {
    if (activeCall) return;
    const callId = Math.random().toString(36).substring(7).toUpperCase();
    const newCall = {
      id: callId,
      userName: "Alex Explorer",
      location: "In-Transit (JFK)",
      startTime: new Date().toISOString(),
      status: 'active'
    };
    setActiveCall(newCall);
    toast({ title: "Call Inbound", description: "Telephony node established." });
  };

  const handleEndCall = async () => {
    if (!activeCall || !firestore) return;
    const callsRef = collection(firestore, 'supportCalls');
    await addDocumentNonBlocking(callsRef, {
      userId: 'anonymous-test',
      agentId: 'admin-node',
      startTime: activeCall.startTime,
      endTime: new Date().toISOString(),
      duration: callDuration,
      status: 'completed',
      notes: 'Simulated support call node resolved.'
    });
    setActiveCall(null);
    toast({ title: "Call Terminated", description: "Node logged to global ledger." });
  };

  const filteredTickets = tickets?.filter(t => 
    t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
            <ShieldCheck className="text-primary h-8 w-8" />
            Support Command
          </h1>
          <p className="text-slate-500 font-medium mt-1">Directing global resolution flows and telephony nodes.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
            <Input 
              placeholder="Search Subject or User..." 
              className="pl-10 h-12 w-64 rounded-xl border-none shadow-sm bg-white" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleSimulateCall} disabled={!!activeCall} className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20">
            <PhoneCall className="mr-2 h-4 w-4" /> Simulate Inbound
          </Button>
        </div>
      </header>

      {activeCall && (
        <Card className="border-none shadow-2xl rounded-[3rem] bg-emerald-600 text-white p-8 animate-pulse-slow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Phone className="h-48 w-48" /></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Mic className="h-10 w-10 text-white animate-pulse" />
              </div>
              <div className="space-y-1">
                <Badge className="bg-white/20 text-white border-none font-bold uppercase text-[8px] mb-2">Live Telephony Node</Badge>
                <h2 className="text-3xl font-black font-headline tracking-tighter uppercase">{activeCall.userName}</h2>
                <p className="text-emerald-100 font-medium">{activeCall.location} • {format(callDuration * 1000, 'mm:ss')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10 font-bold h-14 px-8">
                <Volume2 className="mr-2 h-5 w-5" /> Mute Node
              </Button>
              <Button onClick={handleEndCall} className="rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-black h-14 px-10 shadow-2xl">
                Terminate & Log
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="tickets" className="space-y-8">
        <TabsList className="bg-slate-100 p-1.5 rounded-[2rem] h-16 w-fit shadow-inner">
          <TabsTrigger value="tickets" className="rounded-[1.25rem] px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
            <MessageSquare className="mr-2 h-4 w-4" /> Ticket Queue ({filteredTickets.length})
          </TabsTrigger>
          <TabsTrigger value="calls" className="rounded-[1.25rem] px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
            <History className="mr-2 h-4 w-4" /> Call Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="m-0">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              {isTicketsLoading ? (
                <div className="p-10 space-y-4">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : filteredTickets.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="p-8 flex flex-col md:flex-row items-center gap-8 hover:bg-slate-50 transition-all group">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <User className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black font-headline text-slate-900 uppercase italic tracking-tighter">{ticket.userName}</h3>
                          <Badge variant="outline" className="font-black uppercase text-[8px] text-slate-400">{ticket.category}</Badge>
                          {ticket.priority === 'critical' && <Badge className="bg-red-500 text-white font-black text-[8px] uppercase">CRITICAL</Badge>}
                        </div>
                        <p className="font-bold text-slate-700 mt-1">{ticket.subject}</p>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1 opacity-60 font-medium">"{ticket.message}"</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">
                          SYNTHESIZED: {ticket.createdAt?.toDate ? format(ticket.createdAt.toDate(), 'PPP HH:mm') : 'Recently'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Select 
                          onValueChange={(v) => handleUpdateStatus(ticket.id, v)} 
                          defaultValue={ticket.status}
                        >
                          <SelectTrigger className="rounded-xl h-12 px-6 font-bold border-2 w-[140px]">
                            <div className="flex items-center gap-2">
                              <div className={cn("h-2 w-2 rounded-full", ticket.status === 'open' ? 'bg-amber-500' : 'bg-emerald-500')} />
                              <span className="uppercase tracking-widest text-[10px]">{ticket.status}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-none">
                            <SelectItem value="open" className="rounded-xl font-bold">Open</SelectItem>
                            <SelectItem value="in-progress" className="rounded-xl font-bold">In-Progress</SelectItem>
                            <SelectItem value="resolved" className="rounded-xl font-bold">Resolved</SelectItem>
                            <SelectItem value="closed" className="rounded-xl font-bold">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300">
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center opacity-30 grayscale gap-6">
                  <CheckCircle2 className="h-24 w-24 text-emerald-600" />
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black font-headline uppercase tracking-tighter">Queue Clear</h2>
                    <p className="font-medium">No unresolved nodes in the current cycle.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls" className="m-0">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              {pastCalls && pastCalls.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {pastCalls.map((call) => (
                    <div key={call.id} className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                          <Phone className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tighter italic">Telephony Node {call.id.substring(0, 6)}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1">Duration: {format(call.duration * 1000, 'mm:ss')} • Agent: {call.agentId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Timestamp</p>
                        <p className="text-sm font-bold text-slate-700">{call.startTime ? format(new Date(call.startTime), 'PPP HH:mm') : 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center opacity-30 grayscale gap-6">
                  <Phone className="h-24 w-24 text-primary" />
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black font-headline uppercase tracking-tighter">Ledger Silent</h2>
                    <p className="font-medium">No telephony records synthesized in this ledger.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><Activity className="h-32 w-32 text-primary" /></div>
          <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Service Efficiency</h4>
          <p className="text-2xl font-black font-headline leading-tight italic">94% of Tickets Resolved <br />Within <span className="text-primary">2.4 Seconds.</span></p>
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3">
            <Zap className="h-5 w-5 text-accent" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ruth AI handles Level 1 Triage Nodes.</p>
          </div>
        </Card>
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary/5 p-10 border border-primary/10">
          <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Security Protocol
          </h4>
          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
            "All support calls are synthesized through encrypted ephemeral nodes. No PII is retained in model persistent memory."
          </p>
        </Card>
      </div>
    </div>
  );
}

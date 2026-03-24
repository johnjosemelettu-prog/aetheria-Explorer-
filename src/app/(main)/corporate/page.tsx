'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Search, 
  Loader2, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  Target,
  Globe,
  Wallet,
  Clock,
  Navigation,
  Smartphone,
  ScanLine,
  Utensils,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function CorporateModulePage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [hasMounted, setHasMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const tripsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(1));
    },
    [user, firestore]
  );
  const { data: trips } = useCollection(tripsQuery);
  const activeTrip = trips?.[0];

  const handleScanReceipt = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Receipt Synthesized",
        description: "Transaction #CP-9921 resolved and synced to Corporate Ledger.",
      });
    }, 2000);
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-slate-900 text-white border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Corporate Node</Badge>
          <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
            Corporate Mode
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl">
            Streamline business odysseys with strategic compliance and automated reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compliance Node</p>
            <p className="text-xs font-black text-slate-900 uppercase">Active Duty</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Tabs defaultValue="mission" className="space-y-10">
            <TabsList className="bg-slate-100 p-1.5 rounded-[2rem] h-16 w-fit shadow-inner">
              <TabsTrigger value="mission" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                <Target className="mr-2 h-4 w-4" /> Mission Node
              </TabsTrigger>
              <TabsTrigger value="expense" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                <BarChart3 className="mr-2 h-4 w-4" /> Expense Synthesis
              </TabsTrigger>
              <TabsTrigger value="network" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                <Users className="mr-2 h-4 w-4" /> Professional Network
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mission" className="space-y-8 animate-in fade-in duration-500">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-primary text-white border-none font-bold uppercase text-[9px] mb-4">Live Itinerary Sync</Badge>
                      <CardTitle className="text-3xl font-black font-headline tracking-tighter uppercase italic">{activeTrip?.name || 'No Active Mission'}</CardTitle>
                    </div>
                    <Link href="/itinerary-generator">
                      <Button variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/10 font-bold">Adjust Mission</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Upcoming Meeting Node
                      </h4>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-slate-900">Project Alpha Strategy</p>
                        <p className="text-sm font-bold text-slate-500">14:00 PM • {activeTrip?.destination || 'Global Hub'}</p>
                      </div>
                      <Button className="w-full rounded-xl font-bold bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50">
                        <Navigation className="mr-2 h-4 w-4" /> Map Meeting Node
                      </Button>
                    </div>
                    <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Policy Compliance
                      </h4>
                      <p className="text-sm font-bold text-emerald-900 leading-relaxed italic">
                        "Standard business class authorized for journeys over 6 hours."
                      </p>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase">Aura Policy Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Mission Progress</h4>
                    <Progress value={65} className="h-2 rounded-full bg-slate-100" />
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Departure Resolved</span>
                      <span>Synthesis Goal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-xl rounded-3xl p-8 bg-white group hover:shadow-2xl transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black font-headline text-slate-900">Coworking Hubs</h3>
                  <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Access verified work nodes with zero-latency fiber.</p>
                  <Button variant="link" className="p-0 h-auto mt-4 text-primary font-black flex items-center gap-2">Explore Nodes <ArrowUpRight className="h-4 w-4" /></Button>
                </Card>
                <Card className="border-none shadow-xl rounded-3xl p-8 bg-white group hover:shadow-2xl transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 shadow-inner group-hover:bg-accent group-hover:text-slate-900 transition-all">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black font-headline text-slate-900">Business Dining</h3>
                  <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Curated restaurants suitable for high-stakes negotiation.</p>
                  <Button variant="link" className="p-0 h-auto mt-4 text-accent-foreground font-black flex items-center gap-2">Reserve Table <ArrowUpRight className="h-4 w-4" /></Button>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="expense" className="animate-in fade-in duration-500 m-0">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-10"><BarChart3 className="h-40 w-40" /></div>
                <CardHeader className="p-10 relative z-10">
                  <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] mb-4">Financial Grid Active</Badge>
                  <CardTitle className="text-4xl font-black font-headline tracking-tighter">Molecular Ledger</CardTitle>
                  <CardDescription className="text-slate-400 font-medium text-lg">Real-time expense synthesis via Optical Node.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-0 relative z-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="relative aspect-square max-w-sm rounded-[2rem] border-4 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center overflow-hidden group cursor-pointer" onClick={handleScanReceipt}>
                        {isScanning ? (
                          <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                            <p className="text-xs font-black uppercase tracking-widest animate-pulse">Decoding Node...</p>
                          </div>
                        ) : (
                          <>
                            <Smartphone className="h-16 w-16 text-white/20 mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-black text-white/40 uppercase tracking-widest">Scan Physical Receipt</p>
                            <ScanLine className="absolute h-1 w-full bg-primary/50 top-0 animate-[scan_4s_linear_infinite]" />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Un-reconciled Nodes</p>
                        <p className="text-5xl font-black font-headline text-white">$420.50</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all cursor-pointer">
                          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-primary"><Wallet className="h-5 w-5" /></div>
                          <div>
                            <p className="text-sm font-bold">Uber Business</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yesterday • $22.40</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all cursor-pointer">
                          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-primary"><Utensils className="h-5 w-5" /></div>
                          <div>
                            <p className="text-sm font-bold">Le Comptoir Node</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yesterday • $145.00</p>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full h-14 rounded-2xl font-black bg-white text-slate-900 hover:bg-slate-200">
                        Authorize Bulk Reconciliation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="network" className="animate-in fade-in duration-500 m-0">
              <div className="space-y-8">
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-2xl font-black font-headline text-slate-900">Networking</h3>
                      <p className="text-sm text-slate-500 font-medium">Found 4 verified professionals sharing your trajectory node.</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Sarah K.', role: 'Product Architect', company: 'Neuralis', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                      { name: 'Alex M.', role: 'Growth Lead', company: 'Vortex', avatar: 'https://i.pravatar.cc/150?u=alex' },
                      { name: 'Elena R.', role: 'VC Partner', company: 'SeedNodes', avatar: 'https://i.pravatar.cc/150?u=elena' },
                      { name: 'James W.', role: 'CTO', company: 'GridSync', avatar: 'https://i.pravatar.cc/150?u=james' },
                    ].map((person, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback>{person.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-black text-slate-900">{person.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{person.role} @ {person.company}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-primary hover:bg-primary/5">
                          <ArrowUpRight className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-8 space-y-8">
            <h3 className="text-xl font-black font-headline text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
              <Target className="h-6 w-6 text-primary" /> Mission Nodes
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Mission Type</p>
                  <p className="font-bold text-slate-900">Market Expansion</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none font-black uppercase text-[8px]">Strategic</Badge>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Corporate ID</p>
                <p className="font-mono text-xs font-bold text-slate-700 break-all">VIBE-C-9921-X-ALPHA</p>
              </div>
            </div>
            <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
              Authorize Mission
            </Button>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] bg-slate-900 text-white p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary"><ShieldCheck className="h-6 w-6" /></div>
              <h4 className="font-black font-headline uppercase tracking-widest text-sm">Duty of Care</h4>
            </div>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              Global emergency extraction protocols are locked to your coordinates.
            </p>
            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500">Grid Status</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase animate-pulse">AUTHORIZED</span>
            </div>
          </Card>

          <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
              <strong>Aura Pro Tip:</strong> Your itinerary suggests taking the Rail node between Paris and London. This saves 2.4 tons of CO2 and complies with your company's molecular footprint mandate.
            </p>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}

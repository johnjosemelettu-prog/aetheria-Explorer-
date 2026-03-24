
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Loader2, 
  Users, 
  Sparkles, 
  ArrowUpRight,
  Target,
  Globe,
  Wallet,
  Clock,
  Navigation,
  Smartphone,
  ScanLine,
  Utensils
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
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
        description: "Transaction resolved and synced to Corporate Ledger.",
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
            </TabsList>

            <TabsContent value="mission" className="space-y-8 animate-in fade-in duration-500">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-primary text-white border-none font-bold uppercase text-[9px] mb-4">Live Itinerary Sync</Badge>
                      <CardTitle className="text-3xl font-black font-headline tracking-tighter uppercase italic">{activeTrip?.name || 'No Active Mission'}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Meeting Node
                    </h4>
                    <p className="text-xl font-black text-slate-900">Project Strategy Alpha</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expense" className="animate-in fade-in duration-500 m-0">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden">
                <div className="relative z-10 space-y-10">
                  <div className="relative aspect-square max-w-sm mx-auto rounded-[2rem] border-4 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer group" onClick={handleScanReceipt}>
                    {isScanning ? (
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    ) : (
                      <>
                        <Smartphone className="h-16 w-16 text-white/20 mb-4" />
                        <p className="text-sm font-black text-white/40 uppercase tracking-widest">Scan Physical Receipt</p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

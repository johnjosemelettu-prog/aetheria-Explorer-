'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Backpack, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertTriangle, 
  CloudSun, 
  Briefcase, 
  FileText, 
  Shirt, 
  Wrench, 
  Plus,
  Sparkles,
  ChevronRight,
  PackageCheck,
  Zap,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { generatePackingList, type PackingListOutput } from '@/ai/flows/generate-packing-list-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PackingAssistantPage() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [packingList, setPackingList] = useState<PackingListOutput | null>(null);
  const [packedItems, setPackedItems] = useState<string[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const itinerariesQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore!, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc')) : null),
    [user, firestore]
  );
  const { data: itineraries, isLoading: isItinerariesLoading } = useCollection(itinerariesQuery);

  const rentalsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore!, 'userProfiles', user.uid, 'rentals'), where('status', '==', 'active')) : null),
    [user, firestore]
  );
  const { data: rentals } = useCollection(rentalsQuery);

  const rentedItems = useMemo(() => {
    return rentals?.flatMap(r => r.items.map((i: any) => i.itemName)) || [];
  }, [rentals]);

  const selectedTrip = useMemo(() => 
    itineraries?.find(trip => trip.id === selectedTripId), 
    [itineraries, selectedTripId]
  );

  const handleGenerate = async () => {
    if (!selectedTrip) return;

    setIsGenerating(true);
    try {
      const result = await generatePackingList({
        destination: selectedTrip.destination,
        itinerarySummary: selectedTrip.itinerarySummary || selectedTrip.description,
        weatherContext: "Typically variable for the season. Pack layers.", 
        language: currentLang,
      });
      setPackingList(result);
      setPackedItems([]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not build your packing list. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItem = (item: string) => {
    setPackedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const categories = ['Clothing', 'Gear', 'Documents', 'Toiletries', 'Miscellaneous'] as const;
  
  const progressValue = packingList ? (packedItems.length / packingList.items.length) * 100 : 0;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Clothing': return <Shirt className="h-4 w-4" />;
      case 'Gear': return <Wrench className="h-4 w-4" />;
      case 'Documents': return <FileText className="h-4 w-4" />;
      case 'Toiletries': return <Briefcase className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Forgot Nothing Agent</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Packing Assistant
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Proactive packing synthesis tailored to climate and itinerary nodes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2rem] bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-headline font-black uppercase tracking-tighter">1. Selection Node</CardTitle>
              <CardDescription>Choose an itinerary to synthesize.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {isItinerariesLoading ? (
                <Skeleton className="h-20 w-full rounded-2xl" />
              ) : itineraries && itineraries.length > 0 ? (
                <div className="space-y-3">
                  {itineraries.map(trip => (
                    <button
                      key={trip.id}
                      onClick={() => {setSelectedTripId(trip.id); setPackingList(null);}}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                        selectedTripId === trip.id ? "bg-primary/5 border-primary ring-1 ring-primary" : "bg-white border-slate-100 hover:border-primary/30"
                      )}
                    >
                      <div className="overflow-hidden pr-4">
                        <p className="font-bold text-slate-900 truncate">{trip.name}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{trip.destination}</p>
                      </div>
                      <ChevronRight className={cn("h-4 w-4 text-slate-300 transition-transform flex-shrink-0", selectedTripId === trip.id && "translate-x-1 text-primary")} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 opacity-30 grayscale flex flex-col items-center gap-4">
                  <AlertTriangle className="h-10 w-10 text-slate-400" />
                  <p className="text-xs font-black uppercase tracking-widest">Itineraries Pending</p>
                </div>
              )}
            </CardContent>
            {selectedTrip && (
              <CardFooter className="p-8 pt-0">
                <Button onClick={handleGenerate} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <><Sparkles className="mr-2 h-5 w-5" /> Build Synthesis List</>}
                </Button>
              </CardFooter>
            )}
          </Card>

          {rentedItems.length > 0 && (
            <Card className="border-none shadow-xl rounded-[2rem] bg-slate-900 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <PackageCheck className="h-32 w-32" />
              </div>
              <CardHeader className="p-8 relative z-10">
                <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] mb-4">Rental Sync Active</Badge>
                <CardTitle className="text-xl font-headline font-black leading-tight">Digital Tailor Integration</CardTitle>
                <CardDescription className="text-slate-400 font-medium mt-2">
                  We've detected {rentedItems.length} items waiting for you at your destination hub.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 relative z-10 space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {rentedItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {item}
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 leading-relaxed italic">
                  "These items will be marked as 'Pre-Packed' in your master synthesis."
                </div>
              </CardContent>
            </Card>
          )}
        </aside>

        <div className="lg:col-span-8">
          {!packingList && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-center py-32 opacity-20 grayscale gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
                <Backpack className="h-40 w-40 text-primary relative mx-auto" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black font-headline uppercase tracking-tighter italic">Manifest Idle</h2>
                <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Select a trip node to initialize your proactive packing synthesis.</p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-8">
              <Skeleton className="h-48 w-full rounded-[2.5rem]" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full rounded-3xl" />
                <Skeleton className="h-64 w-full rounded-3xl" />
              </div>
            </div>
          )}

          {packingList && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-primary p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldCheck className="h-40 w-40" /></div>
                  <div className="relative z-10 space-y-4">
                    <Badge className="bg-white/20 text-white border-none font-bold uppercase mb-4 px-3">Synthesis Resolved</Badge>
                    <CardTitle className="text-4xl font-black font-headline leading-tight italic uppercase">Master Checklist</CardTitle>
                    <p className="text-primary-foreground/80 font-medium text-lg italic leading-relaxed">"{packingList.summary}"</p>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Biological & Logistic Readiness</p>
                      <p className="text-xs font-black text-slate-900">{Math.round(progressValue)}% Resolved</p>
                    </div>
                    <Progress value={progressValue} className="h-2.5 rounded-full bg-slate-100" />
                  </div>

                  <div className="grid grid-cols-1 gap-12">
                    {categories.map(category => {
                      const itemsInCategory = packingList.items.filter(i => i.category === category);
                      if (itemsInCategory.length === 0) return null;

                      return (
                        <section key={category} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
                              {getCategoryIcon(category)}
                            </div>
                            <h3 className="text-xl font-black font-headline text-slate-900 uppercase tracking-tight italic">{category}</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {itemsInCategory.map((item, idx) => {
                              const isRented = rentedItems.includes(item.item);
                              const isPacked = packedItems.includes(item.item) || isRented;
                              
                              return (
                                <Card 
                                  key={idx} 
                                  className={cn(
                                    "group cursor-pointer border-none shadow-md rounded-3xl transition-all duration-300 hover:shadow-xl",
                                    isPacked ? "bg-slate-50 opacity-60" : "bg-white"
                                  )}
                                  onClick={() => !isRented && toggleItem(item.item)}
                                >
                                  <CardContent className="p-6 flex items-start gap-4">
                                    <div className="mt-1">
                                      {isPacked ? (
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                      ) : (
                                        <Circle className="h-6 w-6 text-slate-200 group-hover:text-primary transition-colors" />
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <p className={cn("font-black text-slate-900", isPacked && "line-through text-slate-400")}>{item.item}</p>
                                        {isRented && (
                                          <Badge className="bg-slate-900 text-[8px] text-white font-black uppercase border-none px-2 py-0.5">At Dest.</Badge>
                                        )}
                                      </div>
                                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">"{item.reason}"</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0 bg-slate-50 flex justify-center rounded-b-[2.5rem]">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">
                    <Zap className="h-3 w-3 text-primary" /> Verified for {selectedTrip?.destination || 'Global'} climate nodes
                  </div>
                </CardFooter>
              </Card>

              {progressValue >= 100 && (
                <div className="text-center py-16 bg-emerald-50 rounded-[3rem] border-2 border-dashed border-emerald-200 animate-in zoom-in duration-700">
                  <div className="h-20 w-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto text-emerald-600 mb-6">
                    <ShieldCheck className="h-12 w-12" />
                  </div>
                  <h2 className="text-4xl font-black font-headline text-emerald-900 uppercase italic">Synthesis Resolved</h2>
                  <p className="text-emerald-700 font-medium mt-2">All manifest items are accounted for. You are ready for departure.</p>
                  <Button asChild className="mt-8 rounded-xl font-bold h-12 px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                    <Link href="/dashboard">Return to Command Hub <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Wallet, 
  Loader2, 
  ShieldCheck, 
  Package, 
  ShoppingBasket, 
  Sparkles, 
  ArrowUpRight, 
  MapPin, 
  Compass, 
  Zap, 
  Briefcase, 
  Plus, 
  Wand2, 
  Handshake, 
  AlertTriangle,
  Monitor,
  Smartphone,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages, ImagePlaceholder } from '@/lib/placeholder-images';
import { recommendGear, type RecommendGearOutput, type GearItem } from '@/ai/flows/recommend-gear-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, useFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, increment, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function StorePage() {
  const { t, language } = useTranslation();
  const { user, firestore } = useFirebase();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [curatedGear, setCuratedGear] = useState<RecommendGearOutput | null>(null);
  const [customizingItem, setCustomizingItem] = useState<GearItem | null>(null);
  const [selectedCustomization, setSelectedCustomization] = useState<'standard' | 'destination' | 'event'>('standard');

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const tripsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(1));
    },
    [user, firestore]
  );
  const { data: trips, isLoading: isTripsLoading } = useCollection(tripsQuery);
  const activeTrip = trips?.[0];

  useEffect(() => {
    if (activeTrip && hasMounted && !curatedGear) {
      handleSynthesizeGear();
    }
  }, [activeTrip, hasMounted]);

  const handleSynthesizeGear = async () => {
    if (!activeTrip) return;
    setIsSynthesizing(true);
    try {
      const events = activeTrip.dailyPlans?.map((d: any) => d.theme) || [];
      const result = await recommendGear({
        destination: activeTrip.destination,
        events,
        language: currentLang
      });
      setCuratedGear(result);
    } catch (e) {
      console.warn("AI Curation failed, falling back to standard inventory.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);
  const usdWallet = wallets?.find(w => w.currency === 'USD');

  const ownedGearQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'ownedGear');
    },
    [user, firestore]
  );
  const { data: ownedGear, isLoading: isOwnedGearLoading } = useCollection(ownedGearQuery);

  const cartQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'cart');
    },
    [user, firestore]
  );
  const { data: cartItems } = useCollection(cartQuery);

  const inventory: GearItem[] = curatedGear?.recommendedGear || [
    { id: 'gear-1', name: 'Nomad Pro Backpack', category: 'Luggage' as const, price: 249, rating: 4.9, description: 'Smart tracking enabled. RFID protection and ergonomic weight distribution.', imageHint: 'tech backpack', partner: 'AeroLux' },
    { id: 'gear-2', name: 'Horizon Carry-on', category: 'Luggage' as const, price: 599, rating: 4.8, description: 'Carbon fiber shell with integrated weight sensor and USB-C power.', imageHint: 'luxury suitcase', partner: 'Grand Explorer' },
    { id: 'gear-3', name: 'Noise Pods Elite', category: 'Electronics' as const, price: 299, rating: 4.7, description: 'Active noise isolation with spatial travel soundscapes.', imageHint: 'earbuds', partner: 'Vortex Tech' },
    { id: 'gear-4', name: 'Global Node Adapter', category: 'Utility' as const, price: 45, rating: 4.9, description: 'Universal power synthesis for 150+ countries with fast charging.', imageHint: 'universal adapter', partner: 'Aura Systems' },
    { id: 'gear-5', name: 'Memory Cloud Pillow', category: 'Wellness' as const, price: 65, rating: 4.6, description: 'Biological support for long-haul recovery and neck stability.', imageHint: 'travel pillow', partner: 'ZenVoyager' },
    { id: 'gear-6', name: 'Compression Cubes', category: 'Utility' as const, price: 85, rating: 4.8, description: 'Maximize luggage efficiency. 3-piece set with air-release tech.', imageHint: 'packing cubes', partner: 'Aura Systems' },
  ];

  const handleAddToCart = async (item: GearItem, customization?: string) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please sign in to add items to your cart.' });
      return;
    }

    setIsAdding(item.id);
    try {
      const cartRef = collection(firestore, 'userProfiles', user.uid, 'cart');
      const customizationTag = customization || 'Standard';
      
      const existing = cartItems?.find(i => i.productId === item.id && i.customization === customizationTag);
      
      if (existing) {
        const itemRef = doc(firestore, 'userProfiles', user.uid, 'cart', existing.id);
        setDocumentNonBlocking(itemRef, { quantity: increment(1) }, { merge: true });
      } else {
        const newDocRef = doc(cartRef);
        setDocumentNonBlocking(newDocRef, {
          id: newDocRef.id,
          productId: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: 1,
          imageHint: item.imageHint,
          customization: customizationTag,
          partner: item.partner || 'Aura Affiliate'
        }, { merge: true });
      }

      toast({ 
        title: "Added to Cart", 
        description: `${item.name} (${customizationTag}) added to your arsenal.`,
      });
      setCustomizingItem(null);
    } finally {
      setIsAdding(null);
    }
  };

  const findImage = (hint: string): ImagePlaceholder | undefined => {
    if (!hint) return undefined;
    const hintWords = hint.toLowerCase().split(' ');
    let image = PlaceHolderImages.find(p => p.imageHint.toLowerCase() === hint.toLowerCase());
    if (image) return image;
    image = PlaceHolderImages.find(p => hintWords.some(h => p.imageHint.toLowerCase().includes(h)));
    return image;
  }

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Affiliate Supply Hub</Badge>
          <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
            Gear Architect
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-xl">
            AI-synthesized essentials from our verified affiliate network, tailored to your odyssey.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/cart">
            <Button variant="outline" className="h-14 px-8 rounded-2xl font-black border-2 border-primary text-primary hover:bg-primary/5 shadow-lg relative">
              <ShoppingBasket className="mr-2 h-5 w-5" /> Cart 
              {cartItems && cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center border-2 border-background shadow-lg">{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
              )}
            </Button>
          </Link>
          <div className="hidden sm:flex items-center gap-4 bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Smart Assets</p>
              <p className="text-2xl font-black text-slate-900 font-headline">${usdWallet?.balance.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      </header>

      {activeTrip ? (
        <section className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Compass className="h-32 w-32" /></div>
            <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] px-3">Synthesis Active</Badge>
                <h2 className="text-3xl font-black font-headline leading-tight italic">Personalizing for {activeTrip.destination}</h2>
                <p className="text-slate-400 font-medium max-w-md">
                  {isSynthesizing ? "Analyzing partner nodes and destination climate data..." : curatedGear?.curationReasoning}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target Odyssey</p>
                  <p className="font-bold text-primary">{activeTrip.name}</p>
                </div>
                {isSynthesizing ? <Loader2 className="h-12 w-12 rounded-full animate-spin text-primary" /> : <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary"><Sparkles className="h-6 w-6" /></div>}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <Alert className="mb-12 border-amber-200 bg-amber-50 rounded-3xl p-6 shadow-lg">
          <Zap className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-black font-headline uppercase text-amber-900">Standard Hub Node</AlertTitle>
          <AlertDescription className="text-amber-800 font-medium">
            Join the elite network by planning an odyssey. Unlock partner-curated gear and custom imprinting.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="browse" className="space-y-10">
        <TabsList className="bg-slate-100 p-1.5 rounded-[2rem] h-16 w-fit shadow-inner">
          <TabsTrigger value="browse" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
            <ShoppingBag className="mr-2 h-4 w-4" /> Global Collection
          </TabsTrigger>
          <TabsTrigger value="mygear" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
            <Package className="mr-2 h-4 w-4" /> My Arsenal ({ownedGear?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isSynthesizing ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="rounded-[2.5rem] border-none shadow-lg bg-white overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
                </Card>
              ))
            ) : inventory.map((item) => {
              const itemImage = findImage(item.imageHint);
              const isOwned = ownedGear?.some(og => og.productId === item.id || og.id === item.id);
              
              return (
                <Card key={item.id} className="group border-none shadow-xl rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 bg-white flex flex-col">
                  <div className="relative h-64 overflow-hidden">
                    <Image 
                      src={itemImage?.imageUrl || 'https://placehold.co/600x400'} 
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white/90 text-primary font-black uppercase text-[9px] px-3 py-1 border-none">{item.category}</Badge>
                      <Badge variant="outline" className="bg-slate-900/40 text-white border-white/20 font-black uppercase text-[8px] px-2 py-0.5 flex items-center gap-1">
                        <Handshake className="h-2.5 w-2.5" /> {(item as any).partner || 'Affiliate'}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-[10px] font-black"><Star className="h-3 w-3 fill-accent text-accent" /> {item.rating}</div>
                  </div>
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black font-headline text-slate-900">{item.name}</CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500 leading-relaxed mt-2 line-clamp-2">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-4 flex-grow">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black font-headline text-slate-900">${item.price}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Value</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 gap-3">
                    {activeTrip ? (
                      <Dialog open={customizingItem?.id === item.id} onOpenChange={(open) => !open && setCustomizingItem(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1 rounded-xl h-12 font-black border-2 group-hover:border-primary group-hover:text-primary transition-all" disabled={isOwned} onClick={() => setCustomizingItem(item)}>
                            <Wand2 className="h-4 w-4 mr-2" /> Custom Imprint
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic">Bespoke Protocol</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">Personalize your gear with logos from your {activeTrip.destination} odyssey.</DialogDescription>
                          </DialogHeader>
                          <div className="py-6 space-y-8">
                            <div className="aspect-video relative rounded-2xl overflow-hidden bg-slate-100 border-4 border-slate-50 shadow-inner">
                              <Image src={itemImage?.imageUrl || 'https://placehold.co/600x400'} alt="Preview" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                {selectedCustomization !== 'standard' && (
                                  <div className="bg-white p-4 rounded-xl shadow-2xl animate-in zoom-in duration-300 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <Badge className="bg-primary text-white border-none font-bold uppercase text-[10px]">
                                      {selectedCustomization === 'destination' ? activeTrip.destination : activeTrip.dailyPlans?.[0]?.theme || 'Event'} Node
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>

                            <RadioGroup value={selectedCustomization} onValueChange={(v: any) => setSelectedCustomization(v)} className="grid grid-cols-1 gap-4">
                              <Label htmlFor="standard" className={cn("flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all", selectedCustomization === 'standard' ? "border-primary bg-primary/5" : "border-slate-100 hover:bg-slate-50")}>
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem value="standard" id="standard" />
                                  <span className="font-bold">Standard Asset</span>
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400">Default Node</span>
                              </Label>
                              <Label htmlFor="destination" className={cn("flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all", selectedCustomization === 'destination' ? "border-primary bg-primary/5" : "border-slate-100 hover:bg-slate-50")}>
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem value="destination" id="destination" />
                                  <span className="font-bold">{activeTrip.destination} Identity</span>
                                </div>
                                <Badge className="bg-emerald-50 text-white border-none font-black text-[10px]">FREE SYNT.</Badge>
                              </Label>
                              {activeTrip.dailyPlans && activeTrip.dailyPlans.length > 0 && (
                                <Label htmlFor="event" className={cn("flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all", selectedCustomization === 'event' ? "border-primary bg-primary/5" : "border-slate-100 hover:bg-slate-50")}>
                                  <div className="flex items-center gap-3">
                                    <RadioGroupItem value="event" id="event" />
                                    <span className="font-bold">{activeTrip.dailyPlans[0].theme} Node</span>
                                  </div>
                                  <Badge className="bg-emerald-50 text-white border-none font-black text-[10px]">FREE SYNT.</Badge>
                                </Label>
                              )}
                            </RadioGroup>
                          </div>
                          <DialogFooter>
                            <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" onClick={() => handleAddToCart(item, selectedCustomization === 'standard' ? 'Standard' : `Imprinted: ${selectedCustomization === 'destination' ? activeTrip.destination : activeTrip.dailyPlans[0].theme}`)}>
                              Authorize & Add to Cart
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button className="flex-1 h-12 rounded-xl font-black bg-slate-900 text-white hover:bg-primary transition-all shadow-lg" onClick={() => handleAddToCart(item)} disabled={isAdding === item.id || isOwned}>
                        {isAdding === item.id ? <Loader2 className="animate-spin h-4 w-4" /> : isOwned ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Add to Arsenal</>}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="mygear">
          {isOwnedGearLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Skeleton className="aspect-square rounded-3xl" />
              <Skeleton className="aspect-square rounded-3xl" />
            </div>
          ) : ownedGear && ownedGear.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ownedGear.map((gear) => (
                <Card key={gear.id} className="border-none shadow-lg rounded-3xl overflow-hidden group hover:shadow-xl transition-all">
                  <div className="relative aspect-square">
                    <Image src={findImage(gear.imageHint)?.imageUrl || 'https://placehold.co/400x400'} alt={gear.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                      <p className="text-white font-black font-headline text-lg truncate uppercase italic tracking-tighter">{gear.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {gear.customization && gear.customization !== 'Standard' && (
                          <Badge className="bg-primary text-white border-none text-[8px] px-2 py-0.5 font-black uppercase tracking-widest">{gear.customization}</Badge>
                        )}
                        <Badge variant="outline" className="bg-white/10 text-white/60 border-white/20 text-[8px] font-black uppercase tracking-widest">DEPLOYED</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center opacity-30 grayscale flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center shadow-inner"><Package className="h-10 w-10 text-slate-400" /></div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black font-headline uppercase tracking-tighter">Arsenal Empty</h2>
                <p className="font-medium text-slate-500">Your permanent gear library is currently offline. Initialize a node to begin collection.</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <footer className="mt-32 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12 items-center opacity-60">
        <div className="space-y-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-black font-headline text-slate-900 leading-tight italic">Partner Verified.</h3>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            All items in the Aetheria Hub are synthesized by our verified affiliate network. Quality and ethical production nodes are audited every cycle.
          </p>
        </div>
        <div className="flex justify-end gap-12 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-black font-headline text-slate-900">100%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traceable Node</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black font-headline text-slate-900">Global</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Grid</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  Star, 
  Users, 
  Search, 
  Filter, 
  Loader2, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Globe,
  Wallet,
  Tag,
  Flame,
  ArrowUpRight,
  MapPin,
  Heart,
  Eye,
  Share2,
  Lock,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment, query, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const VIBE_PRICE = 2.99;

const mockVibes = [
  { id: 'vibe-1', name: 'Neon Tokyo Night-Crawler', destination: 'Tokyo, Japan', author: 'CyberNomad', rating: 4.9, sales: 1240, tags: ['Cyberpunk', 'Nightlife', 'Foodie'], image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800', isHot: true },
  { id: 'vibe-2', name: 'Minimalist Brutalist London', destination: 'London, UK', author: 'ArchExplorer', rating: 4.8, sales: 850, tags: ['Minimalist', 'Architecture', 'Culture'], image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800', isHot: false },
  { id: 'vibe-3', name: 'Lush Tulum Wellness Drop', destination: 'Tulum, Mexico', author: 'ZenVoyager', rating: 4.7, sales: 2100, tags: ['Nature', 'Wellness', 'Relaxation'], image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&q=80&w=800', isHot: true },
  { id: 'vibe-4', name: 'Parisian Vintage Film Roll', destination: 'Paris, France', author: 'DirectorCut', rating: 4.9, sales: 3400, tags: ['Vintage', 'Cinematic', 'Romance'], image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800', isHot: false },
  { id: 'vibe-5', name: 'Berlin Techno Bunker Trail', destination: 'Berlin, Germany', author: 'BassLine', rating: 4.6, sales: 920, tags: ['Nightlife', 'Music', 'Underground'], image: 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?auto=format&fit=crop&q=80&w=800', isHot: true },
  { id: 'vibe-6', name: 'Kyoto Zen Temple Circuit', destination: 'Kyoto, Japan', author: 'SoulSeeker', rating: 5.0, sales: 1560, tags: ['History', 'Spirituality', 'Tea'], image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800', isHot: false },
];

export default function VibeMarketplacePage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [hasMounted, setHasMounted] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [searchTerm, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);
  const usdWallet = wallets?.find(w => w.currency === 'USD');

  const handlePurchase = async (vibe: any) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: "Identity Required", description: "Join the network to acquire high-fidelity vibes." });
      return;
    }

    if (!usdWallet || usdWallet.balance < VIBE_PRICE) {
      toast({
        variant: 'destructive',
        title: "Insufficient Liquidity",
        description: `This Vibe requires $${VIBE_PRICE} USD. Top up your Smart Wallet to proceed.`,
      });
      return;
    }

    setIsPurchasing(vibe.id);
    try {
      // Simulate Synthesis Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 1. Process Atomic Settlement
      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(-VIBE_PRICE),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Record Ledger Entry
      addDocumentNonBlocking(collection(firestore, 'userProfiles', user.uid, 'transactions'), {
        type: 'debit',
        category: 'marketplace',
        amount: VIBE_PRICE,
        currency: 'USD',
        description: `Vibe Acquisition: ${vibe.name}`,
        timestamp: serverTimestamp()
      });

      // 3. Synthesize User Itinerary Copy
      const tripRef = doc(collection(firestore, 'userProfiles', user.uid, 'itineraries'));
      setDocumentNonBlocking(tripRef, {
        id: tripRef.id,
        name: vibe.name,
        destination: vibe.destination,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        status: 'draft',
        subscriptionTier: 'free',
        vibe: vibe.tags.join(', '),
        isGeneratedByAI: true,
        purchasedFromMarketplace: true,
        author: vibe.author,
        vibeId: vibe.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: user.uid,
        ownerId: user.uid,
        members: [user.uid]
      }, { merge: true });

      toast({
        title: "Vibe DNA Synthesized!",
        description: `"${vibe.name}" has been added to your Journeys.`,
      });
    } finally {
      setIsPurchasing(null);
    }
  };

  const filteredVibes = mockVibes.filter(v => 
    (v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     v.destination.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeCategory === 'all' || v.tags.map(t => t.toLowerCase()).includes(activeCategory.toLowerCase()))
  );

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in duration-700">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-xs sm:text-sm">P2P Economy Node</Badge> {/* Adjusted font size */}
          <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-slate-900 leading-[0.85] italic uppercase"> {/* Adjusted font size */}
            Vibe <br />
            <span className="text-primary italic">Marketplace.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-xl"> {/* Adjusted font size */}
            Acquire proven odyssey templates from legendary explorers or monetize your own visual DNA.
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Available USD</p>
              <p className="text-2xl font-black text-slate-900 font-headline">${usdWallet?.balance.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <Button asChild className="rounded-2xl h-12 sm:h-14 px-8 font-black bg-slate-900 text-white hover:bg-slate-800 shadow-xl w-full md:w-auto"> {/* Adjusted height and font size */}
            <Link href="/itinerary-generator">
              <Plus className="mr-2 h-5 w-5" /> Sell Your Vibe
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-hover:text-primary transition-colors" />
          <Input 
            placeholder="Search vibes, destinations, or authors..." 
            className="h-12 sm:h-16 rounded-[1.5rem] pl-14 border-none shadow-lg bg-white text-base sm:text-lg font-medium focus:ring-4 ring-primary/10 transition-all"
            value={searchTerm}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {['all', 'Cyberpunk', 'Minimalist', 'Nature', 'Vintage', 'Nightlife'].map(cat => (
            <Button 
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              className={cn(
                "rounded-full h-10 sm:h-12 px-6 font-black uppercase text-xs sm:text-sm tracking-widest transition-all",
                activeCategory === cat ? "shadow-lg shadow-primary/20" : "border-2 border-slate-100 bg-white"
              )}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredVibes.map((vibe) => (
          <Card key={vibe.id} className="group border-none shadow-xl rounded-[3rem] overflow-hidden bg-white flex flex-col hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
            <div className="relative h-64 overflow-hidden">
              <Image src={vibe.image} alt={vibe.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                {vibe.tags.map(tag => (
                  <Badge key={tag} className="bg-white/90 text-slate-900 border-none font-black text-xs px-3 py-1 uppercase tracking-tighter">{tag}</Badge>
                ))}
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 text-white text-xs font-black border border-white/10">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {vibe.rating}
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 text-white text-xs font-black border border-white/10">
                  <Users className="h-3.5 w-3.5" /> {vibe.sales.toLocaleString()}
                </div>
              </div>
            </div>
            
            <CardContent className="p-8 flex-grow space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black font-headline text-slate-900 leading-tight group-hover:text-primary transition-colors uppercase italic tracking-tighter"> {/* Adjusted font size */}
                  {vibe.name}
                </h3>
                <p className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {vibe.destination}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                    {vibe.author[0]}
                  </div>
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest">By {vibe.author}</p>
                </div>
                <p className="text-2xl font-black font-headline text-primary">$2.99</p>
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-0">
              <Button 
                onClick={() => handlePurchase(vibe)} 
                disabled={isPurchasing === vibe.id}
                className="w-full h-12 sm:h-14 rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all group/btn"
              >
                {isPurchasing === vibe.id ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                    Acquire Vibe
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

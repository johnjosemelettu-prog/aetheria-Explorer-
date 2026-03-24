
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChefHat, 
  Utensils, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Wallet, 
  ArrowRight,
  TrendingUp,
  Dna,
  PieChart,
  Flame,
  Star,
  Search,
  MapPin,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { analyzeCulinaryDna, type CulinaryDnaOutput } from '@/ai/flows/analyze-culinary-dna-flow';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function FlavorDnaPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dna, setDna] = useState<CulinaryDnaOutput | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const diningQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'diningTableBookings'), orderBy('bookedAt', 'desc'), limit(10));
    },
    [user, firestore]
  );
  const { data: bookings, isLoading: isBookingsLoading } = useCollection(diningQuery);

  const tripsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(1));
    },
    [user, firestore]
  );
  const { data: trips } = useCollection(tripsQuery);
  const activeTrip = trips?.[0];

  const handleSynthesize = async () => {
    if (!bookings || bookings.length === 0) {
      toast({ variant: 'destructive', title: "Data Missing", description: "Initialize a dining node to begin Palate synthesis." });
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await analyzeCulinaryDna({
        foodHistory: bookings.map(b => ({
          dishName: b.restaurantName,
          cuisine: "Global",
          rating: 5
        })),
        currentDestination: activeTrip?.destination || 'New York',
        language: currentLang
      });
      setDna(data);
    } catch (err) {
      toast({ variant: 'destructive', title: "Synthesis Offline" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-orange-100 text-orange-700 border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Gastronomic Intelligence</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Flavor DNA
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Synthesize your permanent taste profile to predict your next high-fidelity culinary target.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-orange-600 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000"><PieChart className="h-32 w-32" /></div>
            <CardHeader className="p-10 pb-4 relative z-10">
              <CardTitle className="text-xl font-headline font-black uppercase tracking-tighter">Synthesis Node</CardTitle>
              <CardDescription className="text-orange-100 opacity-80 font-medium">Analyzing {bookings?.length || 0} culinary touchpoints.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 relative z-10">
              <Button 
                onClick={handleSynthesize} 
                disabled={isAnalyzing || isBookingsLoading}
                className="w-full h-16 rounded-2xl bg-white text-orange-700 hover:bg-orange-50 font-black text-xl shadow-xl active:scale-95 transition-all"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <><Dna className="mr-2 h-6 w-6" /> Map Flavor DNA</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-[2.5rem] bg-white p-8">
            <h3 className="font-headline font-black text-xl mb-6 text-slate-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-500" /> Recent Discovery Nodes
            </h3>
            <div className="space-y-3">
              {bookings?.map((b, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                  <span className="font-bold text-slate-700 text-sm truncate">{b.restaurantName}</span>
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200 text-slate-400">RESOLVED</Badge>
                </div>
              ))}
              {(!bookings || bookings.length === 0) && (
                <div className="py-10 text-center opacity-30 grayscale flex flex-col items-center gap-4">
                  <Utensils className="h-10 w-10 text-slate-400" />
                  <p className="text-xs font-black uppercase tracking-widest">No Dining History</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-8 opacity-50">
              <div className="relative w-32 h-32">
                <Loader2 className="w-full h-full animate-spin text-orange-600" strokeWidth={1} />
                <ChefHat className="absolute inset-0 m-auto h-12 w-12 text-orange-600 animate-pulse" />
              </div>
              <p className="font-headline text-2xl font-black uppercase tracking-tighter">Decoding Flavor Markers...</p>
            </div>
          ) : dna ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="h-40 w-40 text-orange-500" /></div>
                <div className="relative z-10 space-y-8">
                  <div>
                    <Badge className="bg-primary text-white border-none font-bold uppercase mb-4 px-3">Architecture Result</Badge>
                    <h2 className="text-4xl font-black font-headline leading-tight italic uppercase">{dna.palateProfile}</h2>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {dna.dominantFlavors.map(flavor => (
                      <Badge key={flavor} className="bg-white/10 text-white border-white/20 font-black uppercase px-4 py-1.5">{flavor}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Next Target
                      </h4>
                      <div className="space-y-2">
                        <p className="text-3xl font-black font-headline text-white">{dna.nextDishRecommendation.name}</p>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"{dna.nextDishRecommendation.reasoning}"</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Drift Warning
                      </h4>
                      <p className="text-sm font-bold text-slate-300 leading-relaxed italic">"{dna.sensitivityAlert}"</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="p-6 rounded-3xl bg-orange-50 border border-orange-100 flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <p className="text-xs text-orange-800/70 font-medium leading-relaxed">
                  Your next culinary target has been mapped to a <strong>{dna.nextDishRecommendation.whereToFind}</strong> node in {activeTrip?.destination || 'your destination'}.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-32 opacity-20 grayscale gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-full blur-3xl opacity-20" />
                <Utensils className="h-40 w-40 text-orange-600 relative mx-auto" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black font-headline uppercase tracking-tighter italic">Palate Radar Idle</h2>
                <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Initialize a synthesis scan to view your high-fidelity flavor profile.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Loader2, 
  Download, 
  Share2, 
  Wand2, 
  ChevronRight,
  Play,
  Film,
  Zap,
  MapPin,
  Smartphone,
  Monitor,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { generateTripVideo, type GenerateTripVideoOutput } from '@/ai/flows/generate-trip-video-flow';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc, increment, serverTimestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

/**
 * @fileOverview The Trip Odyssey Cinema Studio.
 * Synthesizes 8-second cinematic teasers using Google Veo 3.
 */
export default function VideoTeaserPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [hasMounted, setHasMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateTripVideoOutput | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [videoFormat, setVideoFormat] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isTurbo, setIsTurbo] = useState(false);

  const TURBO_FEE = 2.00;
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const tripsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(5));
    },
    [user, firestore]
  );
  const { data: trips, isLoading: isTripsLoading } = useCollection(tripsQuery);

  const walletsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'wallets');
    },
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);
  const usdWallet = wallets?.find(w => w.currency === 'USD');

  const activeTrip = trips?.find(t => t.id === selectedTripId) || trips?.[0];

  const handleGenerate = async () => {
    if (!activeTrip || !user || !firestore) {
      toast({ variant: 'destructive', title: "Synthesis Error", description: "Target odyssey node required." });
      return;
    }

    if (isTurbo && (!usdWallet || usdWallet.balance < TURBO_FEE)) {
      toast({ variant: 'destructive', title: "Insufficient Assets", description: "Turbo synthesis requires $2.00 in your USD node." });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    try {
      if (isTurbo) {
        const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
        setDocumentNonBlocking(walletRef, { balance: increment(-TURBO_FEE), updatedAt: serverTimestamp() }, { merge: true });
        addDocumentNonBlocking(collection(firestore, 'userProfiles', user.uid, 'transactions'), {
          type: 'debit',
          category: 'synthesis',
          amount: TURBO_FEE,
          currency: 'USD',
          description: 'Turbo Synthesis Boost',
          timestamp: serverTimestamp()
        });
      }

      const highlights = activeTrip.dailyPlans?.slice(0, 3).map((day: any) => day.theme) || ['Sightseeing', 'Local Food', 'Adventure'];
      
      const data = await generateTripVideo({
        destination: activeTrip.destination,
        vibe: activeTrip.vibe || 'Cinematic',
        highlights,
        format: videoFormat,
        language: currentLang
      });
      setResult(data);
      toast({ title: "Odyssey Synthesized!", description: "Your trip teaser is ready for social sharing." });
    } catch (err) {
      console.error(err);
      toast({ 
        variant: 'destructive', 
        title: "Synthesis Error", 
        description: "The film studio is currently busy. Please try again in a few minutes." 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Cinema Logic Node</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Trip Odyssey
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Synthesize 8-second cinematic film teasers of your journey highlights.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-headline font-black uppercase tracking-tighter italic">Studio Settings</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Configure video orientation and target.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {isTripsLoading ? (
                <Skeleton className="h-20 w-full rounded-2xl" />
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Odyssey</p>
                  {trips?.map(trip => (
                    <button
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                        (selectedTripId === trip.id || (!selectedTripId && trip === (trips && trips[0])))
                          ? "bg-primary/5 border-primary ring-1 ring-primary"
                          : "bg-white border-slate-100 hover:border-primary/30"
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 truncate">{trip.name}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> {trip.destination}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aspect Ratio</p>
                <RadioGroup value={videoFormat} onValueChange={(v: any) => setVideoFormat(v)} className="grid grid-cols-2 gap-4">
                  <Label htmlFor="horizontal" className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                    videoFormat === 'horizontal' ? "border-primary bg-primary/5" : "border-slate-100 hover:bg-slate-50"
                  )}>
                    <RadioGroupItem value="horizontal" id="horizontal" className="sr-only" />
                    <Monitor className={cn("h-6 w-6", videoFormat === 'horizontal' ? "text-primary" : "text-slate-300")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">16:9 Cinema</span>
                  </Label>
                  <Label htmlFor="vertical" className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                    videoFormat === 'vertical' ? "border-primary bg-primary/5" : "border-slate-100 hover:bg-slate-50"
                  )}>
                    <RadioGroupItem value="vertical" id="vertical" className="sr-only" />
                    <Smartphone className={cn("h-6 w-6", videoFormat === 'vertical' ? "text-primary" : "text-slate-300")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">9:16 Social</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer" onClick={() => setIsTurbo(!isTurbo)}>
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all", isTurbo ? "bg-primary text-white" : "bg-white text-primary shadow-sm")}>
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-none">Turbo Boost</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Skip Synthesis Queue</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-primary">$2.00</span>
                  <Checkbox checked={isTurbo} onCheckedChange={(v) => setIsTurbo(!!v)} className="rounded-lg h-5 w-5 border-slate-300" />
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all" 
                disabled={isGenerating || !activeTrip}
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <><Sparkles className="mr-2 h-6 w-6" /> Synthesize Film</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className={cn(
            "border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white overflow-hidden relative flex items-center justify-center transition-all duration-700",
            videoFormat === 'vertical' ? "max-w-[400px] mx-auto aspect-[9/16]" : "w-full aspect-video"
          )}>
            {isGenerating ? (
              <div className="text-center p-12 space-y-8 animate-in fade-in duration-1000">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                  <Loader2 className="w-full h-full animate-spin text-primary opacity-20" strokeWidth={1} />
                  <Clapperboard className="absolute inset-0 m-auto h-12 w-12 text-primary animate-bounce" />
                </div>
                <div className="space-y-2 px-8">
                  <h3 className="text-3xl font-black font-headline tracking-tighter uppercase italic">Directing Frame...</h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">{isTurbo ? "Priority access granted. Turbo synthesis in progress." : "Standard queue active. Mixing destination DNA..."}</p>
                </div>
              </div>
            ) : result ? (
              <div className="w-full h-full relative group">
                <video 
                  src={result.videoDataUri} 
                  autoPlay 
                  loop 
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row justify-between items-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="space-y-1">
                    <Badge className="bg-accent text-slate-900 font-black uppercase tracking-widest text-[9px]">{videoFormat === 'vertical' ? 'Veo 2 Social' : 'Veo 3 Cinema'}</Badge>
                    <p className="text-[10px] font-medium text-white/60 max-w-md italic line-clamp-2">"{result.prompt}"</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all" onClick={() => {
                      const link = document.createElement('a');
                      link.href = result.videoDataUri;
                      link.download = `odyssey-${Date.now()}.mp4`;
                      link.click();
                    }}><Download className="h-4 w-4" /></Button>
                    <Button className="rounded-full bg-primary text-white shadow-xl px-6 font-bold active:scale-95 transition-all"><Share2 className="mr-2 h-4 w-4" /> Post</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-20 opacity-20 grayscale flex flex-col items-center gap-6">
                <div className="h-32 w-32 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center">
                  <Play className="h-16 w-16 fill-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-black font-headline uppercase tracking-tighter italic">Cinema Radar Idle</p>
                  <p className="font-bold text-center text-sm">Select an active journey to synthesize high-fidelity cinematic assets.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
    

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Sparkles, 
  Loader2, 
  Play, 
  Pause, 
  Radio, 
  Zap, 
  ShieldCheck,
  Disc,
  TrendingUp,
  Share2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { generateTripSoundtrack, type SoundtrackOutput } from '@/ai/flows/generate-trip-soundtrack-flow';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SoundtrackPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [hasMounted, setHasMounted] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [soundtrack, setSoundtrack] = useState<SoundtrackOutput | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

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
  const { data: trips } = useCollection(tripsQuery);
  const activeTrip = trips?.[0];

  const handleSynthesize = async () => {
    if (!activeTrip) return;
    setIsSynthesizing(true);
    try {
      const data = await generateTripSoundtrack({
        destination: activeTrip.destination,
        vibe: activeTrip.vibe || 'Discovery',
        language: currentLang,
      });
      setSoundtrack(data);
      toast({ title: "Auditory DNA Synced", description: "Bespoke trip soundtrack initialized." });
    } catch (err) {
      toast({ variant: 'destructive', title: "Synthesis Offline" });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Aura Auditory Hub</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Aura Beats
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Synthesize a unique trip soundtrack based on your destination's local underground nodes and your journey vibe.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-2 uppercase tracking-tighter italic">
                <Music className="h-5 w-5 text-primary" /> Active Odyssey
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {activeTrip ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Destination</p>
                    <p className="text-xl font-black text-slate-900">{activeTrip.destination}</p>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase text-[8px]">{activeTrip.vibe || 'Cinematic'}</Badge>
                  </div>
                  <Button 
                    onClick={handleSynthesize} 
                    disabled={isSynthesizing}
                    className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                  >
                    {isSynthesizing ? <Loader2 className="animate-spin mr-2" /> : <><Radio className="mr-2 h-6 w-6" /> Synthesize Beats</>}
                  </Button>
                </div>
              ) : (
                <div className="py-10 text-center opacity-30 grayscale flex flex-col items-center gap-4">
                  <Zap className="h-10 w-10 text-slate-400" />
                  <p className="text-xs font-black uppercase tracking-widest">No Active Journey Node</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {isSynthesizing ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-8 opacity-50">
              <div className="relative w-32 h-32">
                <Loader2 className="w-full h-full animate-spin text-primary" />
                <Disc className="absolute inset-0 m-auto h-12 w-12 text-primary animate-spin-slow" />
              </div>
              <h3 className="text-3xl font-black font-headline uppercase tracking-tighter italic">Sampling Culture Nodes...</h3>
            </div>
          ) : soundtrack ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className="bg-primary p-10 text-white relative">
                  <div className="absolute top-0 right-0 p-10 opacity-10"><Music className="h-40 w-40" /></div>
                  <div className="relative z-10 space-y-4">
                    <Badge className="bg-white/20 text-white border-none font-bold uppercase mb-4 px-3">Soundtrack Resolved</Badge>
                    <h2 className="text-5xl font-black font-headline leading-tight italic uppercase">{soundtrack.playlistTitle}</h2>
                    <p className="text-primary-foreground/80 font-medium text-lg italic leading-relaxed">"{soundtrack.overallAura}"</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {soundtrack.tracks.map((track, i) => (
                      <div key={i} className="p-8 flex items-center gap-8 hover:bg-slate-50/50 transition-all group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "h-14 w-14 rounded-2xl flex-shrink-0 shadow-inner",
                            playingId === track.title ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white"
                          )}
                          onClick={() => togglePlay(track.title)}
                        >
                          {playingId === track.title ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <p className="text-xl font-black text-slate-900 truncate uppercase italic tracking-tighter">{track.title}</p>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{track.artist} • {track.genre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-32 opacity-20 grayscale gap-8">
              <Disc className="h-40 w-40 text-primary relative mx-auto" />
              <div className="space-y-2">
                <h2 className="text-3xl font-black font-headline uppercase tracking-tighter italic">Auditory Radar Idle</h2>
                <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Initialize a synthesis scan to view your high-fidelity trip soundtrack node.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Music, Utensils, Zap, MapPin, Loader2, Sparkles, Quote, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { getCulturalPulse, type CulturalPulseOutput } from '@/ai/flows/get-cultural-pulse-flow';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function CulturalPulsePage() {
  const { t, language } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);
  const [city, setCity] = useState('New York');
  const [isLoading, setIsLoading] = useState(false);
  const [pulse, setPulse] = useState<CulturalPulseOutput | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setIsLoading(true);
    setPulse(null);
    try {
      const data = await getCulturalPulse({ city, language: currentLang });
      setPulse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-5xl uppercase italic text-slate-900 leading-none">
          <Radio className="text-primary h-10 w-10 inline-block mr-3 animate-pulse" />
          Cultural Pulse
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-medium">
          Real-time vibe and auditory DNA synthesized for your current destination.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder="Enter Target City..." 
              className="h-14 rounded-2xl pl-10 border-none shadow-xl bg-white font-bold"
            />
          </div>
          <Button type="submit" className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Capture Pulse"}
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <Skeleton className="md:col-span-12 h-48 rounded-[2.5rem]" />
          <Skeleton className="md:col-span-7 h-80 rounded-[2.5rem]" />
          <Skeleton className="md:col-span-5 h-80 rounded-[2.5rem]" />
        </div>
      ) : pulse ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Atmosphere */}
          <Card className="md:col-span-12 border-none shadow-2xl bg-slate-900 text-white overflow-hidden rounded-[3rem]">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap className="h-48 w-48 text-primary" />
            </div>
            <CardHeader className="p-10">
              <Badge className="w-fit mb-4 bg-primary text-white border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Current Atmosphere Synthesis</Badge>
              <CardTitle className="text-4xl md:text-5xl font-headline font-black leading-[1.1] italic uppercase">{pulse.currentVibe}</CardTitle>
            </CardHeader>
          </Card>

          {/* Music Section */}
          <Card className="md:col-span-7 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center gap-6 bg-purple-50/50 p-8 border-b border-purple-100/50">
              <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                <Music className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic">Auditory DNA</CardTitle>
                <CardDescription className="font-bold text-purple-400 uppercase text-[10px] tracking-widest">Trending Indie Nodes</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="p-6 rounded-[2rem] bg-purple-50 border border-purple-100">
                <p className="font-black text-purple-900 text-xl italic uppercase tracking-tighter">{pulse.localSounds.genre}</p>
                <p className="text-sm text-purple-700/80 font-medium mt-2 leading-relaxed">"{pulse.localSounds.description}"</p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Essential Local Artists</p>
                <div className="flex flex-wrap gap-3">
                  {pulse.localSounds.suggestedArtists.map((artist, i) => (
                    <Badge key={i} variant="outline" className="px-5 py-2.5 border-purple-200 text-purple-700 bg-white hover:bg-purple-50 transition-all cursor-pointer font-black rounded-xl shadow-sm uppercase text-[9px] tracking-widest">
                      {artist}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treat Section */}
          <Card className="md:col-span-5 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center gap-6 bg-orange-50/50 p-8 border-b border-orange-100/50">
              <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                <Utensils className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic">Seasonal Treat</CardTitle>
                <CardDescription className="font-bold text-orange-400 uppercase text-[10px] tracking-widest">Culinary Micro-Moment</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="text-center p-8 bg-orange-50/30 rounded-[2.5rem] border-2 border-dashed border-orange-100 group hover:bg-orange-50 transition-all cursor-pointer">
                <h3 className="text-4xl font-black text-orange-900 mb-4 font-headline leading-tight italic uppercase tracking-tighter group-hover:scale-105 transition-transform">{pulse.seasonalTreat.name}</h3>
                <p className="text-sm text-orange-700/80 font-medium leading-relaxed italic">"{pulse.seasonalTreat.description}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Local Wisdom */}
          <Card className="md:col-span-12 bg-primary/5 border-none rounded-[3rem] p-12 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/wisdom/800/400')] opacity-[0.03] grayscale contrast-125" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="h-24 w-24 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                <Quote className="h-12 w-12 opacity-40 fill-primary" />
              </div>
              <div className="space-y-4">
                <Badge className="bg-primary text-white border-none font-black uppercase tracking-[0.4em] text-[8px] px-3">Ancient Local Wisdom</Badge>
                <p className="text-3xl md:text-5xl font-black text-slate-900 italic font-headline leading-[1.1] tracking-tighter uppercase">"{pulse.localWisdom}"</p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-32 opacity-20 grayscale flex flex-col items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
            <Globe className="h-48 w-48 text-primary relative animate-spin-slow" />
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-black font-headline uppercase tracking-tighter italic">Grid Silent</p>
            <p className="text-sm font-black uppercase tracking-[0.3em] max-w-xs mx-auto">Initialize city node to capture real-time cultural telemetry.</p>
          </div>
        </div>
      )}
    </div>
  );
}

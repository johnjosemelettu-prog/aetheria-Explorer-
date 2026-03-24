
'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Music, Utensils, Zap, MapPin, Loader2, Sparkles, ArrowRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { getCulturalPulse, type CulturalPulseOutput } from '@/ai/flows/get-cultural-pulse-flow';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Radio className="text-primary h-10 w-10 animate-pulse" />
          {t('culturalPulse.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('culturalPulse.subtitle')}
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder={t('culturalPulse.inputPlaceholder')} 
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Button type="submit" className="h-12 px-8 rounded-xl font-bold" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : t('culturalPulse.button')}
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : pulse ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Atmosphere */}
          <Card className="md:col-span-12 border-none shadow-2xl bg-slate-900 text-white overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="h-32 w-32" />
            </div>
            <CardHeader className="p-8">
              <Badge className="w-fit mb-4 bg-primary text-white border-none font-bold uppercase tracking-tighter py-1 px-3">Current Atmosphere</Badge>
              <CardTitle className="text-4xl font-headline font-black leading-tight">{pulse.currentVibe}</CardTitle>
            </CardHeader>
          </Card>

          {/* Music Section */}
          <Card className="md:col-span-7 border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-purple-50/50 p-6">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Music className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black font-headline">Local Sounds</CardTitle>
                <CardDescription className="font-bold text-purple-400">The genre of the week</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100">
                <p className="font-black text-purple-900 text-lg">{pulse.localSounds.genre}</p>
                <p className="text-sm text-purple-700/80 font-medium mt-1 leading-relaxed">{pulse.localSounds.description}</p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Essential Artists</p>
                <div className="flex flex-wrap gap-2">
                  {pulse.localSounds.suggestedArtists.map((artist, i) => (
                    <Badge key={i} variant="outline" className="px-4 py-2 border-purple-200 text-purple-700 bg-white hover:bg-purple-50 transition-colors cursor-pointer font-bold rounded-xl shadow-sm">
                      {artist}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treat Section */}
          <Card className="md:col-span-5 border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-orange-50/50 p-6">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Utensils className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black font-headline">Seasonal Treat</CardTitle>
                <CardDescription className="font-bold text-orange-400">Must-try right now</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center p-8 bg-orange-50/30 rounded-[2rem] border-2 border-dashed border-orange-100">
                <h3 className="text-3xl font-black text-orange-900 mb-3 font-headline leading-none">{pulse.seasonalTreat.name}</h3>
                <p className="text-sm text-orange-700/80 font-medium leading-relaxed">{pulse.seasonalTreat.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Local Wisdom */}
          <Card className="md:col-span-12 bg-primary/5 border-none rounded-[2.5rem] p-10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/wisdom/800/400')] opacity-[0.03] grayscale" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Quote className="h-10 w-10 opacity-40" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-3">Ancient Local Wisdom</h4>
                <p className="text-2xl md:text-3xl font-black text-slate-800 italic font-headline leading-snug">"{pulse.localWisdom}"</p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-20 opacity-20 grayscale">
          <Sparkles className="mx-auto h-24 w-24 mb-4" />
          <p className="text-3xl font-black font-headline tracking-tighter">Capture the Rhythm of a City</p>
        </div>
      )}
    </div>
  );
}

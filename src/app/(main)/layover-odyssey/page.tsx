
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  MapPin, 
  Sparkles, 
  Loader2, 
  Plane, 
  ArrowRight,
  ShieldCheck,
  Compass,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { generateLayoverItinerary, type GenerateLayoverItineraryOutput } from '@/ai/flows/generate-layover-itinerary-flow';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function LayoverOdysseyPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [airport, setAirport] = useState('LHR');
  const [duration, setDuration] = useState([6]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [odyssey, setOdyssey] = useState<GenerateLayoverItineraryOutput | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleGenerate = async () => {
    if (!airport.trim()) return;

    setIsGenerating(true);
    setOdyssey(null);
    try {
      const data = await generateLayoverItinerary({
        airportCode: airport.toUpperCase(),
        durationHours: duration[0],
        timeOfDay: new Date().getHours() < 12 ? 'Morning' : 'Afternoon',
        language: currentLang,
      });
      setOdyssey(data);
      toast({ title: "Odyssey Synthesized!", description: `We've built a ${duration[0]}-hour mission for you.` });
    } catch (err) {
      toast({ variant: 'destructive', title: "Synthesis Failed", description: "The local grid is currently unreachable. Try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">{t('layoverOdyssey.badge')}</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          {t('layoverOdyssey.title')}
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          {t('layoverOdyssey.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="flex items-center gap-2 font-black uppercase tracking-tighter text-lg"><Timer className="h-5 w-5" /> {t('layoverOdyssey.missionParameters')}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <Label className="font-black text-slate-400 uppercase tracking-widest text-[10px]">{t('layoverOdyssey.currentTerminal')}</Label>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input value={airport} onChange={e => setAirport(e.target.value)} maxLength={4} className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-black text-xl" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Label className="font-black text-slate-400 uppercase tracking-widest text-[10px]">{t('layoverOdyssey.layoverDuration')}</Label>
                  <span className="font-black text-primary text-xl font-headline">{duration[0]} Hours</span>
                </div>
                <Slider 
                  value={duration} 
                  onValueChange={setDuration} 
                  min={3} 
                  max={12} 
                  step={1} 
                  className="py-4"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !airport} 
                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <><Sparkles className="mr-2 h-5 w-5" /></>}
                {t('layoverOdyssey.synthesizeOdyssey')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-[2.5rem]" />
              <div className="grid grid-cols-1 gap-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            </div>
          ) : odyssey ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <h2 className="text-4xl font-black font-headline text-slate-900 leading-tight">{odyssey.itineraryTitle}</h2>
              <div className="grid grid-cols-1 gap-4 relative">
                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-100 -z-10" />
                {odyssey.activities.map((step, i) => (
                  <div key={i} className="group relative flex gap-8 p-6 rounded-3xl bg-white shadow-lg border border-transparent hover:border-primary/20 transition-all">
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-900 font-black font-headline text-sm group-hover:bg-primary group-hover:text-white transition-colors shadow-inner flex-shrink-0">
                      {step.time}
                    </div>
                    <div className="space-y-3 py-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xl font-black font-headline text-slate-900 font-headline">{step.activity}</h5>
                        <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none font-bold uppercase text-[9px]">
                          <MapPin className="h-3 w-3 mr-1" /> {step.location}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.transitNote}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center text-center opacity-20 grayscale py-20">
              <Compass className="h-32 w-32 mb-4 mx-auto" />
              <p className="text-3xl font-black font-headline uppercase tracking-tighter">{t('layoverOdyssey.radarSilent')}</p>
              <p className="max-w-xs mx-auto text-sm font-bold mt-2">{t('layoverOdyssey.enterCodeDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

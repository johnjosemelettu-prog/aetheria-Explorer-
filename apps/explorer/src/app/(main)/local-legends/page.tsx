"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Compass, Sparkles, MapPin, Loader2, Play, Pause, RefreshCw, Wand2, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { generateLocalLegend, type GenerateLocalLegendOutput } from '@/ai/flows/generate-local-legend-flow';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function LocalLegendsPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [legend, setLegend] = useState<GenerateLocalLegendOutput | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: "GPS Required", description: "This feature requires your location to find local legends." });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        toast({ variant: 'destructive', title: "Location Error", description: "Could not detect your GPS coordinates." });
      }
    );
  }, [toast]);

  const handleGenerate = async () => {
    if (!location) return;

    setIsGenerating(true);
    setLegend(null);
    try {
      const data = await generateLocalLegend({
        latitude: location.lat,
        longitude: location.lon,
        language: currentLang,
      });
      setLegend(data);
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Storytelling Failed", description: "The spirits of the land are quiet today. Try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <BookOpen className="text-primary h-10 w-10 animate-bounce" />
          Local Legends
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-medium">
          Unlock the hidden folklore of your coordinates via GPS-triggered narration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* State 1: Locating / Call to Action */}
        <div className="space-y-8">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Proximity Sensor
              </CardTitle>
              <CardDescription>Scanning neural grid for local lore...</CardDescription>
            </CardHeader>
            <CardContent>
              {isLocating ? (
                <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Detecting GPS aura...
                </div>
              ) : location ? (
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg border font-mono text-xs text-center">
                    Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
                  </div>
                  <Button onClick={handleGenerate} className="w-full h-12" disabled={isGenerating}>
                    {isGenerating ? (
                      <><Loader2 className="mr-2 animate-spin" /> Weaving the Legend...</>
                    ) : (
                      <><Sparkles className="mr-2" /> Summon Local Lore</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-red-50 text-red-900 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-medium">Location access restricted.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {legend && (
            <Card className="animate-in fade-in slide-in-from-left duration-700">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary">{legend.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 pr-4">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap italic">
                    {legend.story}
                  </p>
                </ScrollArea>
              </CardContent>
              <CardFooter className="bg-muted/30 p-6 flex flex-col gap-4">
                {legend.audioDataUri && (
                  <div className="w-full">
                    <audio 
                      ref={audioRef} 
                      src={legend.audioDataUri} 
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    <Button variant="outline" className="w-full" onClick={toggleAudio}>
                      {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      {isPlaying ? "Pause Narration" : "Listen to Story"}
                    </Button>
                  </div>
                )}
                <Button variant="ghost" className="w-full text-xs" onClick={() => setLegend(null)}>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Find another legend
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Output: Visual Legend */}
        <div className="lg:sticky lg:top-24">
          <Card className="overflow-hidden border-4 border-double shadow-2xl bg-zinc-900 aspect-[4/5] relative flex items-center justify-center">
            {isGenerating ? (
              <div className="text-center p-8 text-white space-y-6">
                <div className="relative w-32 h-32 mx-auto">
                  <RefreshCw className="w-full h-full animate-spin text-accent opacity-20" />
                  <Wand2 className="absolute inset-0 m-auto h-12 w-12 text-accent animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="font-headline text-xl text-accent">Mixing Myth & Reality</p>
                  <p className="text-sm opacity-60">Summoning imagery from the depths of local history...</p>
                </div>
              </div>
            ) : legend ? (
              <>
                <Image 
                  src={legend.imageUrl} 
                  alt={legend.title} 
                  fill 
                  className="object-cover opacity-80 animate-in fade-in zoom-in duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 p-8 w-full text-white">
                  <p className="text-xs uppercase tracking-widest text-accent font-bold mb-2">Artistic Visualization</p>
                  <h3 className="font-headline text-3xl mb-2">{legend.title}</h3>
                  <p className="text-xs opacity-70 line-clamp-2 italic">{legend.imagePrompt}</p>
                </div>
              </>
            ) : (
              <div className="text-center p-12 text-zinc-500 space-y-4">
                <Compass className="h-20 w-20 mx-auto opacity-10" />
                <p className="font-headline text-xl">Legends Radar Idle</p>
                <p className="text-sm max-w-xs">Initialize proximity scan to awaken the spirits of your current node.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

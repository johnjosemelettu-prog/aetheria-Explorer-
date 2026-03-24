
'use client';

import React, { useState, useEffect } from 'react';
import { Utensils, RefreshCw, Star, Info, Flame, MapPin, Loader2, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { getStreetFoodRoulette, type StreetFoodRouletteOutput } from '@/ai/flows/street-food-roulette-flow';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StreetFoodRoulettePage() {
  const { t, language } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);
  const [city, setCity] = useState('Bangkok');
  const [isLoading, setIsLoading] = useState(false);
  const [rouletteData, setRouletteData] = useState<StreetFoodRouletteOutput | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setIsLoading(true);
    setRouletteData(null);
    setSelectedIndex(null);
    try {
      const data = await getStreetFoodRoulette({ city, language: currentLang });
      setRouletteData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const spin = () => {
    if (!rouletteData) return;
    setIsSpinning(true);
    setSelectedIndex(null);
    
    let count = 0;
    const interval = setInterval(() => {
      setSelectedIndex(Math.floor(Math.random() * rouletteData.foods.length));
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Utensils className="text-orange-500 h-10 w-10 animate-bounce" />
          Street Food Roulette
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Discover the most authentic local flavors with our high-fidelity daring node.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-16">
        <form onSubmit={handleFetch} className="flex gap-2">
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder="Enter City Node" 
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Button type="submit" className="h-12 px-8 rounded-xl font-bold" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Load Options"}
          </Button>
        </form>
      </div>

      {rouletteData && (
        <div className="space-y-12 animate-in fade-in duration-700">
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={spin} 
              disabled={isSpinning} 
              className="h-20 w-20 rounded-full bg-orange-500 hover:bg-orange-600 shadow-2xl animate-pulse"
            >
              <RefreshCw className={cn("h-10 w-10", isSpinning && "animate-spin")} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {rouletteData.foods.map((food, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all text-center",
                  selectedIndex === i ? "border-orange-500 bg-orange-50 scale-110 shadow-xl" : "border-muted opacity-40"
                )}
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 font-bold">
                  {i + 1}
                </div>
                <p className="text-[10px] font-black uppercase tracking-tighter truncate">{food.name}</p>
              </div>
            ))}
          </div>

          {selectedIndex !== null && !isSpinning && (
            <Card className="border-none shadow-2xl bg-slate-900 text-white overflow-hidden rounded-[2.5rem] animate-in slide-in-from-bottom-8 duration-500">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Flame className="h-32 w-32 text-orange-500" />
              </div>
              <CardHeader className="p-10 pb-4">
                <Badge className="w-fit mb-4 bg-orange-500 text-white border-none font-bold uppercase tracking-widest px-3">Selected Dish</Badge>
                <CardTitle className="text-5xl font-headline font-black leading-tight">{rouletteData.foods[selectedIndex].name}</CardTitle>
                <CardDescription className="text-slate-400 text-lg font-medium">{rouletteData.foods[selectedIndex].description}</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <h4 className="text-orange-400 font-black flex items-center gap-2 mb-2">
                      <Trophy className="h-5 w-5" /> THE DARE
                    </h4>
                    <p className="text-xl font-bold italic leading-snug">"{rouletteData.foods[selectedIndex].theDare}"</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <h4 className="text-primary font-black flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5" /> PRO TIP
                    </h4>
                    <p className="text-slate-300 font-medium leading-relaxed">{rouletteData.foods[selectedIndex].proTip}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-10 pt-0">
                <Button className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-black text-xl">
                  I ACCEPT THE DARE
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground animate-pulse">Scouting local nodes...</p>
        </div>
      )}
    </div>
  );
}

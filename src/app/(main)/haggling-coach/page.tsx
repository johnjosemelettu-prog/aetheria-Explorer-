'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Banknote, MapPin, Loader2, Sparkles, AlertCircle, Quote, Languages, Handshake, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { getHagglingStrategy, type HagglingCoachOutput } from '@/ai/flows/haggling-coach-flow';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function HagglingCoachPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [item, setItem] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [location, setLocation] = useState('Marrakech, Morocco');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HagglingCoachOutput | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !initialPrice || !location) return;

    setIsGenerating(true);
    setResult(null);
    try {
      const data = await getHagglingStrategy({
        item,
        initialPrice: parseFloat(initialPrice),
        currency,
        location,
        language: currentLang,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Strategy Failed", description: "The market is too crowded for the AI to focus. Try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Handshake className="text-primary h-10 w-10" />
          AI Haggling Coach
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Master the art of the deal. Get personalized negotiation strategies for local markets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <Card className="border-2 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl">Market Intel</CardTitle>
              <CardDescription className="text-slate-400">Tell us what you're buying and where.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">What are you buying?</Label>
                  <div className="relative">
                    <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Leather Bag, Silk Scarf" className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Quoted Price</Label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type="number" value={initialPrice} onChange={(e) => setInitialPrice(e.target.value)} placeholder="0.00" className="pl-10 h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Currency</Label>
                    <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Market Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Grand Bazaar, Istanbul" className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Generate Strategy
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-4 opacity-50">
              <div className="relative h-24 w-24">
                <Loader2 className="h-full w-full animate-spin text-primary" />
                <Handshake className="absolute inset-0 m-auto h-8 w-8 text-primary" />
              </div>
              <p className="font-headline text-xl animate-pulse">Consulting market experts...</p>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-emerald-50 border-emerald-100 rounded-3xl p-6 flex flex-col items-center text-center">
                  <Badge className="bg-emerald-500 text-white border-none font-bold uppercase mb-2">Target Price</Badge>
                  <p className="text-5xl font-black font-headline text-emerald-900">{result.targetPrice} <span className="text-xl opacity-40">{currency}</span></p>
                  <p className="text-xs text-emerald-700 font-bold mt-2">Recommended Deal</p>
                </Card>
                <Card className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col items-center text-center">
                  <Badge className="bg-red-500 text-white border-none font-bold uppercase mb-2">Walk Away</Badge>
                  <p className="text-5xl font-black font-headline text-white">{result.walkAwayPrice} <span className="text-xl opacity-40">{currency}</span></p>
                  <p className="text-xs text-slate-400 font-bold mt-2">Maximum Limit</p>
                </Card>
              </div>

              <Card className="border-none shadow-xl rounded-[2rem]">
                <CardHeader className="p-8 pb-0">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingDown className="h-6 w-6" />
                    <CardTitle className="font-headline font-black uppercase tracking-tighter">The Strategy: {result.strategy}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {result.tactics.map((tactic, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">{i + 1}</div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{tactic}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-[2rem] border-none shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Languages className="h-4 w-4 text-primary" /> Speak the Deal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.localPhrases.map((p, i) => (
                      <div key={i} className="space-y-1 group">
                        <p className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{p.phrase}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.pronunciation}</p>
                        <p className="text-xs text-slate-500 italic">"{p.meaning}"</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-lg bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Cultural Protocol
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-amber-900 leading-relaxed">{result.culturalNote}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-20 grayscale py-20">
              <TrendingDown className="h-32 w-32 mb-4" />
              <p className="text-3xl font-black font-headline uppercase tracking-tighter">Your Tactical Guide</p>
              <p className="max-w-xs text-sm font-bold mt-2">Enter the details on the left to synthesize a winning negotiation strategy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Handshake, Banknote, ShoppingBag, Sparkles, Loader2, TrendingDown, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHagglingStrategy, type HagglingCoachOutput } from '@/ai/flows/haggling-coach-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function HagglingCoachView({ city, language }: { city: string, language: string }) {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState<HagglingCoachOutput | null>(null);

  const fetchStrategy = async () => {
    if (!item || !price) return;
    setIsLoading(true);
    try {
      const data = await getHagglingStrategy({ item, initialPrice: parseFloat(price), currency: 'USD', location: city, language });
      setStrategy(data);
    } finally { setIsLoading(false); }
  }

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-8">
          <CardTitle className="flex items-center gap-2 font-black uppercase tracking-tighter text-lg"><Handshake className="h-5 w-5 text-primary" /> Market Parameters</CardTitle>
          <CardDescription className="text-slate-400 font-medium">Specify item and quoted asset node value.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <Label className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Target Asset</Label>
            <div className="relative">
              <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input value={item} onChange={e => setItem(e.target.value)} placeholder="e.g. Silk Scarf" className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Quoted Node Value</Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold" />
            </div>
          </div>
          <Button onClick={fetchStrategy} disabled={isLoading || !item || !price} className="md:col-span-2 h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 active:scale-95 transition-all">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Sparkles className="mr-2 h-5 w-5" /> Synthesize Protocol</>}
          </Button>
        </CardContent>
      </Card>

      {strategy && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-slate-950 text-white rounded-[2.5rem] p-10 border-none shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Zap className="h-40 w-40 text-primary" /></div>
              <Badge className="bg-emerald-500 text-white border-none font-bold uppercase tracking-widest px-3 mb-6 relative z-10">Target Price</Badge>
              <p className="text-7xl font-black font-headline text-emerald-400 leading-none relative z-10">${strategy.targetPrice}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-6 relative z-10">DO NOT EXCEED: ${strategy.walkAwayPrice}</p>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-lg bg-white p-8">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> High-Fidelity Phrases
              </CardTitle>
              <div className="space-y-4">
                {strategy.localPhrases.map((p, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">{p.phrase}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">"{p.meaning}"</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><TrendingDown className="h-5 w-5" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Negotiation Logic</p>
                    <h4 className="text-xl font-black font-headline text-slate-900 mt-1 uppercase italic">{strategy.strategy}</h4>
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 gap-4 relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100 -z-10" />
                  {strategy.tactics.map((t, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="h-10 w-10 rounded-full bg-white border-2 border-slate-100 shadow-sm flex flex-shrink-0 items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-white transition-all">
                        {i + 1}
                      </div>
                      <div className="py-2">
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{t}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50 flex items-center gap-4 border-t border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                  "{strategy.culturalNote}"
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

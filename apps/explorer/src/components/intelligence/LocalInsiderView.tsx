'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Loader2, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { chatWithLocalInsider, type LocalInsiderOutput } from '@/ai/flows/local-insider-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';

export default function LocalInsiderView({ city, userProfile, language }: { city: string, userProfile: any, language: string }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ query: string; result: LocalInsiderOutput; persona: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const data = await chatWithLocalInsider({ 
        city, 
        query, 
        persona: 'historian', 
        userInterests: userProfile?.preferredInterests || [], 
        language 
      });
      setHistory(prev => [{ query, result: data, persona: 'historian' }, ...prev]);
      setQuery('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              placeholder={`Ask our local insider about ${city}...`} 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              disabled={isLoading} 
              className="h-14 rounded-2xl bg-slate-50 border-none" 
            />
            <Button type="submit" disabled={isLoading || !query.trim()} className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/20">
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {history.length === 0 && !isLoading && (
            <div className="text-center py-20 opacity-20 flex flex-col items-center">
              <MessageCircle className="h-16 w-16 mb-4" />
              <p className="font-black font-headline text-xl uppercase tracking-tighter italic">Initialize Node</p>
              <p className="text-sm font-medium">Start a conversation with the city soul.</p>
            </div>
          )}
          {history.map((item, i) => (
            <div key={i} className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-end"><div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-tr-none max-w-[80%] font-bold text-sm shadow-lg">{item.query}</div></div>
              <div className="flex justify-start"><div className="bg-white p-6 rounded-2xl rounded-tl-none max-w-[90%] space-y-4 shadow-md border border-slate-100">
                <p className="text-sm leading-relaxed text-slate-600 font-medium">{item.result.response}</p>
                {item.result.recommendations && (
                  <div className="pt-4 border-t border-slate-50 grid grid-cols-1 gap-3">
                    {item.result.recommendations.map((rec, ri) => (
                      <div key={ri} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-1"><span className="font-black text-xs text-slate-900">{rec.name}</span><Badge variant="secondary" className="text-[9px] uppercase font-black">{rec.locationType}</Badge></div>
                        <p className="text-[10px] text-slate-500 font-medium italic">"{rec.reason}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div></div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

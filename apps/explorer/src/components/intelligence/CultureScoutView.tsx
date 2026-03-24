'use client';

import React, { useState } from 'react';
import { Landmark, CheckCircle, XCircle, Loader2, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCultureAdvice, type CultureScoutOutput } from '@/ai/flows/culture-scout-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CultureScoutView({ city, language }: { city: string, language: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<CultureScoutOutput | null>(null);

  const fetchAdvice = async () => {
    setIsLoading(true);
    try { const data = await getCultureAdvice({ city, language }); setAdvice(data); } finally { setIsLoading(false); }
  }

  return (
    <div className="space-y-8">
      {!advice ? (
        <Card className="border-none shadow-xl rounded-[2.5rem] text-center p-12 bg-white flex flex-col items-center gap-6">
          <div className="h-20 w-20 rounded-3xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-inner"><Globe className="h-10 w-10" /></div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic">Ready for Discovery?</CardTitle>
            <CardDescription className="font-medium text-slate-500">Synthesize local social DNA for {city}.</CardDescription>
          </div>
          <Button onClick={fetchAdvice} disabled={isLoading} className="h-14 px-10 rounded-2xl font-black bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-200">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Sparkles className="mr-2 h-5 w-5" /> Analyze Etiquette</>}
          </Button>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-xl bg-teal-600 text-white rounded-[2rem] p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Landmark className="h-32 w-32" /></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-teal-200 mb-4 flex items-center gap-2 relative z-10">
              <Sparkles className="h-4 w-4" /> The {city} Atmosphere
            </h3>
            <p className="text-xl font-bold leading-relaxed relative z-10 italic">"{advice.overview}"</p>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-[2.5rem] border-none shadow-lg bg-emerald-50/50 p-2">
              <CardHeader>
                <CardTitle className="text-emerald-600 flex items-center gap-2 font-black uppercase tracking-tighter text-sm italic">
                  <CheckCircle className="h-4 w-4" /> Protocol: Essential Do's
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {advice.dos.map((item, i) => (
                    <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-500 font-black mt-0.5">&rarr;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-lg bg-red-50/50 p-2">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2 font-black uppercase tracking-tighter text-sm italic">
                  <XCircle className="h-4 w-4" /> Protocol: Essential Dont'ts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {advice.donts.map((item, i) => (
                    <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-2">
                      <span className="text-red-500 font-black mt-0.5">&times;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

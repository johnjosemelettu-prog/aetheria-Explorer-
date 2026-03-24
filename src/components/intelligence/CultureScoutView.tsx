'use client';

import React, { useState } from 'react';
import { Landmark, CheckCircle, XCircle, Loader2, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCultureAdvice, type CultureScoutOutput } from '@/ai/flows/culture-scout-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';

export default function CultureScoutView({ city, language }: { city: string, language: string }) {
  const { t } = useTranslation();
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
          <div className="h-20 w-20 rounded-3xl bg-teal-50 flex items-center justify-center text-teal-600"><Globe className="h-10 w-10" /></div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black font-headline">{t('intelligenceHub.scout.readyTitle')}</CardTitle>
            <CardDescription className="font-medium text-slate-500">{t('intelligenceHub.scout.readyDesc', { city })}</CardDescription>
          </div>
          <Button onClick={fetchAdvice} disabled={isLoading} className="h-14 px-10 rounded-2xl font-black bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-200">
            {isLoading ? <Loader2 className="animate-spin" /> : t('intelligenceHub.scout.btn')}
          </Button>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-xl bg-teal-600 text-white rounded-[2rem] p-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-teal-200 mb-4 flex items-center gap-2"><Landmark className="h-4 w-4" /> The {city} Vibe</h3>
            <p className="text-lg font-bold leading-relaxed">{advice.overview}</p>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-[2rem] border-none shadow-lg bg-green-50/50"><CardHeader><CardTitle className="text-green-600 flex items-center gap-2 font-black uppercase tracking-tighter text-sm"><CheckCircle className="h-4 w-4" /> The Do's</CardTitle></CardHeader><CardContent><ul className="space-y-2">{advice.dos.map((item, i) => <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-2"><span className="text-green-500">•</span>{item}</li>)}</ul></CardContent></Card>
            <Card className="rounded-[2rem] border-none shadow-lg bg-red-50/50"><CardHeader><CardTitle className="text-red-600 flex items-center gap-2 font-black uppercase tracking-tighter text-sm"><XCircle className="h-4 w-4" /> The Dont's</CardTitle></CardHeader><CardContent><ul className="space-y-2">{advice.donts.map((item, i) => <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-2"><span className="text-red-500">•</span>{item}</li>)}</ul></CardContent></Card>
          </div>
        </div>
      )}
    </div>
  );
}
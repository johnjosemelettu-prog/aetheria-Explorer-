'use client';

import React, { useState, useEffect } from 'react';
import { 
  Languages, 
  Mic, 
  Volume2, 
  Sparkles, 
  Loader2, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Play, 
  MessageSquare,
  ShieldAlert,
  Coffee,
  Utensils,
  ShoppingBag,
  Bus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { generateSurvivalKit, type LanguageLabOutput } from '@/ai/flows/language-lab-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function LanguageLabPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [city, setCity] = useState('Kyoto');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [kit, setResult] = useState<LanguageLabOutput | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSynthesize = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!city.trim()) return;

    setIsSynthesizing(true);
    setResult(null);
    try {
      const data = await generateSurvivalKit({
        city,
        targetLanguage: 'Local Language', // AI will detect
        userLanguage: currentLang
      });
      setResult(data);
    } catch (err) {
      toast({ variant: 'destructive', title: "Synthesis Failed", description: "The linguistic grid is offline." });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSpeak = async (text: string, id: string) => {
    setIsSpeaking(id);
    try {
      const audio = await textToSpeech(text);
      const player = new Audio(audio.audioDataUri);
      await player.play();
    } catch (e) {
      toast({ variant: 'destructive', title: "Audio Error", description: "Could not synthesize voice." });
    } finally {
      setIsSpeaking(null);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Emergency': return <ShieldAlert className="h-4 w-4" />;
      case 'Social': return <MessageSquare className="h-4 w-4" />;
      case 'Dining': return <Utensils className="h-4 w-4" />;
      case 'Transit': return <Bus className="h-4 w-4" />;
      case 'Shopping': return <ShoppingBag className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">{t('languageLab.badge')}</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          {t('languageLab.title')}
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          {t('languageLab.subtitle')}
        </p>
      </header>

      <div className="max-w-2xl mx-auto mb-16">
        <form onSubmit={handleSynthesize} className="flex gap-2">
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input 
              value={city} 
              onChange={e => setCity(e.target.value)}
              placeholder={t('languageLab.cityPlaceholder')} 
              className="h-14 rounded-2xl pl-10 border-none shadow-xl bg-white font-bold"
            />
          </div>
          <Button type="submit" className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl" disabled={isSynthesizing}>
            {isSynthesizing ? <Loader2 className="animate-spin" /> : t('languageLab.synthesizeBtn')}
          </Button>
        </form>
      </div>

      {isSynthesizing ? (
        <div className="space-y-8">
          <Skeleton className="h-24 w-full rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>
        </div>
      ) : kit ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-headline text-slate-900 flex items-center gap-3">
              <Languages className="text-primary h-6 w-6" /> {t('languageLab.survivalTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kit.survivalKit.map((item, i) => (
                <Card key={i} className="border-none shadow-lg rounded-3xl overflow-hidden group hover:shadow-xl transition-all">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xl font-black font-headline text-slate-900 truncate">{item.phrase}</p>
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-100 text-slate-400">{item.category}</Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-400 italic">"{item.translation}"</p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">{t('languageLab.pronounce', { pronunciation: item.pronunciation })}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-12 w-12 bg-slate-50 group-hover:bg-primary/10"
                      onClick={() => handleSpeak(item.phrase, `p-${i}`)}
                      disabled={isSpeaking === `p-${i}`}
                    >
                      {isSpeaking === `p-${i}` ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-headline text-slate-900 flex items-center gap-3">
              <Sparkles className="text-accent h-6 w-6" /> {t('languageLab.slangTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kit.localSlang.map((slang, i) => (
                <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare className="h-20 w-20" /></div>
                  <Badge className="bg-primary text-white border-none font-bold uppercase mb-4 px-3">{slang.vibe}</Badge>
                  <h3 className="text-3xl font-black font-headline mb-2">{slang.word}</h3>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed italic">"{slang.meaning}"</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-6 p-0 h-auto text-primary font-black flex items-center gap-2 hover:bg-transparent"
                    onClick={() => handleSpeak(slang.word, `s-${i}`)}
                  >
                    {t('languageLab.listenBtn')} <Play className="h-3 w-3 fill-current" />
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="h-full flex flex-col justify-center text-center opacity-20 grayscale py-20">
          <Languages className="h-32 w-32 mb-4 mx-auto" />
          <p className="text-3xl font-black font-headline uppercase tracking-tighter">{t('languageLab.pendingTitle')}</p>
          <p className="max-w-xs mx-auto text-sm font-bold mt-2">{t('languageLab.pendingDesc')}</p>
        </div>
      )}
    </div>
  );
}

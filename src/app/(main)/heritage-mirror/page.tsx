
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Sparkles, Loader2, MapPin, Download, History, User, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { generateHeritagePortrait, type HeritagePortraitOutput } from '@/ai/flows/generate-heritage-portrait-flow';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function HeritageMirrorPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [location, setLocation] = useState('Kyoto, Japan');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HeritagePortraitOutput | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !location.trim()) return;

    setIsGenerating(true);
    try {
      const data = await generateHeritagePortrait({
        photoDataUri: selectedImage,
        location,
        language: currentLang,
      });
      setResult(data);
      toast({ title: "Portal Opened!", description: "Your heritage portrait is ready." });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Magic Failed", description: "The time-stream is unstable. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <History className="text-primary h-10 w-10" />
          {t('heritageMirror.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('heritageMirror.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <Card className="border-2 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-black font-headline uppercase tracking-tighter italic">{t('heritageMirror.step1Title')}</CardTitle>
              <CardDescription className="text-slate-400 font-medium">{t('heritageMirror.step1Desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold"
                  placeholder={t('heritageMirror.locationPlaceholder')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-black font-headline uppercase tracking-tighter italic">{t('heritageMirror.step2Title')}</CardTitle>
              <CardDescription className="text-slate-400 font-medium">{t('heritageMirror.step2Desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div 
                className={cn(
                  "relative aspect-square max-w-sm mx-auto rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
                  selectedImage ? "border-primary/50 shadow-inner" : "border-slate-200 hover:border-primary/30 bg-slate-50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <>
                    <Image src={selectedImage} alt="Selfie" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                      <RefreshCw className="text-white h-10 w-10" />
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto text-slate-300 group-hover:scale-110 transition-transform">
                      <User className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('heritageMirror.uploadPlaceholder')}</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button 
                onClick={handleGenerate} 
                className="w-full h-16 text-xl font-black font-headline uppercase tracking-tighter italic rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95" 
                disabled={!selectedImage || isGenerating}
              >
                {isGenerating ? <><Loader2 className="mr-2 animate-spin h-6 w-6" /> Casting...</> : <><Sparkles className="mr-2 h-6 w-6" /> {t('heritageMirror.generateBtn')}</>}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24">
          <Card className="overflow-hidden border-4 border-double shadow-2xl bg-zinc-900 aspect-[4/5] relative flex items-center justify-center rounded-[3rem]">
            {isGenerating ? (
              <div className="text-center p-8 text-white space-y-6">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20" />
                  <Sparkles className="h-full w-full text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="font-headline text-3xl font-black text-primary uppercase tracking-tighter italic">Neural Path Active</p>
                  <p className="text-sm opacity-60 font-medium">Summoning imagery from the depths of history...</p>
                </div>
              </div>
            ) : result ? (
              <div className="w-full h-full animate-in fade-in zoom-in duration-1000">
                <div className="relative h-full w-full">
                  <Image src={result.portraitUrl} alt="Heritage Portrait" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-0 p-10 w-full text-left space-y-4">
                    <Badge className="bg-primary text-white border-none font-black uppercase tracking-widest text-[9px] px-3">Synthesis Resolved</Badge>
                    <h3 className="text-white font-headline text-4xl font-black leading-tight italic uppercase tracking-tighter">{location} Ancestry</h3>
                    <p className="text-white/70 text-sm font-medium leading-relaxed italic">"{result.historicalContext}"</p>
                    <div className="flex gap-3 pt-4">
                      <Button className="flex-1 h-12 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100" onClick={() => {
                        const link = document.createElement('a');
                        link.href = result.portraitUrl;
                        link.download = `heritage-${Date.now()}.png`;
                        link.click();
                      }}><Download className="mr-2 h-4 w-4" /> Save Asset</Button>
                      <Button variant="outline" className="h-12 w-12 rounded-xl border-white/20 text-white hover:bg-white/10" onClick={() => setResult(null)}><X className="h-5 w-5" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 text-zinc-500 space-y-6 opacity-30 grayscale">
                <div className="h-32 w-32 mx-auto bg-zinc-800 rounded-[2.5rem] flex items-center justify-center border-4 border-zinc-700 shadow-inner">
                  <History className="h-16 w-16" />
                </div>
                <div className="space-y-2">
                  <p className="font-headline text-3xl font-black uppercase tracking-tighter">{t('heritageMirror.emptyTitle')}</p>
                  <p className="text-sm font-bold max-w-xs mx-auto leading-relaxed">{t('heritageMirror.emptyDesc')}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

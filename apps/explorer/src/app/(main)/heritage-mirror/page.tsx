
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Camera, 
  Sparkles, 
  Loader2, 
  MapPin, 
  Download, 
  History, 
  User, 
  X, 
  RefreshCw,
  Zap,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { generateHeritagePortrait, type HeritagePortraitOutput } from '@/ai/flows/generate-heritage-portrait-flow';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      toast({ title: "Portal Resolved", description: "Your heritage portrait is ready." });
    } catch (err) {
      toast({ variant: 'destructive', title: "Synthesis Error", description: "The time-stream is unstable. Try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Aura Studio node</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Heritage Mirror
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Step into the time-stream. Reimagine yourself in the high-fidelity traditional attire of your destination.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-2 uppercase tracking-tighter italic">
                <History className="h-5 w-5 text-primary" /> Mirror Input
              </CardTitle>
              <CardDescription className="text-slate-400">Specify destination and provide a facial node.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Heritage Context</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold"
                    placeholder="e.g. Rome, Italy"
                  />
                </div>
              </div>

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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Face Node</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full h-16 text-xl font-black font-headline uppercase tracking-tighter italic rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95" 
                disabled={!selectedImage || isGenerating}
              >
                {isGenerating ? <><Loader2 className="mr-2 animate-spin h-6 w-6" /> Casting...</> : <><Sparkles className="mr-2 h-6 w-6" /> Open Mirror</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-[2rem] bg-slate-900 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700"><ShieldCheck className="h-24 w-24 text-primary" /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Identity Integrity</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Mirror synthesis uses ephemeral neural sessions. Your facial DNA is processed and purged within 60 seconds of completion.
            </p>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="overflow-hidden border-none shadow-2xl bg-zinc-900 aspect-[4/5] relative flex flex-col justify-center items-center rounded-[3rem]">
            {isGenerating ? (
              <div className="text-center p-8 text-white space-y-8 animate-in fade-in duration-1000">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20" />
                  <Sparkles className="h-full w-full text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="font-headline text-3xl font-black text-primary uppercase tracking-tighter italic">Mixing History...</p>
                  <p className="text-sm opacity-60 font-medium">Reconstituting traditional textures and attire nodes.</p>
                </div>
              </div>
            ) : result ? (
              <div className="w-full h-full animate-in fade-in zoom-in duration-1000">
                <div className="relative h-full w-full">
                  <Image src={result.portraitUrl} alt="Heritage Portrait" fill className="object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-0 p-10 w-full text-left space-y-6">
                    <div>
                      <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] px-3 mb-4">Synthesis Resolved</Badge>
                      <h3 className="text-white font-headline text-5xl font-black leading-tight italic uppercase tracking-tighter">{location} Heritage</h3>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 italic text-white/80 leading-relaxed font-medium">
                      "{result.historicalContext}"
                    </div>
                    <div className="flex gap-4">
                      <Button className="flex-1 h-14 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100" onClick={() => {
                        const link = document.createElement('a');
                        link.href = result.portraitUrl;
                        link.download = `heritage-${Date.now()}.png`;
                        link.click();
                      }}><Download className="mr-2 h-4 w-4" /> Save Node</Button>
                      <Button variant="outline" className="flex-1 h-14 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold"><Share2 className="mr-2 h-4 w-4" /> Post</Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 text-zinc-500 space-y-8 opacity-30 grayscale">
                <div className="h-32 w-32 mx-auto bg-zinc-800 rounded-[2.5rem] flex items-center justify-center border-4 border-zinc-700 shadow-inner">
                  <History className="h-16 w-16" />
                </div>
                <div className="space-y-2">
                  <p className="font-headline text-4xl font-black uppercase tracking-tighter italic">Mirror Idle</p>
                  <p className="text-sm font-bold max-w-xs mx-auto leading-relaxed">Provide a destination node and face snapshot to enter the time-stream.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

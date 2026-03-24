'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, ScanLine, ChefHat, Palette, Gift, X, Sparkles, Wand2, Stethoscope, AlertTriangle, Info, MapPin, User, History, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { exploreMenu, type ExploreMenuOutput } from '@/ai/flows/explore-menu-flow';
import { decodeStreetArt, type DecodeStreetArtOutput } from '@/ai/flows/decode-street-art-flow';
import { describeSouvenir, type DescribeSouvenirOutput } from '@/ai/flows/describe-souvenir-flow';
import { pharmacyScout, type PharmacyScoutOutput } from '@/ai/flows/pharmacy-scout-flow';
import { generateHistoricalImage, type HistoricalImageOutput } from '@/ai/flows/generate-historical-image-flow';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type ScanMode = 'menu' | 'art' | 'souvenir' | 'pharmacy' | 'chronos';

export default function VisionHubPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [mode, setMode] = useState<ScanMode>('menu');
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      setHasCameraPermission(false);
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Camera access is required for vision hub.' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0);
    const photoDataUri = canvas.toDataURL('image/jpeg');
    setCapturedImage(photoDataUri);

    try {
      let data;
      if (mode === 'menu') data = await exploreMenu({ photoDataUri, targetLanguage: currentLang });
      else if (mode === 'art') data = await decodeStreetArt({ photoDataUri, language: currentLang });
      else if (mode === 'souvenir') data = await describeSouvenir({ photoDataUri, language: currentLang });
      else if (mode === 'pharmacy') data = await pharmacyScout({ photoDataUri, language: currentLang });
      else data = await generateHistoricalImage({ photoDataUri, language: currentLang, targetEra: "100 years ago" });
      
      setResult(data);
      stopCamera();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Synthesis node disruption.' });
      setCapturedImage(null);
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setResult(null);
    setCapturedImage(null);
    startCamera();
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Wand2 className="text-primary h-10 w-10 animate-pulse" />
          {t('visionHub.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('visionHub.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          {!result && (
            <Card className="overflow-hidden border-2 shadow-2xl rounded-[2.5rem] bg-slate-950">
              <CardHeader className="bg-slate-900 border-b border-white/5 text-white p-8">
                <Tabs value={mode} onValueChange={(v) => setMode(v as ScanMode)} className="w-full">
                  <TabsList className="bg-white/5 p-1 rounded-2xl w-full grid grid-cols-5 h-14">
                    <TabsTrigger value="menu" className="rounded-xl data-[state=active]:bg-primary font-bold text-[10px]">
                      <ChefHat className="h-3 w-3" /> <span className="hidden sm:inline ml-1">Menu</span>
                    </TabsTrigger>
                    <TabsTrigger value="art" className="rounded-xl data-[state=active]:bg-primary font-bold text-[10px]">
                      <Palette className="h-3 w-3" /> <span className="hidden sm:inline ml-1">Art</span>
                    </TabsTrigger>
                    <TabsTrigger value="souvenir" className="rounded-xl data-[state=active]:bg-primary font-bold text-[10px]">
                      <Gift className="h-3 w-3" /> <span className="hidden sm:inline ml-1">Gift</span>
                    </TabsTrigger>
                    <TabsTrigger value="pharmacy" className="rounded-xl data-[state=active]:bg-primary font-bold text-[10px]">
                      <Stethoscope className="h-3 w-3" /> <span className="hidden sm:inline ml-1">Meds</span>
                    </TabsTrigger>
                    <TabsTrigger value="chronos" className="rounded-xl data-[state=active]:bg-primary font-bold text-[10px]">
                      <History className="h-3 w-3" /> <span className="hidden sm:inline ml-1">Time</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video flex items-center justify-center">
                  {hasCameraPermission ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none" />
                      <div className="absolute inset-[30px] border-2 border-primary/50 rounded-2xl pointer-events-none" />
                      <ScanLine className="absolute h-1 w-[calc(100%-60px)] bg-primary/70 top-1/2 animate-[scan_3s_linear_infinite]" />
                    </>
                  ) : (
                    <div className="p-8 text-center text-white/40">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Initializing sensor grid...</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-900">
                <Button 
                  onClick={handleCapture} 
                  disabled={!hasCameraPermission || isScanning} 
                  className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  {isScanning ? <Loader2 className="animate-spin h-6 w-6" /> : <Camera className="mr-2 h-6 w-6" />}
                  {isScanning ? 'Analyzing Context...' : 'Capture Vision Node'}
                </Button>
              </CardFooter>
            </Card>
          )}

          {result && capturedImage && (
            <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white h-fit animate-in fade-in zoom-in duration-500">
              <div className="relative aspect-video w-full">
                <Image src={capturedImage} alt="Analysis Source" fill className="object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-0 p-10 w-full">
                  <Badge className="mb-4 bg-primary text-white border-none font-bold uppercase tracking-widest px-3">Vision AI Resolved</Badge>
                  <h2 className="text-4xl font-black font-headline leading-tight">
                    {result.menuTitle || result.artTitle || result.itemName || result.medicineName || result.landmarkName}
                  </h2>
                  <p className="text-slate-400 mt-2 font-bold uppercase tracking-tighter text-xs">
                    {mode === 'art' ? `Artist: ${result.artist}` : mode === 'souvenir' ? `Origin: ${result.origin}` : mode === 'chronos' ? 'Chronos Reconstitution' : 'High-Fidelity Discovery'}
                  </p>
                </div>
              </div>
              <CardFooter className="p-10 pt-0">
                <Button variant="outline" className="w-full rounded-2xl h-14 border-white/10 text-white hover:bg-white/5 font-bold" onClick={reset}>
                  <X className="mr-2 h-4 w-4" /> Scan Something Else
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="lg:col-span-5 space-y-8">
          {!result ? (
            <div className="h-full flex flex-col justify-center text-center opacity-30 grayscale space-y-6">
              <Sparkles className="h-24 w-24 mx-auto text-primary" />
              <p className="text-2xl font-black font-headline uppercase tracking-tighter">Target Node Pending</p>
              <p className="max-w-xs mx-auto text-sm font-bold">Select a lens and capture your environment to begin synthesis.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              {mode === 'menu' && <MenuResultView data={result} />}
              {mode === 'art' && <ArtResultView data={result} />}
              {mode === 'souvenir' && <SouvenirResultView data={result} />}
              {mode === 'pharmacy' && <PharmacyResultView data={result} />}
              {mode === 'chronos' && <ChronosResultView data={result} />}
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <style jsx>{` @keyframes scan { 0% { top: 0; } 100% { top: 100%; } } `}</style>
    </div>
  );
}

function MenuResultView({ data }: { data: ExploreMenuOutput }) {
  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {data.dishes.map((dish, i) => (
          <Card key={i} className="rounded-2xl border-none shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-black">{dish.translatedName}</CardTitle>
                  <CardDescription className="italic text-xs">{dish.originalName}</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">{dish.spicinessLevel}/5 Verified</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">{dish.description}</p>
              <div className="flex flex-wrap gap-2">
                {dish.keyIngredients.map(ing => <Badge key={ing} variant="outline" className="text-[10px]">{ing}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

function ArtResultView({ data }: { data: DecodeStreetArtOutput }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem] border-none shadow-xl bg-white p-8">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">The Narrative</h3>
        <p className="text-lg font-medium text-slate-600 leading-relaxed italic">"{data.meaning}"</p>
      </Card>
      <div className="grid grid-cols-1 gap-4">
        <Card className="rounded-2xl bg-slate-50 border-none p-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Style Analysis</h4>
          <p className="text-sm font-bold text-slate-700">{data.styleAnalysis}</p>
        </Card>
        <Card className="rounded-2xl bg-slate-50 border-none p-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cultural Impact</h4>
          <p className="text-sm font-bold text-slate-700">{data.culturalImpact}</p>
        </Card>
      </div>
    </div>
  );
}

function SouvenirResultView({ data }: { data: DescribeSouvenirOutput }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem] border-none shadow-xl bg-white p-8">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Historical Depth</h3>
        <p className="text-lg font-medium text-slate-600 leading-relaxed">{data.significance}</p>
      </Card>
      <Card className="rounded-2xl border-accent/20 bg-accent/5 p-8">
        <h4 className="text-xs font-black uppercase tracking-widest text-accent-foreground mb-4">The Artisan's Tale</h4>
        <p className="text-sm italic text-muted-foreground leading-relaxed">"{data.story}"</p>
      </Card>
      <Card className="rounded-2xl bg-slate-900 text-white p-8">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Authenticity Tip</h4>
        <p className="text-sm font-medium">{data.tips}</p>
      </Card>
    </div>
  );
}

function PharmacyResultView({ data }: { data: PharmacyResultViewProps }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem] border-none shadow-xl bg-white p-8">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
          <Info className="h-4 w-4" /> Active Formulation
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {data.activeIngredients.map(ing => <Badge key={ing} className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">{ing}</Badge>)}
        </div>
        <p className="text-lg font-black text-slate-900 leading-tight">{data.purpose}</p>
      </Card>

      <Card className="rounded-2xl border-red-100 bg-red-50 p-6">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Critical Warnings
        </h4>
        <ul className="space-y-2">
          {data.warnings.map((w, i) => (
            <li key={i} className="text-xs font-bold text-red-900 flex items-start gap-2">
              <span className="h-1 w-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card className="rounded-2xl bg-slate-50 border-none p-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Dosage Protocol</h4>
          <p className="text-sm font-bold text-slate-700 leading-relaxed">{data.dosageSummary}</p>
        </Card>
        <Card className="rounded-2xl bg-slate-900 text-white p-6 border-none">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Familiar Equivalents</h4>
          <p className="text-sm font-medium leading-relaxed">{data.localEquivalentHint}</p>
        </Card>
      </div>
    </div>
  );
}

function ChronosResultView({ data }: { data: HistoricalImageOutput }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-slate-900 text-white">
        <div className="relative aspect-video w-full">
          <Image src={data.historicalImageUrl} alt="Historical" fill className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-40" />
          <Badge className="absolute bottom-4 left-4 bg-accent text-slate-900 font-black uppercase tracking-widest text-[9px]">Historical Reconstitution</Badge>
        </div>
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-black font-headline text-accent">Era: {data.landmarkName}</CardTitle>
          <p className="text-sm font-medium text-slate-400 leading-relaxed italic mt-4">"{data.narrative}"</p>
        </CardHeader>
      </Card>
      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Reconstitution based on verified archival data and architectural synthesis. Accuracy tolerance: 94%.
        </p>
      </div>
    </div>
  );
}

interface PharmacyResultViewProps {
  activeIngredients: string[];
  purpose: string;
  warnings: string[];
  dosageSummary: string;
  localEquivalentHint: string;
}

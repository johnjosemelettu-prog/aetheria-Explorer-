'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, ScanLine, Gift, Info, History, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { describeSouvenir, type DescribeSouvenirOutput } from '@/ai/flows/describe-souvenir-flow';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SouvenirStorytellerPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DescribeSouvenirOutput | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: 'Camera access is needed to scan items.',
      });
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const photoDataUri = canvas.toDataURL('image/jpeg');

    try {
      const data = await describeSouvenir({
        photoDataUri,
        language: currentLang,
      });
      setResult(data);
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not identify this item. Please try a different angle.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Gift className="text-primary h-10 w-10" />
          {t('souvenirStoryteller.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('souvenirStoryteller.subtitle')}
        </p>
      </div>

      {!result ? (
        <Card className="max-w-2xl mx-auto overflow-hidden border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              {t('souvenirStoryteller.cardTitle')}
            </CardTitle>
            <CardDescription>
              {t('souvenirStoryteller.cardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {hasCameraPermission === null ? (
                <div className="text-center space-y-4">
                  <Gift className="h-16 w-16 text-white/20 mx-auto" />
                  <Button onClick={startCamera}>{t('souvenirStoryteller.startCameraButton')}</Button>
                </div>
              ) : hasCameraPermission ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none m-8 rounded-lg" />
                  <ScanLine className="absolute h-1 w-full bg-primary/70 top-0 animate-[scan_4s_linear_infinite]" />
                </>
              ) : (
                <p className="text-white">Camera access denied.</p>
              )}
            </div>
            <div className="p-6">
              <Button 
                onClick={handleCapture} 
                disabled={!hasCameraPermission || isScanning} 
                className="w-full h-12 text-lg font-bold"
              >
                {isScanning ? <Loader2 className="mr-2 animate-spin" /> : <Camera className="mr-2" />}
                {isScanning ? t('souvenirStoryteller.analyzing') : t('souvenirStoryteller.scanButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-500">
          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-headline">{result.itemName}</CardTitle>
                    <CardDescription className="text-primary-foreground/80 flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-white/20 text-white border-none">{result.origin}</Badge>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setResult(null); startCamera(); }}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold flex items-center gap-2">
                    <Info className="h-4 w-4" /> Cultural Significance
                  </h4>
                  <p className="text-sm leading-relaxed opacity-90">{result.significance}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-accent-foreground">
                  <History className="h-5 w-5" />
                  The Artisan's Story
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic leading-relaxed text-muted-foreground">"{result.story}"</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authenticity & Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.tips}</p>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button className="w-full" onClick={() => { setResult(null); startCamera(); }}>
                  Scan Another Souvenir
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
      `}</style>
    </div>
  );
}

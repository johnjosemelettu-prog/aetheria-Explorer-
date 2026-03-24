'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, ScanLine, Palette, Info, History, Sparkles, X, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { decodeStreetArt, type DecodeStreetArtOutput } from '@/ai/flows/decode-street-art-flow';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function StreetArtDecoderPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DecodeStreetArtOutput | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
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
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: 'Camera access is needed to read street art.',
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
    setCapturedImage(photoDataUri);

    try {
      const data = await decodeStreetArt({
        photoDataUri,
        language: currentLang,
      });
      setResult(data);
      // Stop camera
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Decoding Failed',
        description: 'The mural is too complex or lighting is poor. Try again.',
      });
      setCapturedImage(null);
    } finally {
      setIsScanning(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Palette className="text-primary h-10 w-10 animate-pulse" />
          Street Art Decoder
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Turn city walls into a narrated history. Snapshot murals to unlock their secrets.
        </p>
      </div>

      {!result && !capturedImage ? (
        <Card className="max-w-2xl mx-auto overflow-hidden border-2 shadow-2xl rounded-[2rem]">
          <CardHeader className="text-center">
            <CardTitle>Scan Urban Mural</CardTitle>
            <CardDescription>Align the artwork within the frame to decode its social context.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {hasCameraPermission === null ? (
                <Button onClick={startCamera} size="lg" className="rounded-xl font-bold">Open Camera Radar</Button>
              ) : hasCameraPermission ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none m-8 rounded-lg" />
                  <ScanLine className="absolute h-1 w-full bg-primary/70 top-0 animate-[scan_4s_linear_infinite]" />
                </>
              ) : (
                <div className="p-8 text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Camera access denied. Please enable it in browser settings.</p>
                </div>
              )}
            </div>
            <div className="p-8">
              <Button 
                onClick={handleCapture} 
                disabled={!hasCameraPermission || isScanning} 
                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
              >
                {isScanning ? <Loader2 className="mr-2 animate-spin" /> : <Camera className="mr-2" />}
                {isScanning ? 'Decoding Narrative...' : 'Analyze Artwork'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in zoom-in duration-700">
          <div className="lg:col-span-5 space-y-6">
            <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white h-fit">
              <div className="relative aspect-[4/5] w-full">
                {capturedImage && <Image src={capturedImage} alt="Captured Art" fill className="object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute bottom-0 p-8 w-full">
                  <Badge className="mb-4 bg-primary text-white border-none font-bold uppercase tracking-widest px-3">Vision AI Analysis</Badge>
                  {isScanning ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="font-bold animate-pulse text-xl">Translating cultural symbols...</p>
                    </div>
                  ) : result && (
                    <>
                      <h2 className="text-4xl font-black font-headline leading-tight">{result.artTitle}</h2>
                      <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold uppercase tracking-tighter text-xs">
                        <User className="h-3.5 w-3.5" /> Artist: {result.artist}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <CardFooter className="p-6">
                <Button variant="outline" className="w-full rounded-xl border-white/10 text-white hover:bg-white/5" onClick={() => { setResult(null); setCapturedImage(null); startCamera(); }}>
                  <X className="mr-2 h-4 w-4" /> Scan New Piece
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-8">
            {result && (
              <div className="space-y-8">
                <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Info className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black font-headline text-slate-900">The Narrative</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deeper Meaning</p>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-slate-600 leading-relaxed italic">
                    "{result.meaning}"
                  </p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-none shadow-xl rounded-[2rem] bg-slate-50 p-8">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Local Context
                    </h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{result.culturalImpact}</p>
                  </Card>
                  <Card className="border-none shadow-xl rounded-[2rem] bg-slate-50 p-8">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                      <Palette className="h-4 w-4" /> Style & Technique
                    </h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{result.styleAnalysis}</p>
                  </Card>
                </div>

                <Card className="bg-primary/5 border-none rounded-[2rem] p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="h-24 w-24 text-primary" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Explorer's Achievement</h4>
                    <p className="text-2xl font-black text-slate-900">Art Scout Level +1</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">You've unlocked the history of this urban canvas.</p>
                  </div>
                </Card>
              </div>
            )}
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

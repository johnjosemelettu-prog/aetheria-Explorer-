"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { findNearbyPoisForGuide } from '@/ai/flows/find-nearby-pois-for-guide-flow';
import { generateTourScript } from '@/ai/flows/generate-tour-script-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { identifyLandmark } from '@/ai/flows/identify-landmark-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Mic, Play, Pause, AlertTriangle, Camera, ScanLine, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type TourStatus = 'idle' | 'locating' | 'identifying' | 'finding-pois' | 'generating-script' | 'generating-audio' | 'playing' | 'paused' | 'error' | 'finished';

export default function AudioGuidePage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [status, setStatus] = useState<TourStatus>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activePoi, setActivePoi] = useState<any | null>(null);
  const [tourScript, setTourScript] = useState<string | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const startAudioGeneration = useCallback(async (poiName: string) => {
    try {
      setStatus('generating-script');
      const scriptResult = await generateTourScript({ poiName, language: currentLang });
      setTourScript(scriptResult.script);

      setStatus('generating-audio');
      const audioResult = await textToSpeech(scriptResult.script);
      setAudioDataUri(audioResult.audioDataUri);
      
      setStatus('playing');
    } catch (error: any) {
      console.error("Error during audio generation:", error);
      setStatus('error');
      setLocationError("Linguistic node resolution failure. Try again.");
    }
  }, [currentLang]);

  const startGpsTour = useCallback(async (lat: number, lon: number) => {
    setStatus('finding-pois');
    try {
      const pois = await findNearbyPoisForGuide({ latitude: lat, longitude: lon });
      if (pois.length === 0) {
        setStatus('error');
        setLocationError("No nearby landmarks found in this grid node.");
        return;
      }

      const currentPoi = pois[0]; 
      setActivePoi(currentPoi);
      await startAudioGeneration(currentPoi.name);
    } catch (error: any) {
      console.error("Error during tour generation:", error);
      setStatus('error');
      setLocationError("Aura Intelligence grid disruption.");
    }
  }, [startAudioGeneration]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (audioDataUri && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio autoplay failed:", e));
    }
  }, [audioDataUri]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleEnded = () => setStatus('finished');
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleStartGps = () => {
    setStatus('locating');
    if (!navigator.geolocation) {
      setStatus('error');
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationError(null);
        startGpsTour(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setStatus('error');
        setLocationError("Location authorization required for GPS tour.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Optical Node Error',
        description: 'Camera access is required for vision hub guided tours.',
      });
    }
  };

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setStatus('identifying');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const photoDataUri = canvas.toDataURL('image/jpeg');

    try {
      const identification = await identifyLandmark({ photoDataUri, language: currentLang });
      if (!identification.isLandmark) {
        setStatus('error');
        setLocationError("Could not identify landmark in current vision node.");
        return;
      }

      setActivePoi({ id: 'scanned', name: identification.landmarkName });
      await startAudioGeneration(identification.landmarkName);
      
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error: any) {
      console.error("Scanning identification error:", error);
      setStatus('error');
      setLocationError("Vision Hub synthesis error.");
    }
  };
  
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setStatus('playing');
    } else {
      audio.pause();
      setStatus('paused');
    }
  };

  const resetTour = () => {
    setStatus('idle');
    setActivePoi(null);
    setTourScript(null);
    setAudioDataUri(null);
    setProgress(0);
    setLocationError(null);
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl uppercase italic text-slate-900 leading-none">
          Audio Guide
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-medium">
          Personalized high-fidelity tours in your ear, synthesized from your exact coordinates.
        </p>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <header className="bg-slate-900 text-white p-10">
          <div className="flex justify-between items-center font-headline uppercase italic tracking-tighter">
            <span className="text-xl">Guide Control</span>
            {status !== 'idle' && (
              <Button variant="outline" size="sm" onClick={resetTour} className="rounded-xl border-white/20 text-white hover:bg-white/10 font-bold">
                Reset
              </Button>
            )}
          </div>
        </header>
        <CardContent className="p-10 space-y-8">
          {status === 'idle' ? (
            <Tabs defaultValue="gps" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14 p-1 rounded-2xl bg-slate-100">
                <TabsTrigger value="gps" className="flex gap-2 rounded-xl font-black uppercase text-[10px] tracking-widest">
                  <MapPin className="h-4 w-4" /> Proximity
                </TabsTrigger>
                <TabsTrigger value="scan" className="flex gap-2 rounded-xl font-black uppercase text-[10px] tracking-widest" onClick={startCamera}>
                  <Camera className="h-4 w-4" /> Vision Node
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="gps" className="space-y-4 m-0">
                <div className="text-center py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <MapPin className="h-16 w-16 mx-auto text-primary mb-6 opacity-20" />
                  <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">Synthesizing landmarks within a 500m radius of your current GPS node.</p>
                  <Button onClick={handleStartGps} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                    Initialize GPS Tour
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="scan" className="space-y-4 m-0">
                <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden flex items-center justify-center border-4 border-slate-100 shadow-inner">
                  {hasCameraPermission === null ? (
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
                  ) : hasCameraPermission ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none" />
                      <div className="absolute inset-[30px] border-2 border-primary/50 rounded-2xl pointer-events-none" />
                      <ScanLine className="absolute h-1 w-[calc(100%-60px)] bg-primary/70 top-1/2 animate-[scan_3s_linear_infinite]" />
                    </>
                  ) : (
                    <p className="text-white p-8 text-center font-bold">Camera access is required.</p>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <Button onClick={handleScan} disabled={!hasCameraPermission} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                  <ScanLine className="mr-2 h-6 w-6" /> Analyze Vision Node
                </Button>
              </TabsContent>
            </Tabs>
          ) : status === 'error' ? (
             <Alert variant="destructive" className="rounded-2xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Node Disruption</AlertTitle>
              <AlertDescription>{locationError}</AlertDescription>
              <Button onClick={resetTour} className="w-full mt-4 rounded-xl font-black">Reset Core</Button>
            </Alert>
          ) : (
            <div className="space-y-8">
              {activePoi && <div className="p-4 rounded-xl bg-slate-900 text-white font-black text-center">{activePoi.name}</div>}
              {tourScript && (
                <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 h-64 overflow-y-auto shadow-inner">
                  <p className="whitespace-pre-wrap text-slate-600 font-medium leading-relaxed italic">"{tourScript}"</p>
                </div>
              )}

              {audioDataUri && (
                <div className="space-y-8 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Synthesis Playback</p>
                      <span className="text-[10px] font-black text-primary font-mono">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full" />
                  </div>
                  <audio ref={audioRef} src={audioDataUri} className="hidden" />
                  <div className="flex gap-4">
                    <Button onClick={handlePlayPause} className="flex-1 h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20">
                      {status === 'playing' ? <Pause className="mr-2 h-6 w-6" /> : <Play className="mr-2 h-6 w-6" />}
                      {status === 'playing' ? 'Pause' : 'Play'}
                    </Button>
                    <Button variant="outline" size="icon" className="h-16 w-16 rounded-2xl border-2" onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = 0;
                    }}>
                      <RotateCcw className="h-6 w-6 text-slate-400" />
                    </Button>
                  </div>
                </div>
              )}
              
              {!tourScript && (
                <div className="py-20 text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <Loader2 className="w-full h-full animate-spin text-primary" strokeWidth={1} />
                    <Mic className="absolute inset-0 m-auto h-8 w-8 text-primary animate-bounce" />
                  </div>
                  <p className="font-headline text-2xl font-black uppercase tracking-tighter italic animate-pulse">Encoding Native Node...</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes scan {
          from { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          to { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

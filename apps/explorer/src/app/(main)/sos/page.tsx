
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Siren, 
  ShieldAlert, 
  MapPin, 
  Loader2, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Wifi, 
  Phone, 
  X,
  Zap,
  Eye,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SosHubPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isPanicActive, setIsPanicActive] = useState(false);
  const [panicProgress, setPanicProgress] = useState(0);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [isStrobeOn, setIsStrobeOn] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isLongPressing) {
      const interval = setInterval(() => {
        setPanicProgress(prev => {
          if (prev >= 100) {
            triggerPanic();
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    } else {
      setPanicProgress(0);
    }
  }, [isLongPressing]);

  const triggerPanic = async () => {
    setIsPanicActive(true);
    handleSilentSos();
    toggleSiren(true);
    toggleStrobe(true);
    toast({ variant: 'destructive', title: "PANIC ACTIVE", description: "Guardian Grid notified. Siren and Strobe enabled." });
  };

  const handleSilentSos = async () => {
    if (!user || !firestore) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(coords);
        
        const eventRef = collection(firestore, 'userProfiles', user.uid, 'safetyEvents');
        addDocumentNonBlocking(eventRef, {
          type: 'SOS_PANIC',
          status: 'emergency',
          coordinates: coords,
          timestamp: serverTimestamp(),
          message: "User triggered emergency panic mode."
        });
        
        setIsLocating(false);
        toast({ title: "Signal Transmitted", description: "Your high-fidelity location is live on the Guardian Grid." });
      },
      (err) => {
        setIsLocating(false);
        console.error("GPS Failure", err);
      }
    );
  };

  const toggleSiren = (forceOn?: boolean) => {
    const shouldTurnOn = forceOn !== undefined ? forceOn : !isSirenOn;
    setIsSirenOn(shouldTurnOn);

    if (shouldTurnOn) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.0);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscillatorRef.current = osc;
    } else {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    }
  };

  const toggleStrobe = (forceOn?: boolean) => {
    setIsStrobeOn(forceOn !== undefined ? forceOn : !isStrobeOn);
  };

  const resetSOS = () => {
    setIsPanicActive(false);
    toggleSiren(false);
    toggleStrobe(false);
    setPanicProgress(0);
  };

  return (
    <div className={cn(
      "min-h-[calc(100vh-4rem)] transition-colors duration-300 flex items-center justify-center p-4",
      isPanicActive ? "bg-red-600" : "bg-slate-50",
      isStrobeOn && "animate-strobe"
    )}>
      <div className="container mx-auto max-w-2xl">
        <header className={cn(
          "text-center mb-12 space-y-4",
          isPanicActive ? "text-white" : "text-slate-900"
        )}>
          <Badge className={cn(
            "font-black uppercase tracking-widest px-4 py-1 border-none",
            isPanicActive ? "bg-white text-red-600 animate-pulse" : "bg-red-100 text-red-600"
          )}>
            {isPanicActive ? "EMERGENCY PROTOCOL ACTIVE" : "AETHERIA SOS"}
          </Badge>
          <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight leading-none uppercase italic">
            {isPanicActive ? "PANIC ACTIVE" : "SOS Hub"}
          </h1>
        </header>

        {!isPanicActive ? (
          <div className="flex flex-col items-center gap-12">
            <div className="relative group">
              <div 
                className="absolute inset-0 bg-red-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ transform: `scale(${1 + panicProgress / 100})` }}
              />
              <button
                onMouseDown={() => setIsLongPressing(true)}
                onMouseUp={() => setIsLongPressing(false)}
                onMouseLeave={() => setIsLongPressing(false)}
                onTouchStart={() => setIsLongPressing(true)}
                onTouchEnd={() => setIsLongPressing(false)}
                className="relative h-64 w-64 rounded-full bg-white border-[12px] border-slate-100 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all select-none overflow-hidden"
              >
                <div 
                  className="absolute bottom-0 left-0 w-full bg-red-600/10 transition-all"
                  style={{ height: `${panicProgress}%` }}
                />
                <Siren className={cn("h-20 w-20 transition-colors", isLongPressing ? "text-red-600" : "text-slate-300")} />
                <span className="font-headline font-black text-2xl text-slate-900 uppercase">Panic Mode</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Hold to Trigger</p>
              </button>
            </div>
          </div>
        ) : (
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-10 space-y-10 text-center relative overflow-hidden">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-bounce">
                <ShieldAlert className="h-12 w-12" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black font-headline text-slate-900 uppercase">Emergency Active</h2>
              <p className="text-slate-500 font-medium">Identity and location data are being broadcast to global responders.</p>
            </div>
            <div className="flex flex-col gap-4">
              <a href="tel:112" className="w-full">
                <Button className="w-full h-16 rounded-2xl font-black text-xl bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-200">
                  <Phone className="mr-2" /> CALL EMERGENCY
                </Button>
              </a>
              <Button variant="ghost" onClick={resetSOS} className="font-bold text-slate-400 hover:text-slate-900">
                End Emergency Mode
              </Button>
            </div>
          </Card>
        )}
      </div>
      <style jsx global>{`
        @keyframes strobe { 0%, 100% { background-color: rgba(255, 255, 255, 0.1); } 50% { background-color: rgba(255, 255, 255, 0.9); } }
        .animate-strobe { animation: strobe 0.1s infinite; }
      `}</style>
    </div>
  );
}

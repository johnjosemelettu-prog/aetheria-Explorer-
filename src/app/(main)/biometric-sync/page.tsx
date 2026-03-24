'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Heart, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRightLeft,
  Sparkles,
  Thermometer,
  Moon,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { syncBiometrics, type BiometricSyncOutput } from '@/ai/flows/biometric-sync-flow';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function BiometricSyncPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [hasMounted, setHasMounted] = useState(false);
  const [stress, setStress] = useState([4]);
  const [sleep, setSleep] = useState([7]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BiometricSyncOutput | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const tripsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(1));
    },
    [user, firestore]
  );
  const { data: trips } = useCollection(tripsQuery);
  const activeTrip = trips?.[0];

  const handleSync = async () => {
    if (!activeTrip) return;
    setIsAnalyzing(true);
    try {
      const data = await syncBiometrics({
        stressLevel: stress[0],
        sleepHours: sleep[0],
        currentActivity: activeTrip.dailyPlans?.[0]?.activities?.[0]?.description || 'City Exploration',
        itinerarySummary: activeTrip.itinerarySummary || activeTrip.name,
        language: currentLang
      });
      setResult(data);
    } catch (e) {
      toast({ variant: 'destructive', title: "Sync Failed" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptPivot = () => {
    if (!result?.itineraryPivot || !activeTrip || !user || !firestore) return;
    
    const tripRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', activeTrip.id);
    updateDocumentNonBlocking(tripRef, {
      itinerarySummary: `${activeTrip.itinerarySummary || ''} [BIO-PIVOT]: ${result.itineraryPivot.reasoning}`,
      updatedAt: serverTimestamp(),
    });

    toast({ title: "Biological Pivot Active", description: "Your itinerary has been recalibrated for recovery." });
    setResult(null);
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Biological Optimization</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Equilibrium Sync
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Recalibrate your odyssey based on real-time biometric stress nodes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Label className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Cortisol Node (Stress)</Label>
                <Badge variant="outline" className="border-primary/20 text-primary font-black">{stress[0]}/10</Badge>
              </div>
              <Slider value={stress} onValueChange={setStress} min={1} max={10} step={1} />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Label className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Recovery Window (Sleep)</Label>
                <Badge variant="outline" className="border-primary/20 text-primary font-black">{sleep[0]}H</Badge>
              </div>
              <Slider value={sleep} onValueChange={setSleep} min={2} max={12} step={0.5} />
            </div>

            <Button 
              onClick={handleSync} 
              disabled={isAnalyzing || !activeTrip}
              className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <><RefreshCw className="mr-2 h-5 w-5" /> Analyze Equilibrium</>}
            </Button>
          </Card>

          <Card className="border-none shadow-lg rounded-[2rem] bg-slate-900 text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Heart className="h-20 w-20 text-red-500" /></div>
            <h4 className="font-headline font-black text-sm uppercase tracking-widest text-primary mb-4">Aetheria Protocol</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              We use <strong>Heart Rate Variability (HRV)</strong> logic to determine if your travel velocity exceeds your biological threshold.
            </p>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-8 opacity-50">
              <div className="relative w-32 h-32">
                <Loader2 className="w-full h-full animate-spin text-primary" strokeWidth={1} />
                <Activity className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
              </div>
              <p className="font-headline text-2xl font-black uppercase tracking-tighter">Scanning Neural Pathways...</p>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className={cn(
                  "p-10 text-white",
                  result.equilibriumStatus === 'Optimal' ? "bg-emerald-600" : "bg-primary"
                )}>
                  <div className="flex justify-between items-center">
                    <div>
                      <Badge className="bg-white/20 text-white border-none font-bold uppercase mb-4 px-3">Sync Result</Badge>
                      <h2 className="text-5xl font-black font-headline leading-tight italic uppercase">{result.equilibriumStatus}</h2>
                    </div>
                    <Thermometer className="h-16 w-16 opacity-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"><Zap className="h-8 w-8" /></div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black font-headline text-slate-900">Suggested Action</h3>
                      <p className="text-lg font-medium text-slate-600 leading-relaxed italic">"{result.suggestedAction}"</p>
                    </div>
                  </div>

                  {result.itineraryPivot && (
                    <div className="p-8 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 space-y-6">
                      <div className="flex justify-between items-center">
                        <Badge className="bg-slate-900 text-white border-none font-bold uppercase text-[8px]">Itinerary recalibration</Badge>
                        <ArrowRightLeft className="h-5 w-5 text-slate-300" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Original Node</p>
                          <p className="font-bold text-slate-400 line-through truncate">{result.itineraryPivot.originalActivity}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Recalibrated Node</p>
                          <p className="font-black text-slate-900 truncate">{result.itineraryPivot.newActivity}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{result.itineraryPivot.reasoning}"</p>
                      <Button onClick={handleAcceptPivot} className="w-full h-12 rounded-xl font-black">Authorize Recalibration</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-32 opacity-20 grayscale gap-8">
              <Activity className="h-40 w-40 text-primary" />
              <div className="space-y-2">
                <h2 className="text-4xl font-black font-headline uppercase tracking-tighter italic">Sensors Idle</h2>
                <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Specify your biometric nodes to synthesize a biological recovery protocol.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

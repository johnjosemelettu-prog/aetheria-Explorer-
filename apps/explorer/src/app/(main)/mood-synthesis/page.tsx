
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Loader2, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Brain,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { analyzeMoodSynthesis, type MoodSynthesisOutput } from '@/ai/flows/analyze-mood-synthesis-flow';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function MoodSynthesisPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [summary, setSummary] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [result, setResult] = useState<MoodSynthesisOutput | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    if (!summary.trim()) {
      toast({ variant: 'destructive', title: "Input Node Empty", description: "Detail your day to begin synthesis." });
      return;
    }

    setIsSynthesizing(true);
    setResult(null);
    try {
      const data = await analyzeMoodSynthesis({
        dailySummary: summary,
        photoDataUri: selectedImage || undefined,
        language: currentLang,
      });
      setResult(data);
      toast({ title: "Vibe Resolved", description: "Your emotional DNA has been mapped." });
    } catch (err) {
      toast({ variant: 'destructive', title: "Synthesis Failed" });
    } finally {
      setIsSynthesizing(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Emotional Intelligence Node</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          Mood Synthesis
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          The ultimate "Vibe Check." Analyze your day's emotional pulse to recalibrate your odyssey.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-2 uppercase tracking-tighter italic">
                <Brain className="h-5 w-5 text-primary" /> Daily Input Node
              </CardTitle>
              <CardDescription className="text-slate-400">Describe your day or upload a mood snap.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Textarea 
                placeholder="I'm feeling a bit overwhelmed by the crowds, but the architecture was stunning..." 
                className="rounded-2xl h-40 bg-slate-50 border-none font-medium p-6 focus:ring-2 ring-primary transition-all"
                value={summary}
                onChange={e => setSummary(e.target.value)}
              />
              
              <div 
                className={cn(
                  "relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
                  selectedImage ? "border-primary/50" : "border-slate-200 hover:border-primary/30 bg-slate-50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <Image src={selectedImage} alt="Mood" fill className="object-cover" />
                ) : (
                  <div className="text-center opacity-40">
                    <Camera className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Add Visual Node</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <Button 
                onClick={handleSynthesize} 
                disabled={isSynthesizing || !summary.trim()}
                className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {isSynthesizing ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 h-6 w-6" /> Authorize Vibe Check</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {isSynthesizing ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-8 opacity-50">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <Loader2 className="w-full h-full animate-spin text-primary" strokeWidth={1} />
                <Heart className="absolute inset-0 m-auto h-12 w-12 text-primary animate-bounce" />
              </div>
              <h3 className="text-3xl font-black font-headline uppercase tracking-tighter italic">Analyzing Neural Pulse...</h3>
            </div>
          ) : result ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className={cn(
                  "p-10 text-white",
                  result.burnoutRisk === 'Critical' ? "bg-red-600" : "bg-primary"
                )}>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-white/20 text-white border-none font-bold uppercase mb-4 px-3">Synthesis Resolved</Badge>
                      <h2 className="text-5xl font-black font-headline leading-tight italic uppercase">{result.detectedVibe}</h2>
                    </div>
                    <div className="h-16 w-16 rounded-3xl bg-white/10 flex items-center justify-center shadow-inner">
                      <TrendingUp className="h-10 w-10" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-2 gap-10 border-b border-slate-50 pb-10">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Happiness Node</p>
                      <div className="flex items-center gap-4">
                        <p className="text-6xl font-black font-headline text-slate-900">{result.happinessScore}</p>
                        <Progress value={result.happinessScore * 10} className="h-2 flex-1" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Burnout Risk</p>
                      <Badge className={cn(
                        "h-12 w-full flex items-center justify-center font-black text-lg rounded-2xl",
                        result.burnoutRisk === 'Low' ? "bg-emerald-50 text-emerald-600" :
                        result.burnoutRisk === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                      )}>
                        {result.burnoutRisk.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black font-headline text-slate-900 flex items-center gap-3">
                      <Brain className="h-6 w-6 text-primary" /> Emotional Analysis
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed italic">"{result.emotionalAnalysis}"</p>
                  </div>

                  {result.itineraryPivot && (
                    <div className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><RotateCcw className="h-20 w-20 text-primary" /></div>
                      <Badge className="bg-primary text-white border-none font-bold uppercase text-[8px] px-3">Suggested Itinerary Pivot</Badge>
                      <h4 className="text-2xl font-black font-headline text-primary">{result.itineraryPivot.suggestedShift}</h4>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">"{result.itineraryPivot.reasoning}"</p>
                      <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-200 font-black">
                        Authorize Emotional Pivot
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-32 opacity-20 grayscale gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
                <Heart className="h-40 w-40 text-primary relative mx-auto" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black font-headline uppercase tracking-tighter italic">Vibe Radar Idle</h2>
                <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Provide daily inputs to synthesize your emotional state and optimize your odyssey.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

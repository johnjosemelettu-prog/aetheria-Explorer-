
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  Search, 
  Loader2, 
  MapPin, 
  FileText, 
  Clock, 
  ExternalLink, 
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { checkVisaRequirements, type CheckVisaRequirementsOutput } from '@/ai/flows/check-visa-requirements-flow';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function VisaArchitectPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [hasMounted, setHasMounted] = useState(false);
  const [destination, setDestination] = useState('France');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckVisaRequirementsOutput | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const userProfileRef = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return doc(firestore, 'userProfiles', user.uid);
    },
    [user, firestore]
  )
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleCheck = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!destination.trim() || isProfileLoading) return;

    setIsChecking(true);
    setResult(null);
    try {
      const data = await checkVisaRequirements({
        nationality: userProfile?.nationality || 'United States',
        destination,
        purpose: 'Tourism',
        language: currentLang,
      });
      setResult(data);
    } catch (err) {
      toast({ variant: 'destructive', title: "Logic Error", description: "Could not reach the global visa node." });
    } finally {
      setIsChecking(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Cross-Border Compliance</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Visa Architect
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Real-time international entry requirements synthesized from verified diplomatic nodes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-2 uppercase tracking-tighter italic">
                <Globe className="h-5 w-5 text-primary" /> Global Radar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Your Citizenship Node</label>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="font-bold text-slate-700">{userProfile?.nationality || 'Searching DNA...'}</span>
                </div>
              </div>

              <form onSubmit={handleCheck} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Destination Node</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      value={destination} 
                      onChange={e => setDestination(e.target.value)}
                      placeholder="e.g. France, Japan, Brazil"
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isChecking || !destination} 
                  className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  {isChecking ? <Loader2 className="animate-spin mr-2" /> : <><Search className="mr-2 h-5 w-5" /> Analyze Entry Protocol</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {isChecking ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-6 opacity-50">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-headline text-2xl font-black animate-pulse uppercase tracking-tighter">Consulting Diplomatic Nodes...</p>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className={cn(
                  "p-10 text-white",
                  result.status === 'Visa Free' ? "bg-emerald-600" : "bg-primary"
                )}>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-white/20 text-white border-none font-bold uppercase mb-4 px-3">Synthesis Result</Badge>
                      <h2 className="text-5xl font-black font-headline leading-tight italic uppercase">{result.status}</h2>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
                      <Globe className="h-10 w-10" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="p-6 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200">
                    <p className="text-lg font-medium text-slate-600 leading-relaxed italic">"{result.explanation}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" /> Required Documents
                      </h4>
                      <ul className="space-y-3">
                        {result.requiredDocuments.map((doc, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-slate-400" />
                          <span className="text-[10px] font-black uppercase text-slate-400">Max Stay</span>
                        </div>
                        <span className="font-black font-headline text-slate-900 uppercase">{result.maxStayDays || '---'} Days</span>
                      </div>
                    </div>
                  </div>

                  {result.officialLink && (
                    <div className="pt-8 border-t border-slate-100 flex justify-center">
                      <Button asChild className="h-14 px-10 rounded-2xl font-black text-lg bg-slate-900 text-white shadow-xl">
                        <a href={result.officialLink} target="_blank" rel="noopener noreferrer">
                          Open Official Portal <ExternalLink className="ml-2 h-5 w-5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center opacity-20 grayscale py-20">
              <Globe className="h-32 w-32 mb-4 mx-auto" />
              <p className="text-3xl font-black font-headline uppercase tracking-tighter italic">Compliance Radar Idle</p>
              <p className="max-w-xs mx-auto text-sm font-bold mt-2 font-medium">Enter your destination node to synthesize a real-time cross-border compliance report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

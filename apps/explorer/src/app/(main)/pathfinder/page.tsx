'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  MapPin, 
  Wand2, 
  Wallet, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { synthesizeFromPhoto, type VisualPathfinderOutput } from '@/ai/flows/visual-pathfinder-flow';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const SYNTHESIS_FEE = 5.00;

export default function VisualPathfinderPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [hasMounted, setHasMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [result, setResult] = useState<VisualPathfinderOutput | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const walletsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'wallets');
    },
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);
  const usdWallet = wallets?.find(w => w.currency === 'USD');

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

  const handleSynthesize = async () => {
    if (!user || !selectedImage || !firestore) return;

    if (!usdWallet || usdWallet.balance < SYNTHESIS_FEE) {
      toast({
        variant: 'destructive',
        title: "Insufficient Credits",
        description: `Synthesis requires $${SYNTHESIS_FEE}. Please top up your Smart Wallet.`,
      });
      return;
    }

    setIsSynthesizing(true);
    try {
      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(-SYNTHESIS_FEE),
        updatedAt: serverTimestamp()
      }, { merge: true });

      addDocumentNonBlocking(collection(firestore, 'userProfiles', user.uid, 'transactions'), {
        type: 'debit',
        category: 'synthesis',
        amount: SYNTHESIS_FEE,
        currency: 'USD',
        description: 'Visual Path Finder Synthesis',
        timestamp: serverTimestamp()
      });

      const data = await synthesizeFromPhoto({
        photoDataUri: selectedImage,
        language: currentLang,
      });
      setResult(data);
      
      toast({ title: "Destiny Resolved", description: "Your visual path has been mapped." });
    } catch (err) {
      toast({ variant: 'destructive', title: "Synthesis Offline", description: "The visual architect is resting. Try again soon." });
    } finally {
      setIsSynthesizing(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Aetheria Path Chapter</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Path Finder
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          The future of travel synthesis. Upload an aesthetic anchor to map your next trajectory.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-10">
              <CardTitle className="text-xl font-headline flex items-center gap-2 uppercase tracking-tighter italic">
                <ImageIcon className="h-5 w-5 text-primary" /> Visual Anchor
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium">Select an inspiration photo from your grid.</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
              <div 
                className={cn(
                  "relative aspect-[4/5] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
                  selectedImage ? "border-primary/50 shadow-inner" : "border-slate-200 hover:border-primary/30 bg-slate-50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <>
                    <Image src={selectedImage} alt="Inspiration" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                      <RefreshCw className="text-white h-12 w-12" />
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                      <Plus className="h-10 w-10" />
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Select Visual Asset</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </CardContent>
            <CardFooter className="p-10 pt-0">
              <div className="w-full space-y-4">
                <Button 
                  onClick={handleSynthesize} 
                  disabled={!selectedImage || isSynthesizing}
                  className="w-full h-16 rounded-[1.5rem] font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  {isSynthesizing ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <><Sparkles className="mr-2 h-6 w-6" /> Authorize Synthesis</>}
                </Button>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-full">Fixed Synthesis Fee: $5.00 USD</p>
              </div>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-slate-900 text-white">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-headline font-black flex items-center gap-2 uppercase tracking-widest text-sm italic"><Wallet className="h-5 w-5 text-accent" /> Smart Assets</h4>
              <Badge variant="outline" className="border-white/10 text-slate-400">USD</Badge>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Node</span>
              <span className="text-2xl font-black font-headline text-accent">${usdWallet?.balance.toFixed(2) || '0.00'}</span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {isSynthesizing ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-8 opacity-50">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <Loader2 className="w-full h-full animate-spin text-primary" strokeWidth={1} />
                <Zap className="absolute inset-0 m-auto h-12 w-12 text-primary animate-bounce" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-3xl font-black font-headline tracking-tighter uppercase italic">Decoding Aesthetic...</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mapping visual data to global clusters</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className="bg-primary p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10"><MapPin className="h-40 w-40" /></div>
                  <div className="relative z-10">
                    <Badge className="bg-white/20 text-white border-none font-bold uppercase mb-4 px-3">Synthesis Complete</Badge>
                    <h2 className="text-5xl font-black font-headline leading-tight italic">{result.suggestedDestination}</h2>
                    <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 italic text-sm font-medium">
                      "{result.vibeAesthetic}"
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black font-headline text-slate-900 flex items-center gap-3 italic uppercase tracking-tighter">
                      <ShieldCheck className="h-6 w-6 text-emerald-500" /> Synthesis Logic
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed italic">"{result.matchingLogic}"</p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-black font-headline text-slate-900 flex items-center gap-3 italic uppercase tracking-tighter">
                      <Zap className="h-6 w-6 text-primary" /> Aesthetic Activities
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {result.activities.map((act, i) => (
                        <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:shadow-lg transition-all">
                          <div className="space-y-1">
                            <p className="font-black text-slate-900 text-lg uppercase italic tracking-tighter">{act.name}</p>
                            <p className="text-sm text-slate-500 font-medium">{act.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 leading-none">Vibe</p>
                            <Badge className="bg-primary text-white font-black">{act.aestheticScore}/10</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0 gap-4">
                  <Button asChild className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 bg-slate-900 text-white hover:bg-slate-800">
                    <Link href="/itinerary-generator">
                      Initialize Full Odyssey <ArrowRight className="ml-2 h-6 w-6" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-32 opacity-20 grayscale gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
                <ImageIcon className="h-40 w-40 text-primary relative mx-auto" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black font-headline uppercase tracking-tighter italic">Engine Idle</h2>
                <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Upload your visual inspiration to initialize path synthesis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

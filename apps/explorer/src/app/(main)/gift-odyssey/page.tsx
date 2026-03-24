
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gift, 
  Sparkles, 
  Wallet, 
  Loader2, 
  CheckCircle2, 
  User, 
  Send, 
  Crown, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  History
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const giftOptions = [
  { id: 'discovery', name: 'Discovery Pass', price: 19, icon: Zap, color: 'text-primary', desc: 'Unlocks full AR/VR and AI support for one trip.' },
  { id: 'elite', name: 'Elite Pass', price: 49, icon: Crown, color: 'text-amber-500', desc: 'Unlock cinematic video and heritage mirror synthesis.' },
  { id: 'credit-50', name: '$50 Experience Credit', price: 50, icon: Wallet, color: 'text-emerald-600', desc: 'Pre-paid credits for bookings or gear.' },
];

export default function GiftOdysseyPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedGiftId, setSelectedGiftId] = useState('discovery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);
  const usdWallet = wallets?.find(w => w.currency === 'USD');

  const selectedGift = giftOptions.find(g => g.id === selectedGiftId)!;

  const handleSendGift = async () => {
    if (!user || !recipientEmail || !selectedGift || !firestore) return;

    if (!usdWallet || usdWallet.balance < selectedGift.price) {
      toast({
        variant: 'destructive',
        title: "Insufficient Wallet Balance",
        description: `You need $${selectedGift.price} USD to send this gift.`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(-selectedGift.price),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit',
        category: 'gift',
        amount: selectedGift.price,
        currency: 'USD',
        description: `Gifted ${selectedGift.name} to ${recipientEmail}`,
        timestamp: serverTimestamp()
      });

      setStep('success');
      toast({ title: 'Gift Transmitted' });
    } catch (e) {
      toast({ variant: 'destructive', title: "Synthesis Error" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!hasMounted) return null;

  if (step === 'success') {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Card className="max-w-xl w-full border-none shadow-2xl rounded-[3rem] text-center overflow-hidden animate-in zoom-in duration-700">
          <div className="bg-primary p-12 text-white relative">
            <div className="mx-auto h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-14 w-14" />
            </div>
            <h2 className="text-4xl font-black font-headline tracking-tighter uppercase italic">Odyssey Sent!</h2>
            <p className="mt-2 text-primary-foreground/80 font-medium">Successfully gifted {selectedGift.name} to {recipientEmail}.</p>
          </div>
          <CardFooter className="p-12 bg-white">
            <Button asChild className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
              <Link href="/dashboard">Back to Command Center</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Odyssey Gifting</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Gift an Odyssey
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Share the world with fellow explorers through high-fidelity travel nodes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-10">
              <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic">Gift Parameters</CardTitle>
              <CardDescription className="text-slate-400">Specify recipient and select adventure node.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="space-y-3">
                <Label className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Recipient Email</Label>
                <Input 
                  type="email" 
                  placeholder="friend@explorer.com" 
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white font-bold" 
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Select Asset Node</Label>
                <RadioGroup value={selectedGiftId} onValueChange={setSelectedGiftId} className="grid grid-cols-1 gap-4">
                  {giftOptions.map((opt) => (
                    <Label
                      key={opt.id}
                      htmlFor={opt.id}
                      className={cn(
                        "relative flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all hover:bg-slate-50",
                        selectedGiftId === opt.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-100"
                      )}
                    >
                      <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                      <div className="flex items-center gap-6">
                        <div className={cn("h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center", opt.color)}>
                          <opt.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">{opt.name}</p>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{opt.desc}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-black font-headline text-slate-900">${opt.price}</p>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="p-10 pt-0">
              <Button 
                onClick={handleSendGift} 
                disabled={isProcessing || !recipientEmail.trim()} 
                className="w-full h-16 rounded-[1.5rem] font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <><Send className="mr-2 h-6 w-6" /> Authorize Gift</>}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <aside className="lg:col-span-5">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white p-10 overflow-hidden relative">
            <h3 className="font-headline font-black text-2xl uppercase tracking-tighter italic">Wallet Context</h3>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mt-8">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Available Balance</p>
              <p className="text-4xl font-black font-headline text-primary">${usdWallet?.balance.toFixed(2) || '0.00'}</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

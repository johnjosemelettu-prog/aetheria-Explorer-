'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBasket, 
  Trash2, 
  Plus, 
  Minus, 
  Wallet, 
  ArrowRightLeft, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight,
  CreditCard,
  AlertTriangle,
  Truck,
  Wand2
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PlaceHolderImages, ImagePlaceholder } from '@/lib/placeholder-images';
import { useTranslation } from '@/lib/i18n';
import { synthesizeGearPurchaseEmail } from '@/ai/flows/gear-purchase-email-flow';
import { Skeleton } from '@/components/ui/skeleton';

const exchangeRates: Record<string, number> = {
  'USD': 1,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 150.45,
  'INR': 82.95,
  'THB': 35.85,
};

export default function CartPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const cartQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'cart') : null),
    [user, firestore]
  );
  const { data: cartItems, isLoading: isCartLoading } = useCollection(cartQuery);

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);

  const totalUSD = useMemo(() => {
    return cartItems?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  }, [cartItems]);

  const convertedTotal = useMemo(() => {
    return totalUSD * (exchangeRates[selectedCurrency] || 1);
  }, [totalUSD, selectedCurrency]);

  const currentWallet = wallets?.find(w => w.currency === selectedCurrency);
  const canAfford = currentWallet && currentWallet.balance >= convertedTotal;

  const handleUpdateQuantity = (itemId: string, current: number, delta: number) => {
    if (!user || !firestore) return;
    const newQty = current + delta;
    if (newQty < 1) {
      handleRemove(itemId);
      return;
    }
    const itemRef = doc(firestore, 'userProfiles', user.uid, 'cart', itemId);
    setDocumentNonBlocking(itemRef, { quantity: newQty }, { merge: true });
  };

  const handleRemove = (itemId: string) => {
    if (!user || !firestore) return;
    const itemRef = doc(firestore, 'userProfiles', user.uid, 'cart', itemId);
    deleteDocumentNonBlocking(itemRef);
  };

  const handleCheckout = async () => {
    if (!user || !firestore || !cartItems || cartItems.length === 0) return;
    
    if (!canAfford) {
      toast({ 
        variant: 'destructive', 
        title: 'Insufficient Funds', 
        description: `Your ${selectedCurrency} wallet node has insufficient balance.` 
      });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', selectedCurrency);
      setDocumentNonBlocking(walletRef, {
        balance: increment(-convertedTotal),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit',
        category: 'purchase',
        amount: convertedTotal,
        currency: selectedCurrency,
        description: `Bespoke Gear Purchase: ${cartItems.length} nodes`,
        timestamp: serverTimestamp()
      });

      const ownedGearRef = collection(firestore, 'userProfiles', user.uid, 'ownedGear');
      for (const item of cartItems) {
        addDocumentNonBlocking(ownedGearRef, {
          ...item,
          purchasedAt: serverTimestamp(),
          purchasePrice: item.price,
          purchaseCurrency: 'USD',
          status: 'deployed'
        });
        
        const cartItemRef = doc(firestore, 'userProfiles', user.uid, 'cart', item.id);
        deleteDocumentNonBlocking(cartItemRef);
      }

      try {
        await synthesizeGearPurchaseEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          itemName: `${cartItems.length} Custom Items`,
          category: 'Adventure Arsenal',
          price: totalUSD,
          language: 'English'
        });
      } catch (e) {}

      toast({
        title: "Odyssey Arsenal Updated",
        description: "Bespoke gear secured. Items are scheduled for deployment.",
      });
      
    } catch (e) {
      toast({ variant: 'destructive', title: 'Checkout Failed', description: 'Transaction node interrupted.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const findImage = (hint: string): ImagePlaceholder | undefined => {
    if (!hint) return undefined;
    const hintWords = hint.toLowerCase().split(' ');
    let image = PlaceHolderImages.find(p => p.imageHint.toLowerCase() === hint.toLowerCase());
    if (image) return image;
    image = PlaceHolderImages.find(p => hintWords.some(h => p.imageHint.toLowerCase().includes(h)));
    return image;
  }

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-12">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px] mb-4">Manifest Review</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          Confirm Arsenal
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {isCartLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-[2.5rem]" />
              <Skeleton className="h-32 w-full rounded-[2.5rem]" />
            </div>
          ) : cartItems && cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemImage = findImage(item.imageHint);
                const isCustomized = item.customization && item.customization !== 'Standard';
                
                return (
                  <Card key={item.id} className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-white hover:shadow-xl transition-all group">
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className="relative h-24 w-24 rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                        <Image 
                          src={itemImage?.imageUrl || 'https://placehold.co/200x200'} 
                          alt={item.name} 
                          fill 
                          className="object-cover transition-transform group-hover:scale-110" 
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black font-headline text-slate-900 truncate">{item.name}</h3>
                          {isCustomized && (
                            <Badge className="bg-primary text-white border-none font-black text-[8px] px-2 py-0.5 flex items-center gap-1">
                              <Wand2 className="h-2.5 w-2.5" /> Bespoke
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <p className="text-2xl font-black text-primary">${item.price}</p>
                          {isCustomized && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{item.customization}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-300 hover:text-destructive hover:bg-destructive/5 transition-all"
                          onClick={() => handleRemove(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-20 grayscale">
              <ShoppingBasket className="h-32 w-32 text-primary" />
              <div className="space-y-2">
                <h2 className="text-3xl font-black font-headline uppercase tracking-tighter">Your Arsenal is Empty</h2>
                <p className="text-lg font-medium text-slate-500">Initialize your odyssey with customized designer gear.</p>
              </div>
              <Button asChild className="rounded-2xl h-14 px-10 font-black text-lg bg-slate-900 shadow-xl shadow-slate-200">
                <Link href="/store">Back to Supply Hub</Link>
              </Button>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="h-32 w-32" /></div>
            <h3 className="text-2xl font-black font-headline flex items-center gap-3 uppercase tracking-tighter italic">
              <ShieldCheck className="h-8 w-8 text-primary" /> Global Order
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between text-sm font-bold opacity-60">
                <span className="uppercase tracking-widest">Gross Subtotal</span>
                <span>${totalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-400">
                <span className="uppercase tracking-widest">Synthesis & Duty</span>
                <span>COMPLIMENTARY</span>
              </div>
              <div className="pt-6 border-t border-white/10 space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">Currency Unit</label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger className="w-24 h-10 bg-white/5 border-white/10 rounded-xl text-xs font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl">
                      {Object.keys(exchangeRates).map(curr => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center font-black text-sm shadow-lg">
                      {selectedCurrency}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Smart Balance</p>
                      <p className="text-base font-black">{currentWallet?.balance.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  {canAfford ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2">Total Node Settlement</p>
                  <p className="text-5xl font-black font-headline text-primary leading-none tracking-tighter">{convertedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <p className="text-2xl font-black opacity-40 font-headline mb-1">{selectedCurrency}</p>
              </div>
            </div>

            <Button 
              className="w-full h-20 rounded-[2rem] bg-primary text-white hover:bg-primary/90 font-black text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all"
              onClick={handleCheckout}
              disabled={isProcessing || cartItems?.length === 0 || !canAfford}
            >
              {isProcessing ? <Loader2 className="animate-spin h-8 w-8" /> : <><CreditCard className="mr-3 h-8 w-8" /> Authorize & Deploy</>}
            </Button>
            
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Settlement verified via VibePack Smart Wallet Protocol. All imprints are permanent once authorized.
              </p>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl p-8 bg-white border border-slate-50">
            <h4 className="font-headline font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tighter">
              <Truck className="h-6 w-6 text-primary" /> Direct Node Delivery
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Bespoke physical gear is synthesized and dispatched to your next verified <strong>Odyssey Hub</strong> within 48 hours of departure. Digital assets unlock instantly.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

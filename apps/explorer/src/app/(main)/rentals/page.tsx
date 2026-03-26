'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  RotateCcw, 
  CheckCircle2, 
  Loader2, 
  PackageCheck, 
  History, 
  ArrowUpRight,
  ShieldCheck,
  Wallet,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment, query, orderBy } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages, ImagePlaceholder } from '@/lib/placeholder-images';
import { synthesizeWardrobeEmail } from '@/ai/flows/wardrobe-email-flow';

export default function RentalsPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isReturning, setIsReturning] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const rentalsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'userProfiles', user.uid, 'rentals'), orderBy('createdAt', 'desc')) : null),
    [user, firestore]
  );
  const { data: rentals, isLoading } = useCollection(rentalsQuery);

  const findImage = (hint: string): ImagePlaceholder | undefined => {
    if (!hint) return undefined;
    const hintWords = hint.toLowerCase().split(' ');
    let image = PlaceHolderImages.find(p => p.imageHint.toLowerCase() === hint.toLowerCase());
    if (image) return image;
    image = PlaceHolderImages.find(p => hintWords.some(h => p.imageHint.toLowerCase().includes(h)));
    return image;
  }

  const handleReturn = async (rentalId: string, deposit: number, rentPaid: boolean, itemNames: string[]) => {
    if (!user || !firestore) return;
    setIsReturning(rentalId);
    
    try {
      const refundAmount = rentPaid ? deposit : deposit * 0.5;
      await new Promise(resolve => setTimeout(resolve, 2000));

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(refundAmount),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'credit',
        category: 'refund',
        amount: refundAmount,
        currency: 'USD',
        description: `Security Deposit Refund • Rental ${rentalId.substring(0, 6).toUpperCase()}`,
        timestamp: serverTimestamp()
      });

      const rentalRef = doc(firestore, 'userProfiles', user.uid, 'rentals', rentalId);
      setDocumentNonBlocking(rentalRef, {
        status: 'returned',
        refundedAmount: refundAmount,
        updatedAt: serverTimestamp()
      }, { merge: true });

      try {
        await synthesizeWardrobeEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          type: 'return',
          itemNames: itemNames,
          amount: refundAmount,
          language: currentLang
        });
      } catch (e) {}

      toast({
        title: "Return Processed!",
        description: "Successfully unboxed. Check your inbox for the return confirmation.",
      });
    } catch (error) {
      toast({ variant: 'destructive', title: "Return Failed" });
    } finally {
      setIsReturning(null);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Rental Management</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          My Rentals
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Manage your zero-luggage wardrobe rentals and track deposit returns.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-[2.5rem]" />
            <Skeleton className="h-48 w-full rounded-[2.5rem]" />
          </div>
        ) : rentals && rentals.length > 0 ? (
          rentals.map((rental) => {
            const isActive = rental.status === 'active';
            const itemNames = rental.items.map((i: any) => i.itemName);
            return (
              <Card key={rental.id} className={cn(
                "border-none shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-500 bg-white",
                !isActive && "opacity-60 grayscale-[0.5]"
              )}>
                <div className="bg-slate-950 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg",
                      isActive ? "bg-primary" : "bg-slate-800"
                    )}>
                      <Briefcase className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black font-headline">Package {rental.id.substring(0, 6).toUpperCase()}</h3>
                        <Badge className={cn(
                          "font-black uppercase text-[9px] px-2",
                          isActive ? "bg-emerald-500" : "bg-slate-700"
                        )}>{rental.status}</Badge>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Ordered {rental.createdAt?.toDate ? format(rental.createdAt.toDate(), 'PPP') : 'Recently'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Deposit</p>
                      <p className="text-3xl font-black font-headline text-accent">${rental.depositAmount.toFixed(2)}</p>
                    </div>
                    {isActive && (
                      <Button 
                        onClick={() => handleReturn(rental.id, rental.depositAmount, rental.isRentPaidInFull, itemNames)}
                        disabled={!!isReturning}
                        className="rounded-2xl h-14 px-8 font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                      >
                        {isReturning === rental.id ? <Loader2 className="animate-spin mr-2" /> : <RotateCcw className="mr-2" />}
                        Process Return
                      </Button>
                    )}
                    {!isActive && (
                      <div className="h-14 flex items-center px-6 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 font-bold">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Refund Completed
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contents</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {rental.items.map((item: any, i: number) => {
                        const img = findImage(item.imageHint);
                        return (
                          <div key={i} className="aspect-square relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group">
                            <Image src={img?.imageUrl || 'https://placehold.co/400x400'} alt={item.itemName} fill className="object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                              <div className="w-full">
                                <p className="text-white text-[9px] font-black uppercase tracking-tighter truncate">{item.itemName}</p>
                                <p className="text-white/40 text-[7px] font-bold uppercase truncate">{item.category}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-20 grayscale">
            <PackageCheck className="h-32 w-32 text-primary" />
            <div className="space-y-2">
              <h2 className="text-3xl font-black font-headline uppercase tracking-tighter">No active rentals</h2>
              <p className="text-sm font-bold uppercase tracking-widest">Your permanent gear library is currently offline. Initialize a node to begin collection.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

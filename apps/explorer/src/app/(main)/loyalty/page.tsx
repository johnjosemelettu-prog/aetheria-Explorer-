'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Gift, 
  Users, 
  Plane, 
  BedDouble, 
  Ship, 
  Car, 
  UtensilsCrossed, 
  Copy, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp, increment } from 'firebase/firestore';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LoyaltyPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);

  const loyaltyRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid, 'loyalty', 'status') : null),
    [user, firestore]
  );
  
  const { data: loyaltyData, isLoading } = useDoc(loyaltyRef);

  const points = loyaltyData?.points || 0;
  
  const getTier = (pts: number) => {
    if (pts >= 5000) return { name: 'Platinum', next: null, threshold: 5000 };
    if (pts >= 2500) return { name: 'Gold', next: 'Platinum', threshold: 5000 };
    if (pts >= 1000) return { name: 'Silver', next: 'Gold', threshold: 2500 };
    return { name: 'Bronze', next: 'Silver', threshold: 1000 };
  };

  const currentTier = getTier(points);
  const progress = Math.min((points / currentTier.threshold) * 100, 100);

  const referralCode = user?.uid.substring(0, 8).toUpperCase() || 'BPCKPR';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`https://backpacker.app/signup?ref=${referralCode}`);
    toast({
      title: t('loyalty.referral.copied'),
    });
  };

  const handleClaimReferral = async () => {
    if (!user || !loyaltyRef) return;
    setIsClaiming(true);
    
    // Simulate finding a referral
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setDocumentNonBlocking(loyaltyRef, {
      points: increment(250),
      tier: getTier(points + 250).name,
      updatedAt: serverTimestamp()
    }, { merge: true });

    toast({
      title: "Bonus Claimed!",
      description: "250 points added for your successful referral.",
    });
    setIsClaiming(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Gift className="text-primary h-10 w-10" />
          {t('loyalty.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('loyalty.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tier Status Card */}
        <Card className="md:col-span-2 overflow-hidden">
          <div className="bg-primary p-8 text-primary-foreground">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest opacity-80">{t('loyalty.tier')}</p>
                <h2 className="text-4xl font-headline font-bold mt-1">{currentTier.name}</h2>
              </div>
              <Trophy className="h-12 w-12 text-accent" />
            </div>
            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>{points} Points</span>
                {currentTier.next && <span>{currentTier.threshold} pts for {currentTier.next}</span>}
              </div>
              <Progress value={progress} className="bg-white/20 h-3" />
            </div>
          </div>
          <CardContent className="p-8">
            <h3 className="font-bold text-lg mb-4">{t('loyalty.howToEarn')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <Plane className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t('loyalty.waysToEarn.flight')}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <BedDouble className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t('loyalty.waysToEarn.hotel')}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <Ship className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t('loyalty.waysToEarn.cruise')}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <Car className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t('loyalty.waysToEarn.cab')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary" />
              {t('loyalty.referral.title')}
            </CardTitle>
            <CardDescription>
              {t('loyalty.referral.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-6">
            <div className="p-4 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 text-center">
              <p className="text-xs uppercase font-bold text-muted-foreground mb-2">{t('loyalty.referral.yourCode')}</p>
              <p className="text-3xl font-headline font-bold tracking-widest text-primary">{referralCode}</p>
            </div>
            <Button onClick={handleCopyCode} variant="outline" className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              {t('loyalty.referral.copy')}
            </Button>
          </CardContent>
          <CardFooter className="pt-0">
            <Button onClick={handleClaimReferral} disabled={isClaiming} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isClaiming ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {t('loyalty.referral.claim')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-headline font-bold mb-6">Tier Benefits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => (
            <Card key={tier} className={cn(
              "transition-all",
              currentTier.name === tier ? "border-primary shadow-lg scale-105 z-10" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
            )}>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{tier}</CardTitle>
                <CardDescription>{tier === 'Bronze' ? '0' : tier === 'Silver' ? '1,000' : tier === 'Gold' ? '2,500' : '5,000'} points</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Standard Rewards</span>
                </div>
                {tier !== 'Bronze' && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Priority Support</span>
                  </div>
                )}
                {tier === 'Gold' || tier === 'Platinum' ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Lounge Access</span>
                  </div>
                ) : null}
                {tier === 'Platinum' && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Concierge AI</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

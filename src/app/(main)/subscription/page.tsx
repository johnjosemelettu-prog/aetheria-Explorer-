'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Zap, 
  Crown, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Backpack, 
  Plane, 
  CreditCard,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
  Compass,
  Rocket,
  Activity,
  Heart,
  UserCheck
} from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, serverTimestamp, collection, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { synthesizeSubscriptionEmail } from '@/ai/flows/subscription-email-flow';

type Tier = 'free' | 'voyager' | 'pathfinder' | 'sovereign' | 'legend';

const plans = [
  {
    id: 'free',
    icon: Plane,
    color: 'text-slate-500',
    accent: 'bg-slate-100',
    features: [
      { key: 'itineraries', valueKey: 'subscription.plans.free.itinerariesValue' },
      { key: 'immersive', valueKey: 'subscription.plans.free.immersiveValue' },
      { key: 'loyalty', valueKey: 'subscription.plans.free.loyaltyValue' },
    ],
  },
  {
    id: 'voyager',
    icon: Compass,
    color: 'text-blue-500',
    accent: 'bg-blue-50',
    features: [
      { key: 'itineraries', valueKey: 'subscription.plans.voyager.itinerariesValue' },
      { key: 'immersive', valueKey: 'subscription.plans.voyager.immersiveValue' },
      { key: 'packing', valueKey: 'subscription.plans.voyager.packingValue' },
      { key: 'loyalty', valueKey: 'subscription.plans.voyager.loyaltyValue' },
    ],
  },
  {
    id: 'pathfinder',
    icon: Zap,
    color: 'text-primary',
    accent: 'bg-primary/10',
    popular: true,
    features: [
      { key: 'itineraries', valueKey: 'subscription.plans.pathfinder.itinerariesValue' },
      { key: 'immersive', valueKey: 'subscription.plans.pathfinder.immersiveValue' },
      { key: 'insider', valueKey: 'subscription.plans.pathfinder.insiderValue' },
      { key: 'loyalty', valueKey: 'subscription.plans.pathfinder.loyaltyValue' },
    ],
  },
  {
    id: 'sovereign',
    icon: Rocket,
    color: 'text-purple-600',
    accent: 'bg-purple-50',
    features: [
      { key: 'itineraries', valueKey: 'subscription.plans.sovereign.itinerariesValue' },
      { key: 'immersive', valueKey: 'subscription.plans.sovereign.immersiveValue' },
      { key: 'mirror', valueKey: 'subscription.plans.sovereign.mirrorValue' },
      { key: 'fees', valueKey: 'subscription.plans.sovereign.feesValue' },
    ],
  },
  {
    id: 'legend',
    icon: Crown,
    color: 'text-amber-600',
    accent: 'bg-amber-100',
    features: [
      { key: 'itineraries', valueKey: 'subscription.plans.legend.itinerariesValue' },
      { key: 'immersive', valueKey: 'subscription.plans.legend.immersiveValue' },
      { key: 'mirror', valueKey: 'subscription.plans.legend.mirrorValue' },
      { key: 'insider', valueKey: 'subscription.plans.legend.insiderValue' },
      { key: 'fees', valueKey: 'subscription.plans.legend.feesValue' },
    ],
  },
];

export default function SubscriptionPage() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const activeTripQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(1));
    },
    [user, firestore]
  );
  const { data: trips, isLoading: isItineraryLoading } = useCollection(activeTripQuery);

  const activeTrip = trips?.[0];
  const currentTier = (activeTrip?.subscriptionTier as Tier) || 'free';

  const handleSubscribe = async (tier: string) => {
    if (!user || !activeTrip || !firestore) return;
    if (tier === currentTier) return;

    setIsProcessing(tier);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const itineraryRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', activeTrip.id);
      updateDocumentNonBlocking(itineraryRef, {
        subscriptionTier: tier,
        updatedAt: serverTimestamp(),
      });

      try {
        await synthesizeSubscriptionEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          tierName: tier.toUpperCase(),
          tripName: activeTrip.name,
          type: 'activation',
          language: currentLang
        });
      } catch (err) {}

      toast({
        title: t('common.verified'),
        description: `Successfully upgraded ${activeTrip?.name} to ${t(`subscription.plans.${tier}.name`)}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: "There was an issue processing your request.",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">{t('subscription.badge')}</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-7xl text-slate-900 leading-none italic uppercase">
          {t('subscription.title')}
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
          {t('subscription.subtitle')}
        </p>
      </div>

      {!activeTrip && !isItineraryLoading ? (
        <Card className="mb-12 border-none shadow-2xl rounded-[3rem] bg-amber-50 overflow-hidden">
          <CardContent className="p-12 flex flex-col md:flex-row items-center gap-10">
            <div className="h-24 w-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-amber-600 flex-shrink-0 animate-pulse">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-3xl font-black font-headline text-amber-900 uppercase tracking-tighter italic">{t('subscription.itineraryRequired')}</h3>
              <p className="text-lg text-amber-800/70 font-medium">{t('subscription.itineraryRequiredDesc')}</p>
            </div>
            <Button asChild size="lg" className="rounded-2xl h-16 px-10 font-black text-xl bg-amber-600 hover:bg-amber-700 shadow-2xl shadow-amber-600/20">
              <Link href="/itinerary-generator" className="flex items-center gap-3">
                {t('subscription.createItineraryBtn')} <ArrowRight className="h-6 w-6" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
            {plans.map((plan) => {
              const isCurrent = currentTier === plan.id;
              const PlanIcon = plan.icon;

              return (
                <Card key={plan.id} className={cn(
                  "relative border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-500 bg-white flex flex-col group",
                  plan.popular ? "ring-4 ring-primary ring-offset-4 scale-105 z-10" : "opacity-90 hover:opacity-100",
                  isCurrent && "border-2 border-emerald-500"
                )}>
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-white border-none font-bold uppercase tracking-tighter text-[8px] px-2 py-0.5">Most Targeted</Badge>
                    </div>
                  )}
                  <CardHeader className={cn("p-6", plan.accent)}>
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 bg-white shadow-md group-hover:scale-110 transition-transform", plan.color)}>
                      <PlanIcon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-black font-headline text-slate-900 leading-tight">{t(`subscription.plans.${plan.id}.name`)}</CardTitle>
                    <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed line-clamp-2">{t(`subscription.plans.${plan.id}.description`)}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6 flex-grow">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black font-headline text-slate-900">{t(`subscription.plans.${plan.id}.price`)}</span>
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{t('subscription.period.monthly')}</span>
                    </div>

                    <div className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1 h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={4} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{t(`subscription.features.${feature.key}`)}</p>
                            <p className="text-[10px] font-bold text-slate-700 leading-tight">{t(feature.valueKey as any)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button 
                      className={cn(
                        "w-full h-12 rounded-xl font-black text-sm uppercase tracking-tighter transition-all",
                        isCurrent ? "bg-emerald-50 text-emerald-600 cursor-default" : "shadow-lg shadow-primary/10",
                      )}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrent || !!isProcessing}
                    >
                      {isProcessing === plan.id ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : isCurrent ? (
                        <><UserCheck className="mr-2 h-4 w-4" /> {t('subscription.currentPlan')}</>
                      ) : (
                        t('subscription.upgrade')
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Infrastructure Protocol</Badge>
                <h2 className="text-4xl md:text-5xl font-black font-headline text-slate-900 italic uppercase leading-[0.9]">Synthesis <br />Quality Nodes.</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  Higher tier passes unlock prioritized neural compute, allowing for hour-by-hour itinerary synthesis and cinematic 1080p video rendering via Veo 3.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white shadow-xl border border-slate-50 flex items-start gap-4 group hover:bg-primary/5 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner"><Activity className="h-5 w-5" /></div>
                  <div>
                    <p className="font-black text-slate-900 uppercase tracking-tighter text-sm italic">High compute</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sovereign & Legend</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white shadow-xl border border-slate-100 flex items-start gap-4 group hover:bg-emerald-50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner"><Heart className="h-5 w-5" /></div>
                  <div>
                    <p className="font-black text-slate-900 uppercase tracking-tighter text-sm italic">Bio-Sync Logic</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Legend Exclusive</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white p-12 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <ShieldCheck className="h-48 w-48 text-primary" />
              </div>
              <div className="relative z-10 space-y-8">
                <Badge className="bg-primary text-white border-none font-bold uppercase text-[9px] px-3">Guardian Grid</Badge>
                <h3 className="text-4xl font-black font-headline leading-tight italic uppercase tracking-tighter">Identity & <br />Asset Security.</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  All subscription payments are processed via encrypted settlement nodes. Trip passes are non-transferable and tied to your unique explorer DNA.
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary"><Sparkles className="h-6 w-6" /></div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Protocol v2.4 Compliant</p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}

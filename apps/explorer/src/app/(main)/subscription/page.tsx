'use client'

import React, { useState } from 'react'
import { Check, Sparkles, Zap, ShieldCheck, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { usePremiumStatus, SUBSCRIPTION_PLANS, SubscriptionTier } from '@/hooks/use-premium-status'
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase'
import { doc, serverTimestamp } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const tierFeatures: Record<SubscriptionTier, string[]> = {
  free: [
    'AI Itinerary Generation (Standard)',
    'Marketplace Access',
    'Budget Synthesis',
  ],
  pathfinder: [
    'All Explorer Features',
    'AR Wayfinding',
    'AI Guide (Standard)',
    'Local Legends Access',
  ],
  sovereign: [
    'All Pathfinder Features',
    'Vision Hub & Scanner',
    'Cultural Pulse Radio',
    'AI Audio Guide',
    'Heritage Mirror',
  ],
  legend: [
    'All Sovereign Features',
    'Digital Tailor',
    'Real-time Translator',
    'AI Postcard Studio',
    'High-Fidelity Video Teaser',
    'VIP Priority Support',
  ],
}

export default function SubscriptionPage() {
  const { activeTrip, activeTier, isLoading } = usePremiumStatus()
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState<SubscriptionTier | null>(null)

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!user || !firestore || !activeTrip) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Please sign in to manage subscriptions.',
      })
      return
    }

    setIsProcessing(tier)
    try {
      const tripRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', activeTrip.id)
      await setDocumentNonBlocking(tripRef, {
        subscriptionTier: tier,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      toast({
        title: 'Upgrade Successful!',
        description: `Your trip to ${activeTrip.destination} is now on the ${SUBSCRIPTION_PLANS[tier].name} plan.`,
      })
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      toast({
        variant: 'destructive',
        title: 'Upgrade Failed',
        description: 'Could not update your trip subscription. Please try again.',
      })
    } finally {
      setIsProcessing(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-24 w-1/2 mx-auto mb-16" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Skeleton className="h-[450px] rounded-[2rem]" />
          <Skeleton className="h-[450px] rounded-[2rem]" />
          <Skeleton className="h-[450px] rounded-[2rem]" />
          <Skeleton className="h-[450px] rounded-[2rem]" />
        </div>
      </div>
    )
  }

  if (!activeTrip) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl font-bold">No Active Trip</h2>
        <p>Create an itinerary to see subscription options.</p>
      </div>
    )
  }

  const TIER_HIERARCHY: SubscriptionTier[] = ['free', 'pathfinder', 'sovereign', 'legend'];
  const currentTierIndex = TIER_HIERARCHY.indexOf(activeTier);

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-16 space-y-4">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Trip Synthesis Matrix
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Upgrade the AI capabilities for your odyssey to <span className="font-bold text-primary">{activeTrip.destination}</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
        {Object.entries(SUBSCRIPTION_PLANS).map(([tierId, plan], index) => {
          const isCurrentPlan = activeTier === tierId;
          const isBelowCurrent = index < currentTierIndex;
          const tier = tierId as SubscriptionTier;

          return (
            <Card
              key={tierId}
              className={cn(
                'border-2 shadow-2xl rounded-[3rem] flex flex-col transition-all duration-300',
                isCurrentPlan ? 'border-primary shadow-primary/20 scale-105' : 'border-slate-100'
              )}
            >
              <CardHeader className="p-8 text-center">
                <h3 className="font-headline text-3xl font-black uppercase tracking-tighter italic">{plan.name}</h3>
                <p className="text-5xl font-black font-headline text-primary">${plan.price}<span className="text-sm font-bold text-slate-400">/trip</span></p>
                <p className="text-xs text-slate-400 font-medium h-10">{plan.description}</p>
              </CardHeader>
              <CardContent className="p-8 flex-grow space-y-6">
                <ul className="space-y-4">
                  {tierFeatures[tier].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-8">
                {isCurrentPlan ? (
                  <div className="w-full text-center font-bold text-primary border-2 border-primary/20 bg-primary/5 rounded-xl h-14 flex items-center justify-center">
                    <ShieldCheck className="mr-2 h-5 w-5" /> Current Plan
                  </div>
                ) : isBelowCurrent ? (
                  <div className="w-full text-center font-bold text-slate-400 border-2 border-slate-100 bg-slate-50 rounded-xl h-14 flex items-center justify-center">
                    Downgrade
                  </div>
                ) : (
                  <Button
                    className="w-full h-14 rounded-2xl font-black text-lg shadow-xl"
                    onClick={() => handleUpgrade(tier)}
                    disabled={isProcessing !== null}
                  >
                    {isProcessing === tier ? <Loader2 className="animate-spin" /> : 'Upgrade'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

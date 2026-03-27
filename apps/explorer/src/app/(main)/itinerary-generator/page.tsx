
'use client'

import { useState, useEffect } from 'react'
import {
  generatePersonalizedItinerary,
} from '@/ai/flows/generate-personalized-itinerary-flow'
import type { GeneratePersonalizedItineraryOutput } from '@/ai/flows/itinerary-schemas'
import {
  refineExistingItinerary,
} from '@/ai/flows/refine-existing-itinerary-flow'
import { useToast } from '@/hooks/use-toast'
import ItineraryForm from '@/components/itinerary/ItineraryForm'
import type { ItineraryFormValues } from '@/components/itinerary/ItineraryForm'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay'
import { useFirebase, setDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase'
import { collection, doc, serverTimestamp } from 'firebase/firestore'
import { Skeleton } from '@/components/ui/skeleton'

export default function ItineraryGeneratorPage() {
  const [itineraryId, setItineraryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const { toast } = useToast()
  const { t, language } = useTranslation()
  const { user, firestore } = useFirebase();

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const itineraryRef = useMemoFirebase(
    () => (itineraryId && user && firestore ? doc(firestore, 'userProfiles', user.uid, 'itineraries', itineraryId) : null),
    [itineraryId, firestore, user]
  );
  const { data: itineraryDoc, isLoading: isItineraryLoading } = useDoc(itineraryRef);

  const itineraryOutput: GeneratePersonalizedItineraryOutput | null = itineraryDoc ? {
      itinerarySummary: itineraryDoc.itinerarySummary || itineraryDoc.description,
      dailyPlans: itineraryDoc.dailyPlans || [],
  } : null;

  const handleGenerate = async (data: ItineraryFormValues) => {
    if (!user || !firestore) {
      toast({
        title: t('itineraryGenerator.authError'),
        description: t('itineraryGenerator.authErrorDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true)
    setItineraryId(null)

    try {
      const startDate = data.dates?.from?.toISOString().split('T')[0] ?? '';
      const endDate = data.dates?.to?.toISOString().split('T')[0] ?? '';
      const result = await generatePersonalizedItinerary({
        destination: data.destination,
        startDate: startDate,
        endDate: endDate,
        interests: data.interests,
        budget: data.budget,
        travelStyle: [data.travelStyle],
        vibe: data.vibe,
        language: currentLang,
      })

      const newItineraryDoc = {
        itinerarySummary: result.itinerarySummary,
        dailyPlans: result.dailyPlans,
        destination: data.destination,
        startDate: startDate,
        endDate: endDate,
        interests: data.interests,
        budget: data.budget,
        travelStyle: [data.travelStyle],
        vibe: data.vibe || '',
        userId: user.uid,
        ownerId: user.uid,
        members: [user.uid],
        name: `${data.destination} ${t('itineraryGenerator.odysseySuffix')}`,
        status: 'draft',
        isGeneratedByAI: true,
        subscriptionTier: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const itinerariesRef = collection(firestore, 'userProfiles', user.uid, 'itineraries');
      const newItineraryRef = doc(itinerariesRef);
      setDocumentNonBlocking(newItineraryRef, newItineraryDoc, { merge: true });
      
      setItineraryId(newItineraryRef.id);

      toast({
        title: t('itineraryGenerator.toast.generateSuccessTitle'),
        description: t('itineraryGenerator.toast.generateSuccessDescription', { destination: data.destination }),
      });

    } catch (error) {
      console.error('Error generating itinerary:', error)
      toast({
        title: t('itineraryGenerator.toast.generateErrorTitle'),
        description: t('itineraryGenerator.toast.generateErrorDescription'),
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  const handleRefine = async (refinementRequest: string) => {
    if (!itineraryDoc || !itineraryId || !user || !firestore) return

    setIsRefining(true)
    try {
      const result = await refineExistingItinerary({
        currentItinerary: JSON.stringify(itineraryDoc),
        refinementRequest,
        language: currentLang,
      })
      
      const refinedData = result.refinedItinerary
      
      const itineraryRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', itineraryId);
      setDocumentNonBlocking(itineraryRef, {
        itinerarySummary: refinedData.itinerarySummary,
        dailyPlans: refinedData.dailyPlans,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: t('itineraryGenerator.toast.refineSuccessTitle'),
        description: result.explanation,
      })
    } catch (error) {
      console.error('Error refining itinerary:', error)
      toast({
        title: t('itineraryGenerator.toast.refineErrorTitle'),
        description: t('itineraryGenerator.toast.refineErrorDescription'),
        variant: 'destructive',
      })
    }
    setIsRefining(false)
  }

  if (!hasMounted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto mb-12" />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="h-[600px] w-full rounded-3xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          {t('itineraryGenerator.title')}
        </h1>
        <p className="mt-4 text-xl text-slate-500 font-medium">
          {t('itineraryGenerator.subtitle')}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-1">
          <ItineraryForm onSubmit={handleGenerate} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <ItineraryDisplay
            itinerary={itineraryOutput}
            itineraryId={itineraryId}
            members={itineraryDoc?.members || []}
            isLoading={isLoading || (itineraryId ? isItineraryLoading : false)}
            isRefining={isRefining}
            onRefine={handleRefine}
            tripVibe={itineraryDoc?.vibe}
          />
        </div>
      </div>
    </div>
  )
}

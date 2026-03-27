'use client'

import { useState } from 'react'
import type { GeneratePersonalizedItineraryOutput } from '@/ai/flows/itinerary-schemas'
import {
  suggestItineraryAdjustment,
  SuggestItineraryAdjustmentOutput,
} from '@/ai/flows/suggest-itinerary-adjustment-flow'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Bot, Clock, Send, Sparkles, StickyNote, Ticket, Lightbulb, CloudRain, Zap, ArrowRight, Loader2, Wand2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { Collaborators } from './Collaborators'
import { updateDocumentNonBlocking, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'

interface ItineraryDisplayProps {
  itinerary: GeneratePersonalizedItineraryOutput | null
  itineraryId: string | null;
  members: string[];
  isLoading: boolean
  isRefining: boolean
  onRefine: (refinementRequest: string) => void
  tripVibe?: string;
}

export default function ItineraryDisplay({
  itinerary,
  itineraryId,
  members,
  isLoading,
  isRefining,
  onRefine,
  tripVibe,
}: ItineraryDisplayProps) {
  const [refinementRequest, setRefinementRequest] = useState('')
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [suggestion, setSuggestion] = useState<SuggestItineraryAdjustmentOutput | null>(null);

  const { toast } = useToast()
  const { t, language } = useTranslation()
  const { user } = useUser()
  const firestore = useFirestore()

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const itineraryRef = useMemoFirebase(
    () => (itineraryId && user && firestore ? doc(firestore, 'userProfiles', user.uid, 'itineraries', itineraryId) : null),
    [itineraryId, firestore, user]
  );
  const { data: itineraryDoc } = useDoc(itineraryRef);

  const isFreeTier = !itineraryDoc?.subscriptionTier || itineraryDoc?.subscriptionTier === 'free';

  const handleRefineClick = () => {
    if (refinementRequest.trim()) {
      onRefine(refinementRequest)
      setRefinementRequest('')
    }
  }

  const handleBookActivity = (activityDescription: string) => {
    toast({
      title: t('itineraryGenerator.toast.bookingInitiated'),
      description: t('itineraryGenerator.toast.reserving', { activity: activityDescription }),
    })
  }

  const handleSuggestAdjustment = async () => {
    if (!itinerary) return;
    setIsAdjusting(true);
    try {
      const result = await suggestItineraryAdjustment({
        currentItinerary: JSON.stringify(itinerary),
        context: t('itineraryGenerator.display.recalibrateContext'),
        language: currentLang,
      });
      setSuggestion(result);
    } catch (error) {
      console.error("Error suggesting adjustment:", error);
      toast({
        title: t('itineraryGenerator.toast.adjustmentFailed'),
        description: t('itineraryGenerator.toast.adjustmentFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!suggestion || !itineraryId || !user || !firestore) return;

    const itineraryRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', itineraryId);
    updateDocumentNonBlocking(itineraryRef, {
      ...suggestion.updatedItinerary,
      updatedAt: new Date().toISOString(),
    });

    toast({
      title: t('itineraryGenerator.toast.pathRecalibrated'),
      description: t('itineraryGenerator.toast.pathRecalibratedDesc'),
    });
    setSuggestion(null);
  };


  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!itinerary) {
    return (
      <Card className="flex h-full min-h-[500px] items-center justify-center border-none shadow-xl rounded-[2.5rem] bg-white">
        <div className="text-center p-12 opacity-30 grayscale flex flex-col items-center gap-6">
          <Bot className="h-20 w-20 text-primary" />
          <div className="space-y-2">
            <h3 className="text-3xl font-black font-headline uppercase tracking-tighter italic">{t('itineraryGenerator.display.pendingTitle')}</h3>
            <p className="text-lg font-medium max-w-xs mx-auto">
              {t('itineraryGenerator.display.pendingDesc')}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
        {isFreeTier && (
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Sparkles className="h-32 w-32" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-xl">
                    <Zap className="h-8 w-8 text-white fill-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black font-headline tracking-tighter uppercase italic">{t('itineraryGenerator.display.upgradeTitle')}</h4>
                    <p className="text-sm text-slate-400 font-medium">{t('itineraryGenerator.display.upgradeDesc')}</p>
                  </div>
                </div>
                <Button asChild className="bg-white text-slate-900 hover:bg-slate-200 font-black h-14 px-8 rounded-2xl shadow-2xl transition-all active:scale-95">
                  <Link href="/subscription" className="flex items-center gap-2">
                    {t('itineraryGenerator.display.upgradeBtn')} <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="p-10 pb-6">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[10px] px-4 py-1">{t('itineraryGenerator.display.resultBadge')}</Badge>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>
            <CardTitle className="font-headline text-4xl font-black tracking-tight leading-tight italic uppercase text-slate-900">
              {t('itineraryGenerator.display.pathTitle')}
            </CardTitle>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mt-4 italic">"{itinerary.itinerarySummary}"</p>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-10">
            <Alert className="border-none shadow-lg bg-blue-50 text-blue-900 rounded-[2rem] p-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700"><CloudRain className="h-24 w-24" /></div>
              <div className="relative z-10 flex gap-6 items-start">
                <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-sm"><Lightbulb className="h-8 w-8" /></div>
                <div className="flex-1">
                  <AlertTitle className="text-xl font-black font-headline tracking-tighter uppercase mb-2">{t('itineraryGenerator.display.recalibrateTitle')}</AlertTitle>
                  <AlertDescription className="text-blue-800/70 font-medium text-sm leading-relaxed mb-4">
                    {t('itineraryGenerator.display.recalibrateDesc')}
                  </AlertDescription>
                  <Button 
                    variant="outline"
                    className="rounded-xl border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-black h-11 transition-all active:scale-95" 
                    onClick={handleSuggestAdjustment} 
                    disabled={isAdjusting}
                  >
                    {isAdjusting ? (
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : (
                      <CloudRain className="mr-2 h-4 w-4" />
                    )}
                    {t('itineraryGenerator.display.recalibrateBtn')}
                  </Button>
                </div>
              </div>
            </Alert>

            <Accordion type="single" collapsible defaultValue="day-0" className="w-full space-y-4">
              {itinerary.dailyPlans.map((day, index) => (
                <AccordionItem key={index} value={`day-${index}`} className="border-none bg-slate-50 rounded-[2.5rem] overflow-hidden group">
                  <AccordionTrigger className="hover:no-underline px-8 py-6 data-[state=open]:bg-slate-100 transition-all">
                    <div className="flex items-center gap-6 text-left">
                      <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary font-black font-headline group-hover:bg-primary group-hover:text-white transition-all text-xl">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none mb-1">{format(parseISO(day.date), 'MMMM do')}</p>
                        <h4 className="text-xl font-black font-headline text-slate-900 leading-tight uppercase italic">{day.theme}</h4>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-10 pt-6">
                    <div className="space-y-8 relative">
                      <div className="absolute left-7 top-0 bottom-0 w-px bg-slate-200 -z-10" />
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex gap-8 group/act">
                          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-shrink-0 items-center justify-center text-slate-400 group-hover/act:border-primary group-hover/act:text-primary transition-all">
                             <Clock className="h-6 w-6" />
                          </div>
                          <div className="flex-grow flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">{activity.time}</p>
                              <p className="text-lg font-bold text-slate-700 leading-tight">{activity.description}</p>
                            </div>
                            <Button
                              variant="outline"
                              className="rounded-xl h-11 px-6 font-black border-2 border-slate-100 hover:border-primary hover:text-primary transition-all active:scale-95"
                              onClick={() => handleBookActivity(activity.description)}
                            >
                              <Ticket className="mr-2 h-4 w-4" />
                              {t('itineraryGenerator.display.reserveBtn')}
                            </Button>
                          </div>
                        </div>
                      ))}
                       {day.notes && (
                        <div className="ml-22 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex gap-4">
                          <StickyNote className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{t('itineraryGenerator.display.notes')}</p>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{day.notes}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {itineraryId && (
              <Collaborators itineraryId={itineraryId} memberIds={members} tripVibe={tripVibe} />
            )}

            <div className="mt-16 pt-10 border-t border-slate-100 space-y-8">
              <div className="space-y-2">
                <h4 className="text-2xl font-black font-headline text-slate-900 flex items-center gap-3 italic uppercase tracking-tighter">
                  <Wand2 className="h-6 w-6 text-primary" />
                  {t('itineraryGenerator.display.adjustTitle')}
                </h4>
                <p className="text-slate-500 font-medium text-sm">
                  {t('itineraryGenerator.display.adjustDesc')}
                </p>
              </div>
              <div className="space-y-4">
                <Textarea
                  placeholder={t('itineraryGenerator.display.adjustPlaceholder')}
                  value={refinementRequest}
                  onChange={(e) => setRefinementRequest(e.target.value)}
                  disabled={isRefining}
                  className="rounded-[2rem] h-32 p-8 bg-slate-50 border-none font-medium focus:ring-2 ring-primary transition-all shadow-inner text-lg"
                />
                <Button 
                  onClick={handleRefineClick} 
                  disabled={isRefining || !refinementRequest.trim()}
                  className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  {isRefining ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <Send className="mr-2 h-6 w-6" />}
                  {isRefining ? t('itineraryGenerator.display.processing') : t('itineraryGenerator.display.updateBtn')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={!!suggestion} onOpenChange={(open) => !open && setSuggestion(null)}>
        <AlertDialogContent className="rounded-[2.5rem] p-10 max-w-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-inner"><CloudRain className="h-8 w-8" /></div>
            <AlertDialogTitle className="text-3xl font-black font-headline uppercase tracking-tighter italic">{t('itineraryGenerator.display.proposedTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-slate-500 leading-relaxed italic mt-4">
              "{suggestion?.reason}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-xl h-14 px-8 font-bold border-2" onClick={() => setSuggestion(null)}>{t('itineraryGenerator.display.rejectBtn')}</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl h-14 px-10 font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95" onClick={handleAcceptSuggestion}>{t('itineraryGenerator.display.authorizeBtn')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const LoadingSkeleton = () => (
  <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
    <CardHeader className="p-10 bg-slate-50">
      <Skeleton className="h-10 w-1/2 rounded-xl" />
      <Skeleton className="h-4 w-full mt-6" />
      <Skeleton className="h-4 w-3/4 mt-2" />
    </CardHeader>
    <CardContent className="p-10 space-y-6">
      <Skeleton className="h-20 w-full rounded-[2rem]" />
      <Skeleton className="h-20 w-full rounded-[2rem]" />
      <Skeleton className="h-20 w-full rounded-[2rem]" />
    </CardContent>
  </Card>
)

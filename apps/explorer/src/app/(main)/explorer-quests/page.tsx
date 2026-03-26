'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Compass, Loader2, CheckCircle2, Sparkles, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { generateExplorerQuest, type ExplorerQuestOutput } from '@/ai/flows/explorer-quest-flow'
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function ExplorerQuestsPage() {
  const { t, language } = useTranslation()
  const { user } = useUser()
  const firestore = useFirestore()
  const [hasMounted, setHasMounted] = useState(false)
  const [city, setCity] = useState('Kyoto')
  const [isLoading, setIsLoading] = useState(false)
  const [questData, setQuestData] = useState<ExplorerQuestOutput | null>(null)
  const [completedIds, setCompletedIds] = useState<string[]>([])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const userProfileRef = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return doc(firestore, 'userProfiles', user.uid);
    },
    [user, firestore]
  )
  const { data: userProfile } = useDoc(userProfileRef)

  const handleGenerate = async () => {
    if (!city.trim()) return
    setIsLoading(true)
    try {
      const data = await generateExplorerQuest({
        city,
        interests: userProfile?.preferredInterests || [],
        language: currentLang,
      })
      setQuestData(data)
      setCompletedIds([])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleQuest = (id: string) => {
    setCompletedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  if (!hasMounted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/2 mx-auto mb-12" />
        <Card className="max-w-md mx-auto">
          <CardContent className="p-12">
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPoints = questData?.quests.reduce((acc, q) => acc + q.points, 0) || 0
  const currentPoints = questData?.quests
    .filter(q => completedIds.includes(q.id))
    .reduce((acc, q) => acc + q.points, 0) || 0
  
  const progressValue = questData ? (completedIds.length / questData.quests.length) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-5xl flex items-center justify-center gap-3 text-slate-900 leading-tight uppercase italic">
          <Trophy className="text-accent h-10 w-10" />
          {t('explorerQuests.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-medium">
          {t('explorerQuests.subtitle')}
        </p>
      </div>

      {!questData ? (
        <Card className="max-w-md mx-auto border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <CardTitle className="text-xl uppercase tracking-tighter italic">{t('explorerQuests.initTitle')}</CardTitle>
            <CardDescription className="text-slate-400">{t('explorerQuests.initDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input 
                placeholder={t('explorerQuests.cityPlaceholder')} 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                className="pl-10 h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"
              />
            </div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button onClick={handleGenerate} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Sparkles className="mr-2 h-5 w-5" /> {t('explorerQuests.generateBtn')}</>}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-headline italic uppercase tracking-tighter">{questData.title}</CardTitle>
                <Button variant="secondary" size="sm" onClick={() => setQuestData(null)} className="rounded-xl font-bold h-9">
                  {t('explorerQuests.newCityBtn')}
                </Button>
              </div>
              <CardDescription className="text-primary-foreground/80 font-medium text-lg italic">"{questData.description}"</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                <span>{t('explorerQuests.progress', { completed: completedIds.length, total: questData.quests.length })}</span>
                <span className="text-accent">{t('explorerQuests.xp', { current: currentPoints, total: totalPoints })}</span>
              </div>
              <Progress value={progressValue} className="bg-white/20 h-2 rounded-full" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {questData.quests.map((quest, index) => {
              const isDone = completedIds.includes(quest.id)
              return (
                <Card 
                  key={quest.id} 
                  className={cn(
                    "cursor-pointer border-none shadow-lg rounded-3xl transition-all hover:shadow-xl hover:-translate-y-1 bg-white",
                    isDone ? "opacity-60 grayscale-[0.5]" : ""
                  )}
                  onClick={() => toggleQuest(quest.id)}
                >
                  <CardContent className="p-6 flex items-start gap-6">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl border-2 flex-shrink-0 transition-colors shadow-inner",
                      isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-primary/20 text-primary bg-slate-50"
                    )}>
                      {isDone ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-black font-headline">{index + 1}</span>}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={cn("font-black text-lg uppercase italic tracking-tighter text-slate-900", isDone && "line-through text-slate-400")}>{quest.task}</h3>
                        <Badge variant="outline" className="ml-2 text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-400 flex-shrink-0">
                          {quest.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed italic mb-3">{t('explorerQuests.hint', { hint: quest.hint })}</p>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        {t('explorerQuests.xpSynthesized', { points: quest.points })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {completedIds.length === questData.quests.length && (
            <div className="text-center py-16 bg-emerald-50 rounded-[3rem] border-2 border-dashed border-emerald-200 animate-in zoom-in duration-700">
              <Trophy className="h-20 w-20 text-accent mx-auto mb-6 drop-shadow-xl animate-bounce" />
              <h2 className="text-4xl font-black font-headline text-emerald-900 uppercase italic tracking-tighter">{t('explorerQuests.resolvedTitle')}</h2>
              <p className="text-emerald-700 font-medium mt-2">{t('explorerQuests.resolvedDesc', { city })}</p>
              <Button asChild className="mt-8 rounded-2xl font-black h-14 px-10 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200">
                <Link href="/dashboard">{t('explorerQuests.returnBtn')} <Sparkles className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

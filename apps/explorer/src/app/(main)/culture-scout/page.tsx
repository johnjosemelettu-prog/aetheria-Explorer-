
'use client'

import React, { useState, useEffect } from 'react'
import { Landmark, Info, CheckCircle, XCircle, BookOpen, Globe, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { getCultureAdvice, type CultureScoutOutput } from '@/ai/flows/culture-scout-flow'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

export default function CultureScoutPage() {
  const { t, language } = useTranslation()
  const [hasMounted, setHasMounted] = useState(false)
  const [city, setCity] = useState('Bangkok')
  const [isLoading, setIsLoading] = useState(false)
  const [advice, setAdvice] = useState<CultureScoutOutput | null>(null)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!city.trim()) return
    setIsLoading(true)
    try {
      const data = await getCultureAdvice({ city, language: currentLang })
      setAdvice(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasMounted) return null

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Globe className="text-primary h-10 w-10" />
          {t('cultureScout.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('cultureScout.subtitle')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder={t('cultureScout.inputPlaceholder')} 
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Button type="submit" className="h-12 px-8 rounded-xl font-bold" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : t('cultureScout.button')}
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      ) : advice ? (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
          <Card className="border-primary/20 bg-primary/5 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="text-primary" />
                {t('cultureScout.vibeTitle', { city })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{advice.overview}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-500/20 bg-green-50/30 dark:bg-green-950/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2 text-lg font-black uppercase tracking-tighter">
                  <CheckCircle className="h-5 w-5" />
                  {t('cultureScout.dos')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {advice.dos.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1 font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-50/30 dark:bg-red-950/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2 text-lg font-black uppercase tracking-tighter">
                  <XCircle className="h-5 w-5" />
                  {t('cultureScout.donts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {advice.donts.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-1 font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="etiquette" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-muted p-1 rounded-xl">
              <TabsTrigger value="etiquette" className="rounded-lg font-bold">{t('cultureScout.tabs.etiquette')}</TabsTrigger>
              <TabsTrigger value="phrases" className="rounded-lg font-bold">{t('cultureScout.tabs.phrases')}</TabsTrigger>
            </TabsList>
            <TabsContent value="etiquette" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advice.etiquetteTips.map((tip, i) => (
                  <Card key={i} className="rounded-2xl border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">{tip.topic}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.advice}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="phrases" className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                {advice.essentialPhrases?.map((p, i) => (
                  <Card key={i} className="flex items-center p-6 rounded-2xl border-none shadow-sm">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-headline font-black text-primary text-2xl">{p.local}</span>
                        <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary border-none">{p.pronunciation}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-medium italic mb-2">"{p.english}"</p>
                      <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-bold uppercase tracking-widest">{p.context}</Badge>
                    </div>
                    <BookOpen className="h-8 w-8 text-slate-200" />
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="text-center py-20 opacity-20 grayscale">
          <BookOpen className="mx-auto h-24 w-24 mb-4" />
          <p className="text-2xl font-black font-headline">{t('cultureScout.emptyState')}</p>
        </div>
      )}
    </div>
  )
}

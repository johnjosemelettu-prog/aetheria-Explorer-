'use client'

import React, { useState } from 'react'
import { MessageCircle, Send, MapPin, Loader2, Compass, Sparkles, History, Utensils, Zap, Wind } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { chatWithLocalInsider, type LocalInsiderOutput } from '@/ai/flows/local-insider-flow'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const personas = [
  { id: 'historian' as const, icon: History, label: 'Archivist', color: 'text-amber-600 bg-amber-50' },
  { id: 'foodie' as const, icon: Utensils, label: 'Scout', color: 'text-orange-600 bg-orange-50' },
  { id: 'nightlife' as const, icon: Zap, label: 'Night Queen', color: 'text-purple-600 bg-purple-50' },
  { id: 'minimalist' as const, icon: Wind, label: 'Minimalist', color: 'text-blue-600 bg-blue-50' },
];

export default function LocalInsiderPage() {
  const { t, language } = useTranslation()
  const [city, setCity] = useState('Paris')
  const [queryText, setQueryText] = useState('')
  const [activePersona, setActivePersona] = useState<'historian' | 'foodie' | 'nightlife' | 'minimalist'>('historian')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<{ query: string; result: LocalInsiderOutput; persona: string }[]>([])

  const { user } = useUser()
  const firestore = useFirestore()
  
  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid) : null),
    [user, firestore]
  )
  const { data: userProfile } = useDoc(userProfileRef)

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryText.trim() || !city.trim()) return

    setIsLoading(true)
    try {
      const data = await chatWithLocalInsider({
        city,
        query: queryText,
        persona: activePersona,
        userInterests: userProfile?.preferredInterests || [],
        language: currentLang,
      })
      setHistory(prev => [{ query: queryText, result: data, persona: activePersona }, ...prev])
      setQueryText('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Compass className="text-primary h-10 w-10" />
          Local Insider Hub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-medium">
          Choose an expert persona and unlock the authentic soul of any city.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Destination Radar</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary transition-transform group-focus-within:scale-110" />
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold"
                  placeholder="e.g. Kyoto, Japan"
                />
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Select Expert Persona</p>
                <div className="grid grid-cols-2 gap-3">
                  {personas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePersona(p.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left",
                        activePersona === p.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shadow-sm", p.color)}>
                        <p.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase leading-none">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-slate-900 text-white p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Sparkles className="h-20 w-20" /></div>
            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Synthesis Tip</h4>
            <p className="text-xs font-medium leading-relaxed opacity-60">The **Archivist** persona uses verified historical nodes, while the **Scout** identifies trending flavors in real-time.</p>
          </Card>
        </aside>

        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input 
                  placeholder={cn("Ask our", activePersona, "about", city, "...")} 
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  disabled={isLoading}
                  className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-medium shadow-inner"
                />
                <Button type="submit" disabled={isLoading || !queryText.trim()} className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/20">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
              </form>
            </CardContent>
          </Card>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8 pb-10">
              {history.length === 0 && !isLoading && (
                <div className="text-center py-32 opacity-20 flex flex-col items-center gap-6">
                  <div className="h-20 w-20 rounded-full border-4 border-dashed border-slate-300 flex items-center justify-center">
                    <MessageCircle className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="font-headline text-2xl font-black uppercase tracking-tighter">The Oracle is Idle</p>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-4 max-w-[90%]">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-lg flex-shrink-0">
                      <div className="bg-primary h-full w-full flex items-center justify-center text-white"><Loader2 className="animate-spin h-5 w-5" /></div>
                    </Avatar>
                    <Card className="rounded-3xl rounded-tl-none border-none shadow-md bg-white p-6">
                      <p className="text-sm font-medium italic animate-pulse text-slate-400">Synthesizing expert intelligence for your query...</p>
                    </Card>
                  </div>
                </div>
              )}

              {history.map((item, i) => (
                <div key={i} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-5 rounded-[2rem] rounded-tr-none max-w-[80%] font-bold text-sm shadow-xl shadow-primary/10">
                      {item.query}
                    </div>
                  </div>
                  <div className="flex justify-start gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-lg flex-shrink-0">
                      <AvatarImage src={user?.photoURL || ''} />
                      <AvatarFallback className="bg-slate-900 text-white text-[10px] font-black uppercase">{item.persona[0]}</AvatarFallback>
                    </Avatar>
                    <div className="bg-white p-8 rounded-[2.5rem] rounded-tl-none max-w-[90%] space-y-6 shadow-xl border border-slate-50">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-black uppercase text-[8px] tracking-widest border-slate-100 text-slate-400">
                          Persona: {item.persona.toUpperCase()}
                        </Badge>
                        <span className="text-[9px] font-bold text-slate-300">Verified Insight</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600 font-medium">{item.result.response}</p>
                      
                      {item.result.recommendations && item.result.recommendations.length > 0 && (
                        <div className="pt-6 border-t border-slate-50 space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Sparkles className="h-3 w-3" /> Expert Recommendations
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            {item.result.recommendations.map((rec, ri) => (
                              <div key={ri} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:bg-slate-100 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors">{rec.name}</span>
                                  <Badge variant="secondary" className="text-[8px] font-black uppercase bg-white border-none shadow-sm">{rec.locationType}</Badge>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{rec.reason}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}


'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Compass, Globe, Handshake, Loader2, Sparkles, MapPin, MessageCircle } from 'lucide-react';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Logic components localized within workspace
import LocalInsiderView from '@/components/intelligence/LocalInsiderView';
import CultureScoutView from '@/components/intelligence/CultureScoutView';
import HagglingCoachView from '@/components/intelligence/HagglingCoachView';

export default function LocalIntelligenceHub() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const [hasMounted, setHasMounted] = useState(false);
  const [city, setCity] = useState('Paris');

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid) : null),
    [user, firestore]
  )
  const { data: userProfile } = useDoc(userProfileRef)

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Intelligence Hub</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Intel Hub
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Master any city with context-aware local intelligence nodes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Target Node</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 ring-primary transition-all"
                  placeholder="Enter city..."
                />
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary leading-relaxed">
                <Sparkles className="h-3 w-3 mb-1" />
                AI analysis is calibrated for your profile DNA.
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2rem] bg-slate-900 text-white space-y-4 shadow-xl">
            <h4 className="font-black font-headline text-lg italic tracking-tight">"Knowledge is the true path to immersion."</h4>
            <p className="text-xs text-slate-400 font-medium">— Aura Intelligence v2.4</p>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <Tabs defaultValue="insider" className="space-y-8">
            <TabsList className="bg-slate-100 p-1 rounded-3xl h-16 w-full max-w-md shadow-inner">
              <TabsTrigger value="insider" className="rounded-2xl px-6 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
                <MessageCircle className="mr-2 h-4 w-4" /> Local Insider
              </TabsTrigger>
              <TabsTrigger value="scout" className="rounded-2xl px-6 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
                <Globe className="mr-2 h-4 w-4" /> Culture Scout
              </TabsTrigger>
              <TabsTrigger value="haggling" className="rounded-2xl px-6 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
                <Handshake className="mr-2 h-4 w-4" /> Haggling Coach
              </TabsTrigger>
            </TabsList>

            <TabsContent value="insider" className="animate-in fade-in duration-500 m-0">
              <LocalInsiderView city={city} userProfile={userProfile} language={currentLang} />
            </TabsContent>
            <TabsContent value="scout" className="animate-in fade-in duration-500 m-0">
              <CultureScoutView city={city} language={currentLang} />
            </TabsContent>
            <TabsContent value="haggling" className="animate-in fade-in duration-500 m-0">
              <HagglingCoachView city={city} language={currentLang} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

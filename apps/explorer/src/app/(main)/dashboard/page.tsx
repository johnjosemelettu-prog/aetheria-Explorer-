
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bot,
  History,
  Wand2,
  Trophy,
  Globe,
  Camera,
  Clapperboard,
  Activity,
  Utensils,
  Play,
  Leaf,
  Timer,
  ShieldAlert,
  Loader2,
  Radar,
  BarChart3,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Target,
  CheckCircle2,
  ShoppingBasket,
  Smartphone,
  Presentation,
  Wallet,
  Zap,
  Lock,
  MapPin,
  ShoppingBag,
  Gift,
  Wifi,
  Shirt,
  ShieldCheck,
  BookOpen,
  Award,
  Siren,
  Search,
  Radio,
  Dna,
  MousePointer2,
  Tag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { allAchievements } from '@/lib/achievements'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { usePremiumStatus } from '@/hooks/use-premium-status'
import { PromotedExperiences } from '@/components/promotions/PromotedExperiences'
import { getPromotions } from '@/ai/flows/get-promotions-flow'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'

const featureGroups = {
  plan: {
    titleKey: 'header.categories.orchestration',
    accent: 'bg-primary',
    features: [
      { titleKey: 'header.aiItinerary', href: '/itinerary-generator', icon: Bot, color: 'text-primary', isFree: true, descKey: 'dashboard.shortDesc.itinerary' },
      { titleKey: 'header.pathfinder', href: '/pathfinder', icon: Smartphone, color: 'text-secondary', isFree: false, descKey: 'dashboard.shortDesc.pathfinder' },
      { titleKey: 'header.vibeMarketplace', href: '/marketplace', icon: ShoppingBasket, color: 'text-accent', isFree: true, descKey: 'dashboard.shortDesc.marketplace' },
      { titleKey: 'header.vibeShopping', href: '/store', icon: Tag, color: 'text-amber-600', isFree: true, descKey: 'dashboard.shortDesc.store' },
      { titleKey: 'header.bookingHub', href: '/booking', icon: ShoppingBag, color: 'text-emerald-500', isFree: true, descKey: 'dashboard.shortDesc.booking' },
      { titleKey: 'header.wallet', href: '/wallet', icon: Wallet, color: 'text-emerald-600', isFree: true, descKey: 'dashboard.shortDesc.wallet' },
      { titleKey: 'header.budgetSynthesis', href: '/budget-synthesis', icon: BarChart3, color: 'text-amber-500', isFree: true, descKey: 'dashboard.shortDesc.budget' },
    ],
  },
  explore: {
    titleKey: 'header.categories.intelligence',
    accent: 'bg-secondary',
    features: [
      { titleKey: 'header.visionHub', href: '/scanner', icon: Camera, color: 'text-primary', isFree: false, descKey: 'dashboard.shortDesc.vision' },
      { titleKey: 'header.intelligenceCenter', href: '/guide', icon: Globe, color: 'text-teal-500', isFree: false, descKey: 'dashboard.shortDesc.guide' },
      { titleKey: 'header.arWayfinding', href: '/ar-wayfinding', icon: MapPin, color: 'text-cyan-500', isFree: false, descKey: 'dashboard.shortDesc.ar' },
      { titleKey: 'header.localLegends', href: '/local-legends', icon: History, color: 'text-amber-600', isFree: false, descKey: 'dashboard.shortDesc.legends' },
      { titleKey: 'header.culturalPulse', href: '/cultural-pulse', icon: Radio, color: 'text-purple-500', isFree: false, descKey: 'dashboard.shortDesc.pulse' },
      { titleKey: 'header.audioGuide', href: '/audio-guide', icon: Wifi, color: 'text-primary', isFree: false, descKey: 'dashboard.shortDesc.audio' },
    ],
  },
  creative: {
    titleKey: 'header.categories.studios',
    accent: 'bg-accent',
    features: [
      { titleKey: 'header.tripOdyssey', href: '/video-teaser', icon: Clapperboard, color: 'text-purple-500', isFree: false, descKey: 'dashboard.shortDesc.odyssey' },
      { titleKey: 'header.postcardStudio', href: '/postcard-studio', icon: Wand2, color: 'text-pink-500', isFree: false, descKey: 'dashboard.shortDesc.postcard' },
      { titleKey: 'header.heritageMirror', href: '/heritage-mirror', icon: History, color: 'text-orange-500', isFree: false, descKey: 'dashboard.shortDesc.mirror' },
      { titleKey: 'header.journal', href: '/journal', icon: BookOpen, color: 'text-slate-500', isFree: true, descKey: 'dashboard.shortDesc.journal' },
    ]
  },
}

export default function DashboardPage() {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  const { t, language } = useTranslation()
  const { hasPremiumPass, activeTier, activeTrip, isLoading: isPremiumLoading } = usePremiumStatus();

  const [promotions, setPromotions] = useState<any[]>([]);
  const [isPromosLoading, setIsPromosLoading] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const userProfileRef = useMemoFirebase(
      () => (user && firestore ? doc(firestore, 'userProfiles', user.uid) : null),
      [user, firestore]
  )
  const { data: userProfile, isLoading: isProfileLoading } =
      useDoc(userProfileRef)

  const loyaltyRef = useMemoFirebase(
      () => (user && firestore ? doc(firestore, 'userProfiles', user.uid, 'loyalty', 'status') : null),
      [user, firestore]
  )
  const { data: loyaltyData } = useDoc(loyaltyRef);

  useEffect(() => {
    async function fetchPromos() {
      setIsPromosLoading(true);
      try {
        const result = await getPromotions({
          destination: activeTrip?.destination,
          interests: userProfile?.preferredInterests || [],
          language: currentLang
        });
        setPromotions(result.promotions);
      } catch (e) {
        // AI flow handles fallbacks internally
      } finally {
        setIsPromosLoading(false);
      }
    }
    if (userProfile || activeTrip) {
      fetchPromos();
    }
  }, [userProfile, activeTrip, currentLang]);

  const handleMissionInvite = (name: string) => {
    toast({
      title: t('dashboard.missionInvite.title'),
      description: t('dashboard.missionInvite.description', { name }),
    });
  };

  const isLoading = isProfileLoading || isPremiumLoading

  if (isLoading) return <div className="p-4 md:p-12 bg-background min-h-screen pt-safe"><Skeleton className="h-screen w-full rounded-2xl md:rounded-[3rem]" /></div>

  const nearbyVibers = [
    { name: 'Leo', vibe: 'Adventure', avatar: 'https://i.pravatar.cc/150?u=leo' },
    { name: 'Mina', vibe: 'Street Art', avatar: 'https://i.pravatar.cc/150?u=mina' },
    { name: 'Jack', vibe: 'Foodie', avatar: 'https://i.pravatar.cc/150?u=jack' }
  ];

  return (
      <div className="min-h-screen bg-background text-foreground pb-24 md:pb-32 pt-safe">
        <div className="container mx-auto px-4 pt-6 md:pt-12">
          <OnboardingTour />
          <header className="mb-8 md:mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 animate-in fade-in duration-700">
            <div className="space-y-3 md:space-y-4">
              <Badge id="header-node" className="bg-primary/20 text-primary border-primary/30 font-black tracking-[0.2em] py-1 px-4 uppercase text-[9px] rounded-full w-fit">{t('dashboard.explorerHubActive')}</Badge>
              <h1 className="font-headline text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-none italic uppercase">
                {t('dashboard.welcomeBack', { name: userProfile?.firstName || 'Explorer' })}
              </h1>
              <p className="text-[10px] md:text-sm text-muted-foreground font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Dna className="h-4 w-4 text-primary" /> {t('dashboard.odysseyLevel', { level: 12 })}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:gap-4">
              {activeTrip && activeTrip.status === 'completed' && (
                  <Link href={`/wrapped/${activeTrip.id}`} className="w-full sm:w-auto">
                    <Button className="w-full h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl font-black bg-accent text-accent-foreground shadow-2xl glow-accent animate-pulse text-xs md:text-sm active:scale-95 transition-all">
                      <Presentation className="mr-2 h-4 w-4 md:h-5 md:w-5" /> {t('dashboard.viewLegacyWrapped')}
                    </Button>
                  </Link>
              )}
              <Link href="/video-brochure" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl font-black border-2 border-border glass text-foreground hover:bg-primary/5 shadow-xl transition-all text-xs md:text-sm active:scale-95">
                  <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 fill-current" /> {t('dashboard.productionTrailer')}
                </Button>
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
            <div className="lg:col-span-8 space-y-12 md:space-y-20">
              {/* Contextual Promotions Section */}
              {isPromosLoading ? (
                  <Skeleton className="h-48 md:h-64 w-full rounded-2xl md:rounded-[3rem]" />
              ) : promotions.length > 0 ? (
                  <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <PromotedExperiences promotions={promotions} />
                  </section>
              ) : null}

              {/* Season Pass Node */}
              <section id="season-pass" className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <Card className="border-none shadow-2xl rounded-2xl md:rounded-[3rem] bg-card text-card-foreground overflow-hidden group border border-border">
                  <CardHeader className="bg-slate-900 dark:bg-slate-950 text-white p-5 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 border-b border-white/5">
                    <div className="space-y-2">
                      <Badge className="bg-primary text-white border-none font-black uppercase tracking-widest text-[8px] px-3 py-0.5">{t('dashboard.seasonPass.subtitle')}</Badge>
                      <CardTitle className="text-xl md:text-4xl font-black font-headline tracking-tighter italic uppercase">{t('dashboard.seasonPass.title')}</CardTitle>
                    </div>
                    <div className="md:text-right">
                      <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{t('dashboard.xpSynthesized')}</p>
                      <p className="text-2xl md:text-5xl font-black font-headline text-primary leading-none tracking-tighter">12,450</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 md:p-10 space-y-8 md:space-y-10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('dashboard.progressionToLevel', { level: 13 })}</p>
                        <p className="text-[10px] font-black text-foreground tracking-widest uppercase">{t('dashboard.progression', { current: 850, total: 1000 })}</p>
                      </div>
                      <Progress value={85} className="h-2 rounded-full bg-muted" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
                      <div className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-muted/50 border border-border flex items-center gap-4 group hover:bg-primary/5 transition-all active:scale-95">
                        <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform"><Flame className="h-5 w-5" /></div>
                        <div>
                          <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">{t('dashboard.vibeStreak')}</p>
                          <p className="text-xs font-black tracking-tight uppercase italic">{t('dashboard.vibeStreakValue', { num: 5 })}</p>
                        </div>
                      </div>
                      <div className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-muted/50 border border-border flex items-center gap-4 group hover:bg-primary/5 transition-all active:scale-95">
                        <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center text-emerald-500 shadow-lg group-hover:scale-110 transition-transform"><CheckCircle2 className="h-5 w-5" /></div>
                        <div>
                          <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">{t('dashboard.tasksResolved')}</p>
                          <p className="text-xs font-black tracking-tight uppercase italic">{t('dashboard.tasksResolvedValue', { num: 42 })}</p>
                        </div>
                      </div>
                      <div className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-muted/50 border border-border flex items-center gap-4 group hover:bg-primary/5 transition-all active:scale-95">
                        <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center text-accent shadow-lg group-hover:scale-110 transition-transform"><Trophy className="h-5 w-5" /></div>
                        <div>
                          <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">{t('dashboard.totalMedals')}</p>
                          <p className="text-xs font-black tracking-tight uppercase italic">{t('dashboard.totalMedalsValue', { num: 12 })}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Feature Bento Sections */}
              {Object.entries(featureGroups).map(([key, group]) => (
                  <section key={key} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-8 w-1.5 rounded-full", group.accent)} />
                      <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-foreground italic">{t(group.titleKey)}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                      {group.features.map((feature) => {
                        const isLocked = !hasPremiumPass && !feature.isFree;
                        const featureId = feature.href.includes('itinerary') ? 'itinerary-node' :
                            feature.href.includes('scanner') ? 'vision-hub' :
                                feature.href.includes('postcard') ? 'postcard-studio' : undefined;
                        return (
                            <Link href={isLocked ? "/subscription" : feature.href} key={feature.href} id={featureId} className="group active:scale-95 transition-all">
                              <Card className={cn(
                                  "h-full border-none shadow-xl rounded-2xl md:rounded-[2.5rem] overflow-hidden transition-all duration-500 group-hover:-translate-y-1.5 bg-card border border-border",
                                  isLocked && "opacity-40 grayscale-[0.8]"
                              )}>
                                <CardContent className="p-5 md:p-8 flex flex-col h-full">
                                  <div className={cn(
                                      "p-3 md:p-4 rounded-xl md:rounded-2xl w-fit mb-4 md:mb-6 shadow-xl transition-all duration-500",
                                      isLocked ? "bg-muted text-muted-foreground" : "bg-muted group-hover:bg-primary group-hover:text-white",
                                      feature.color
                                  )}>
                                    <feature.icon className="h-5 w-5 md:h-6 md:w-6" />
                                  </div>
                                  <div className="space-y-2 flex-grow">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-base md:text-xl font-black font-headline tracking-tighter leading-none text-card-foreground uppercase italic">{t(feature.titleKey)}</h3>
                                      {isLocked ? <Lock className="h-3 w-3 text-muted-foreground opacity-40" /> : <MousePointer2 className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed opacity-60">
                                      {isLocked ? t('dashboard.premiumRequired') : t(feature.descKey)}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                        )
                      })}
                    </div>
                  </section>
              ))}
            </div>

            <aside className="lg:col-span-4 space-y-6 md:space-y-10">
              {/* Identity Node Card */}
              <Card className="border-none shadow-2xl rounded-2xl md:rounded-[3rem] bg-card text-card-foreground overflow-hidden border border-border">
                <div className="relative h-24 md:h-32 bg-primary overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/800/600')] opacity-30 grayscale contrast-125 bg-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
                <CardContent className="relative pt-0 -mt-10 md:-mt-12 px-5 md:px-8 pb-8 md:pb-10 flex flex-col items-center">
                  <Avatar className="w-20 h-20 md:w-28 md:h-28 border-4 border-card shadow-2xl ring-4 ring-primary/10">
                    <AvatarImage src={userProfile?.photoURL || user?.photoURL || ''} />
                    <AvatarFallback className="bg-slate-900 text-white text-2xl md:text-3xl font-black uppercase">{user?.email?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="mt-4 md:mt-6 text-center space-y-1">
                    <h3 className="text-lg md:text-2xl font-black font-headline leading-tight truncate max-w-[200px] md:max-w-[250px] uppercase italic text-foreground tracking-tighter">{userProfile?.firstName} {userProfile?.lastName}</h3>
                    <Badge className="bg-primary text-white border-none font-black uppercase tracking-widest text-[8px] py-0.5 px-3 rounded-full">
                      {t('dashboard.explorerStatus', { tier: activeTier.toUpperCase() })}
                    </Badge>
                  </div>
                  <div className="w-full mt-8 md:mt-10 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 p-4 md:p-5 rounded-xl md:rounded-2xl text-center border border-border">
                        <p className="text-xl md:text-2xl font-black font-headline text-primary leading-none tracking-tighter">{loyaltyData?.points || 0}</p>
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-2">{t('dashboard.points')}</p>
                      </div>
                      <div className="bg-muted/50 p-4 md:p-5 rounded-xl md:rounded-2xl text-center border border-border">
                        <p className="text-xl md:text-2xl font-black font-headline text-foreground leading-none tracking-tighter">{allAchievements.filter(a => ['first-flight', 'culinary-explorer', 'globetrotter'].includes(a.id)).length}</p>
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-2">{t('dashboard.medals')}</p>
                      </div>
                    </div>
                    <Button asChild className="w-full rounded-xl md:rounded-2xl h-11 md:h-12 bg-foreground text-background hover:opacity-90 font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                      <Link href="/profile">{t('dashboard.editProfile')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Social Vibe Radar */}
              <Card id="vibe-radar" className="border-none shadow-2xl rounded-2xl md:rounded-[3rem] bg-card text-card-foreground p-5 md:p-8 border border-border overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5"><Target className="h-24 md:h-32 w-24 md:w-32 text-primary" /></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="font-headline font-black text-lg md:text-xl text-foreground flex items-center gap-2 uppercase italic tracking-tighter">
                      <Radar className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" /> {t('dashboard.vibeRadar.title')}
                    </h3>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed mb-6 md:mb-8 opacity-60 italic">
                    "{t('dashboard.vibeRadar.desc', { vibe: activeTrip?.vibe || 'Discovery', location: activeTrip?.destination || 'Global Grid' })}"
                  </p>
                  <div className="space-y-4 md:space-y-5">
                    {nearbyVibers.map((viber, idx) => (
                        <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 -mx-1 rounded-xl transition-all">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-card shadow-lg group-hover:border-primary transition-all">
                              <AvatarImage src={viber.avatar} />
                              <AvatarFallback className="bg-muted text-muted-foreground font-black text-[10px] uppercase">{viber.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-black text-[10px] md:text-xs text-foreground leading-none uppercase tracking-tighter">{viber.name}</p>
                              <Badge variant="outline" className="text-[6px] md:text-[7px] font-black uppercase tracking-widest py-0 px-1.5 border-primary/20 text-primary mt-1">{t('dashboard.vibeRadar.match', { vibe: viber.vibe })}</Badge>
                            </div>
                          </div>
                          <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-full h-7 w-7 md:h-8 md:w-8 hover:bg-primary hover:text-white transition-all shadow-sm"
                              onClick={() => handleMissionInvite(viber.name)}
                          >
                            <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full mt-6 md:mt-8 rounded-xl md:rounded-2xl h-11 md:h-12 font-black border-2 border-border hover:bg-muted transition-all uppercase tracking-widest text-[9px]">
                    <Link href="/transit-connect">{t('dashboard.vibeRadar.expand')}</Link>
                  </Button>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </div>
  )
}

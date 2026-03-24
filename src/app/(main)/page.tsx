
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Bot,
  MapPin,
  Sparkles,
  Plane,
  History,
  Wand2,
  Backpack,
  ArrowUpRight,
  Zap,
  Globe,
  Clapperboard,
  Smartphone,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useUser } from '@/firebase'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'home-hero')
  const { t } = useTranslation()
  const { user, isUserLoading } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: Bot,
      titleKey: 'home.features.itinerary.title',
      descKey: 'home.features.itinerary.desc',
      link: '/itinerary-generator',
      image: PlaceHolderImages.find((img) => img.id === 'feature-itinerary'),
      badgeKey: 'home.features.itinerary.badge'
    },
    {
      icon: Wand2,
      titleKey: 'home.features.postcard.title',
      descKey: 'home.features.postcard.desc',
      link: '/postcard-studio',
      image: PlaceHolderImages.find((img) => img.id === 'feature-vr'),
      badgeKey: 'home.features.postcard.badge'
    },
    {
      icon: History,
      titleKey: 'home.features.legends.title',
      descKey: 'home.features.legends.desc',
      link: '/local-legends',
      image: PlaceHolderImages.find((img) => img.id === 'feature-ar'),
      badgeKey: 'home.features.legends.badge'
    },
    {
      icon: Backpack,
      titleKey: 'home.features.packing.title',
      descKey: 'home.features.packing.desc',
      link: '/packing-assistant',
      image: PlaceHolderImages.find((img) => img.id === 'feature-profile'),
      badgeKey: 'home.features.packing.badge'
    },
  ]

  const steps = [
    {
      icon: MapPin,
      titleKey: 'home.workflow.step1.title',
      descKey: 'home.workflow.step1.desc',
      color: "text-primary bg-primary/10"
    },
    {
      icon: Sparkles,
      titleKey: 'home.workflow.step2.title',
      descKey: 'home.workflow.step2.desc',
      color: "text-secondary bg-secondary/10"
    },
    {
      icon: Plane,
      titleKey: 'home.workflow.step3.title',
      descKey: 'home.workflow.step3.desc',
      color: "text-accent bg-accent/10"
    }
  ]

  if (!mounted) return null;

  return (
    <div className="flex flex-col bg-background text-foreground selection:bg-primary selection:text-white -mt-28 lg:-mt-32">
      {/* Hyper-Impact Hero Section */}
      <section className="relative min-h-[90svh] w-full overflow-hidden flex items-center pt-safe">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover scale-105 animate-pulse-slow brightness-50 dark:brightness-[0.3]"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        </div>

        <div className="relative z-20 container mx-auto px-4 lg:px-8 flex flex-col items-center text-center max-w-4xl">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary text-primary font-black tracking-[0.3em] uppercase bg-primary/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700 text-[9px]">
            {t('home.hero.badge')}
          </Badge>
          
          <h1 className="mb-6 font-headline text-5xl font-black tracking-tighter text-foreground sm:text-7xl lg:text-[7.5rem] leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            THE WORLD <br />
            <span className="text-primary italic">RECODED.</span>
          </h1>
          
          <p className="max-w-xl text-base text-muted-foreground md:text-xl mb-10 leading-relaxed opacity-80 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 px-4">
            {t('home.hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 px-4">
            {isUserLoading ? (
              <Skeleton className="h-14 w-full sm:w-56 rounded-full bg-muted" />
            ) : user ? (
              <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-2xl glow-primary font-black text-lg group active:scale-95 transition-all">
                <Link href="/dashboard" className="flex items-center gap-3">
                  {t('header.dashboard')} <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-2xl glow-primary font-black text-lg transition-all active:scale-95">
                  <Link href="/signup">{t('home.hero.cta.start')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-16 px-10 rounded-2xl glass border-border text-foreground hover:bg-muted font-black text-lg transition-all active:scale-95">
                  <Link href="/login">{t('home.hero.cta.signin')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Scroll Indicator Node */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40 animate-bounce hidden sm:flex text-foreground">
          <span className="text-[8px] font-black uppercase tracking-[0.3em]">{t('home.hero.scroll')}</span>
          <div className="h-8 w-0.5 bg-gradient-to-b from-foreground to-transparent" />
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 bg-card text-card-foreground rounded-t-[3rem] relative z-30 shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4">
          <div className="mb-16 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-1 w-12 bg-primary rounded-full" />
              <Badge variant="outline" className="text-primary font-black uppercase tracking-widest border-primary/20 text-[9px] px-3">{t('home.features.chapter')}</Badge>
            </div>
            <h2 className="font-headline text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none italic uppercase">
              {t('home.features.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group border-none shadow-lg rounded-[2rem] overflow-hidden bg-muted/30 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col border border-border active:scale-95">
                <div className="relative h-48 w-full overflow-hidden">
                  {feature.image && (
                    <Image 
                      src={feature.image.imageUrl} 
                      alt="Feature" 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                      data-ai-hint={feature.image.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-white/90 text-primary border-none font-black uppercase text-[8px] px-2 py-0.5">{t(feature.badgeKey)}</Badge>
                </div>
                <CardContent className="p-6 flex-grow space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-card shadow-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-headline text-xl font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors uppercase italic">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-muted-foreground font-medium leading-relaxed text-xs">
                    {t(feature.descKey)}
                  </p>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                  <Button asChild variant="ghost" className="w-full h-10 rounded-xl font-black text-primary hover:bg-primary/5 hover:text-primary p-0 text-[10px] uppercase tracking-widest">
                    <Link href={feature.link} className="flex items-center justify-center gap-2">
                      {t('home.features.initNode')} <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Workflow Grid */}
      <section className="bg-background py-24 text-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-5 animate-spin-slow">
          <Globe className="h-[400px] w-[400px] text-primary" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16 text-center">
            <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1 uppercase tracking-[0.2em] mb-4 text-[9px] rounded-full">{t('home.workflow.badge')}</Badge>
            <h2 className="font-headline text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">{t('home.workflow.title')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <Card key={i} className="bg-muted/30 border border-border rounded-[2.5rem] p-10 space-y-6 group hover:bg-muted transition-all duration-500 active:scale-95 shadow-sm">
                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500 shadow-inner", step.color)}>
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">{t('home.workflow.phase', { num: i + 1 })}</span>
                  <h3 className="text-2xl font-black font-headline tracking-tighter uppercase italic">{t(step.titleKey)}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed text-xs opacity-80">{t(step.descKey)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic CTA */}
      <section className="py-20 bg-muted/20 rounded-t-[3rem]">
        <div className="container mx-auto px-4">
          <Card className="rounded-[3rem] bg-slate-900 border-none p-10 lg:p-24 text-center text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 z-0">
              <Image src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1920" alt="CTA" fill className="object-cover opacity-20 grayscale transition-transform duration-[10s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/20 mix-blend-overlay" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <Badge className="bg-white text-slate-950 font-black uppercase tracking-[0.3em] px-6 py-1.5 text-[9px] rounded-full">{t('home.cta.badge')}</Badge>
              <h2 className="font-headline text-4xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                {t('home.cta.title')}
              </h2>
              <p className="text-slate-300 text-lg md:text-2xl font-medium leading-relaxed opacity-80">
                {t('home.cta.subtitle')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button asChild size="lg" className="h-16 w-full sm:w-auto px-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-black text-xl shadow-2xl transition-transform active:scale-95">
                  <Link href="/signup">{t('home.cta.start')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-16 w-full sm:w-auto px-12 rounded-2xl border-4 border-white/10 text-white hover:bg-white/5 font-black text-xl transition-transform active:scale-95">
                  <Link href="/news">{t('home.cta.feed')}</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer Branded Bar */}
      <section className="py-12 border-t border-border text-center bg-background">
        <div className="flex flex-col items-center gap-4 opacity-30">
          <div className="flex items-center gap-2">
            <Backpack className="h-5 w-5 text-primary" />
            <span className="font-headline font-black text-lg tracking-tighter uppercase text-foreground">Aetheria AI Systems</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-foreground">Global Network • Ver 0.0.1</p>
        </div>
      </section>
    </div>
  )
}

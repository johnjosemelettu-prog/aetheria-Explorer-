
"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react'
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
  Play,
  Moon,
  ChevronRight,
  Star,
  Cpu,
  Navigation,
  Compass
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

const Footer = dynamic(() => import('@/components/layout/Footer').then(m => m.Footer), { ssr: false });

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'home-hero')
  const { t } = useTranslation()
  const { user, isUserLoading } = useUser()
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])

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
      badgeKey: 'home.features.itinerary.badge',
      color: "bg-primary",
      size: "large"
    },
    {
      icon: Wand2,
      titleKey: 'home.features.postcard.title',
      descKey: 'home.features.postcard.desc',
      link: '/postcard-studio',
      image: PlaceHolderImages.find((img) => img.id === 'feature-vr'),
      badgeKey: 'home.features.postcard.badge',
      color: "bg-secondary",
      size: "small"
    },
    {
      icon: History,
      titleKey: 'home.features.legends.title',
      descKey: 'home.features.legends.desc',
      link: '/local-legends',
      image: PlaceHolderImages.find((img) => img.id === 'feature-ar'),
      badgeKey: 'home.features.legends.badge',
      color: "bg-accent",
      size: "small"
    },
    {
      icon: Backpack,
      titleKey: 'home.features.packing.title',
      descKey: 'home.features.packing.desc',
      link: '/packing-assistant',
      image: PlaceHolderImages.find((img) => img.id === 'feature-profile'),
      badgeKey: 'home.features.packing.badge',
      color: "bg-slate-800",
      size: "medium"
    },
  ]

  return (
    <div ref={containerRef} className="flex flex-col bg-slate-950 text-white selection:bg-primary selection:text-white overflow-x-hidden relative">
      <div className="noise" />
      
      <main className="flex-1">
        {/* HERO SECTION - REDESIGNED FOR GEN Z */}
        <section className="relative min-h-svh w-full flex items-center justify-center overflow-hidden py-20">
          <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950 z-10" />
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" 
            />
            <motion.div 
              animate={{ 
                y: [0, 20, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-10 w-48 h-48 bg-secondary/20 blur-3xl rounded-full" 
            />
          </div>

          <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center pt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-2 px-6 py-2 border-white/10 text-white font-black tracking-[0.4em] uppercase bg-white/5 backdrop-blur-2xl rounded-full text-[10px]">
                <Cpu className="mr-2 h-3 w-3 text-primary animate-pulse" /> {t('home.hero.badge')}
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <h1 className="mb-2 font-headline text-[clamp(3rem,15vw,10rem)] font-black tracking-tighter text-white leading-[0.75] uppercase italic mix-blend-difference">
                AETHERIA<span className="text-primary">.</span>
              </h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="absolute -bottom-4 left-0 h-4 bg-primary/50 blur-md"
              />
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-3xl text-lg sm:text-2xl text-slate-300 mb-8 font-black tracking-tight leading-none uppercase italic"
            >
              {t('home.hero.description1')} <br className="hidden sm:block" />
              <span className="text-white">{t('home.hero.description2')}</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto relative z-30"
            >
              {user ? (
                <Button asChild size="lg" className="h-16 sm:h-24 px-8 sm:px-16 rounded-full bg-white text-black hover:bg-slate-200 shadow-2xl font-black text-lg sm:text-2xl group active:scale-95 transition-all w-full sm:w-auto uppercase italic">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    {t('home.hero.enterGrid')} <ArrowUpRight className="h-6 w-6 sm:h-8 sm:w-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="h-16 sm:h-24 px-8 sm:px-16 rounded-full bg-primary text-white hover:bg-primary/90 shadow-2xl animate-glow-pulse font-black text-lg sm:text-2xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto uppercase italic">
                    <Link href="/signup">{t('home.hero.signUp')}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-16 sm:h-24 px-8 sm:px-16 rounded-full border-white/60 bg-white/20 hover:bg-white/30 text-white font-black text-lg sm:text-2xl backdrop-blur-3xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto uppercase italic shadow-lg">
                    <Link href="/login">{t('home.hero.login')}</Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>

          <motion.div 
            style={{ opacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">{t('home.hero.scroll')}</span>
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-px h-16 bg-gradient-to-b from-primary to-transparent" 
            />
          </motion.div>
        </section>

        {/* BENTO GRID FEATURES - NEURAL MODULES */}
        <section className="py-24 bg-slate-950 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-3xl">
                <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1 uppercase tracking-[0.3em] mb-6 text-[10px] rounded-full">{t('home.features.badge')}</Badge>
                <h2 className="font-headline text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.75] uppercase italic">
                  {t('home.features.title').split(' ')[0]} <br />
                  <span className="text-primary">{t('home.features.title').split(' ')[1]}</span>
                </h2>
              </div>
              <p className="text-slate-400 text-xl max-w-sm font-black italic leading-none uppercase">
                {t('home.features.quote')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[300px]">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 0.98 }}
                  className={cn(
                    "relative rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/5",
                    feature.size === "large" ? "md:col-span-2 md:row-span-2" : 
                    feature.size === "medium" ? "md:col-span-2" : "md:col-span-1"
                  )}
                >
                  {feature.image && (
                    <Image 
                      src={feature.image.imageUrl} 
                      alt="Feature" 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-between z-20">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-2xl", feature.color)}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <Badge className="mb-4 bg-white/10 backdrop-blur-md text-white border-none font-black uppercase text-[10px] px-3 py-1">{t(feature.badgeKey)}</Badge>
                      <h3 className="font-headline text-2xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="text-slate-300 font-medium text-sm max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {t(feature.descKey)}
                      </p>
                      <Link href={feature.link} className="mt-4 flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        {t('common.initialize')} <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION - BRUTALIST STYLE */}
        <section className="bg-white text-black py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-primary mb-8 block">{t('home.workflow.badge')}</span>
                <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-[0.8] uppercase italic mb-12">
                  {t('home.workflow.title').split(' ').slice(0, -1).join(' ')} <br />
                  <span className="text-primary">{t('home.workflow.title').split(' ').slice(-1)}</span>
                </h2>
                <div className="space-y-8">
                  {[
                    { id: "01", title: t('home.workflow.step1.title'), desc: t('home.workflow.step1.desc') },
                    { id: "02", title: t('home.workflow.step2.title'), desc: t('home.workflow.step2.desc') },
                    { id: "03", title: t('home.workflow.step3.title'), desc: t('home.workflow.step3.desc') }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-8 group">
                      <span className="font-headline text-4xl font-black text-primary/20 group-hover:text-primary transition-colors">{step.id}</span>
                      <div>
                        <h3 className="text-2xl font-black uppercase italic mb-2">{step.title}</h3>
                        <p className="text-slate-600 font-medium max-w-md">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden relative group">
                  <Image 
                    src="https://picsum.photos/seed/cyberpunk/1000/1000" 
                    alt="Process" 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-64 h-64 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center"
                    >
                      <Navigation className="h-12 w-12 text-white" />
                    </motion.div>
                  </div>
                </div>
                
                {/* Floating Card */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-10 -left-10 bg-black text-white p-8 rounded-[2rem] shadow-2xl max-w-xs hidden md:block"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span className="font-black uppercase text-[10px] tracking-widest">{t('home.workflow.floating.title')}</span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">{t('home.workflow.floating.desc')}</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION - IMMERSIVE */}
        <section className="relative py-32 overflow-hidden bg-slate-950 min-h-[60vh] flex items-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="font-headline text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.8] uppercase italic mb-4">
                {t('home.cta.title').split(' ').slice(0, -1).join(' ')} <br />
                <span className="text-primary">{t('home.cta.title').split(' ').slice(-1)}</span>
              </h2>
              <p className="text-slate-400 text-xl mb-6 font-medium italic">
                {t('home.cta.description')}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <Button asChild size="lg" className="h-16 sm:h-24 px-8 sm:px-16 rounded-full bg-primary text-white hover:bg-primary/90 shadow-2xl animate-glow-pulse font-black text-lg sm:text-2xl transition-all hover:scale-105 active:scale-95">
                  <Link href="/signup">{t('home.cta.signUpNow')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-16 sm:h-24 px-8 sm:px-16 rounded-full border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-lg sm:text-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 shadow-lg">
                  <Link href="/login">{t('home.hero.login')}</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

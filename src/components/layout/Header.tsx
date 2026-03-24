
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Backpack,
  ChevronDown,
  Globe,
  Wallet,
  Camera,
  Bot,
  Smartphone,
  BarChart3,
  History,
  Clapperboard,
  ShoppingBasket,
  Check,
  Menu,
  X,
  Zap,
  Dna,
  Radio,
  MapPin,
  ShoppingBag,
  Wand2,
  BookOpen,
  Briefcase,
  Siren,
  Plane,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Wifi,
  Users,
  Brain,
  ChefHat,
  Music,
  Tag,
  Heart,
  Activity
} from 'lucide-react'
import { collection } from 'firebase/firestore'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useFirebase, useMemoFirebase, useCollection } from '@/firebase'
import { UserNav } from './UserNav'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { Separator } from '@/components/ui/separator'

const NavDropdown = ({ 
  title, 
  items, 
  icon: Icon 
}: { 
  title: string; 
  items: { label: string; href: string; icon: any; desc: string }[];
  icon: any;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all group">
          <Icon className="mr-1.5 h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
          {title}
          <ChevronDown className="ml-1 h-2.5 w-2.5 opacity-40 group-data-[state=open]:rotate-180 transition-transform" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 glass p-2 rounded-[2rem] shadow-2xl border-none animate-in fade-in zoom-in-95 duration-200">
        <div className="grid grid-cols-1 gap-1">
          {items.map((item) => (
            <DropdownMenuItem key={item.href} asChild className="rounded-2xl p-3 focus:bg-primary/5 cursor-pointer group">
              <Link href={item.href} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter line-clamp-1">{item.desc}</p>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const pathname = usePathname()
  const { user, firestore } = useFirebase()
  const { t, language, setLanguage } = useTranslation()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const cartQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'cart') : null),
    [user, firestore]
  );
  const { data: cartItems } = useCollection(cartQuery);
  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  if (pathname === '/') return null;

  const orchestrationItems = [
    { label: t('header.aiItinerary'), href: '/itinerary-generator', icon: Bot, desc: t('dashboard.shortDesc.itinerary') },
    { label: t('header.pathfinder'), href: '/pathfinder', icon: Smartphone, desc: t('dashboard.shortDesc.pathfinder') },
    { label: t('header.vibeMarketplace'), href: '/marketplace', icon: ShoppingBasket, desc: t('dashboard.shortDesc.marketplace') },
    { label: t('header.vibeShopping'), href: '/store', icon: Tag, desc: t('dashboard.shortDesc.store') },
    { label: t('header.bookingHub'), href: '/booking', icon: ShoppingBag, desc: t('dashboard.shortDesc.booking') },
    { label: t('header.wallet'), href: '/wallet', icon: Wallet, desc: t('dashboard.shortDesc.wallet') },
    { label: t('header.budgetSynthesis'), href: '/budget-synthesis', icon: BarChart3, desc: t('dashboard.shortDesc.budget') },
    { label: t('header.corporate'), href: '/corporate', icon: Briefcase, desc: t('dashboard.shortDesc.corporate') },
  ];

  const intelligenceItems = [
    { label: t('header.visionHub'), href: '/scanner', icon: Camera, desc: t('dashboard.shortDesc.vision') },
    { label: t('header.intelligenceCenter'), href: '/guide', icon: Globe, desc: t('dashboard.shortDesc.guide') },
    { label: t('header.arWayfinding'), href: '/ar-wayfinding', icon: MapPin, desc: t('dashboard.shortDesc.ar') },
    { label: t('header.localLegends'), href: '/local-legends', icon: History, desc: t('dashboard.shortDesc.legends') },
    { label: t('header.culturalPulse'), href: '/cultural-pulse', icon: Radio, desc: t('dashboard.shortDesc.pulse') },
    { label: t('header.audioGuide'), href: '/audio-guide', icon: Wifi, desc: t('dashboard.shortDesc.audio') },
    { label: t('header.moodSynthesis'), href: '/mood-synthesis', icon: Brain, desc: t('dashboard.shortDesc.mood') },
  ];

  const studioItems = [
    { label: t('header.tripOdyssey'), href: '/video-teaser', icon: Clapperboard, desc: t('dashboard.shortDesc.odyssey') },
    { label: t('header.postcardStudio'), href: '/postcard-studio', icon: Wand2, desc: t('dashboard.shortDesc.postcard') },
    { label: t('header.heritageMirror'), href: '/heritage-mirror', icon: History, desc: t('dashboard.shortDesc.mirror') },
    { label: t('header.journal'), href: '/journal', icon: BookOpen, desc: t('dashboard.shortDesc.journal') },
    { label: t('header.auraBeats'), href: '/soundtrack', icon: Music, desc: "Synthesize a trip soundtrack." },
  ];

  const utilityItems = [
    { label: t('header.safety'), href: '/safety', icon: Siren, desc: t('dashboard.shortDesc.safety') },
    { label: t('header.insurance'), href: '/insurance', icon: ShieldAlert, desc: t('dashboard.shortDesc.insurance') },
    { label: t('header.visaArchitect'), href: '/visa-architect', icon: ShieldCheck, desc: t('dashboard.shortDesc.visa') },
    { label: t('header.flightStatus'), href: '/flight-status', icon: Plane, desc: t('dashboard.shortDesc.status') },
    { label: t('header.esim'), href: '/esim', icon: Signal, desc: t('dashboard.shortDesc.esim') },
    { label: t('header.carbonSynthesis'), href: '/carbon-synthesis', icon: Leaf, desc: t('dashboard.shortDesc.carbon') },
    { label: t('header.packingassistant'), href: '/packing-assistant', icon: Backpack, desc: t('dashboard.shortDesc.packing') },
    { label: t('header.equilibriumSync'), href: '/biometric-sync', icon: Heart, desc: "Recalibrate based on cortisol nodes." },
    { label: t('header.flavorDna'), href: '/flavor-dna', icon: ChefHat, desc: "Synthesize your culinary portfolio." },
  ];

  const isAdminPortal = pathname.startsWith('/admin');
  const isVendorPortal = pathname.startsWith('/vendor');

  return (
    <header className={cn(
      "fixed top-0 z-[100] w-full transition-all duration-500 pt-safe",
      scrolled ? "py-2" : "py-6"
    )}>
      <div className="container mx-auto px-4">
        <div className={cn(
          "flex h-16 items-center px-6 rounded-full transition-all duration-500",
          scrolled ? "glass shadow-2xl" : "bg-background/60 backdrop-blur-xl border border-border/50 shadow-sm"
        )}>
          {mounted ? (
            <>
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 duration-500" />
                  <div className={cn(
                    "relative h-11 w-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-xl overflow-hidden",
                    isAdminPortal ? "bg-slate-900" : isVendorPortal ? "bg-emerald-600" : "bg-slate-950"
                  )}>
                    <Globe className="absolute h-10 w-10 text-white/5 animate-spin-slow" />
                    <Backpack className="h-6 w-6 text-white relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]" />
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-lg flex items-center justify-center border-2 border-slate-950 shadow-lg z-20">
                      <Zap className="h-2.5 w-2.5 text-white fill-white animate-pulse" />
                    </div>
                    <div className="absolute -bottom-1 -left-1 h-5 w-5 bg-secondary rounded-full flex items-center justify-center border-2 border-slate-950 shadow-md z-20">
                      <Users className="h-2.5 w-2.5 text-slate-950" strokeWidth={3} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start leading-none mr-4">
                  <span className="font-headline text-lg font-black tracking-tighter uppercase leading-none text-foreground">
                    AETHERIA<span className="text-accent italic">AI</span>
                  </span>
                  <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-0.5">Journey Synthesized</span>
                </div>
              </Link>

              <Separator orientation="vertical" className="h-6 mx-2 hidden lg:block bg-border/60" />
              
              <nav className="hidden items-center gap-1 lg:flex ml-2">
                <Link href="/dashboard" className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                  pathname === '/dashboard' ? "text-primary bg-primary/5 rounded-full" : "text-muted-foreground hover:text-foreground"
                )}>
                  {t('header.dashboard')}
                </Link>
                <NavDropdown title={t('header.categories.orchestration')} items={orchestrationItems} icon={Zap} />
                <NavDropdown title={t('header.categories.intelligence')} items={intelligenceItems} icon={Dna} />
                <NavDropdown title={t('header.categories.studios')} items={studioItems} icon={Clapperboard} />
                <NavDropdown title={t('header.categories.utility')} items={utilityItems} icon={Activity} />
              </nav>

              <div className="flex-1" />

              <div className="flex items-center justify-end gap-2 sm:gap-4">
                {user && (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link href="/sos">
                      <Button variant="destructive" size="sm" className="rounded-full px-4 h-9 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-red-500/20 animate-pulse">
                        <Siren className="mr-1.5 h-3.5 w-3.5" /> SOS
                      </Button>
                    </Link>
                    {!isAdminPortal && !isVendorPortal && (
                      <>
                        <Link href="/cart">
                          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground relative group">
                            <ShoppingBasket className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-lg">{cartCount}</span>}
                          </Button>
                        </Link>
                        <Link href="/wallet">
                          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground group">
                            <Wallet className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground group">
                      <Globe className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass p-2 rounded-[2rem] shadow-2xl border-none animate-in fade-in zoom-in-95 duration-200">
                    <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase text-primary tracking-widest">Linguistic Grid</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border mx-2" />
                    {availableLanguages.map((lang) => (
                      <DropdownMenuItem 
                        key={lang.code} 
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                          "rounded-xl cursor-pointer flex justify-between items-center px-4 py-3 transition-all mb-1 last:mb-0",
                          language === lang.code ? "bg-primary text-white font-black" : "text-muted-foreground hover:bg-primary/5"
                        )}
                      >
                        <span className="font-black text-[9px] uppercase tracking-widest">{lang.name}</span>
                        {language === lang.code && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {user ? <UserNav /> : (
                  <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" className="font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground">
                      <Link href="/login">{t('login.signInButton')}</Link>
                    </Button>
                    <Button asChild className="rounded-full shadow-2xl glow-primary font-black uppercase tracking-widest text-[9px] h-10 px-8 bg-primary text-white active:scale-90 transition-all">
                      <Link href="/signup">{t('login.signUpLink')}</Link>
                    </Button>
                  </div>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden rounded-full h-10 w-10 text-foreground"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="h-10 w-full bg-muted/20 animate-pulse rounded-full" />
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] glass flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="space-y-12 text-center">
            <div className="space-y-4">
              <Link href="/login" className="block text-4xl font-black font-headline text-foreground italic uppercase tracking-tighter" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link href="/signup" className="block text-4xl font-black font-headline text-primary italic uppercase tracking-tighter" onClick={() => setMobileMenuOpen(false)}>Join Network</Link>
            </div>
            <div className="h-px w-20 bg-border mx-auto" />
            <div className="space-y-4">
              <Link href="/brochure" className="block text-sm font-black uppercase tracking-widest text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Brochure</Link>
              <Link href="/partners" className="block text-sm font-black uppercase tracking-widest text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Partners</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

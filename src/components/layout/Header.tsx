'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "motion/react"
import {
  Backpack,
  ChevronDown,
  ChevronLeft,
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
  Activity,
  Shirt,
  Ticket,
  CreditCard
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
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BrandLogo } from "./BrandLogo"

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
        <Button variant="ghost" className="px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all group"> {/* Adjusted font size */}
          <Icon className="mr-1.5 h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
          {title}
          <ChevronDown className="ml-1 h-2.5 w-2.5 opacity-40 group-data-[state=open]:rotate-180 transition-transform" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-xs glass p-2 rounded-[2rem] shadow-2xl border-none animate-in fade-in zoom-in-95 duration-200"> {/* Adjusted width */}
        <div className="grid grid-cols-1 gap-1">
          {items.map((item) => (
            <DropdownMenuItem key={item.href} asChild className="rounded-2xl p-3 focus:bg-primary/5 cursor-pointer group">
              <Link href={item.href} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{item.label}</p> {/* Adjusted font size */}
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter line-clamp-1">{item.desc}</p> {/* Adjusted font size */}
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

  const pathname = usePathname()
  const router = useRouter()
  const { user, firestore } = useFirebase()
  const { t, language, setLanguage } = useTranslation()

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const cartQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'cart') : null),
    [user, firestore]
  );
  const { data: cartItems } = useCollection(cartQuery);
  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const isHome = pathname === "/";
  const isNotDashboard = pathname !== "/dashboard";

  if (pathname === '/') return null;

  const orchestrationItems = [
    { label: t('header.aiItinerary'), href: '/itinerary-generator', icon: Bot, desc: t('dashboard.shortDesc.itinerary') },
    { label: t('header.pathfinder'), href: '/pathfinder', icon: Smartphone, desc: t('dashboard.shortDesc.pathfinder') },
    { label: t('header.vibeMarketplace'), href: '/marketplace', icon: ShoppingBasket, desc: t('dashboard.shortDesc.marketplace') },
    { label: t('header.vibeShopping'), href: '/store', icon: Tag, desc: t('dashboard.shortDesc.store') },
    { label: t('header.bookingHub'), href: '/booking', icon: ShoppingBag, desc: t('dashboard.shortDesc.booking') },
    { label: 'Manage Bookings', href: '/manage-bookings', icon: Ticket, desc: 'Review, modify or cancel reservations' },
    { label: t('header.wallet'), href: '/wallet', icon: Wallet, desc: t('dashboard.shortDesc.wallet') },
    { label: t('header.budgetSynthesis'), href: '/budget-synthesis', icon: BarChart3, desc: t('dashboard.shortDesc.budget') },
    { label: t('header.scanAndPay'), href: '/scan-and-pay', icon: CreditCard, desc: "Scan QR codes to pay instantly." },
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
    { label: t('header.digitalTailor'), href: '/digital-tailor', icon: Shirt, desc: t('dashboard.shortDesc.digitalTailor') },
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
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 z-[100] w-full py-2 transition-all duration-500",
        scrolled ? "py-1" : "py-2"
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={cn(
          "flex h-12 items-center px-4 rounded-full transition-all duration-500 border",
          scrolled 
            ? "bg-slate-950/95 backdrop-blur-2xl border-white/20 shadow-2xl" 
            : isHome 
              ? "bg-slate-950/60 backdrop-blur-md border-white/20 shadow-none" 
              : "bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm"
        )}>
          {mounted ? (
            <>
              <div className="flex items-center gap-2">
                {!isHome && (
                  <SidebarTrigger className={cn(
                    "h-10 w-10 rounded-full transition-all shadow-sm border",
                    isHome || scrolled ? "border-white/10 hover:bg-white/10 text-white" : "border-slate-100 hover:bg-primary/5 hover:text-primary"
                  )} />
                )}
                
                {isNotDashboard && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-10 w-10 rounded-full shadow-lg transition-all active:scale-90",
                      isHome || scrolled ? "bg-white text-black hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                    onClick={() => router.back()}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}

                <Link href="/" className="flex items-center gap-3 ml-2 group">
                  <BrandLogo size="sm" src="/logo.png" />
                  <div className="hidden sm:flex flex-col items-start leading-none group-hover:translate-x-1 transition-transform">
                    <span className={cn(
                      "font-headline text-sm font-black tracking-tighter uppercase italic leading-none",
                      isHome || scrolled ? "text-white" : "text-foreground"
                    )}>
                      AETHERIA<span className="text-primary">AI</span>
                    </span>
                    <span className={cn(
                      "text-[6px] font-black uppercase tracking-[0.3em] mt-0.5",
                      isHome || scrolled ? "text-white/40" : "text-muted-foreground"
                    )}>Journey Synthesized</span>
                  </div>
                </Link>
              </div>

              <div className="flex-1" />

              <nav className="hidden items-center gap-1 lg:flex ml-2">
                <Link href="/dashboard" className={cn(
                  "px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition-all", // Adjusted font size
                  pathname === '/dashboard' ? "text-primary bg-primary/5 rounded-full" : "text-muted-foreground hover:text-foreground"
                )}>
                  {t('header.dashboard')}
                </Link>
                <NavDropdown title={t('header.categories.orchestration')} items={orchestrationItems} icon={Zap} />
                <NavDropdown title={t('header.categories.intelligence')} items={intelligenceItems} icon={Dna} />
                <NavDropdown title={t('header.categories.studios')} items={studioItems} icon={Clapperboard} />
                <NavDropdown title={t('header.categories.utility')} items={utilityItems} icon={Activity} />
              </nav>

              <div className="flex items-center justify-end gap-2 sm:gap-4">
                {user && (
                  <div className="flex items-center gap-2">
                    <Link href="/sos">
                      <Button variant="destructive" size="sm" className="rounded-full px-3 sm:px-4 h-9 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-red-500/20 animate-pulse">
                        <Siren className="sm:mr-1.5 h-3.5 w-3.5" /> <span className="hidden sm:inline">SOS</span>
                      </Button>
                    </Link>
                    {!isAdminPortal && !isVendorPortal && (
                      <>
                        <Link href="/scan-and-pay">
                          <Button variant="ghost" size="icon" className={cn(
                            "rounded-full h-10 w-10 group",
                            isHome || scrolled ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                          )}>
                            <CreditCard className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          </Button>
                        </Link>
                        <Link href="/cart">
                          <Button variant="ghost" size="icon" className={cn(
                            "rounded-full h-10 w-10 relative group",
                            isHome || scrolled ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                          )}>
                            <ShoppingBasket className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-lg text-white">{cartCount}</span>}
                          </Button>
                        </Link>
                        <Link href="/wallet">
                          <Button variant="ghost" size="icon" className={cn(
                            "rounded-full h-10 w-10 text-muted-foreground hover:text-foreground group",
                            isHome || scrolled ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                          )}>
                            <Wallet className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn(
                      "rounded-full h-10 w-10 group",
                      isHome || scrolled ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}>
                      <Globe className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-slate-950/90 backdrop-blur-2xl p-2 rounded-[2rem] shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                    <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase text-primary tracking-widest">Linguistic Grid</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10 mx-2" />
                    {availableLanguages.map((lang) => (
                      <DropdownMenuItem 
                        key={lang.code} 
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                          "rounded-xl cursor-pointer flex justify-between items-center px-4 py-3 transition-all mb-1 last:mb-0",
                          language === lang.code ? "bg-primary text-white font-black" : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span className="font-black text-[9px] uppercase tracking-widest">{lang.name}</span>
                        {language === lang.code && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {user ? <UserNav /> : (
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" className={cn(
                      "flex font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-full transition-all",
                      isHome || scrolled 
                        ? "text-white hover:bg-white/20 hover:scale-105" 
                        : "text-slate-900 hover:bg-slate-100 hover:scale-105"
                    )}>
                      <Link href="/login">LOGIN</Link>
                    </Button>
                    <Button asChild className="rounded-full shadow-2xl animate-glow-pulse font-black uppercase tracking-widest text-[9px] h-10 px-6 bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all">
                      <Link href="/signup">SIGN UP</Link>
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
    </motion.header>
  )
}

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Backpack, 
  Sparkles, 
  Bot, 
  Wallet, 
  Camera, 
  Globe, 
  MapPin, 
  History, 
  Wand2, 
  Film, 
  Shirt, 
  Activity, 
  Mic, 
  Trophy, 
  ShieldCheck, 
  ArrowUpRight,
  Zap,
  Star,
  Users,
  Utensils,
  Plane,
  ShoppingBag,
  Handshake,
  View,
  FileText,
  BadgeDollarSign,
  TrendingUp,
  BarChart3,
  Building2,
  Ticket,
  Leaf,
  Wifi,
  Timer,
  Stethoscope,
  Siren,
  Smartphone,
  ShoppingBasket,
  Rocket,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export default function BrochurePage() {
  const { t } = useTranslation();
  const heroImage = PlaceHolderImages.find(img => img.id === 'home-hero');

  const categories = [
    {
      title: t('header.categories.orchestration'),
      desc: "From psychological profiling to secure group logistics.",
      features: [
        { 
          name: t('header.pathfinder'), 
          icon: Smartphone, 
          desc: "The future of planning. Upload an inspiration photo from social media and let our AI synthesize a journey that matches that exact aesthetic vibe.",
          href: "/pathfinder"
        },
        { 
          name: t('header.vibeMarketplace'), 
          icon: ShoppingBasket, 
          desc: "Browse and download viral itinerary templates shared by legendary explorers. Turn proven adventures into your next personalized odyssey.",
          href: "/marketplace"
        },
        { 
          name: t('header.wallet'), 
          icon: Wallet, 
          desc: "Manage multiple global currencies with instant AI-driven exchange rate intelligence. Pay local vendors via Scan & Pay.",
          href: "/wallet"
        },
        { 
          name: t('header.budgetSynthesis'), 
          icon: BarChart3, 
          desc: "The Financial Oracle. Analyze your Smart Wallet data against your budget to get AI 'Smart Swaps' that keep your trip fulfilling and affordable.",
          href: "/budget-synthesis"
        }
      ]
    },
    {
      title: t('header.categories.intelligence'),
      desc: "Understand the hidden layers of your destination.",
      features: [
        { 
          name: "Chronos Lens", 
          icon: History, 
          desc: "Identifies landmarks and synthesizes high-fidelity historical reconstructions. See exactly what your location looked like 100+ years ago.",
          href: "/scanner"
        },
        { 
          name: t('header.visionHub'), 
          icon: Camera, 
          desc: "Decode foreign menus, identify the social narrative behind street art, and discover the true history of local souvenirs via multimodal scanning.",
          href: "/scanner"
        },
        { 
          name: t('header.translator'), 
          icon: Globe, 
          desc: "Master the local dialect with AI-synthesized survival kits and high-fidelity native pronunciation via text-to-speech logic.",
          href: "/translator"
        },
        { 
          name: "Haggling Coach", 
          icon: Handshake, 
          desc: "Master local market psychology. Get a target price and specific negotiation tactics in the local language.",
          href: "/guide"
        }
      ]
    },
    {
      title: t('header.categories.studios'),
      desc: "Transform your memories into cinematic masterpieces.",
      features: [
        { 
          name: t('header.tripOdyssey'), 
          icon: Film, 
          desc: "Using Google Veo 3, we synthesize cinematic film teasers of your journey. Optimized for social sharing with 9:16 vertical support.",
          href: "/video-teaser"
        },
        { 
          name: t('header.postcardStudio'), 
          icon: Wand2, 
          desc: "Turn destination snapshots into high-art postcards with AI-generated poetic captions and multiple artistic styles.",
          href: "/postcard-studio"
        },
        { 
          name: t('header.heritageMirror'), 
          icon: History, 
          desc: "Step into the time-stream. Upload a selfie to see yourself reimagined in the traditional, period-accurate attire of your destination.",
          href: "/heritage-mirror"
        },
        { 
          name: t('header.achievements'), 
          icon: Trophy, 
          desc: "Every journey earns XP. Level up your status from Nomad to Legend, unlocking exclusive tools and community rewards.",
          href: "/dashboard"
        }
      ]
    },
    {
      title: t('header.categories.utility'),
      desc: "Precision tools for seamless human logistics.",
      features: [
        { 
          name: t('header.sos'), 
          icon: Siren, 
          desc: "Immediate emergency response protocols. Silent GPS SOS transmission and high-frequency audible deterrents for absolute safety.",
          href: "/sos"
        },
        { 
          name: t('header.flightStatus'), 
          icon: Plane, 
          desc: "Real-time telemetry for your transitions. Live status board for air, rail, and sea with terminal discovery intelligence.",
          href: "/flight-status"
        },
        { 
          name: t('header.visaArchitect'), 
          icon: ShieldCheck, 
          desc: "Real-time cross-border compliance. Check entry requirements and required documents based on your specific nationality.",
          href: "/visa-architect"
        },
        { 
          name: t('header.carbonSynthesis'), 
          icon: Leaf, 
          desc: "Track your molecular footprint. Calculate CO2 tons from your bookings and reach equilibrium with one-tap wallet offsetting.",
          href: "/carbon-synthesis"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-slate-900 selection:text-white pb-20 -mt-28 lg:-mt-32">
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <Image 
              src={heroImage.imageUrl} 
              alt="VibePack AI Hero" 
              fill 
              className="object-cover grayscale-[0.2]"
              priority
            />
          )}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-50 animate-pulse" />
              <Backpack className="h-24 w-24 relative" />
            </div>
          </div>
          <Badge className="bg-accent text-slate-900 font-black uppercase tracking-[0.3em] px-6 py-2 mb-6">Master Feature Guide 0.0.1</Badge>
          <h1 className="text-6xl md:text-9xl font-black font-headline tracking-tighter leading-none mb-6">
            THE WORLD <br />
            <span className="text-primary italic">RECODED.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl md:text-2xl font-medium opacity-80 leading-relaxed mb-12">
            Welcome to VibePack AI. We have synthesized the world's most advanced AI travel ecosystem to eliminate logistics and amplify immersion.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl font-black text-xl shadow-2xl shadow-primary/20">
              <Link href="/signup" className="flex items-center gap-2">Join the Network <ArrowUpRight className="h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl font-black text-xl border-white/20 text-white hover:bg-white/5">
              <Link href="/brochure-document" className="flex items-center gap-2">Read Formal Specification <FileText className="h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-32 space-y-40">
        {categories.map((cat, idx) => (
          <section key={idx} className="space-y-16">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-1.5 w-16 bg-primary rounded-full" />
                <span className="text-sm font-black uppercase tracking-[0.5em] text-slate-400">Chapter 0{idx + 1}</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black font-headline text-slate-900 tracking-tight leading-none">{cat.title}</h2>
              <p className="text-2xl text-slate-500 font-medium mt-6">{cat.desc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {cat.features.map((feat, fIdx) => (
                <Card key={fIdx} className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[3rem] group hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 bg-white border border-slate-50">
                  <CardContent className="p-12 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-10">
                      <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                        <feat.icon className="h-10 w-10" />
                      </div>
                      <Link href={feat.href}>
                        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-slate-100">
                          <ArrowUpRight className="h-6 w-6 text-slate-300 group-hover:text-primary transition-colors" />
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-4 flex-grow">
                      <h3 className="text-3xl font-black font-headline text-slate-900 tracking-tight">{feat.name}</h3>
                      <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                    <div className="mt-10 pt-8 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Status: Operational</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        <section className="space-y-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1.5 w-16 bg-accent rounded-full" />
              <span className="text-sm font-black uppercase tracking-[0.5em] text-slate-400">Chapter 05</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black font-headline text-slate-900 tracking-tight leading-none">The Economy</h2>
            <p className="text-2xl text-slate-500 font-medium mt-6">A sustainable ecosystem built for travelers, not billing cycles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-slate-50">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Ticket className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black font-headline text-slate-900 mb-4">Trip Passes</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                One-time activation fees per itinerary. No monthly subscriptions.
              </p>
            </Card>
            <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-slate-50">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6">
                <Gift className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black font-headline text-slate-900 mb-4">Odyssey Gifting</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                Purchase experience credits or trip passes for fellow explorers.
              </p>
            </Card>
            <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-slate-50">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-6">
                <Rocket className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black font-headline text-slate-900 mb-4">Turbo Synthesis</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                Skip the render queue for high-fidelity social-ready video synthesis.
              </p>
            </Card>
            <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-slate-50">
              <div className="h-14 w-14 rounded-2xl bg-slate-900/5 flex items-center justify-center text-slate-900 mb-6">
                <ShoppingBasket className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black font-headline text-slate-900 mb-4">Market Royalties</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                Monetize your travel creativity by selling itinerary vibes to others.
              </p>
            </Card>
          </div>
        </section>
      </div>

      <section className="bg-slate-950 py-40 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-5">
          <Globe className="h-[600px] w-[600px]" />
        </div>
        <div className="container mx-auto px-4 text-center space-y-10 relative z-10">
          <Badge className="bg-primary/20 text-primary border-primary/30 font-black px-6 py-2 uppercase tracking-widest">Our Core Philosophy</Badge>
          <h3 className="text-4xl md:text-7xl font-black font-headline italic tracking-tighter leading-tight">
            "The journey is the synthesis <br className="hidden md:block" />
            of human intent and <br className="hidden md:block" />
            infinite intelligence."
          </h3>
          <p className="text-primary font-black uppercase tracking-[0.4em] text-sm">— VibePack AI Systems</p>
        </div>
      </section>

      <section className="py-40 text-center space-y-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h4 className="text-5xl font-black font-headline text-slate-900 tracking-tight leading-none">Ready to start your first odyssey?</h4>
            <p className="text-slate-500 font-medium text-xl">Join 50,000+ explorers who have already upgraded their world view.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            <Button asChild size="lg" className="h-20 px-12 rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/30">
              <Link href="/signup" className="flex items-center gap-2">Get Started for Free <ArrowUpRight className="h-6 w-6" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-20 px-12 rounded-[2rem] font-black text-2xl border-4 border-slate-200">
              <Link href="/dashboard" className="flex items-center gap-2">Enter Command Center <ArrowUpRight className="h-6 w-6" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-16 border-t border-slate-100 text-center bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 grayscale opacity-30">
              <Backpack className="h-6 w-6" />
              <span className="font-headline font-black tracking-tighter">VibePack AI Intelligence</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">Global Edition • Version 0.0.1 • All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

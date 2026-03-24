
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Backpack, 
  Camera, 
  Globe, 
  History, 
  Wand2, 
  Film, 
  Trophy, 
  ShieldCheck, 
  ArrowUpRight,
  Zap,
  Plane,
  ShoppingBag,
  Handshake,
  FileText,
  BarChart3,
  Ticket,
  Leaf,
  Smartphone,
  ShoppingBasket,
  Rocket,
  Gift,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/lib/i18n';

export default function BrochurePage() {
  const { t } = useTranslation();
  const heroImage = PlaceHolderImages.find(img => img.id === 'home-hero');

  const categories = [
    {
      title: "Odyssey Orchestration",
      desc: "From psychological profiling to secure group logistics.",
      features: [
        { 
          name: "Path Finder", 
          icon: Smartphone, 
          desc: "Synthesize a journey from social media inspiration photos.",
          href: "/pathfinder"
        },
        { 
          name: "Vibe Marketplace", 
          icon: ShoppingBasket, 
          desc: "Download viral itinerary templates shared by legendary explorers.",
          href: "/marketplace"
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
              alt="Aetheria Hero" 
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
          <Badge className="bg-accent text-slate-900 font-black uppercase tracking-[0.3em] px-6 py-2 mb-6">Master Guide 0.0.1</Badge>
          <h1 className="text-6xl md:text-9xl font-black font-headline tracking-tighter leading-none mb-6">
            THE WORLD <br />
            <span className="text-primary italic">RECODED.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl md:text-2xl font-medium opacity-80 leading-relaxed mb-12">
            Welcome to Aetheria. We have synthesized the world's most advanced AI travel ecosystem to eliminate logistics and amplify immersion.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl font-black text-xl shadow-2xl shadow-primary/20">
              <Link href="/signup">Join the Network <ArrowUpRight className="h-5 w-5" /></Link>
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
                <Card key={fIdx} className="border-none shadow-lg rounded-[3rem] group hover:shadow-2xl transition-all duration-700 bg-white border border-slate-50">
                  <CardContent className="p-12 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-10">
                      <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-primary">
                        <feat.icon className="h-10 w-10" />
                      </div>
                    </div>
                    <div className="space-y-4 flex-grow">
                      <h3 className="text-3xl font-black font-headline text-slate-900 tracking-tight">{feat.name}</h3>
                      <p className="text-lg text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

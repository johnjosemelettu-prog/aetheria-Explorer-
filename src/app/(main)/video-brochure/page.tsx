'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Sparkles, 
  Bot, 
  MapPin, 
  Film, 
  Wand2, 
  Zap,
  ArrowRight,
  Backpack,
  Compass,
  Globe,
  View,
  History,
  Smartphone,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const trailerChapters = [
  {
    id: 'intent',
    title: 'The Intent Engine',
    subtitle: 'Beyond standard logistics.',
    desc: 'VibePack AI is the world\'s first travel synthesizer. We use psychological profiling and the Visual Path Finder to architect experiences that resonate with your unique aesthetic DNA.',
    image: PlaceHolderImages.find(img => img.id === 'home-hero'),
    icon: Compass,
    accent: 'text-primary'
  },
  {
    id: 'intelligence',
    title: 'Historical Vision',
    subtitle: 'The Chronos Lens.',
    desc: 'Point your camera at any landmark to reconstitute history. See high-fidelity historical recreations of city squares and monuments as they appeared 100+ years ago, narrated by AI.',
    image: PlaceHolderImages.find(img => img.id === 'feature-ar'),
    icon: History,
    accent: 'text-emerald-500'
  },
  {
    id: 'cinematic',
    title: 'Cinematic Synthesis',
    subtitle: 'Viral-Ready Odyssey.',
    desc: 'Using Google Veo 3, we transform your highlights into 1080p cinematic film teasers. Optimized for TikTok and social feeds with native 9:16 vertical support.',
    image: PlaceHolderImages.find(img => img.id === 'feature-vr'),
    icon: Film,
    accent: 'text-purple-500'
  },
  {
    id: 'financial',
    title: 'Financial Oracle',
    subtitle: 'Molecular Ledger.',
    desc: 'Master your Smart Wallet with the Financial Oracle. AI analyzes every transaction to suggest Smart Swaps, ensuring your journey remains fulfilling while optimizing your liquidity.',
    image: PlaceHolderImages.find(img => img.id === 'feature-profile'),
    icon: BarChart3,
    accent: 'text-amber-500'
  }
];

export default function VideoBrochurePage() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary selection:text-white -mt-28 lg:-mt-32">
      <div className="fixed inset-0 z-0">
        {trailerChapters.map((chapter, idx) => (
          <div 
            key={chapter.id}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-in-out transform",
              activeChapter === idx ? "opacity-100 scale-100" : "opacity-0 scale-110"
            )}
          >
            {chapter.image && (
              <Image 
                src={chapter.image.imageUrl} 
                alt={chapter.title} 
                fill 
                className="object-cover grayscale-[0.4] brightness-[0.3]"
                priority={idx === 0}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col justify-center items-start pt-20">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="flex items-center gap-4">
            <Badge className="bg-primary/20 text-primary border-primary/30 font-black uppercase tracking-widest px-4 py-1.5">
              Production Sequence 0{activeChapter + 1}
            </Badge>
            <div className="h-px w-20 bg-white/10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-none italic">
              {trailerChapters[activeChapter].title.split(' ')[0]} <br />
              <span className={cn("text-white", trailerChapters[activeChapter].accent)}>
                {trailerChapters[activeChapter].title.split(' ').slice(1).join(' ')}
              </span>
            </h1>
            <p className="text-2xl md:text-3xl font-black font-headline text-slate-400 uppercase tracking-tighter">
              {trailerChapters[activeChapter].subtitle}
            </p>
          </div>

          <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-2xl">
            {trailerChapters[activeChapter].desc}
          </p>

          <div className="pt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 bg-white text-slate-950 hover:bg-slate-200">
              <Link href="/signup" className="flex items-center gap-2">
                Join the Odyssey <Play className="h-5 w-5 fill-current" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl font-black text-xl border-white/20 text-white hover:bg-white/5">
              <Link href="/itinerary-generator">Start Synthesis</Link>
            </Button>
          </div>
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 items-end">
          {trailerChapters.map((chapter, idx) => (
            <button 
              key={chapter.id}
              onClick={() => setActiveChapter(idx)}
              className="group flex items-center gap-4 text-right"
            >
              <div className="space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Chapter 0{idx + 1}</p>
                <p className={cn(
                  "font-headline font-black text-sm uppercase tracking-tighter",
                  activeChapter === idx ? "text-white" : "text-slate-500"
                )}>
                  {chapter.id}
                </p>
              </div>
              <div className={cn(
                "h-12 w-1.5 rounded-full transition-all duration-500",
                activeChapter === idx ? "bg-primary h-16 scale-x-150" : "bg-white/10 group-hover:bg-white/30"
              )} />
            </button>
          ))}
        </div>

        <div className="absolute bottom-12 left-0 w-full px-8 flex justify-between items-end border-t border-white/5 pt-12">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary animate-pulse">
                {React.createElement(trailerChapters[activeChapter].icon, { className: 'h-6 w-6' })}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Status</p>
                <p className="text-xs font-bold text-white uppercase tracking-tighter">Live Synthesis Active</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="hidden md:block">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Engine</p>
              <p className="text-xs font-bold text-white uppercase tracking-tighter">Google Gemini 2.5 + Veo 3</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-12 w-12 text-white/40 hover:text-white"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-14 w-14 border-white/10 text-white hover:bg-white/5"
                onClick={() => setActiveChapter(prev => (prev === 0 ? trailerChapters.length - 1 : prev - 1))}
              >
                <ChevronRight className="h-6 w-6 rotate-180" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-14 w-14 border-white/10 text-white hover:bg-white/5"
                onClick={() => setActiveChapter(prev => (prev + 1) % trailerChapters.length)}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 20s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

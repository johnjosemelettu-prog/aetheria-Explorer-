
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Printer, 
  ChevronLeft, 
  Backpack, 
  Compass, 
  ShieldCheck,
  Globe,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: "1. Odyssey Orchestration",
    subtitle: "Strategic Logistics & Financial Integration",
    content: "VibePack AI leverages a multi-agent AI architecture to manage the physical and financial dimensions of travel. The AI Odyssey Planner synthesizes itineraries based on a user's psychological profile, while the Smart Wallet provides a unified, multi-currency hub for instant global transactions. The Global eSIM system ensures instant connectivity upon arrival, with destination-aware data plans synthesized in real-time."
  },
  {
    title: "2. The Intelligence Lens",
    subtitle: "Visual AI & Cultural Decoding",
    content: "The Vision AI Hub serves as a real-time interpreter of the destination's environment. Users can scan menus for culinary context, decode the narratives behind urban murals, and identify the artisan origins of souvenirs. Specialized lenses like the Pharmacy Scout allow for the safe decoding of foreign medication labels, while the Haggling Coach provides tactical negotiation protocols tailored to local market psychology."
  },
  {
    title: "3. Creative Synthesis",
    subtitle: "Generative Art & Cinematic Memory",
    content: "Utilizing state-of-the-art models like Google Veo 3 and Imagen 4, VibePack AI transforms standard travel data into high-fidelity creative output. The AI Trip Odyssey generates cinematic film teasers of upcoming journeys, while the Postcard Studio and Heritage Mirror allow users to reimagine their photos and themselves within the artistic and historical context of their destination."
  },
  {
    title: "4. Immersive Exploration",
    subtitle: "Augmented Reality & Local Discovery",
    content: "Immersive tools bridge the gap between navigation and discovery. AR Wayfinding provides intuitive street-level data overlays, and VR Previews offer 360-degree destination trials. The Local Legends AI uses precision GPS to summon ancient folklore and mystical histories at the user's exact coordinates, while Explorer Quests gamify city exploration through curated scavenger hunts."
  },
  {
    title: "5. Explorer's Utility",
    subtitle: "Biological Optimization & Sustainability",
    content: "The platform prioritizes human well-being and environmental responsibility. Jet Lag Logic synthesizes molecular-level recovery plans, while the Carbon Synthesis engine enables explorers to track and offset their travel footprint via the Smart Wallet. Specialized tools like Layover Odyssey transform terminal downtime into high-speed local missions, maximizing the utility of every travel hour."
  }
];

export default function BrochureDocumentPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-primary/10 py-12 md:py-20 font-serif">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Actions Bar */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4 no-print">
          <Button asChild variant="ghost" className="font-sans font-bold text-slate-500">
            <Link href="/brochure">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Visual Brochure
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl font-sans font-bold border-stone-200" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print Document
            </Button>
            <Button size="sm" className="rounded-xl font-sans font-bold shadow-lg">
              <Download className="mr-2 h-4 w-4" /> Export as PDF
            </Button>
          </div>
        </div>

        {/* The Document */}
        <Card className="border-stone-200 shadow-2xl bg-white rounded-none p-12 md:p-20 relative overflow-hidden">
          {/* Subtle Document Header */}
          <div className="flex justify-between items-start mb-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-900 text-white rounded flex items-center justify-center">
                <Backpack className="h-6 w-6" />
              </div>
              <div className="font-sans">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Official Publication</p>
                <p className="text-sm font-black tracking-tighter">Aetheria AI Intelligence Systems</p>
              </div>
            </div>
            <div className="text-right font-sans">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Edition</p>
              <p className="text-sm font-bold">v0.0.1</p>
            </div>
          </div>

          {/* Title Area */}
          <div className="space-y-6 mb-20 text-center md:text-left">
            <Badge variant="outline" className="font-sans border-slate-900 text-slate-900 font-bold uppercase tracking-widest px-4 py-1">Whitepaper & Feature Specification</Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[0.95] font-headline uppercase italic">
              Architecting the <br />
              <span className="italic text-primary">New Exploration.</span>
            </h1>
            <p className="text-xl text-stone-500 max-w-2xl leading-relaxed italic">
              A comprehensive technical and conceptual overview of the Aetheria AI travel ecosystem and its immersive capabilities.
            </p>
          </div>

          <Separator className="bg-stone-100 mb-20" />

          {/* Content Sections */}
          <div className="space-y-20">
            {sections.map((section, idx) => (
              <section key={idx} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">{section.title}</h2>
                  <p className="font-sans text-xs font-black uppercase tracking-[0.4em] text-primary">{section.subtitle}</p>
                </div>
                <p className="text-lg text-stone-600 leading-relaxed text-justify">
                  {section.content}
                </p>
                <div className="pt-4 flex gap-8 font-sans text-[10px] font-black uppercase tracking-widest text-stone-300">
                  <div className="flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> System: Verified</div>
                  <div className="flex items-center gap-2"><Globe className="h-3 w-3" /> Deployment: Global</div>
                </div>
              </section>
            ))}
          </div>

          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none -rotate-12 select-none">
            <Backpack size={800} />
          </div>
        </Card>

        {/* Post-Doc Call to Action */}
        <div className="mt-20 text-center no-print">
          <Card className="bg-primary text-white border-none rounded-[2rem] p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Sparkles className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-6">
              <h4 className="text-3xl font-black font-headline tracking-tighter">Ready to initialize your odyssey?</h4>
              <p className="text-white/70 font-medium max-w-xl mx-auto">Access the full power of the Aetheria AI Intelligence Systems by starting your first itinerary synthesis today.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="h-14 px-8 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-lg">
                  <Link href="/signup">Join the Network <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-xl border-white/20 text-white hover:bg-white/5 font-black text-lg">
                  <Link href="/itinerary-generator">Start Synthesis</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .shadow-2xl { shadow: none !important; }
          Card { border: none !important; }
        }
      `}</style>
    </div>
  );
}

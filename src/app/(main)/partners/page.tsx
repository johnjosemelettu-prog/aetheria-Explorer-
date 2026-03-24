
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  Plane, 
  BedDouble, 
  Ship, 
  Car, 
  ArrowUpRight,
  Handshake,
  BadgeCheck,
  TrendingUp,
  Zap,
  BarChart3,
  Cpu,
  Database,
  Shield,
  Lock,
  Search,
  CheckCircle2,
  Shirt,
  Smartphone,
  Tag,
  ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const tourismPartners = [
  { id: 'logo-tourism-1', name: 'Visit France', role: 'Official Data Partner' },
  { id: 'logo-tourism-2', name: 'JNTO Japan', role: 'Cultural Heritage Partner' },
  { id: 'logo-tourism-3', name: 'Amazing Thailand', role: 'Local Insider Partner' },
];

const corporatePartners = [
  { id: 'logo-corp-1', name: 'AeroLux', role: 'Primary Flight Provider', icon: Plane },
  { id: 'logo-corp-2', name: 'Grand Explorer', role: 'Boutique Hotel Provider', icon: BedDouble },
  { id: 'logo-corp-3', name: 'Oceanic Voyages', role: 'Cruise Line Partner', icon: Ship },
];

const retailPartners = [
  { id: 'logo-retail-1', name: 'Patagonia', role: 'Technical Gear Partner', icon: Shirt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'logo-retail-2', name: 'Aura Systems', role: 'Travel Utility Node', icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'logo-retail-3', name: 'Vortex Tech', role: 'Electronics Provider', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
];

const protectionPartners = [
  { id: 'logo-protect-1', name: 'Aura Underwriting', role: 'Lead Protection Node', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'logo-protect-2', name: 'Sentinel Global', role: 'Risk Mitigation Sync', icon: Shield, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'logo-protect-3', name: 'Aether Assurance', role: 'Full-Spectrum Sentinel', icon: Lock, color: 'text-blue-600', bg: 'bg-blue-50' },
];

const techProviders = [
  { id: 'logo-tech-1', name: 'Google Cloud', role: 'Infrastructure Node', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'logo-tech-2', name: 'Google Gemini', role: 'AI Synthesis Engine', icon: Cpu, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'logo-tech-3', name: 'Firebase', role: 'Real-time Backend Node', icon: Database, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function PartnersPage() {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const renderPartnerCard = (partner: any, Icon?: any) => {
    const logo = PlaceHolderImages.find(p => p.id === partner.id);
    return (
      <Card key={partner.id} className="group border-none shadow-xl rounded-[3rem] overflow-hidden bg-white flex flex-col hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="relative h-48 w-full bg-slate-50 flex items-center justify-center p-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white opacity-50" />
          {logo && (
            <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100 transform group-hover:scale-110">
              <Image 
                src={logo.imageUrl} 
                alt={partner.name} 
                fill 
                className="object-contain"
                data-ai-hint={logo.imageHint}
              />
            </div>
          )}
          <Badge className="absolute top-4 right-4 bg-white/80 text-slate-400 border-none font-black uppercase text-[8px] tracking-[0.2em] shadow-sm">
            Node {partner.id.split('-').pop()}
          </Badge>
        </div>
        
        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle className="text-2xl font-black font-headline text-slate-900 tracking-tighter">{partner.name}</CardTitle>
              <CardDescription className="font-bold text-primary uppercase tracking-widest text-[10px] mt-1">
                {partner.role}
              </CardDescription>
            </div>
            {Icon && (
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 flex-grow">
          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Connection: Active</span>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5">
              Protocol Docs <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-24 text-center space-y-6">
        <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest py-1.5 px-4 text-[10px] rounded-full">Global Intelligence Network</Badge>
        <h1 className="font-headline text-5xl font-black tracking-tight md:text-8xl text-slate-900 leading-none italic uppercase">
          The Ecosystem
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
          VibePack AI is powered by a high-fidelity network of tourism boards, logistics providers, and technology nodes.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
        {[
          { icon: TrendingUp, title: "Market Access", desc: "Gain direct visibility to high-intent travelers using our AI Odyssey Planner.", color: "text-primary" },
          { icon: BarChart3, title: "DNA Analytics", desc: "Access anonymized psychological travel trends to optimize your offerings.", color: "text-accent" },
          { icon: Zap, title: "API Integration", desc: "Seamlessly plug your inventory into our multi-currency Smart Wallet.", color: "text-amber-500" }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[2.5rem] p-10 bg-white group hover:shadow-2xl transition-all duration-500 border border-slate-50">
            <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-8 shadow-inner group-hover:bg-slate-900 transition-all duration-500">
              <item.icon className={cn("h-8 w-8 transition-colors duration-500", item.color, "group-hover:text-white")} />
            </div>
            <h3 className="text-2xl font-black font-headline text-slate-900 mb-4 uppercase tracking-tighter">{item.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-40">
        <section className="space-y-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-16 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Layer 01</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-headline text-slate-900 tracking-tighter uppercase italic">Intelligence Core</h2>
            <p className="text-xl text-slate-500 font-medium mt-4">The high-fidelity cloud infrastructure powering our real-time synthesis and secure ledger.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {techProviders.map((partner) => renderPartnerCard(partner, partner.icon))}
          </div>
        </section>

        <section className="space-y-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-16 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Layer 02</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-headline text-slate-900 tracking-tighter uppercase italic">Guardian Grid</h2>
            <p className="text-xl text-slate-500 font-medium mt-4">Verified insurance providers ensuring safety and asset protection across all destination nodes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {protectionPartners.map((partner) => renderPartnerCard(partner, partner.icon))}
          </div>
        </section>

        <section className="space-y-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-16 bg-accent rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Layer 03</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-headline text-slate-900 tracking-tighter uppercase italic">Vibe Store Affiliates</h2>
            <p className="text-xl text-slate-500 font-medium mt-4">Verified gear and utility providers synthesized into our Gear Architect hub.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {retailPartners.map((partner) => renderPartnerCard(partner, partner.icon))}
          </div>
        </section>

        <section className="space-y-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-16 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Layer 04</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-headline text-slate-900 tracking-tighter uppercase italic">Logistics Radar</h2>
            <p className="text-xl text-slate-500 font-medium mt-4">Consolidated transit and accommodation providers integrated via our high-speed API network.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {corporatePartners.map((partner) => renderPartnerCard(partner, partner.icon))}
          </div>
        </section>

        <section className="space-y-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-16 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Layer 05</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-headline text-slate-900 tracking-tighter uppercase italic">Cultural Sovereigns</h2>
            <p className="text-xl text-slate-500 font-medium mt-4">Working directly with national departments to synthesize authentic and ethical cultural intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {tourismPartners.map((partner) => renderPartnerCard(partner, Globe))}
          </div>
        </section>

        <Card className="border-none shadow-2xl rounded-[4rem] bg-slate-900 text-white p-12 md:p-24 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <Handshake className="h-64 w-64 text-primary" />
          </div>
          <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
            <Badge className="bg-primary text-white border-none font-black uppercase tracking-[0.4em] px-6 py-2">Alliance Protocol</Badge>
            <h3 className="text-5xl md:text-7xl font-black font-headline tracking-tighter leading-[0.9] italic">SCALE YOUR <br /><span className="text-primary">INTENT.</span></h3>
            <p className="text-slate-400 text-xl font-medium leading-relaxed">
              Integrate your inventory or data nodes into the VibePack AI ecosystem. Our Strategic Partnerships team is reviewing new nodes for the 2026 Season.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button size="lg" className="h-20 px-12 rounded-[2rem] bg-white text-slate-900 hover:bg-slate-200 font-black text-2xl shadow-2xl transition-all active:scale-95">
                Contact Strategy Hub
              </Button>
              <Button variant="outline" size="lg" className="h-20 px-12 rounded-[2rem] border-4 border-white/10 text-white hover:bg-white/5 font-black text-2xl">
                Developer API
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <footer className="mt-40 pt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between opacity-40 grayscale">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-slate-400" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Verified Strategic Network</p>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.6em] mt-6 md:mt-0">Protocol v0.0.1 • All Nodes Secured</p>
      </footer>
    </div>
  );
}

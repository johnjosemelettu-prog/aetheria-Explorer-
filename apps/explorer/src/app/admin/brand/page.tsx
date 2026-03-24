'use client';

import React from 'react';
import { 
  Download, 
  ImageIcon, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Backpack,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/layout/BrandLogo';
import Image from 'next/image';

/**
 * @fileOverview Brand Asset Node.
 * Provides access to high-fidelity brand assets, including PNG icons synthesized at runtime.
 */
export default function BrandAssetPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
            <Zap className="text-primary h-8 w-8" />
            Brand Assets
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage high-fidelity identity nodes and PNG synthesis.</p>
        </div>
        <Button className="rounded-xl h-12 px-6 font-black shadow-xl shadow-primary/20">
          <Share2 className="mr-2 h-4 w-4" /> Share Asset Grid
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-10">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[8px] mb-4 px-3">Synthesis Active</Badge>
                  <CardTitle className="text-3xl font-black font-headline tracking-tighter uppercase italic">Master Application Icon</CardTitle>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-primary shadow-inner">
                  <ImageIcon className="h-10 w-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative h-64 w-64 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50 group">
                  <Image 
                    src="/icon" 
                    alt="Aetheria PNG Logo" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <p className="text-white font-black uppercase text-[10px] tracking-widest">Right Click & Save</p>
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xl font-black font-headline text-slate-900 uppercase">PNG Identity Node</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      The application icon is synthesized dynamically at 512x512 resolution. This node is used for Favicons, PWA manifest nodes, and Apple home screens.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button asChild className="h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                      <a href="/icon" download="aetheria-logo.png">
                        <Download className="mr-2 h-6 w-6" /> Download PNG (512px)
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="h-14 rounded-2xl font-bold border-2">
                      <a href="/apple-icon" download="aetheria-apple-icon.png">
                        <Smartphone className="mr-2 h-5 w-5" /> Apple Home Screen Node
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
              <h3 className="text-xl font-black font-headline text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                <Globe className="h-6 w-6 text-primary" /> Visual DNA
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Primary Node</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#6366f1]" />
                    <span className="font-mono text-[10px] font-bold text-slate-600">#6366F1</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Guardian Node</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#020617]" />
                    <span className="font-mono text-[10px] font-bold text-slate-600">#020617</span>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
              <h3 className="text-xl font-black font-headline text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                <ShieldCheck className="h-6 w-6 text-emerald-600" /> Usage Policy
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                "The Aetheria Identity node must maintain 20% clear space across all digital trajectories. Color synthesis is restricted to the verified palette nodes."
              </p>
            </Card>
          </div>
        </div>

        <aside className="lg:col-span-5 space-y-10">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <Backpack size={400} />
            </div>
            <div className="relative z-10 space-y-8">
              <h3 className="text-3xl font-black font-headline italic uppercase tracking-tighter leading-none">Aura Design System</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                The Aetheria brand node is a synthesis of three core elements:
              </p>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shadow-inner">
                    <Backpack className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-widest text-white">The Explorer</p>
                    <p className="text-[10px] text-slate-500 font-medium">Core backpack geometry representing standard travel.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shadow-inner">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-widest text-white">The Intelligence</p>
                    <p className="text-[10px] text-slate-500 font-medium">Spark node representing multi-agent AI synthesis.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shadow-inner">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-widest text-white">The Grid</p>
                    <p className="text-[10px] text-slate-500 font-medium">Aura ring representing global connectivity.</p>
                  </div>
                </li>
              </ul>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
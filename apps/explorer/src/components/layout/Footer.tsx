
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Scale, Lock, ShieldAlert, FileText, Presentation, Instagram, Facebook, Youtube, Zap, ArrowUpRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { BrandLogo } from './BrandLogo'

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
  </svg>
)

export function Footer() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-slate-950 text-white border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        {mounted ? (
          <>
            <div className="flex flex-col lg:flex-row justify-between gap-20">
              <div className="max-w-md">
                <Link href="/" className="flex items-center gap-4 group cursor-pointer w-fit mb-8">
                  <BrandLogo size="lg" src="/logo.png" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="font-headline text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                      AETHERIA<span className="text-primary">AI</span>
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mt-1">Journey Synthesized</span>
                  </div>
                </Link>
                <p className="text-slate-400 text-xl font-black italic leading-none uppercase mb-12">
                  "The future of travel isn't just about where you go, but how you synthesize the reality of your journey."
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-primary hover:text-white transition-all border border-white/5 group">
                    <XIcon className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-primary hover:text-white transition-all border border-white/5 group">
                    <Instagram className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-primary hover:text-white transition-all border border-white/5 group">
                    <Youtube className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Protocols</h4>
                  <ul className="space-y-4">
                    <li><Link href="/terms" className="text-slate-400 hover:text-white font-black uppercase text-[11px] tracking-widest transition-colors flex items-center gap-2 group">Terms <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                    <li><Link href="/privacy" className="text-slate-400 hover:text-white font-black uppercase text-[11px] tracking-widest transition-colors flex items-center gap-2 group">Privacy <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                    <li><Link href="/data-security" className="text-slate-400 hover:text-white font-black uppercase text-[11px] tracking-widest transition-colors flex items-center gap-2 group">Security <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                  </ul>
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Network</h4>
                  <ul className="space-y-4">
                    <li><Link href="/legal" className="text-slate-400 hover:text-white font-black uppercase text-[11px] tracking-widest transition-colors flex items-center gap-2 group">Legal <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                    <li><Link href="/brochure" className="text-slate-400 hover:text-white font-black uppercase text-[11px] tracking-widest transition-colors flex items-center gap-2 group">Brochure <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                    <li><Link href="/partners" className="text-slate-400 hover:text-white font-black uppercase text-[11px] tracking-widest transition-colors flex items-center gap-2 group">Partners <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                  </ul>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Support</h4>
                  <ul className="space-y-4">
                    <li><Link href="/contact" className="text-slate-400 hover:text-white font-black uppercase text-[11px] tracking-widest transition-colors flex items-center gap-2 group">Hub <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                    <li><Link href="/faq" className="text-slate-400 hover:text-white font-black uppercase text-[11px] tracking-widest transition-colors flex items-center gap-2 group">FAQ <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  All Systems Operational • {currentYear} Aetheria AI
                </p>
              </div>
              
              <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer group">
                <Zap className="h-5 w-5 text-primary group-hover:animate-pulse" />
                <span className="font-headline font-black text-sm tracking-tighter uppercase text-white italic">Powered by Aetheria Neural Grid</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 w-full bg-white/5 rounded-[3rem] animate-pulse" />
        )}
      </div>
    </footer>
  )
}

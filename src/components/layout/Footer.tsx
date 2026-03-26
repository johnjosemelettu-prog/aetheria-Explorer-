
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Backpack, Scale, Lock, ShieldAlert, FileText, Presentation, Instagram, Facebook, Youtube, Zap, Globe, Users } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

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
    <footer className="bg-background text-foreground border-t border-border overflow-hidden pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-10 md:py-20">
        {mounted ? (
          <>
            <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
              <Link href="/" className="flex items-center gap-3 md:gap-4 group cursor-pointer w-fit">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="relative h-12 w-12 md:h-16 md:w-16 bg-slate-950 rounded-xl md:rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 group-hover:-rotate-3 shadow-2xl overflow-hidden">
                    <Globe className="absolute h-10 w-10 md:h-12 md:w-12 text-white/5 animate-spin-slow" />
                    <Backpack className="h-6 w-6 md:h-8 md:w-8 text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    <div className="absolute -top-0.5 -right-0.5 h-5 w-5 md:h-7 md:w-7 bg-primary rounded-lg md:rounded-xl flex items-center justify-center border-2 md:border-4 border-slate-950 shadow-lg z-20">
                      <Zap className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-white fill-white animate-pulse" />
                    </div>
                    <div className="absolute -bottom-0.5 -left-0.5 h-4 w-4 md:h-6 md:w-6 bg-secondary rounded-full flex items-center justify-center border-2 md:border-4 border-slate-950 z-20">
                      <Users className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-slate-950" strokeWidth={3} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-foreground leading-none">
                    AETHERIA<span className="text-primary">AI</span>
                  </span>
                  <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-1">Journey Synthesized</span>
                </div>
              </Link>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-12 w-full max-w-5xl">
                <Link href="/terms" className="group space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-muted mx-auto flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <Scale className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                    {t('footer.terms')}
                  </p>
                </Link>
                <Link href="/privacy" className="group space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-muted mx-auto flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <Lock className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                    {t('footer.privacyProtocol')}
                  </p>
                </Link>
                <Link href="/data-security" className="group space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-muted mx-auto flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                    {t('footer.dataSecurity')}
                  </p>
                </Link>
                <Link href="/legal" className="group space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-muted mx-auto flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                    {t('footer.legalHub')}
                  </p>
                </Link>
                <Link href="/brochure" className="group space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-muted mx-auto flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                    <Presentation className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                    {t('header.digitalBrochure')}
                  </p>
                </Link>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {t('footer.globalConnect')}
                </p>
                <div className="flex items-center gap-4 justify-center">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted hover:bg-primary hover:text-white transition-all">
                    <XIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted hover:bg-primary hover:text-white transition-all">
                    <Instagram className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted hover:bg-primary hover:text-white transition-all">
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted hover:bg-primary hover:text-white transition-all">
                    <Youtube className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-sm font-bold text-muted-foreground">
                {t('footer.allRightsReserved', { year: currentYear })}
              </p>
              <div className="flex items-center gap-6">
                <Link href="/contact" className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest">
                  {t('footer.supportHub')}
                </Link>
                <Link href="/partners" className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest">
                  {t('footer.partnerNetwork')}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Backpack className="h-6 w-6 text-primary" />
                <span className="font-headline font-black text-xl tracking-tighter uppercase text-foreground">Aetheria AI Systems</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-32 w-full bg-muted/20 rounded-[2rem] animate-pulse" />
        )}
      </div>
    </footer>
  )
}

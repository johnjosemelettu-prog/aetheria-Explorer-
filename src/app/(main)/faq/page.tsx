'use client';

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  Bot, 
  Zap, 
  Wallet, 
  ShieldCheck, 
  Globe, 
  Sparkles, 
  ChevronRight,
  MessageCircle,
  ArrowUpRight,
  Layers,
  Compass,
  Lock,
  Cpu
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const faqCategories = [
  { 
    id: 'general', 
    title: 'Initialization', 
    icon: Zap, 
    color: 'text-primary', 
    bg: 'bg-primary/5',
    questions: [
      { q: 'faq.questions.whatIsAetheria.q', a: 'faq.questions.whatIsAetheria.a' },
      { q: 'faq.questions.isItFree.q', a: 'faq.questions.isItFree.a' }
    ]
  },
  { 
    id: 'orchestration', 
    title: 'Orchestration', 
    icon: Compass, 
    color: 'text-secondary', 
    bg: 'bg-secondary/10',
    questions: [
      { q: 'faq.questions.howItineraryWorks.q', a: 'faq.questions.howItineraryWorks.a' },
      { q: 'faq.questions.pathFinderFee.q', a: 'faq.questions.pathFinderFee.a' }
    ]
  },
  { 
    id: 'intelligence', 
    title: 'Intelligence', 
    icon: Cpu, 
    color: 'text-accent', 
    bg: 'bg-accent/5',
    questions: [
      { q: 'faq.questions.visionHubPrivacy.q', a: 'faq.questions.visionHubPrivacy.a' },
      { q: 'faq.questions.chronosLens.q', a: 'faq.questions.chronosLens.a' }
    ]
  },
  { 
    id: 'assets', 
    title: 'Assets & Wallet', 
    icon: Wallet, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50',
    questions: [
      { q: 'faq.questions.walletSecurity.q', a: 'faq.questions.walletSecurity.a' },
      { q: 'faq.questions.exchangeRates.q', a: 'faq.questions.exchangeRates.a' }
    ]
  }
];

export default function FaqPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-20 text-center space-y-6">
        <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-[0.3em] py-1.5 px-4 text-[10px] rounded-full">Intelligence Hub</Badge>
        <h1 className="font-headline text-5xl font-black tracking-tighter md:text-8xl text-slate-900 leading-[0.85] italic uppercase">
          Logic <br />
          <span className="text-primary italic">Resolved.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Everything you need to know about navigating the Aetheria ecosystem and its high-fidelity features.
        </p>
      </header>

      <div className="max-w-2xl mx-auto mb-20">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search the logic grid..." 
            className="h-20 rounded-[2.5rem] pl-16 border-none shadow-2xl bg-white text-xl font-bold focus:ring-4 ring-primary/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* FAQ Categories & Questions */}
        <div className="lg:col-span-8 space-y-12">
          {faqCategories.map((cat) => (
            <section key={cat.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg", cat.bg, cat.color)}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter italic">{cat.title}</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {cat.questions.map((item, idx) => (
                    <AccordionItem 
                      key={idx} 
                      value={`${cat.id}-${idx}`} 
                      className="border-none shadow-lg rounded-[2rem] bg-white overflow-hidden px-8 transition-all hover:shadow-xl"
                    >
                      <AccordionTrigger className="hover:no-underline py-6">
                        <span className="text-left font-black text-lg text-slate-900 tracking-tight">{t(item.q)}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-8 text-slate-500 font-medium leading-relaxed text-base">
                        {t(item.a)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          ))}
        </div>

        {/* Support Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[3rem] p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Sparkles className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center backdrop-blur-md shadow-xl">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black font-headline tracking-tight uppercase italic">Need more intel?</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Ruth AI is standing by</p>
                </div>
              </div>
              <p className="text-lg font-medium leading-relaxed opacity-90">
                If the logic grid hasn't resolved your query, open a direct link to Ruth for instant assistance.
              </p>
              <Button asChild variant="outline" className="w-full h-16 bg-white text-primary hover:bg-slate-50 border-none font-black text-lg rounded-2xl shadow-2xl">
                <Link href="/contact">Contact Support <ArrowUpRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 p-6 opacity-10"><ShieldCheck className="h-24 w-24 text-primary" /></div>
            <h4 className="font-headline font-black text-xl mb-6">Security Protocol</h4>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
              Your data integrity is our priority. Every synthesis and transaction is secured via the Guardian Grid.
            </p>
            <Button asChild variant="link" className="p-0 h-auto text-primary font-black">
              <Link href="/privacy" className="flex items-center gap-2">Read Privacy Specs <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </Card>

          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary flex-shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">System Status</p>
              <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                "All intelligence nodes are operational. Current synthesis latency: 1.2s"
              </p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="mt-32 pt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between opacity-40 grayscale gap-8">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-slate-400" />
          <p className="text-xs font-bold uppercase tracking-widest">Logic Hub v0.0.1</p>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest">© 2026 Aetheria AI Intelligence Systems</p>
      </footer>
    </div>
  );
}

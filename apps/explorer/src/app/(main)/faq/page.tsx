
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
      { q: 'What is Aetheria AI?', a: 'Aetheria is a multi-agent AI travel ecosystem designed to eliminate logistical load and amplify human immersion through high-fidelity orchestration.' },
      { q: 'Is it free to use?', a: 'Identity nodes and basic logistics are free. We utilize one-time Trip Passes for premium intelligence features like AR Wayfinding and Cinematic Teasers.' }
    ]
  },
  { 
    id: 'orchestration', 
    title: 'Orchestration', 
    icon: Compass, 
    color: 'text-secondary', 
    bg: 'bg-secondary/10',
    questions: [
      { q: 'How does the Itinerary Architect work?', a: 'It synthesizes a daily trajectory based on your psychological vibe and real-time destination climate data.' },
      { q: 'What is the Path Finder fee?', a: 'Visual Path Finder requires a $5.00 synthesis fee to map destination DNA from your uploaded social anchors.' }
    ]
  },
  { 
    id: 'assets', 
    title: 'Assets & Wallet', 
    icon: Wallet, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50',
    questions: [
      { q: 'Is my Smart Wallet secure?', a: 'Every transaction is verified by the Guardian Grid and uses atomic increment logic to ensure ledger integrity.' },
      { q: 'How do exchange rates work?', a: 'Rates are updated every 60 seconds from global liquidity nodes to ensure high-fidelity conversion accuracy.' }
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
                        <span className="text-left font-black text-lg text-slate-900 tracking-tight">{item.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-8 text-slate-500 font-medium leading-relaxed text-base">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          ))}
        </div>

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
        </aside>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  FileText, 
  ChevronRight,
  Stethoscope,
  Briefcase,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const legalNodes = [
  {
    title: "AI Accuracy Mandate",
    icon: Zap,
    desc: "Backpacker utilizes generative AI (Google Gemini & Veo) to synthesize content. These outputs are probabilistic and should be independently verified.",
    badge: "Operational Disclaimer"
  },
  {
    title: "Medical Information",
    icon: Stethoscope,
    desc: "The Pharmacy Scout tool is for informational purposes only. It does not constitute medical advice or prescriptions.",
    badge: "Health Mandate"
  },
  {
    title: "Financial Synthesis",
    icon: Scale,
    desc: "The Smart Wallet and Financial Oracle provide suggestive data. Backpacker is not a registered financial advisor.",
    badge: "Asset Protocol"
  }
];

export default function LegalHubPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Backpacker Systems</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          Legal Hub
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Comprehensive regulatory and operational frameworks for the Backpacker ecosystem.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {legalNodes.map((node, i) => (
          <Card key={i} className="border-none shadow-lg rounded-[2rem] p-8 bg-white group hover:bg-slate-900 transition-all duration-500">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white mb-6 transition-all">
              <node.icon className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="mb-4 border-slate-100 text-slate-400 group-hover:text-primary group-hover:border-primary/20 text-[8px] font-black uppercase tracking-widest">{node.badge}</Badge>
            <h3 className="text-xl font-black font-headline text-slate-900 group-hover:text-white mb-2">{node.title}</h3>
            <p className="text-sm text-slate-500 group-hover:text-slate-400 font-medium leading-relaxed">{node.desc}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-10">
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-black font-headline uppercase tracking-tighter">Regulatory Framework</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Version 2.0.26 • Effective February 2026</CardDescription>
              </div>
              <Globe className="h-12 w-12 text-primary opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" /> 1. Compliance Protocol
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Backpacker operates under the <strong>Global Digital Nomad Accord</strong>. We ensure that all cross-border intelligence (Visa Architect) is synthesized from verified government nodes. However, travelers are legally responsible for their own documentation and compliance with local laws.
              </p>
            </section>

            <Separator className="bg-slate-100" />

            <section className="space-y-6">
              <h2 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" /> 2. Partner Indemnity
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Third-party bookings (Flights, Hotels, Cruises) are subject to the specific terms of the fulfilling partner. Backpacker acts as an AI Orchestrator and is not liable for service interruptions caused by physical logistics providers.
              </p>
            </section>

            <Separator className="bg-slate-100" />

            <section className="space-y-6">
              <h2 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500" /> 3. SOS Limitation
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                The SOS Panic Hub is a software deterrent and transmission tool. It does not replace local emergency services. Backpacker does not guarantee response times from local authorities or medical teams.
              </p>
            </section>
          </CardContent>
          <CardFooter className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Formal Document Ref: BP-LEGAL-2026-X</p>
            </div>
            <Button asChild variant="outline" className="rounded-xl font-bold">
              <Link href="/terms">Full Terms of Service <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
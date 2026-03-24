'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, AlertTriangle, Scale, FileText, Zap, Wallet, Users, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Backpacker Operational Protocol</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          Terms of Service
        </h1>
        <p className="mt-4 text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Rules and responsibilities for explorers within the Backpacker Intelligence ecosystem.
        </p>
      </header>

      <div className="space-y-10">
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10"><Scale className="h-40 w-40 rotate-12" /></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-2">
                <CardTitle className="text-4xl font-black font-headline uppercase tracking-tighter">1. User Agreement</CardTitle>
                <CardDescription className="text-slate-400 font-medium text-lg">By initializing any AI synthesis or booking flow, you agree to these high-fidelity protocols.</CardDescription>
              </div>
              <Badge className="bg-primary text-white border-none font-bold uppercase px-4 py-1.5">Active Protocol</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10 md:p-16 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tight">1.1 AI Accuracy Mandate</h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Backpacker utilizes advanced generative artificial intelligence to synthesize itineraries, translations, and historical reconstructions. While we strive for absolute precision, <strong>AI-generated content may contain inaccuracies.</strong>
              </p>
              <div className="p-6 rounded-[2rem] bg-amber-50 border-2 border-dashed border-amber-200 text-sm text-amber-900 font-bold italic leading-relaxed">
                Requirement: Users must independently verify flight times, visa requirements, and safety protocols before departure. Backpacker assumes no liability for missed nodes caused by probabilistic AI outputs.
              </div>
            </section>

            <Separator className="bg-slate-100" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tight">1.2 Smart Wallet & Bookings</h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                All financial transactions within the Smart Wallet are processed securely via the **Guardian Protocol**. Once a "Scan & Pay" or booking transaction is authorized, it is considered final. Refunds for cancellations are subject to the specific provider's terms and will be returned to your wallet balance minus any synthesis fees.
              </p>
            </section>

            <Separator className="bg-slate-100" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tight">1.3 Community Ethics</h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Users may not use our Vision AI Hub or TransitConnect features to harass, stalk, or invade the privacy of others. Any misuse of AR navigation for trespassing or illegal entry into restricted destination nodes will result in immediate account termination.
              </p>
            </section>
          </CardContent>
          <CardFooter className="p-10 bg-slate-50 border-t border-slate-100">
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Identity-Verified Agreement</p>
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Version 0.0.1 • Reference: BP-TERMS-0.0.1-ALPHA</p>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-12 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <Zap className="h-40 w-40 text-primary" />
          </div>
          <div className="relative z-10 space-y-8 max-w-2xl">
            <h4 className="text-3xl font-black font-headline italic tracking-tighter leading-tight">Limitation of Liability</h4>
            <p className="text-slate-400 leading-relaxed font-medium text-lg">
              Backpacker Intelligence Systems shall not be liable for any direct, indirect, or incidental damages resulting from your use of the platform, including missed connections, travel delays, or errors in AI-generated cultural advice.
            </p>
            <Button asChild className="rounded-xl h-12 bg-white text-slate-900 hover:bg-slate-200 font-bold">
              <Link href="/contact">Legal Inquiry Hub <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

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
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Aetheria Operational Protocol</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          Terms of Service
        </h1>
        <p className="mt-4 text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Rules and responsibilities for explorers within the Aetheria Intelligence ecosystem.
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
                Aetheria utilizes advanced generative artificial intelligence to synthesize itineraries, translations, and historical reconstructions. While we strive for absolute precision, <strong>AI-generated content may contain inaccuracies.</strong>
              </p>
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
                All financial transactions within the Smart Wallet are processed securely via the **Guardian Protocol**. Once a "Scan & Pay" or booking transaction is authorized, it is considered final.
              </p>
            </section>
          </CardContent>
          <CardFooter className="p-10 bg-slate-50 border-t border-slate-100">
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Identity-Verified Agreement</p>
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Version 0.0.1 • Reference: AE-TERMS-0.0.1-ALPHA</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

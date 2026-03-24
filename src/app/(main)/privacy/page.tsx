'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { ShieldCheck, Eye, Lock, Camera, MapPin, Database, Sparkles, Fingerprint, ShieldAlert, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Data Integrity Node</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          Privacy Protocol
        </h1>
        <p className="mt-4 text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Your journey is yours alone. We architect our intelligence to protect your Travel DNA.
        </p>
      </header>

      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg rounded-3xl p-8 bg-white text-center hover:shadow-xl transition-all">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner"><Lock className="h-7 w-7" /></div>
            <h3 className="font-black text-slate-900 font-headline text-lg uppercase tracking-tighter">Private by Design</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">Your travel profile is encrypted and isolated from public access nodes.</p>
          </Card>
          <Card className="border-none shadow-lg rounded-3xl p-8 bg-white text-center hover:shadow-xl transition-all">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-inner"><Eye className="h-7 w-7" /></div>
            <h3 className="font-black text-slate-900 font-headline text-lg uppercase tracking-tighter">Zero Tracking</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">We never sell your movement data. We monetize through Trip Passes, not your data.</p>
          </Card>
          <Card className="border-none shadow-lg rounded-3xl p-8 bg-white text-center hover:shadow-xl transition-all">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-inner"><ShieldCheck className="h-7 w-7" /></div>
            <h3 className="font-black text-slate-900 font-headline text-lg uppercase tracking-tighter">Total Control</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">Manage your "Explorer DNA" and purge your history at any moment.</p>
          </Card>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardContent className="p-10 md:p-16 space-y-16">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Database className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">1. Data We Synthesize</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                To provide a high-fidelity travel experience, we collect your <strong>Travel DNA</strong>: preferred vibes, dietary needs, and historical interests. This information is used exclusively to prime our AI models for your specific journey.
              </p>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                <Sparkles className="h-5 w-5 text-primary mt-1" />
                <p className="text-sm text-slate-500 italic">"We treat your preferences as a seed for synthesis, not as a target for profiling."</p>
              </div>
            </section>

            <Separator className="bg-slate-100" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Camera className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">2. Visual Intelligence Hub</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Our Vision AI Hub processes camera feeds in real-time. <strong>We do not store raw video or photo data</strong> on our servers unless you explicitly choose to "Save to Journal" or "Create Postcard." Analysis is performed on-device or via secure, transient server sessions that are purged immediately after synthesis.
              </p>
            </section>

            <Separator className="bg-slate-100" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">3. Geolocation Protocols</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Backpacker uses GPS data for AR Wayfinding and Local Legends. This data is strictly used for real-time feature delivery and is not used to build a permanent history of your movements outside of the trip context you've created.
              </p>
            </section>

            <Separator className="bg-slate-100" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">4. Guardian Grid Security</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Identity and Wallet data are secured using 256-bit encryption. Access to your SOS Hub location data is only granted to verified emergency responders during an active Panic Protocol.
              </p>
            </section>
          </CardContent>
          <CardFooter className="p-10 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <Fingerprint className="h-10 w-10 text-primary" />
              <div>
                <p className="font-black font-headline text-xl">Privacy Verified</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Protocol v0.0.1 • Global Edition</p>
              </div>
            </div>
            <Button asChild className="rounded-xl h-12 bg-white text-slate-900 hover:bg-slate-200 font-bold px-8">
              <Link href="/data-security">Technical Security Specs</Link>
            </Button>
          </CardFooter>
        </Card>

        <footer className="text-center py-10 opacity-40 grayscale flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">GDPR & CCPA Compliant Hub</p>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian Compliance v0.0.1 • Backpacker AI Systems</p>
        </footer>
      </div>
    </div>
  )
}
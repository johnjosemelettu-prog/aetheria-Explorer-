'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Database, 
  Zap, 
  Eye, 
  ShieldCheck, 
  Server, 
  Smartphone,
  Fingerprint,
  RefreshCw,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const securityPillars = [
  { title: "Isolated Neural Nodes", icon: Brain, desc: "AI synthesis happens in transient memory. We never 'train' models on your private journal or budget data.", color: "text-blue-600" },
  { title: "TLS 1.3 Encryption", icon: Lock, desc: "Every packet between your device and the Guardian Grid is encrypted using high-fidelity protocols.", color: "text-emerald-600" },
  { title: "SOC 2 Compliance", icon: ShieldCheck, desc: "Our infrastructure matches global enterprise standards for data handling and privacy isolation.", color: "text-primary" }
];

function Brain(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.205 4 4 0 0 0 6.003 2.9V5Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.52 8.205 4 4 0 0 1-6.003 2.9V5Z" />
    </svg>
  );
}

export default function DataSecurityPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Guardian Infrastructure</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
          Data Security
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          How we architect the vault for your Travel DNA and high-fidelity assets.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {securityPillars.map((pillar, i) => (
          <Card key={i} className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white text-center flex flex-col items-center group hover:scale-[1.02] transition-all">
            <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 shadow-inner group-hover:bg-slate-900 transition-colors">
              <pillar.icon className={cn("h-8 w-8", pillar.color, "group-hover:text-white transition-colors")} />
            </div>
            <h3 className="text-xl font-black font-headline text-slate-900 mb-2">{pillar.title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{pillar.desc}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-10">
              <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter">The Vault Protocol</CardTitle>
              <CardDescription className="text-slate-400">Layer-by-layer security synthesis.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Fingerprint className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-black font-headline text-slate-900 uppercase tracking-tight">Identity Isolation</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  We utilize <strong>Firebase Authentication</strong> nodes to ensure that your credentials never touch our application logic. Identity tokens are refreshed every 60 minutes via secure OIDC protocols.
                </p>
              </section>

              <Separator className="bg-slate-50" />

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Database className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-black font-headline text-slate-900 uppercase tracking-tight">Database Sharding</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Your travel data is stored in user-isolated document sub-collections in <strong>Cloud Firestore</strong>. Security Rules enforce a strict 'Owner-Only' read/write access node, verified on every request.
                </p>
              </section>

              <Separator className="bg-slate-50" />

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-black font-headline text-slate-900 uppercase tracking-tight">Device Integrity</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Vision Hub analysis (Menu scanning, Art decoding) uses transient buffer technology. Raw camera streams are processed and immediately purged from server memory upon completion of the synthesis task.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Zap className="h-24 w-24 text-primary" /></div>
            <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-6">Security Uptime</h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Guardian Grid Status</span>
                  <span className="text-emerald-400">99.99%</span>
                </div>
                <Progress value={99.99} className="h-1 bg-white/5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Encryption Node</span>
                  <span className="text-primary">Active</span>
                </div>
                <Progress value={100} className="h-1 bg-white/5" />
              </div>
            </div>
            <div className="mt-10 p-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 italic leading-relaxed">
              "Backpacker Security Systems are updated every 24 hours to match emerging global threat patterns."
            </div>
          </Card>

          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
            <p className="text-xs text-emerald-800/70 font-medium leading-relaxed">
              Your financial data (Smart Wallet) is secured using <strong>Atomic Increment Logic</strong>, preventing any double-spend or state-mismatch errors.
            </p>
          </div>
        </aside>
      </div>
      <footer className="text-center py-10 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-widest">Guardian Compliance v0.0.1 • All Nodes Secured</p>
      </footer>
    </div>
  );
}
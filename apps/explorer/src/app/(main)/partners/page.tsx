
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  Plane, 
  BedDouble, 
  Ship, 
  ArrowUpRight,
  Handshake,
  Zap,
  BarChart3,
  Cpu,
  Database,
  Shield,
  Lock,
  Search,
  Shirt,
  Smartphone,
  Tag,
  ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function PartnersPage() {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-24 text-center space-y-6">
        <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest py-1.5 px-4 text-[10px] rounded-full">Global Intelligence Network</Badge>
        <h1 className="font-headline text-5xl font-black tracking-tight md:text-8xl text-slate-900 leading-none italic uppercase">
          The Ecosystem
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
          Aetheria is powered by a high-fidelity network of tourism boards, logistics providers, and technology nodes.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
        {[
          { icon: TrendingUp, title: "Market Access", desc: "Gain direct visibility to high-intent travelers using our AI Odyssey Planner.", color: "text-primary" },
          { icon: BarChart3, title: "DNA Analytics", desc: "Access anonymized psychological travel trends to optimize your offerings.", color: "text-accent" },
          { icon: Zap, title: "API Integration", desc: "Seamlessly plug your inventory into our multi-currency Smart Wallet.", color: "text-amber-500" }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-lg rounded-[2.5rem] p-10 bg-white group hover:shadow-2xl transition-all duration-500">
            <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-8 shadow-inner">
              <item.icon className={cn("h-8 w-8 transition-colors duration-500", item.color)} />
            </div>
            <h3 className="text-2xl font-black font-headline text-slate-900 mb-4 uppercase tracking-tighter">{item.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 16 8.5 11 2 18" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

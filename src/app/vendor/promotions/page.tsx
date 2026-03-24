'use client';

import React from 'react';
import { 
  Megaphone, 
  TrendingUp, 
  Users, 
  Globe, 
  Zap, 
  BarChart3, 
  MousePointer2, 
  Eye, 
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from 'recharts';

const impressionData = [
  { day: 'Mon', views: 4200, clicks: 120 },
  { day: 'Tue', views: 3800, clicks: 95 },
  { day: 'Wed', views: 5100, clicks: 150 },
  { day: 'Thu', views: 4900, clicks: 140 },
  { day: 'Fri', views: 6200, clicks: 210 },
  { day: 'Sat', views: 7500, clicks: 320 },
  { day: 'Sun', views: 6800, clicks: 280 },
];

const chartConfig = {
  views: { label: 'Impressions', color: 'hsl(var(--primary))' },
  clicks: { label: 'Lead Conversions', color: 'hsl(var(--accent))' },
} satisfies ChartConfig;

export default function PartnerPromotionsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3">
            <Megaphone className="text-primary h-8 w-8" />
            Partner Spotlights
          </h1>
          <p className="text-slate-500 font-medium mt-1">High-fidelity metrics for your co-branded and tourism content.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Partner Tier</p>
            <p className="text-sm font-black text-slate-900">Elite Co-Brand</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-white p-8 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Eye className="h-6 w-6" />
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">+12%</Badge>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Impressions</p>
          <p className="text-4xl font-black font-headline text-slate-900 mt-1">42,105</p>
        </Card>
        <Card className="border-none shadow-lg bg-white p-8 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <MousePointer2 className="h-6 w-6" />
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">+8%</Badge>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Conversions</p>
          <p className="text-4xl font-black font-headline text-slate-900 mt-1">1,402</p>
        </Card>
        <Card className="border-none shadow-lg bg-white p-8 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">Optimal</Badge>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Conversion Rate</p>
          <p className="text-4xl font-black font-headline text-primary mt-1">3.3%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50">
              <CardTitle className="text-2xl font-black font-headline">Synthesis Reach Velocity</CardTitle>
              <CardDescription>Performance of your spotlight across AI-generated journeys.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 h-[400px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <BarChart data={impressionData}>
                    <CartesianGrid vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="views" fill="var(--color-views)" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8">
            <h3 className="text-xl font-black font-headline mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> Active Spotlights
            </h3>
            <div className="space-y-4">
              {[
                { name: "Visit France Spotlight", region: "Europe", score: "High" },
                { name: "AeroLux Upgrades", region: "Transatlantic", score: "Med" },
                { name: "Horizon Luggage", region: "Global", score: "High" }
              ].map((spot, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">{spot.name}</p>
                    <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-tighter">{spot.score}</Badge>
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">{spot.region}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 rounded-xl border-white/10 text-white hover:bg-white/5 font-bold h-12">
              Update Content Nodes
            </Button>
          </Card>

          <Card className="border-none shadow-lg rounded-[2rem] bg-primary/5 border border-primary/10 p-8">
            <h4 className="font-headline font-black text-primary text-lg mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" /> Synthesis Intel
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Explorers are currently synthesizing <strong>40% more itineraries</strong> for Mediterranean destinations. We recommend boosting your "Coastal Gems" spotlight to capture this trend.
            </p>
            <Button variant="link" className="p-0 h-auto mt-4 text-primary font-black flex items-center gap-2">
              Launch Trend Boost <ChevronRight className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

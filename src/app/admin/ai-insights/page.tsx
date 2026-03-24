'use client';

import React from 'react';
import { 
  Activity, 
  Zap, 
  Cpu, 
  BarChart3, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Globe,
  Database,
  TrendingUp,
  ShieldAlert,
  Rocket
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const flowMetrics = [
  { name: 'Itinerary Gen', calls: 1450, latency: '4.2s', success: 98 },
  { name: 'Translation', calls: 8200, latency: '0.8s', success: 99.9 },
  { name: 'Vision Hub', calls: 2100, latency: '2.5s', success: 94 },
  { name: 'Veo Cinema', calls: 320, latency: '72s', success: 89 },
];

const usageData = [
  { time: '00:00', tokens: 1200 },
  { time: '04:00', tokens: 800 },
  { time: '08:00', tokens: 2500 },
  { time: '12:00', tokens: 4200 },
  { time: '16:00', tokens: 3800 },
  { time: '20:00', tokens: 2900 },
];

const chartConfig = {
  tokens: {
    label: 'Token Consumption',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function AiInsightsPage() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3">
            <Cpu className="text-primary h-8 w-8" />
            AI Service Health
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time telemetry for Genkit flows and model consumption.</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-none font-black uppercase tracking-widest px-4 py-2">
          System Status: Optimal
        </Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total AI Calls (24H)</p>
          <p className="text-4xl font-black font-headline text-slate-900">12,070</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <TrendingUp className="h-3 w-3" /> +15.2% vs Yesterday
          </div>
        </Card>
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Avg. Response Time</p>
          <p className="text-4xl font-black font-headline text-slate-900">1.4s</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600">
            <Clock className="h-3 w-3" /> Stable across regions
          </div>
        </Card>
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Success Rate</p>
          <p className="text-4xl font-black font-headline text-emerald-600">97.8%</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
            <ShieldCheck className="h-3 w-3" /> 22 retries logged
          </div>
        </Card>
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Model Efficiency</p>
          <p className="text-4xl font-black font-headline text-slate-900">High</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary">
            <Zap className="h-3 w-3" /> Gemini 2.5 Active
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-2xl font-black font-headline">Token Synthesis Velocity</CardTitle>
              <CardDescription>Daily consumption patterns across global clusters.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 h-[400px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <BarChart data={usageData}>
                    <CartesianGrid vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="tokens" fill="var(--color-tokens)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Rocket className="h-48 w-48 text-primary" />
            </div>
            <div className="relative z-10 space-y-8">
              <div>
                <Badge className="bg-primary text-white border-none font-bold uppercase mb-4 px-3">Production Roadmap</Badge>
                <h2 className="text-4xl font-black font-headline leading-tight italic uppercase">System Readiness</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-500">Testing Phase</p>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4" /> 100% COMPLETE
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-500">Staging Node</p>
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Clock className="h-4 w-4" /> 85% SYNCED
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-500">Live Transition</p>
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <ShieldAlert className="h-4 w-4" /> PENDING AUTH
                  </div>
                </div>
              </div>
              <Button asChild variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/5">
                <a href="/docs/deployment_checklist.md">View Technical Specification</a>
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8">
            <h3 className="text-xl font-black font-headline mb-6">Flow Health Radar</h3>
            <div className="space-y-6">
              {flowMetrics.map((flow) => (
                <div key={flow.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-400">{flow.name}</span>
                    <span className={cn(flow.success > 95 ? "text-emerald-400" : "text-amber-400")}>{flow.success}% SUCCESS</span>
                  </div>
                  <Progress value={flow.success} className="h-1.5 bg-white/5" />
                  <div className="flex justify-between text-[10px] font-black text-slate-500">
                    <span>{flow.calls} Calls</span>
                    <span>Lat: {flow.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-lg rounded-[2rem] bg-primary/5 p-8 border border-primary/10">
            <h4 className="font-headline font-black text-primary text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Safety Protocols
            </h4>
            <ul className="space-y-3">
              {[
                "HARM_CATEGORY_HARASSMENT: BLOCK_NONE",
                "HARM_CATEGORY_HATE_SPEECH: BLOCK_NONE",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT: BLOCK_NONE",
                "HARM_CATEGORY_DANGEROUS_CONTENT: BLOCK_NONE"
              ].map((rule, i) => (
                <li key={i} className="text-[10px] font-black uppercase text-slate-500 bg-white p-2 rounded-lg border border-slate-100 flex justify-between">
                  <span>{rule.split(':')[0]}</span>
                  <span className="text-primary">{rule.split(':')[1]}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
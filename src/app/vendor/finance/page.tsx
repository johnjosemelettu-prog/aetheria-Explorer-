'use client';

import React from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  Wallet, 
  ShieldCheck, 
  History, 
  Download, 
  Filter, 
  Search,
  Zap,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const revenueData = [
  { day: 'Mon', revenue: 1200, commission: 240 },
  { day: 'Tue', revenue: 900, commission: 180 },
  { day: 'Wed', revenue: 1500, commission: 300 },
  { day: 'Thu', revenue: 1100, commission: 220 },
  { day: 'Fri', revenue: 2200, commission: 440 },
  { day: 'Sat', revenue: 2800, commission: 560 },
  { day: 'Sun', revenue: 2400, commission: 480 },
];

const chartConfig = {
  revenue: { label: 'Gross Sales', color: 'hsl(var(--primary))' },
  commission: { label: 'Net Commission', color: 'hsl(var(--emerald-500))' },
} satisfies ChartConfig;

export default function VendorFinancePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3">
            <CreditCard className="text-emerald-600 h-8 w-8" />
            Financial Yield
          </h1>
          <p className="text-slate-500 font-medium mt-1">Managing partner commissions and settlement nodes.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 font-bold border-2">
            <Download className="mr-2 h-4 w-4" /> Export Ledger
          </Button>
          <Button className="rounded-xl h-12 px-6 font-black shadow-xl shadow-emerald-200 bg-emerald-600 hover:bg-emerald-700">
            Request Payout
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Unpaid Commission', value: '$4,250.00', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Gross Sales (30D)', value: '$22,405.00', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg. Yield / Sale', value: '18.5%', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Next Settlement', value: 'Mar 15', icon: Calendar, color: 'text-primary', bg: 'bg-primary/5' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-lg bg-white rounded-3xl p-6">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black font-headline text-slate-900 mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50">
              <CardTitle className="text-2xl font-black font-headline">Commission Synthesis</CardTitle>
              <CardDescription>Daily revenue and commission nodes for the current cycle.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 h-[400px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <BarChart data={revenueData}>
                    <CartesianGrid vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="commission" fill="#10b981" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5"><PieChart className="h-32 w-32 text-primary" /></div>
            <h3 className="text-xl font-black font-headline mb-6 uppercase tracking-tighter italic">Settlement Status</h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500">Last Payout</p>
                  <p className="font-bold">Feb 28, 2026</p>
                </div>
                <p className="font-headline font-black text-emerald-400">$8,120.00</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500">Method</p>
                  <p className="font-bold flex items-center gap-2"><CreditCard className="h-3 w-3" /> Stripe Connect</p>
                </div>
                <Badge className="bg-emerald-500 text-white border-none font-black text-[8px]">ACTIVE</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-8 rounded-xl border-white/10 text-white hover:bg-white/5 font-bold h-12">
              Manage Settlement Node
            </Button>
          </Card>

          <Card className="border-none shadow-lg rounded-[2rem] bg-primary/5 p-8 border border-primary/10">
            <h4 className="font-headline font-black text-primary text-lg mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" /> Commission Intel
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Your average commission rate has increased by <strong>2.1%</strong> due to high-fidelity "Elite Pass" upsells in the Japan region.
            </p>
          </Card>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-black font-headline text-slate-900">Recent Node Settlements</h2>
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {[
                { id: 'SET-9901', amount: 450.00, commission: 90.00, date: '2026-03-05', status: 'Pending' },
                { id: 'SET-9902', amount: 1200.00, commission: 240.00, date: '2026-03-04', status: 'Authorized' },
                { id: 'SET-9903', amount: 85.00, commission: 17.00, date: '2026-03-02', status: 'Authorized' },
              ].map((settlement) => (
                <div key={settlement.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{settlement.id}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{settlement.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400">Gross</p>
                      <p className="font-bold text-slate-900">${settlement.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-emerald-600">Yield</p>
                      <p className="font-black text-emerald-600">${settlement.commission.toFixed(2)}</p>
                    </div>
                    <Badge className={cn(
                      "font-black uppercase text-[9px] px-3",
                      settlement.status === 'Authorized' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>{settlement.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
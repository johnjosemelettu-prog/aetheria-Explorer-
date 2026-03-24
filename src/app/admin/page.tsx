
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { UserTable } from '@/components/admin/UserTable'
import { SimulationTool } from '@/components/admin/SimulationTool'
import { 
  Users, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  Globe, 
  Cpu, 
  Megaphone,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Rocket,
  FileText,
  Activity,
  History,
  ChevronRight
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-primary h-8 w-8" />
            <h1 className="font-headline text-4xl font-black tracking-tight md:text-5xl">
              System Overview
            </h1>
          </div>
          <p className="text-lg text-muted-foreground font-medium">Monitoring the Aetheria Intelligence Ecosystem.</p>
        </div>
        <Button asChild className="rounded-2xl h-14 px-8 font-black bg-slate-900 text-white hover:bg-slate-800 shadow-xl">
          <Link href="/admin/ai-insights">
            <Rocket className="mr-2 h-5 w-5" /> Launch Diagnostics
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Explorers', value: '12,450', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Trip Passes', value: '3,820', change: '+8%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'eSIM Activations', value: '1,205', change: '+22%', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'AI Synthesis (24H)', value: '45.8K', change: '+15%', icon: Cpu, color: 'text-primary', bg: 'bg-primary/5' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-lg bg-white rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px]">{stat.change}</Badge>
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black font-headline text-slate-900 mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black font-headline tracking-tighter">Identity Grid Monitor</CardTitle>
                <CardDescription className="text-slate-400">Verifying live identity nodes and role authorizations.</CardDescription>
              </div>
              <Button asChild variant="outline" className="rounded-xl border-slate-200 font-bold">
                <Link href="/admin/users">Full User Hub <ChevronRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <UserTable />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 group">
              <div className="flex justify-between items-start mb-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                  <Megaphone className="h-7 w-7" />
                </div>
                <Link href="/admin/promotions">
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><ArrowUpRight className="h-5 w-5" /></Button>
                </Link>
              </div>
              <h3 className="text-2xl font-black font-headline text-slate-900">Partner Content</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">Manage co-branded spotlights and tourism department integrations.</p>
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Promotions</span>
                <span className="font-bold text-primary">12 Nodes</span>
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 group border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <CreditCard className="h-7 w-7" />
                </div>
                <Link href="/admin/finance">
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><ArrowUpRight className="h-5 w-5" /></Button>
                </Link>
              </div>
              <h3 className="text-2xl font-black font-headline text-slate-900">Financial Audit</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">Global transaction ledger and affiliate commission monitoring.</p>
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Revenue</span>
                <span className="font-bold text-emerald-600">$22.4K</span>
              </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Zap className="h-32 w-32 text-primary" /></div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black font-headline flex items-center gap-2 text-slate-900">
                <Zap className="h-5 w-5 text-primary" /> Simulation Node
              </CardTitle>
              <CardDescription>Rapid feature testing and state injection.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <SimulationTool />
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-950 text-white p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><ShieldCheck className="h-32 w-32" /></div>
            <div className="relative z-10 space-y-6">
              <h4 className="text-2xl font-black font-headline italic tracking-tight">Production Roadmap</h4>
              <p className="text-sm font-medium leading-relaxed opacity-80">Follow the strategic technical specification to transition nodes from testing to production.</p>
              <Button asChild variant="outline" className="w-full rounded-xl h-12 font-bold border-white/20 text-white hover:bg-white/5">
                <a href="/docs/deployment_checklist.md">View Checklist <FileText className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n'
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ArrowUpRight,
  Zap,
  BarChart3,
  Megaphone,
  Wallet
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function VendorDashboardPage() {
  const { t } = useTranslation()

  const stats = [
    { label: 'Unpaid Commission', value: '$4,250.00', change: '+12.5%', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Rentals', value: '235', change: '+180%', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Available Inventory', value: '1,257', change: '-4%', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Promo Impressions', value: '42.1K', change: '+12%', icon: Megaphone, color: 'text-primary', bg: 'bg-primary/5' },
  ]

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-5xl text-slate-900">
          Partner Hub
        </h1>
        <p className="text-lg text-muted-foreground font-medium mt-1">
          Managing global logistics and affiliate synthesis.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
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
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black font-headline tracking-tighter">Active Fulfillment Queue</CardTitle>
                  <CardDescription className="text-slate-400">High-priority logistics nodes requiring verification.</CardDescription>
                </div>
                <Button asChild variant="outline" className="rounded-xl border-slate-200 font-bold">
                  <Link href="/vendor/orders">View All Orders</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {[
                  { id: 'ORD-4421', user: 'Alex D.', destination: 'Paris Hub', items: 3, status: 'Shipped' },
                  { id: 'ORD-4422', user: 'Sarah K.', destination: 'Tokyo Hub', items: 5, status: 'Pending' },
                  { id: 'ORD-4423', user: 'Mike R.', destination: 'London Hub', items: 2, status: 'Returned' },
                ].map((order) => (
                  <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{order.id}</p>
                        <p className="text-xs text-slate-400 font-medium">{order.user} • {order.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Items</p>
                        <p className="text-sm font-bold text-slate-700">{order.items}</p>
                      </div>
                      <Badge className={cn(
                        "font-black uppercase text-[9px] px-3",
                        order.status === 'Shipped' ? "bg-blue-100 text-blue-700" :
                        order.status === 'Returned' ? "bg-emerald-100 text-emerald-700" :
                        "bg-amber-100 text-amber-700"
                      )}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8 group">
              <div className="flex justify-between items-start mb-6">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                  <Zap className="h-7 w-7 text-accent" />
                </div>
                <Link href="/vendor/promotions">
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-white/40 hover:text-white"><ArrowUpRight className="h-5 w-5" /></Button>
                </Link>
              </div>
              <h3 className="text-2xl font-black font-headline">Intelligence Sync</h3>
              <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">Your co-branded content is currently being prioritized for explorers visiting <strong>Western Europe</strong>.</p>
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ad Score</span>
                <span className="font-bold text-accent">High Fidelity</span>
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 group border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <Link href="/vendor/finance">
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><ArrowUpRight className="h-5 w-5" /></Button>
                </Link>
              </div>
              <h3 className="text-2xl font-black font-headline text-slate-900">Revenue Yield</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">Your net earnings for this cycle are projected to be 15% higher than last month.</p>
              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Yield</span>
                <span className="font-bold text-emerald-600">$12,450.00</span>
              </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Clock className="h-32 w-32 text-primary" /></div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black font-headline flex items-center gap-2 text-slate-900">
                <AlertCircle className="h-5 w-5 text-amber-500" /> System Alerts
              </CardTitle>
              <CardDescription>Critical partner-only notifications.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs font-bold text-amber-900 leading-relaxed">API Synchronization for "Horizon Luggage" is lagging. Check your catalog feed.</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-900 leading-relaxed">Your "Visit France" spotlight was featured in 4,500 AI Itinerary syntheses today.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <TrendingUp className="h-40 w-40 text-primary" />
            </div>
            <div className="relative z-10 space-y-6">
              <Badge className="bg-primary text-white border-none font-black uppercase tracking-widest text-[9px] px-3">Growth Node</Badge>
              <h4 className="text-3xl font-black font-headline leading-tight">Scale Your <br />Reach.</h4>
              <p className="text-sm font-medium leading-relaxed opacity-60">Unlock targeted spotlights for "Elite Pass" explorers by upgrading your partner tier.</p>
              <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-200 font-black text-lg">
                Explore Tiers <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { useTranslation } from '@/lib/i18n'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { DollarSign, Banknote, TrendingUp, Users, ArrowUpRight, ShieldCheck, History } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const chartData = [
  { month: 'Jan', revenue: 18600, payouts: 8000 },
  { month: 'Feb', revenue: 30500, payouts: 12000 },
  { month: 'Mar', revenue: 23700, payouts: 9500 },
  { month: 'Apr', revenue: 17300, payouts: 4000 },
  { month: 'May', revenue: 20900, payouts: 8500 },
  { month: 'Jun', revenue: 21400, payouts: 9000 },
]

const chartConfig = {
  revenue: { label: 'Platform Revenue', color: 'hsl(var(--primary))' },
  payouts: { label: 'Partner Payouts', color: 'hsl(var(--emerald-500))' },
} satisfies ChartConfig

export default function AdminFinancePage() {
  const { t } = useTranslation()

  const totalRevenue = chartData.reduce((acc, item) => acc + item.revenue, 0)
  const totalPayouts = chartData.reduce((acc, item) => acc + item.payouts, 0)
  const netProfit = totalRevenue - totalPayouts

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight">
            Global Ledger
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitoring platform revenue and affiliate settlement nodes.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 font-bold border-2">
            <History className="mr-2 h-4 w-4" /> View Full Audit
          </Button>
          <Button className="rounded-xl h-12 px-6 font-black shadow-xl shadow-primary/20">
            Export Payout File
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-lg bg-white rounded-3xl p-8 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Total Platform Revenue</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><DollarSign className="h-5 w-5" /></div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-4xl font-black font-headline text-slate-900">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 font-bold mt-2">
              +12.5% from last cycle
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-white rounded-3xl p-8 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Affiliate Obligations</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Banknote className="h-5 w-5" /></div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-4xl font-black font-headline text-slate-900">${totalPayouts.toLocaleString()}</div>
            <p className="text-xs text-slate-400 font-bold mt-2">
              Pending 12 partner nodes
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-slate-900 text-white rounded-3xl p-8 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Net Platform Yield</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-primary"><TrendingUp className="h-5 w-5" /></div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-4xl font-black font-headline text-white">${netProfit.toLocaleString()}</div>
            <p className="text-xs text-primary font-bold mt-2 italic">
              "Optimal liquidity synthesized."
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-2xl font-black font-headline">Economic Velocity</CardTitle>
              <CardDescription>Visualizing the synthesis of platform revenue and partner payouts.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 h-[400px] w-full">
               <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="payouts" fill="#10b981" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
            <h3 className="text-xl font-black font-headline mb-6 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Payout Queue
            </h3>
            <div className="space-y-4">
              {[
                { name: "AeroLux Logistics", amount: 2450.00, status: "Verified" },
                { name: "Visit France Dept", amount: 1200.00, status: "Authorized" },
                { name: "Aura Underwriting", amount: 850.00, status: "Authorized" },
                { name: "Horizon Gear Hub", amount: 3100.00, status: "Pending" }
              ].map((payout, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:shadow-md transition-all">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{payout.name}</p>
                    <p className={cn("text-[9px] font-black uppercase mt-1", payout.status === 'Verified' ? "text-emerald-600" : "text-slate-400")}>{payout.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">${payout.amount.toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full"><ArrowUpRight className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6 rounded-xl h-12 font-black shadow-lg">Execute Bulk Payout</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

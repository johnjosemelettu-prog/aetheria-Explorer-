'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserTable } from '@/components/admin/UserTable';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function UserHubPage() {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-primary h-8 w-8" />
            User Hub
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage explorer profiles and authorize identity nodes.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 font-bold border-2" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} /> Refresh Grid
          </Button>
          <Button className="rounded-xl h-12 px-6 font-black shadow-xl shadow-primary/20">
            <Download className="mr-2 h-4 w-4" /> Export Users
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total Node Population</p>
          <p className="text-4xl font-black font-headline text-slate-900">12,450</p>
          <div className="mt-4 flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px]">+120 TODAY</Badge>
          </div>
        </Card>
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Active Premium Nodes</p>
          <p className="text-4xl font-black font-headline text-primary">3,820</p>
          <div className="mt-4 flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px]">31% PENETRATION</Badge>
          </div>
        </Card>
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Partner/Vendor Nodes</p>
          <p className="text-4xl font-black font-headline text-slate-900">142</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> All nodes verified
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black font-headline">Explorer Grid</CardTitle>
            <CardDescription>Direct management of identity nodes and role authorization.</CardDescription>
          </div>
          <div className="flex gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
              <Input placeholder="Search Identity..." className="pl-10 h-11 w-64 rounded-xl border-slate-100 bg-slate-50 focus:bg-white" />
            </div>
            <Button variant="outline" className="rounded-xl h-11 border-slate-100 font-bold">
              <Filter className="mr-2 h-4 w-4 text-slate-400" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <UserTable />
        </CardContent>
      </Card>
    </div>
  );
}
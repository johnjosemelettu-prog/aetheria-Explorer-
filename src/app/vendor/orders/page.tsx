'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  RotateCcw, 
  Search, 
  Filter, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  MapPin, 
  User, 
  ChevronRight,
  MoreVertical,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const mockOrders = [
  { id: 'ORD-9901', user: 'Alex Doe', items: ['Linen Suit', 'White Shirt'], total: 45.00, status: 'Processing', date: '2026-03-05', hub: 'London Hub' },
  { id: 'ORD-9902', user: 'Sarah Kent', items: ['Trench Coat', 'Chinos'], total: 60.00, status: 'Shipped', date: '2026-03-04', hub: 'Paris Hub' },
  { id: 'ORD-9903', user: 'Mike Ross', items: ['Blazer', 'Trousers'], total: 85.00, status: 'Delivered', date: '2026-03-02', hub: 'NYC Hub' },
  { id: 'ORD-9904', user: 'Emma Stone', items: ['Cocktail Dress'], total: 40.00, status: 'Returned', date: '2026-02-28', hub: 'Tokyo Hub' },
];

export default function OrderFulfillmentPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateStatus = (id: string) => {
    setIsUpdating(id);
    setTimeout(() => {
      setIsUpdating(null);
    }, 1500);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="text-emerald-600 h-8 w-8" />
            Fulfillment Hub
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage global "Zero-Luggage" logistics and returns.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search Order or Explorer..." 
              className="pl-10 h-12 w-64 rounded-xl border-none shadow-sm bg-white" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl h-12 bg-white border-none shadow-sm font-bold">
            <Filter className="mr-2 h-4 w-4 text-slate-400" /> Filter
          </Button>
        </div>
      </header>

      <Tabs defaultValue="active" className="space-y-8">
        <TabsList className="bg-slate-100 p-1 rounded-3xl h-14 w-fit shadow-inner">
          <TabsTrigger value="active" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-emerald-600 transition-all">
            <Clock className="mr-2 h-4 w-4" /> Pending & Active
          </TabsTrigger>
          <TabsTrigger value="returns" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-emerald-600 transition-all">
            <RotateCcw className="mr-2 h-4 w-4" /> Returns Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="m-0">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {mockOrders.filter(o => o.status !== 'Returned').map((order) => (
                  <div key={order.id} className="p-8 flex items-center gap-8 hover:bg-slate-50/50 transition-all group">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                      <Truck className="h-8 w-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-black font-headline text-slate-900">{order.id}</p>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2",
                          order.status === 'Processing' ? "bg-amber-100 text-amber-700" :
                          order.status === 'Shipped' ? "bg-blue-100 text-blue-700" :
                          "bg-emerald-100 text-emerald-700"
                        )}>{order.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {order.user}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="flex items-center gap-1 text-primary"><MapPin className="h-3.5 w-3.5" /> {order.hub}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Package Worth</p>
                      <p className="text-2xl font-black text-slate-900 font-headline">${order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="rounded-xl h-12 font-bold border-2 border-slate-100"
                        onClick={() => handleUpdateStatus(order.id)}
                        disabled={isUpdating === order.id}
                      >
                        {isUpdating === order.id ? <Loader2 className="animate-spin" /> : "Update Status"}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black font-headline">Return Verification Protocol</CardTitle>
                  <CardDescription className="font-medium text-slate-500">Scan and verify incoming items to release security deposits.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {mockOrders.filter(o => o.status === 'Returned').map((order) => (
                  <div key={order.id} className="p-10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <RotateCcw className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-xl font-black font-headline text-slate-900">{order.id} • Return Verification</p>
                        <p className="text-sm font-medium text-slate-400">Received from {order.hub} • Pending Item Inspection</p>
                      </div>
                    </div>
                    <Button className="h-12 rounded-xl px-8 font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                      Analyze & Verify
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck className="h-32 w-32" /></div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-4">Verification Intelligence</h4>
          <p className="text-lg font-medium leading-relaxed opacity-80">
            Our AI unboxing verification system reduces return fraud by 92% by comparing arrival state against initial synthesis snapshots.
          </p>
        </Card>
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary/5 border border-primary/10 p-8">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Logistics Note</h4>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            Ensure all packages for <strong>London Hub</strong> are dispatched by 18:00 UTC to meet tomorrow's arrival explorers.
          </p>
        </Card>
      </div>
    </div>
  );
}

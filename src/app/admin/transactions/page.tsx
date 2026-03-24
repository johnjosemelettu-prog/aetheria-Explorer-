'use client';

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  User, 
  Globe, 
  Loader2,
  Wallet,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, collectionGroup } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AuditLedgerPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchQuery] = useState('');

  const transactionsQuery = useMemoFirebase(
    () => (firestore ? query(collectionGroup(firestore, 'transactions'), orderBy('timestamp', 'desc'), limit(100)) : null),
    [firestore]
  );
  const { data: transactions, isLoading, error } = useCollection(transactionsQuery);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3">
            <History className="text-primary h-8 w-8" />
            Global Audit Ledger
          </h1>
          <p className="text-slate-500 font-medium mt-1">Verifying financial integrity across the Backpacker network.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
            <Input 
              placeholder="Search Ref or User..." 
              className="pl-10 h-12 w-64 rounded-xl border-none shadow-sm bg-white" 
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl h-12 bg-white border-none shadow-sm font-bold">
            <Filter className="mr-2 h-4 w-4 text-slate-400" /> Filter
          </Button>
          <Button className="rounded-xl h-12 px-6 font-bold shadow-xl shadow-primary/20">
            <Download className="mr-2 h-4 w-4" /> Export Audit
          </Button>
        </div>
      </header>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 space-y-4">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : error ? (
            <div className="p-20 text-center flex flex-col items-center gap-6 opacity-50">
              <AlertTriangle className="h-16 w-16 text-amber-500" />
              <div className="space-y-2">
                <h3 className="text-2xl font-black font-headline uppercase tracking-tighter">Authorization Pending</h3>
                <p className="max-w-md mx-auto text-sm font-medium leading-relaxed">
                  The global audit ledger node is currently initializing. Verify your administrative token in the Command Center.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-mono text-left max-w-lg">
                <p className="text-primary font-bold mb-2">SYSTEM TELEMETRY LOG</p>
                <p>{error.message}</p>
              </div>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {transactions.filter(t => 
                t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                t.id.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((trans) => (
                <div key={trans.id} className="p-8 flex items-center gap-8 hover:bg-slate-50/50 transition-all group">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                    trans.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'
                  )}>
                    {trans.type === 'credit' ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase tracking-tighter",
                        trans.category === 'booking' ? "text-primary border-primary/20 bg-primary/5" :
                        trans.category === 'exchange' ? "text-blue-600 border-blue-200 bg-blue-50" :
                        trans.category === 'topup' ? "text-green-600 border-green-200 bg-green-50" :
                        "text-slate-400 border-slate-200 bg-slate-50"
                      )}>
                        {trans.category}
                      </Badge>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {trans.timestamp?.toDate ? format(trans.timestamp.toDate(), 'MMM dd, HH:mm') : 'Recently'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-bold text-slate-900 truncate">{trans.description}</p>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter italic">Auth Ref: {trans.id.substring(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-2xl font-black font-headline",
                      trans.type === 'credit' ? "text-green-600" : "text-slate-900"
                    )}>
                      {trans.type === 'credit' ? '+' : '-'}{trans.amount.toFixed(2)} <span className="text-sm text-slate-400 font-bold">{trans.currency}</span>
                    </p>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Node Resolved</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-center opacity-30 grayscale">
              <History className="h-32 w-32 text-primary mb-6" />
              <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">Ledger Silent</h2>
              <p className="font-medium">No global transactions recorded in this cycle.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="pt-10 flex items-center justify-center gap-8 opacity-40 grayscale">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-xs font-bold uppercase tracking-widest">Verified Multi-Currency Audit Ledger</p>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <p className="text-xs font-bold uppercase tracking-widest">Global Compliance v2.0</p>
        </div>
      </footer>
    </div>
  );
}
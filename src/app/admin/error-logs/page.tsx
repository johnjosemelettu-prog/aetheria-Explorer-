'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  User, 
  ChevronRight, 
  Loader2, 
  AlertTriangle,
  Activity,
  History,
  Terminal,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useFirestore, useCollection, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ErrorLogsAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [searchTerm, setSearchQuery] = useState('');

  const logsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'errorLogs'), orderBy('timestamp', 'desc'), limit(100)) : null),
    [firestore]
  );
  const { data: logs, isLoading } = useCollection(logsQuery);

  const handleDeleteAll = () => {
    if (!logs || !firestore) return;
    logs.forEach(log => {
      deleteDocumentNonBlocking(doc(firestore, 'errorLogs', log.id));
    });
    toast({ title: "Ledger Purged", description: "All error nodes have been cleared." });
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'errorLogs', id));
    toast({ title: "Log Removed" });
  };

  const filteredLogs = logs?.filter(log => 
    log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-destructive h-8 w-8" />
            System Disruptions
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time telemetry for application crashes and logic shifts.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
            <Input 
              placeholder="Search Message or User..." 
              className="pl-10 h-12 w-64 rounded-xl border-none shadow-sm bg-white" 
              value={searchTerm}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="destructive" className="rounded-xl h-12 px-6 font-bold" onClick={handleDeleteAll}>
            <Trash2 className="mr-2 h-4 w-4" /> Purge Ledger
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Logs Captured (24H)</p>
          <p className="text-4xl font-black font-headline text-slate-900">{logs?.length || 0}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
            <Activity className="h-3 w-3" /> Real-time feed active
          </div>
        </Card>
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Critical Crashes</p>
          <p className="text-4xl font-black font-headline text-destructive">{logs?.filter(l => l.severity === 'critical').length || 0}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600">
            <AlertTriangle className="h-3 w-3" /> Action required
          </div>
        </Card>
        <Card className="border-none shadow-lg bg-white p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">System Health</p>
          <p className="text-4xl font-black font-headline text-emerald-600">98.2%</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
            <RefreshCw className="h-3 w-3" /> Recovering nodes
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 space-y-4">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-8 flex items-center gap-8 hover:bg-slate-50 transition-all group cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-inner",
                    log.severity === 'critical' ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"
                  )}>
                    <Terminal className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-black text-slate-900 truncate uppercase tracking-tighter italic">{log.type} disruption</p>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2",
                        log.severity === 'critical' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-50"
                      )}>{log.severity}</Badge>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'HH:mm:ss') : 'Recently'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 mt-1 line-clamp-1">{log.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {log.userId}</span>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="flex items-center gap-1 text-primary"><History className="h-3.5 w-3.5" /> {log.id.substring(0, 8)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 group-hover:text-primary">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-center opacity-30 grayscale">
              <ShieldAlert className="h-32 w-32 text-emerald-600 mb-6" />
              <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">System Pure</h2>
              <p className="font-medium">No disruptions recorded in the current cycle.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="rounded-[3rem] max-w-3xl overflow-hidden p-0 border-none shadow-2xl">
          {selectedLog && (
            <div className="flex flex-col h-[80vh]">
              <CardHeader className={cn(
                "p-10 text-white",
                selectedLog.severity === 'critical' ? "bg-red-600" : "bg-slate-900"
              )}>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-white/20 text-white border-none font-bold uppercase mb-4 px-3">Telemetry Node Detail</Badge>
                    <CardTitle className="text-3xl font-black font-headline tracking-tighter uppercase italic">{selectedLog.type} Disruption</CardTitle>
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Terminal className="h-10 w-10" />
                  </div>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 bg-white p-10">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Error Message</label>
                    <p className="text-xl font-bold text-slate-900 leading-tight">{selectedLog.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">User Context</p>
                      <p className="text-sm font-bold text-slate-700">{selectedLog.userId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Timestamp</p>
                      <p className="text-sm font-bold text-slate-700">{selectedLog.timestamp?.toDate ? format(selectedLog.timestamp.toDate(), 'PPP HH:mm:ss') : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Stack Trace Synthesis
                    </label>
                    <div className="p-6 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[10px] leading-relaxed shadow-inner overflow-x-auto whitespace-pre">
                      {selectedLog.stack}
                    </div>
                  </div>

                  {selectedLog.metadata && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Logic Metadata</label>
                      <pre className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <CardFooter className="p-8 bg-slate-50 border-t border-slate-100 gap-4">
                <Button className="flex-1 h-14 rounded-2xl font-black text-lg shadow-xl" onClick={() => setSelectedLog(null)}>Resolve Node</Button>
                <Button variant="ghost" className="h-14 rounded-2xl font-bold text-destructive hover:bg-red-50" onClick={() => { handleDelete(selectedLog.id); setSelectedLog(null); }}>
                  Purge Log
                </Button>
              </CardFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
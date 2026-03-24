
'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { PlusCircle, BookOpen, Sparkles, History, MapPin, Zap, Wand2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { JournalCard, type JournalEntry } from '@/components/journal/JournalCard';
import { JournalForm } from '@/components/journal/JournalForm';
import { WithId } from '@/firebase/firestore/use-collection';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function JournalPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<
    WithId<JournalEntry> | undefined
  >(undefined);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const journalQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(
        collection(firestore, 'userProfiles', user.uid, 'journalEntries'),
        orderBy('date', 'desc')
      );
    },
    [firestore, user]
  );

  const { data: entries, isLoading } = useCollection<JournalEntry>(journalQuery);

  const handleCreateNew = () => {
    setSelectedEntry(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: WithId<JournalEntry>) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Explorer's Legacy</Badge>
          <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
            Explorer Journal
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-xl">
            Document your odyssey legacy with high-fidelity memories and AI-synthesized reflections.
          </p>
        </div>
        <Button size="lg" onClick={handleCreateNew} className="rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/20">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Memory
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="border-none shadow-lg bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700"><History className="h-20 w-20 text-primary" /></div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 relative z-10">Memories Synthesized</p>
          <p className="text-4xl font-black font-headline relative z-10">{entries?.length || 0}</p>
        </Card>
        <Card className="border-none shadow-lg bg-white rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700"><MapPin className="h-20 w-20 text-primary" /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 relative z-10">Destination Nodes</p>
          <p className="text-4xl font-black font-headline text-slate-900 relative z-10">12</p>
        </Card>
        <Card className="border-none shadow-lg bg-primary/5 border border-primary/10 rounded-3xl p-8 group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all"><Zap className="h-5 w-5" /></div>
            <Badge className="bg-primary text-white border-none font-bold text-[8px] uppercase">Legacy XP</Badge>
          </div>
          <p className="text-[10px] font-black uppercase text-primary tracking-widest">Aura Progression</p>
          <p className="text-4xl font-black font-headline text-slate-900 mt-1">+2,450</p>
        </Card>
      </div>

      <div className="mt-12">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-96 w-full rounded-[2.5rem]" />
            <Skeleton className="h-96 w-full rounded-[2.5rem]" />
            <Skeleton className="h-96 w-full rounded-[2.5rem]" />
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <JournalCard key={entry.id} entry={entry} onEdit={handleEdit} />
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-20 grayscale">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
              <BookOpen className="h-32 w-32 text-primary relative mx-auto" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black font-headline uppercase tracking-tighter italic">Ledger Empty</h2>
              <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Initialize your first memory node to start documenting your legacy.</p>
            </div>
            <Button onClick={handleCreateNew} variant="outline" className="rounded-xl border-2 h-12 px-8 font-bold">Host First Memory</Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <CardHeader className="bg-slate-900 text-white p-10">
            <DialogTitle className="text-3xl font-black font-headline uppercase tracking-tighter italic flex items-center gap-3">
              <Wand2 className="h-8 w-8 text-primary" />
              {selectedEntry ? "Edit Memory Node" : "Synthesize New Memory"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Encode your experiences into the permanent Aetheria grid.
            </DialogDescription>
          </CardHeader>
          <div className="p-10 bg-white">
            <JournalForm
              key={selectedEntry?.id}
              entryToEdit={selectedEntry}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

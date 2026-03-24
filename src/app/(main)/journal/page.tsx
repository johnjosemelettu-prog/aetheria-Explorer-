'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
            {t('journal.title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('journal.subtitle')}
          </p>
        </div>
        <Button size="lg" onClick={handleCreateNew}>
          <PlusCircle className="mr-2" />
          {t('journal.createNew')}
        </Button>
      </div>

      <div className="mt-12">
        {isLoading && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}
        {!isLoading && entries && entries.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <JournalCard key={entry.id} entry={entry} onEdit={handleEdit} />
            ))}
          </div>
        )}
        {!isLoading && (!entries || entries.length === 0) && (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {t('journal.noEntries')}
            </p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry ? t('journal.editEntry') : t('journal.createNew')}
            </DialogTitle>
            <DialogDescription>
              {t('journal.form.description')}
            </DialogDescription>
          </DialogHeader>
          <JournalForm
            key={selectedEntry?.id}
            entryToEdit={selectedEntry}
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

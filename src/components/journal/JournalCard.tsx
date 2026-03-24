'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { Star, Edit, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WithId } from '@/firebase/firestore/use-collection';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

// This is a placeholder type. In a real app, you'd import this from your entity definitions.
export interface JournalEntry {
  title: string;
  content: string;
  date: any; // Can be Timestamp from Firestore
  rating: number;
  photoUrl?: string;
  userId: string;
}

interface JournalCardProps {
  entry: WithId<JournalEntry>;
  onEdit: (entry: WithId<JournalEntry>) => void;
}

export function JournalCard({ entry, onEdit }: JournalCardProps) {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'System Node Offline',
        description: 'Unable to connect to the memory grid.',
      });
      return;
    }
    const entryRef = doc(firestore, `userProfiles/${entry.userId}/journalEntries`, entry.id);
    deleteDocumentNonBlocking(entryRef);
    toast({
      title: 'Entry Deleted',
      description: `"${entry.title}" has been successfully removed from your journal.`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      {entry.photoUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={entry.photoUrl}
            alt={entry.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{entry.title}</CardTitle>
        <CardDescription>
          {entry.date?.toDate ? format(entry.date.toDate(), 'MMMM d, yyyy') : 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < entry.rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'
              }`}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
          {entry.content}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the memory from your journal grid.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Entry</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete Memory
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" size="icon" onClick={() => onEdit(entry)}>
          <Edit className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

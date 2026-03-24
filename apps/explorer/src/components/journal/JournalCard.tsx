
'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { Star, Edit, Trash2, MapPin, Calendar, Sparkles } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

export interface JournalEntry {
  title: string;
  content: string;
  date: any;
  rating: number;
  photoUrl?: string;
  userId: string;
}

interface JournalCardProps {
  entry: WithId<JournalEntry>;
  onEdit: (entry: WithId<JournalEntry>) => void;
}

export function JournalCard({ entry, onEdit }: JournalCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!firestore) return;
    const entryRef = doc(firestore, `userProfiles/${entry.userId}/journalEntries`, entry.id);
    deleteDocumentNonBlocking(entryRef);
    toast({
      title: 'Memory Purged',
      description: `"${entry.title}" node has been cleared.`,
    });
  };

  return (
    <Card className="flex flex-col border-none shadow-xl rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 bg-white">
      {entry.photoUrl ? (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={entry.photoUrl}
            alt={entry.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 border-none font-black uppercase text-[8px] px-2 py-0.5">Memory Node</Badge>
        </div>
      ) : (
        <div className="h-56 w-full bg-slate-50 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/journal/600/400')] opacity-5 grayscale" />
          <Sparkles className="h-12 w-12 text-slate-200" />
        </div>
      )}
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-2xl font-black font-headline text-slate-900 truncate uppercase italic tracking-tighter">{entry.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 font-bold text-primary uppercase tracking-widest text-[9px] mt-1">
          <Calendar className="h-3 w-3" /> {entry.date?.toDate ? format(entry.date.toDate(), 'MMMM d, yyyy') : 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-4 flex-grow space-y-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < entry.rating ? 'text-accent fill-accent' : 'text-slate-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3 italic">
          "{entry.content}"
        </p>
      </CardContent>
      <CardFooter className="p-8 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">NODE VERIFIED</span>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-200 hover:text-destructive hover:bg-destructive/5">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem]">
              <AlertDialogHeader>
                <AlertDialogTitle>Purge this memory?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the memory from your explorer journal grid.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Abort</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-bold"
                  onClick={handleDelete}
                >
                  Confirm Purge
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-2 border-slate-50 text-slate-300 hover:text-primary hover:border-primary/20" onClick={() => onEdit(entry)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}


'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Sparkles, Star, Wand2, Loader2, Save } from 'lucide-react';
import {
  useUser,
  useFirestore,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { JournalEntry } from './JournalCard';
import { suggestJournalPrompt } from '@/ai/flows/suggest-journal-prompt-flow';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  date: z.date(),
  rating: z.number().min(1, 'Please provide a rating.'),
  photoUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

interface JournalFormProps {
  entryToEdit?: WithId<JournalEntry>;
  onSuccess: () => void;
}

export function JournalForm({ entryToEdit, onSuccess }: JournalFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: entryToEdit?.title ?? '',
      content: entryToEdit?.content ?? '',
      date: entryToEdit?.date?.toDate ? entryToEdit.date.toDate() : new Date(),
      rating: entryToEdit?.rating ?? 0,
      photoUrl: entryToEdit?.photoUrl ?? '',
    },
  });

  const handleGetAiPrompt = async () => {
    setIsAiLoading(true);
    try {
      const result = await suggestJournalPrompt({ language: currentLang });
      form.setValue('content', result.prompt, { shouldDirty: true });
      toast({ title: "Synthesis Complete", description: "AI reflection prompt active." });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Prompt Error',
        description: 'AI suggestion node offline.',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;

    const entryData = {
      ...values,
      date: Timestamp.fromDate(values.date),
      userId: user.uid,
    };

    if (entryToEdit) {
      const entryRef = doc(firestore, `userProfiles/${user.uid}/journalEntries`, entryToEdit.id);
      updateDocumentNonBlocking(entryRef, {
        ...entryData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const collectionRef = collection(firestore, `userProfiles/${user.uid}/journalEntries`);
      addDocumentNonBlocking(collectionRef, {
        ...entryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Sunset over Nakagin" {...field} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Memory Narrative</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto p-0 text-[10px] font-black uppercase text-primary hover:bg-transparent group"
                  onClick={handleGetAiPrompt}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Wand2 className="h-3 w-3 mr-1 group-hover:scale-110 transition-transform" />}
                  Invoke AI Reflection
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Detail your high-fidelity experience..."
                  rows={6}
                  {...field}
                  className="rounded-2xl p-6 bg-slate-50 border-none font-medium text-lg shadow-inner resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temporal Node</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'h-12 rounded-xl border-slate-100 bg-slate-50 font-bold pl-3 text-left',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {field.value ? format(field.value, 'PPP') : "Select date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-none shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vibe Rating</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2 h-12">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={cn(
                          'h-8 w-8 transition-all active:scale-95',
                          star <= field.value
                            ? 'text-accent'
                            : 'text-slate-200 hover:text-accent/40'
                        )}
                        onClick={() => field.onChange(star)}
                      >
                        <Star className={cn("h-full w-full", star <= field.value && "fill-current")} />
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visual Node (External URL)</FormLabel>
              <FormControl>
                <Input placeholder="https://unsplash.com/..." {...field} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
              </FormControl>
              <FormDescription className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                Attach a visual asset to anchor this memory.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all">
          <Save className="mr-2 h-6 w-6" /> Authorize Memory
        </Button>
      </form>
    </Form>
  );
}

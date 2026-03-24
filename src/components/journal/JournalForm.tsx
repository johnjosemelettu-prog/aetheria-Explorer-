'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Sparkles, Star } from 'lucide-react';
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
      form.setValue('content', result.prompt);
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
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Network Disruption',
        description: 'Identity nodes are currently unreachable.',
      });
      return;
    }

    const entryData = {
      ...values,
      date: Timestamp.fromDate(values.date),
      userId: user.uid,
    };

    if (entryToEdit) {
      // Update existing item
      const entryRef = doc(firestore, `userProfiles/${user.uid}/journalEntries`, entryToEdit.id);
      updateDocumentNonBlocking(entryRef, {
        ...entryData,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Add new item
      const collectionRef = collection(firestore, `userProfiles/${user.uid}/journalEntries`);
      addDocumentNonBlocking(collectionRef, {
        ...entryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    toast({
      title: 'Entry Saved',
      description: `"${values.title}" node established in your journal.`,
    });
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Journey Node Title" {...field} />
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
              <FormLabel>Memory Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detail your experience..."
                  rows={8}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={handleGetAiPrompt}
                  disabled={isAiLoading}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isAiLoading ? "Synthesizing..." : "Get AI Suggestion"}
                </Button>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
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
                <FormLabel>Experience Rating</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-8 w-8 cursor-pointer transition-colors',
                          star <= field.value
                            ? 'text-accent fill-accent'
                            : 'text-muted-foreground/30'
                        )}
                        onClick={() => field.onChange(star)}
                      />
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
              <FormLabel>Photo Node URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>
                Attach a visual asset to this memory.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Memory</Button>
      </form>
    </Form>
  );
}

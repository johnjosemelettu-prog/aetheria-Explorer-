'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from '@/lib/i18n'

const formSchema = (t: any) => z.object({
  destination: z.string().min(2, t('itineraryGenerator.validation.destination')),
  dates: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  interests: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: t('itineraryGenerator.validation.interests'),
    }),
  budget: z.enum(['low', 'medium', 'high']),
  travelStyle: z.string(),
  vibe: z.string().optional(),
})

export type ItineraryFormValues = z.infer<typeof formSchema>

interface ItineraryFormProps {
  onSubmit: (data: ItineraryFormValues) => void
  isLoading: boolean
}

export default function ItineraryForm({
  onSubmit,
  isLoading,
}: ItineraryFormProps) {
  const { t } = useTranslation()
  const form = useForm<ItineraryFormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      destination: '',
      interests: ['food'],
      budget: 'medium',
      travelStyle: 'relaxed',
      vibe: '',
    },
  })

  const interestOptions = [
    { id: 'history' },
    { id: 'food' },
    { id: 'hiking' },
    { id: 'art' },
    { id: 'nightlife' },
    { id: 'shopping' },
    { id: 'nature' },
    { id: 'wellness' },
  ]

  const styleOptions = [
    { value: 'relaxed' },
    { value: 'active' },
    { value: 'adventurous' },
    { value: 'packed' },
    { value: 'familyFriendly' },
  ]

  return (
    <Card className="sticky top-20 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-8">
        <CardTitle className="font-headline text-2xl uppercase tracking-tighter italic">{t('itineraryGenerator.form.title')}</CardTitle>
        <CardDescription className="text-slate-400 font-medium">
          {t('itineraryGenerator.form.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('itineraryGenerator.form.destinationLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('itineraryGenerator.form.destinationPlaceholder')} {...field} className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('itineraryGenerator.form.datesLabel')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-bold rounded-xl h-12 border-slate-100 bg-slate-50',
                            !field.value?.from && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, 'LLL dd, y')} -{' '}
                                {format(field.value.to, 'LLL dd, y')}
                              </>
                            ) : (
                              format(field.value.from, 'LLL dd, y')
                            )
                          ) : (
                            <span>{t('itineraryGenerator.form.pickDateRange')}</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
                      <Calendar
                        mode="range"
                        selected={{ from: field.value?.from, to: field.value?.to }}
                        onSelect={field.onChange}
                        numberOfMonths={1}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('profile.interests.title')}</FormLabel>
                    <FormDescription className="text-[9px] font-medium uppercase text-slate-400">
                      {t('profile.interests.description')}
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((interest) => (
                      <FormField
                        key={interest.id}
                        control={form.control}
                        name="interests"
                        render={({ field }) => {
                          const isChecked = field.value?.includes(interest.id);
                          return (
                            <FormItem
                              key={interest.id}
                              className={cn(
                                "flex flex-row items-center space-x-3 space-y-0 p-3 rounded-xl border transition-colors cursor-pointer",
                                isChecked ? "border-primary/50 bg-primary/5" : "border-slate-100 bg-slate-50"
                              )}
                            >
                              <FormControl>
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          interest.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== interest.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-[10px] font-black uppercase text-slate-600 cursor-pointer">
                                {t(`profile.interests.items.${interest.id}`)}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('itineraryGenerator.form.budgetLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-12 border-slate-100 bg-slate-50 font-bold">
                        <SelectValue placeholder={t('itineraryGenerator.form.budgetPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl shadow-2xl border-none">
                      <SelectItem value="low" className="rounded-xl font-bold">{t('itineraryGenerator.form.budgetLow')}</SelectItem>
                      <SelectItem value="medium" className="rounded-xl font-bold">{t('itineraryGenerator.form.budgetMedium')}</SelectItem>
                      <SelectItem value="high" className="rounded-xl font-bold">{t('itineraryGenerator.form.budgetHigh')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="vibe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('itineraryGenerator.form.vibeLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('itineraryGenerator.form.vibePlaceholder')}
                      {...field}
                      className="rounded-xl p-4 min-h-[100px] border-slate-100 bg-slate-50 font-medium"
                    />
                  </FormControl>
                  <FormDescription className="text-[9px] font-medium text-slate-400">
                    {t('itineraryGenerator.form.vibeDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="travelStyle"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('trips.travelStyle' as any) || 'Travel Style'}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      {styleOptions.map((style) => (
                         <FormItem key={style.value} className="flex items-center space-x-3 space-y-0">
                         <FormControl>
                           <RadioGroupItem value={style.value} className="border-slate-300" />
                         </FormControl>
                         <FormLabel className="font-bold text-xs text-slate-600 cursor-pointer">{t(`profile.travelStyle.${style.value}.label` as any) || style.value}</FormLabel>
                       </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all">
              {isLoading ? (
                t('itineraryGenerator.form.generatingButton')
              ) : (
                <>
                  <Sparkles className="mr-2 h-6 w-6" /> {t('itineraryGenerator.form.generateButton')}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Languages,
  ArrowRightLeft,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Zap,
  Globe,
  ShieldCheck,
} from 'lucide-react'

import { translateTextAction, transcribeAndTranslateAudioAction } from './actions'
import { textToSpeech } from '@/ai/flows/text-to-speech-flow'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const languages = [
  { value: 'Arabic', label: 'Arabic' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Mandarin Chinese', label: 'Mandarin Chinese' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Portuguese', label: 'Portuguese' },
]

const translationSchema = z.object({
  text: z.string().min(1, 'Please enter some text to translate.'),
  sourceLanguage: z.string(),
  targetLanguage: z.string().min(1, 'Please select a language.'),
})

export default function TranslatorPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [translatedText, setTranslatedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])

  const [audioDataUri, setAudioDataUri] = useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const { toast } = useToast()
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof translationSchema>>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      text: '',
      sourceLanguage: 'auto',
      targetLanguage: 'Spanish',
    },
  })

  useEffect(() => {
    setHasMounted(true)
    if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsSpeechRecognitionSupported(true)
    }
  }, [])

  const handleAudioGeneration = useCallback(
    async (text: string) => {
      if (!text) return
      setIsGeneratingAudio(true)
      setAudioDataUri(null)
      try {
        const audioResult = await textToSpeech(text)
        setAudioDataUri(audioResult.audioDataUri)
      } catch (error) {
        console.error('Error generating audio:', error)
      } finally {
        setIsGeneratingAudio(false)
      }
    },
    []
  )

  const onSubmit = useCallback(
    async (values: z.infer<typeof translationSchema>) => {
      setIsLoading(true)
      setTranslatedText('')
      setAudioDataUri(null)
      setDetectedLanguage(null)
      try {
        const result = await translateTextAction({
          text: values.text,
          targetLanguage: values.targetLanguage,
          sourceLanguage: values.sourceLanguage === 'auto' ? undefined : values.sourceLanguage,
        })
        setTranslatedText(result.translatedText)
        if (result.detectedSourceLanguage) {
          setDetectedLanguage(result.detectedSourceLanguage)
        }
        handleAudioGeneration(result.translatedText)
      } catch (error) {
        console.error('Error translating text:', error)
        toast({
          title: 'Translation Failed',
          description: 'The linguistic lab is offline.',
          variant: 'destructive',
        })
      }
      setIsLoading(false)
    },
    [toast, handleAudioGeneration]
  )

  const handleToggleListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      setIsListening(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data)
          }
        }

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop())
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          
          const reader = new FileReader()
          reader.readAsDataURL(audioBlob)
          reader.onloadend = async () => {
            const base64Audio = reader.result as string
            
            setIsLoading(true)
            setTranslatedText('')
            setAudioDataUri(null)
            try {
              const targetLang = form.getValues('targetLanguage')
              const sourceLang = form.getValues('sourceLanguage')
              
              const result = await transcribeAndTranslateAudioAction(base64Audio, targetLang, sourceLang)
              
              if (result) {
                form.setValue('text', result.transcription)
                setTranslatedText(result.translatedText)
                if (result.detectedSourceLanguage) {
                  setDetectedLanguage(result.detectedSourceLanguage)
                }
                handleAudioGeneration(result.translatedText)
              }
            } catch (error) {
              console.error('Error processing audio:', error)
              toast({
                title: 'Audio Processing Failed',
                description: 'Failed to transcribe and translate audio.',
                variant: 'destructive',
              })
            } finally {
              setIsLoading(false)
            }
          }
        }

        mediaRecorder.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error accessing microphone:', error)
        toast({
          title: 'Microphone Error',
          description: 'Could not access the microphone.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleSwapLanguages = () => {
    const source = form.getValues('sourceLanguage')
    const target = form.getValues('targetLanguage')
    if (source !== 'auto') {
      form.setValue('sourceLanguage', target)
      form.setValue('targetLanguage', source)
    }
  }

  if (!hasMounted) return null

  return (
    <div className="container mx-auto px-4 py-12 max-5xl">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Synthesis Node</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Linguistic Lab
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Break communication barriers with high-fidelity synthesis and native voice nodes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-10">
              <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter flex items-center gap-3">
                <Languages className="h-6 w-6 text-primary" /> Input Node
              </CardTitle>
              <CardDescription className="text-slate-400">Specify text or initiate a voice link.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase text-slate-400 tracking-widest">Target Content</FormLabel>
                        <div className="relative group">
                          <FormControl>
                            <Textarea
                              placeholder={isListening ? "Recording audio input..." : "Enter text to synthesize..."}
                              className={cn(
                                "resize-none pr-16 h-40 rounded-[2rem] border-slate-100 bg-slate-50 focus:bg-white transition-all text-lg font-medium p-8",
                                isListening && "ring-4 ring-primary/20 border-primary animate-pulse"
                              )}
                              {...field}
                            />
                          </FormControl>
                          {isSpeechRecognitionSupported && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={handleToggleListening}
                              className={cn(
                                "absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full transition-all",
                                isListening ? "bg-red-50 text-white animate-bounce shadow-lg shadow-red-200" : "bg-white text-primary border border-slate-100 shadow-sm hover:bg-slate-50"
                              )}
                            >
                              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
                    <FormField
                      control={form.control}
                      name="sourceLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">From</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-2xl shadow-2xl border-none">
                              <SelectItem value="auto">Detect Node</SelectItem>
                              {languages.map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={handleSwapLanguages} disabled={form.watch('sourceLanguage') === 'auto'} className="rounded-full h-12 w-12 hover:bg-slate-50">
                      <ArrowRightLeft className="h-5 w-5 text-slate-300" />
                    </Button>
                    <FormField
                      control={form.control}
                      name="targetLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">To</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-2xl shadow-2xl border-none">
                              {languages.map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all">
                    {isLoading ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Synthesizing...</> : <><Zap className="mr-2 h-6 w-6" /> Authorize Synthesis</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-8">
          {(isLoading || translatedText) ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden h-fit">
                <CardHeader className="p-10 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest px-3 mb-4">
                        Synthesis Resolved {detectedLanguage && `(from ${detectedLanguage})`}
                      </Badge>
                      <h3 className="text-3xl font-black font-headline leading-tight italic">{form.getValues('targetLanguage')} Node</h3>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary shadow-inner">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-0 space-y-10">
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 min-h-[120px] flex items-center justify-center text-center">
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs font-black uppercase tracking-widest">Resolving DNA...</p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold leading-relaxed">{translatedText}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Auditory Synthesis</p>
                      <p className="text-xs font-bold text-slate-400">{isGeneratingAudio ? "Encoding voice node..." : audioDataUri ? "Auditory Node Resolved" : "Idle"}</p>
                    </div>
                    {isGeneratingAudio ? (
                      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : audioDataUri ? (
                      <Button onClick={() => audioRef.current?.play()} className="h-16 w-16 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/20 active:scale-95 transition-all">
                        <Volume2 className="h-8 w-8" />
                        <audio ref={audioRef} src={audioDataUri} className="hidden" />
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Translation synthesized via Aura linguistic nodes. Auditory output calibrated for high-fidelity native pronunciation.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center opacity-20 grayscale py-24 gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
                <Globe className="h-40 w-40 text-primary relative mx-auto" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black font-headline uppercase tracking-tighter italic">Linguistic Radar Idle</h2>
                <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Initialize input node to break language barriers across the global grid.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

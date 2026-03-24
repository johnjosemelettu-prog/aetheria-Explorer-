'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
  Camera,
  PersonStanding,
  Ruler,
  ScanLine,
  Sparkles,
  Palette,
  Check,
  Plane,
  Heart,
  X,
  Undo,
  PlusCircle,
  Trash2,
  Briefcase,
  Calendar as CalendarIcon,
  Loader2,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  AlertTriangle,
  RotateCcw,
  CloudSun,
  MapPin,
  Clock,
  PackageCheck,
  Wand2,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { recommendWardrobe } from '@/ai/flows/recommend-wardrobe-flow'
import {
  type RecommendWardrobeInput,
  type RecommendWardrobeOutput,
  type RecommendedItem,
} from '@/ai/flows/wardrobe-schemas'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { useFirebase, setDocumentNonBlocking, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase'
import { doc, collection, serverTimestamp, increment, query, orderBy } from 'firebase/firestore'
import { Badge } from '@/components/ui/badge'
import { synthesizeWardrobeEmail } from '@/ai/flows/wardrobe-email-flow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const fitPreferences = [
  { value: 'slim', labelKey: 'Slim' },
  { value: 'regular', labelKey: 'Regular' },
  { value: 'relaxed', labelKey: 'Relaxed' },
  { value: 'oversized', labelKey: 'Oversized' },
]

const sensitivities = [
  { id: 'wool-allergy', labelKey: 'Wool Allergy' },
  { id: 'natural-fibers', labelKey: 'Natural Fibers' },
  { id: 'no-turtlenecks', labelKey: 'No Turtlenecks' },
  { id: 'synthetic-friendly', labelKey: 'Synthetic Friendly' },
]

const looks = [
  {
    id: 'look-1',
    title: 'Positano Linen',
    image: PlaceHolderImages.find((img) => img.id === 'digital-tailor-look-1'),
  },
  {
    id: 'look-2',
    title: 'Tokyo Streetwear',
    image: PlaceHolderImages.find((img) => img.id === 'digital-tailor-look-2'),
  },
  {
    id: 'look-3',
    title: 'SF Tech Fleece',
    image: PlaceHolderImages.find((img) => img.id === 'digital-tailor-look-3'),
  },
]

const brands = [
  { id: 'patagonia', label: 'Patagonia' },
  { id: 'reformation', label: 'Reformation' },
  { id: 'brunello-cucinelli', label: 'Brunello Cucinelli' },
  { id: 'nike', label: 'Nike' },
  { id: 'zara', label: 'Zara' },
  { id: 'gucci', label: 'Gucci' },
  { id: 'uniqlo', label: 'Uniqlo' },
  { id: 'acne-studios', label: 'Acne Studios' },
  { id: 'levis', label: "Levi's" },
  { id: 'the-north-face', label: 'The North Face' },
  { id: 'everlane', label: 'Everlane' },
  { id: 'prada', label: 'Prada' },
]

export default function DigitalTailorPage() {
  const [activeTab, setActiveTab] = useState<'synthesize' | 'manage'>('synthesize');
  const [currentStep, setCurrentStep] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null)
  const { t, language } = useTranslation()

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const [wardrobeRequest, setWardrobeRequest] =
    useState<RecommendWardrobeInput>({
      fitPreference: 'regular',
      sensitivities: [],
      styleVibe: {
        lovedLooks: [],
        passedLooks: [],
      },
      brandAffinities: [],
      tripContext: {
        destination: 'London, UK',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(
          new Date(new Date().setDate(new Date().getDate() + 5)),
          'yyyy-MM-dd'
        ),
        predictedWeather: 'Rainy and cool, avg. 10°C', 
        luggageLevel: 'hybrid',
        events: [
          { name: 'Gala Dinner', dressCode: 'Black Tie' },
          { name: 'Coffee with Investors', dressCode: 'Smart Casual' },
        ],
      },
      language: currentLang,
    })
  
  const [recommendations, setRecommendations] = useState<RecommendWardrobeOutput | null>(null);
  const [selectedItems, setSelectedItems] = useState<RecommendedItem[]>([]);

  const updateRequest = (updates: Partial<RecommendWardrobeInput>) => {
    setWardrobeRequest((prev) => ({
      ...prev,
      ...updates,
      styleVibe: { ...prev.styleVibe, ...updates.styleVibe },
      tripContext: { ...prev.tripContext, ...updates.tripContext },
    }))
  }

  const steps = [
    { name: 'Scan', description: 'Body Topology', icon: Ruler },
    { name: 'Vibe', description: 'Style DNA', icon: Palette },
    { name: 'Trip', description: 'Canvas Nodes', icon: Plane },
    { name: 'Mirror', description: 'Synthesis', icon: Sparkles },
    { name: 'Deploy', description: 'Fulfillment', icon: ShoppingCart },
  ]

  useEffect(() => {
    if (currentStep === 0 && activeTab === 'synthesize') {
      const getCameraPermission = async () => {
        try {
          if (hasCameraPermission === null) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            })
            setHasCameraPermission(true)
            if (videoRef.current) {
              videoRef.current.srcObject = stream
            }
          }
        } catch (error) {
          console.error('Error accessing camera:', error)
          setHasCameraPermission(false)
          toast({
            variant: 'destructive',
            title: 'Camera Error',
            description: 'Check browser permissions.',
          })
        }
      }
      getCameraPermission()
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [currentStep, activeTab, toast, hasCameraPermission])

  const goToNextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  const goToPrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl text-slate-900 leading-none italic uppercase">
          Digital Tailor
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-medium">
          Zero-luggage wardrobe synthesis for the modern explorer.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-12">
        <div className="flex justify-center">
          <TabsList className="bg-white/80 backdrop-blur-md shadow-xl border-none h-16 p-1.5 rounded-3xl w-fit">
            <TabsTrigger value="synthesize" className="rounded-[1.25rem] px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Sparkles className="mr-2 h-4 w-4" /> Synthesize
            </TabsTrigger>
            <TabsTrigger value="manage" className="rounded-[1.25rem] px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Briefcase className="mr-2 h-4 w-4" /> Manage
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="synthesize" className="m-0 space-y-12">
          <div className="mx-auto max-w-3xl">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li
                  key={step.name}
                  className={cn(
                    "relative flex w-full items-center",
                    stepIdx !== steps.length - 1
                      ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-border after:border-4 after:inline-block"
                      : ''
                  )}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full transition-colors shadow-lg',
                        currentStep > stepIdx
                          ? 'bg-primary text-primary-foreground'
                          : currentStep === stepIdx
                          ? 'bg-primary/20 border-2 border-primary text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {stepIdx < currentStep ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="absolute top-14 w-24 -ml-6 text-center">
                      <p
                        className={cn(
                          'text-[10px] font-black uppercase tracking-widest',
                          currentStep >= stepIdx
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        )}
                      >
                        {step.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Card className="mx-auto mt-24 max-w-3xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-10">
              <CardTitle className="text-3xl font-black font-headline uppercase tracking-tighter">
                Step {currentStep + 1}
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium">
                {steps[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10">
              {currentStep === 0 && (
                <Step1BodyScan
                  hasCameraPermission={hasCameraPermission}
                  videoRef={videoRef}
                  data={wardrobeRequest}
                  onUpdate={updateRequest}
                />
              )}
              {currentStep === 1 && (
                <Step2VibeCheck data={wardrobeRequest} onUpdate={updateRequest} />
              )}
              {currentStep === 2 && (
                <Step3TripCanvas data={wardrobeRequest} onUpdate={updateRequest} />
              )}
              {currentStep === 3 && <Step4MagicMirror 
                requestData={{...wardrobeRequest, language: currentLang}} 
                recommendations={recommendations} 
                setRecommendations={setRecommendations} 
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                />}
              {currentStep === 4 && <Step5Checkout 
                selectedItems={selectedItems} 
                language={currentLang}
                onSuccess={() => {
                  setActiveTab('manage');
                  setCurrentStep(0);
                  toast({
                    title: "Deployment Initiated",
                    description: "Your wardrobe is scheduled for destination delivery.",
                  });
                }}
              />}
            </CardContent>
          </Card>

          <div className="mx-auto mt-8 flex justify-between max-w-3xl">
            <Button
              variant="outline"
              onClick={goToPrevStep}
              disabled={currentStep === 0}
              className="rounded-xl h-12 px-8 font-bold border-2"
            >
              Back
            </Button>
            <Button
              onClick={goToNextStep}
              disabled={currentStep === steps.length - 1}
              className="rounded-xl h-12 px-8 font-bold shadow-xl shadow-primary/20"
            >
              Next Step
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="m-0">
          <ManageWardrobeView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ManageWardrobeView() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const [isReturning, setIsReturning] = useState<string | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const rentalsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'userProfiles', user.uid, 'rentals'), orderBy('createdAt', 'desc')) : null),
    [user, firestore]
  );
  const { data: rentals, isLoading } = useCollection(rentalsQuery);

  const findImage = (hint: string): ImagePlaceholder | undefined => {
    if (!hint) return undefined;
    const hintWords = hint.toLowerCase().split(' ');
    let image = PlaceHolderImages.find(p => p.imageHint.toLowerCase() === hint.toLowerCase());
    if (image) return image;
    image = PlaceHolderImages.find(p => hintWords.some(h => p.imageHint.toLowerCase().includes(h)));
    return image;
  }

  const handleReturn = async (rentalId: string, deposit: number, rentPaid: boolean, itemNames: string[]) => {
    if (!user || !firestore) return;
    setIsReturning(rentalId);
    
    try {
      const refundAmount = rentPaid ? deposit : deposit * 0.5;
      await new Promise(resolve => setTimeout(resolve, 2000));

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(refundAmount),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'credit',
        category: 'refund',
        amount: refundAmount,
        currency: 'USD',
        description: `Security Deposit Refund • Rental ${rentalId.substring(0, 6).toUpperCase()}`,
        timestamp: serverTimestamp()
      });

      const rentalRef = doc(firestore, 'userProfiles', user.uid, 'rentals', rentalId);
      setDocumentNonBlocking(rentalRef, {
        status: 'returned',
        refundedAmount: refundAmount,
        updatedAt: serverTimestamp()
      }, { merge: true });

      try {
        await synthesizeWardrobeEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          type: 'return',
          itemNames: itemNames,
          amount: refundAmount,
          language: currentLang
        });
      } catch (e) {}

      toast({ title: "Refund Completed", description: "Deposit returned to your Smart Wallet Hub." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Return Failed" });
    } finally {
      setIsReturning(null);
    }
  };

  if (isLoading) return (
    <div className="space-y-8">
      <Skeleton className="h-48 w-full rounded-[2.5rem]" />
      <Skeleton className="h-48 w-full rounded-[2.5rem]" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <PackageCheck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">My Wardrobe Rentals</h2>
              <p className="text-slate-500 font-medium">Manage your zero-luggage inventory.</p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-none font-black uppercase px-4 py-1.5">Node Active</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        {rentals && rentals.length > 0 ? (
          rentals.map((rental) => {
            const isActive = rental.status === 'active';
            const itemNames = rental.items.map((i: any) => i.itemName);
            return (
              <Card key={rental.id} className={cn(
                "border-none shadow-2xl rounded-[3rem] overflow-hidden transition-all duration-500 bg-white",
                !isActive && "opacity-60 grayscale-[0.5]"
              )}>
                <div className="bg-slate-950 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg",
                      isActive ? "bg-primary" : "bg-slate-800"
                    )}>
                      <Briefcase className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black font-headline">Package {rental.id.substring(0, 6).toUpperCase()}</h3>
                        <Badge className={cn(
                          "font-black uppercase text-[9px] px-2",
                          isActive ? "bg-emerald-500" : "bg-slate-700"
                        )}>{rental.status}</Badge>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Ordered {rental.createdAt?.toDate ? format(rental.createdAt.toDate(), 'PPP') : 'Recently'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Deposit</p>
                      <p className="text-3xl font-black font-headline text-accent">${rental.depositAmount.toFixed(2)}</p>
                    </div>
                    {isActive && (
                      <Button 
                        onClick={() => handleReturn(rental.id, rental.depositAmount, rental.isRentPaidInFull, itemNames)}
                        disabled={!!isReturning}
                        className="rounded-2xl h-14 px-8 font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                      >
                        {isReturning === rental.id ? <Loader2 className="animate-spin mr-2" /> : <RotateCcw className="mr-2" />}
                        Process Return
                      </Button>
                    )}
                    {!isActive && (
                      <div className="h-14 flex items-center px-6 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 font-bold">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Refund Completed
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contents</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {rental.items.map((item: any, i: number) => {
                        const img = findImage(item.imageHint);
                        return (
                          <div key={i} className="aspect-square relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group">
                            <Image src={img?.imageUrl || 'https://placehold.co/400x400'} alt={item.itemName} fill className="object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                              <div className="w-full">
                                <p className="text-white text-[9px] font-black uppercase tracking-tighter truncate">{item.itemName}</p>
                                <p className="text-white/40 text-[7px] font-bold uppercase truncate">{item.category}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-20 grayscale">
            <PackageCheck className="h-32 w-32 text-primary" />
            <div className="space-y-2">
              <h2 className="text-3xl font-black font-headline uppercase tracking-tighter">No active rentals.</h2>
              <p className="text-sm font-bold uppercase tracking-widest">Initialize a node to begin collection.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Step1BodyScan({
  hasCameraPermission,
  videoRef,
  data,
  onUpdate,
}: {
  hasCameraPermission: boolean | null
  videoRef: React.RefObject<HTMLVideoElement | null>
  data: RecommendWardrobeInput
  onUpdate: (updates: Partial<RecommendWardrobeInput>) => void
}) {
  const { t } = useTranslation()

  const handleSensitivityChange = (id: string, checked: boolean) => {
    const newSensitivities = checked
      ? [...data.sensitivities, id]
      : data.sensitivities.filter((s) => s !== id);
    onUpdate({ sensitivities: newSensitivities });
  };


  return (
    <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
      <div className="space-y-10">
        <div>
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Fit Preference</Label>
          <RadioGroup
            value={data.fitPreference}
            onValueChange={(value) => onUpdate({ fitPreference: value })}
            className="flex flex-wrap gap-4"
          >
            {fitPreferences.map((pref) => (
               <Label
                  key={pref.value}
                  htmlFor={`fit-${pref.value}`}
                  className="flex flex-1 min-w-[120px] cursor-pointer items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-600 transition-all hover:bg-slate-100 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 [&:has([data-state=checked])]:text-primary"
                >
                <RadioGroupItem
                    value={pref.value}
                    id={`fit-${pref.value}`}
                    className="sr-only"
                  />
                  {pref.labelKey}
                </Label>
            ))}
          </RadioGroup>
        </div>
        <div>
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">
            Sensitivities
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sensitivities.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Checkbox
                  id={item.id}
                  checked={data.sensitivities.includes(item.id)}
                  onCheckedChange={(checked) => handleSensitivityChange(item.id, !!checked)}
                />
                <label
                  htmlFor={item.id}
                  className="text-sm font-bold text-slate-700 leading-none cursor-pointer"
                >
                  {item.labelKey}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative mx-auto flex aspect-[3/4] w-full max-w-md items-center justify-center overflow-hidden rounded-[2rem] border-4 border-slate-100 bg-slate-900 shadow-2xl">
          <video
            ref={videoRef}
            className="h-full w-full object-cover opacity-60"
            autoPlay
            muted
            playsInline
          />

          <PersonStanding
            className="absolute inset-0 h-full w-full text-primary/10"
            strokeWidth={1}
          />
          <ScanLine className="absolute h-1 w-full animate-[scan_4s_ease-in-out_infinite] bg-primary shadow-[0_0_20px_rgba(37,99,235,0.8)]" />

          {hasCameraPermission === false && (
            <Alert variant="destructive" className="m-4 bg-red-50 text-red-900 border-none rounded-2xl">
              <Camera className="h-4 w-4" />
              <AlertTitle className="font-black font-headline uppercase tracking-tighter">Camera Error</AlertTitle>
              <AlertDescription className="font-medium text-xs">
                Check browser permissions.
              </AlertDescription>
            </Alert>
          )}
          {hasCameraPermission === true && (
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-black/40 p-4 text-center backdrop-blur-md border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                Place full body in frame for synthesis
              </p>
            </div>
          )}
        </div>
        <style jsx>{`
          @keyframes scan {
            0% { transform: translateY(-100%); }
            50% { transform: translateY(100%); }
            100% { transform: translateY(-100%); }
          }
        `}</style>
      </div>
    </div>
  )
}

function Step2VibeCheck({
  data,
  onUpdate,
}: {
  data: RecommendWardrobeInput
  onUpdate: (updates: Partial<RecommendWardrobeInput>) => void
}) {
  const { t } = useTranslation()
  const [currentLookIndex, setCurrentLookIndex] = useState(0)
  const [selections, setSelections] = useState<('love' | 'pass' | null)[]>(
    Array(looks.length).fill(null)
  )

  const handleSelection = (selection: 'love' | 'pass') => {
    const newSelections = [...selections]
    newSelections[currentLookIndex] = selection
    setSelections(newSelections)
    
    const lookTitle = looks[currentLookIndex].title;
    const currentStyleVibe = data.styleVibe;
    
    const updatedStyleVibe = {
        lovedLooks: selection === 'love' 
            ? [...currentStyleVibe.lovedLooks, lookTitle] 
            : currentStyleVibe.lovedLooks.filter(l => l !== lookTitle),
        passedLooks: selection === 'pass' 
            ? [...currentStyleVibe.passedLooks, lookTitle] 
            : currentStyleVibe.passedLooks.filter(l => l !== lookTitle),
    }
    onUpdate({ styleVibe: updatedStyleVibe });

    goToNextLook()
  }

  const goToNextLook = () => {
    setCurrentLookIndex((prev) => Math.min(prev + 1, looks.length))
  }

  const goBack = () => {
    setCurrentLookIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleBrandChange = (id: string, checked: boolean) => {
    const newBrandAffinities = checked
      ? [...data.brandAffinities, id]
      : data.brandAffinities.filter((b) => b !== id);
    onUpdate({ brandAffinities: newBrandAffinities });
  };


  return (
    <div className="grid grid-cols-1 items-start gap-16 md:grid-cols-2">
      <div className="space-y-8">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Style Swipe</h3>
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
          {looks.map((look, index) => (
            <Card
              key={look.id}
              className={cn(
                'absolute h-full w-full overflow-hidden transition-all duration-500 ease-in-out border-none shadow-2xl rounded-[2.5rem]',
                index === currentLookIndex ? 'opacity-100 z-10' : 'opacity-0 -z-10',
                selections[index] === 'love' && index < currentLookIndex
                  ? 'transform -translate-x-full rotate-[-15deg] opacity-0'
                  : '',
                selections[index] === 'pass' && index < currentLookIndex
                  ? 'transform translate-x-full rotate-[15deg] opacity-0'
                  : ''
              )}
            >
              {look.image && (
                <Image
                  src={look.image.imageUrl}
                  alt={look.image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={look.image.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 w-full p-8">
                <CardTitle className="text-3xl font-black font-headline text-white tracking-tighter uppercase italic">{look.title}</CardTitle>
              </div>
            </Card>
          ))}
          {currentLookIndex >= looks.length && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-slate-100 p-8 text-center animate-in zoom-in duration-500">
              <CheckCircle2 className="mb-6 h-20 w-20 text-primary" />
              <h4 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tighter">Vibe Resolved</h4>
              <p className="text-sm font-medium text-slate-500 mt-2">
                Style DNA preferences recorded.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {setCurrentLookIndex(0); setSelections(Array(looks.length).fill(null))}}
                className="mt-8 rounded-xl font-bold h-11 px-6 border-2"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Calibration
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full border-4 border-slate-100 text-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-lg"
            onClick={goBack}
            disabled={currentLookIndex === 0}
          >
            <Undo className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-20 w-20 rounded-full border-4 border-red-100 text-red-500 hover:bg-red-50 shadow-xl"
            onClick={() => handleSelection('pass')}
            disabled={currentLookIndex >= looks.length}
          >
            <X className="h-10 w-10" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-20 w-20 rounded-full border-4 border-primary/20 text-primary hover:bg-primary/5 shadow-xl shadow-primary/5"
            onClick={() => handleSelection('love')}
            disabled={currentLookIndex >= looks.length}
          >
            <Heart className="h-10 w-10 fill-current" />
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand Affinity</h3>
        <ScrollArea className="h-[450px] w-full rounded-3xl border-none shadow-inner bg-slate-50 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {brands.map((brand) => (
              <div key={brand.id} className={cn(
                "flex items-center space-x-3 p-4 rounded-2xl transition-all",
                data.brandAffinities.includes(brand.id) ? "bg-primary text-white shadow-lg" : "bg-white text-slate-600 shadow-sm border border-slate-100"
              )}>
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={data.brandAffinities.includes(brand.id)}
                  onCheckedChange={(checked) => handleBrandChange(brand.id, !!checked)}
                  className={cn(data.brandAffinities.includes(brand.id) && "border-white")}
                />
                <label
                  htmlFor={`brand-${brand.id}`}
                  className="text-sm font-bold leading-none cursor-pointer"
                >
                  {brand.label}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function Step3TripCanvas({
  data,
  onUpdate,
}: {
  data: RecommendWardrobeInput
  onUpdate: (updates: Partial<RecommendWardrobeInput>) => void
}) {
  const { t } = useTranslation()
  const { tripContext } = data;

  const [newEventName, setNewEventName] = useState('')
  const [newDressCode, setNewDressCode] = useState('Casual')

  const handleTripContextUpdate = (updates: Partial<RecommendWardrobeInput['tripContext']>) => {
    onUpdate({ tripContext: { ...tripContext, ...updates }});
  }

  const addEvent = () => {
    if (newEventName.trim() !== '') {
      handleTripContextUpdate({
        events: [...tripContext.events, { name: newEventName, dressCode: newDressCode }]
      });
      setNewEventName('')
    }
  }

  const removeEvent = (indexToRemove: number) => {
    handleTripContextUpdate({
      events: tripContext.events.filter((_, index) => index !== indexToRemove)
    });
  }

  return (
    <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
      <div className="space-y-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination Node</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                id="destination"
                placeholder="Where are you landing?"
                value={tripContext.destination}
                onChange={(e) => handleTripContextUpdate({ destination: e.target.value })}
                className="h-12 rounded-xl border-slate-200 pl-10 font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-bold rounded-xl h-12 border-slate-100 bg-slate-50',
                    !tripContext.startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {tripContext.startDate ? (
                    tripContext.endDate ? (
                      <>
                        {format(new Date(tripContext.startDate), 'MMM dd')} - {format(new Date(tripContext.endDate), 'MMM dd')}
                      </>
                    ) : (
                      format(new Date(tripContext.startDate), 'LLL dd')
                    )
                  ) : (
                    <span>Pick a date node</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date(tripContext.startDate)}
                  selected={{ from: new Date(tripContext.startDate), to: new Date(tripContext.endDate) }}
                  onSelect={(range) => handleTripContextUpdate({ 
                    startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
                    endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
                  })}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Card className="border-none shadow-lg rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CloudSun className="h-4 w-4 text-primary" /> Weather Logic
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-around text-center py-4">
            <div className="space-y-1">
              <p className="text-xl font-black text-slate-900">60%</p>
              <p className="text-[10px] font-black uppercase text-slate-400">Rain Prob.</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="space-y-1">
              <p className="text-xl font-black text-slate-900">8°C</p>
              <p className="text-[10px] font-black uppercase text-slate-400">Avg. Temp</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Luggage Level</Label>
          <RadioGroup 
            value={tripContext.luggageLevel} 
            onValueChange={(value) => handleTripContextUpdate({ luggageLevel: value })}
            className="grid grid-cols-1 gap-4"
          >
            <Label
              htmlFor="luggage-zero"
              className="flex cursor-pointer items-center gap-6 rounded-3xl border-2 p-6 transition-all hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem value="zero" id="luggage-zero" className="sr-only" />
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary"><Sparkles className="h-6 w-6" /></div>
              <div className="flex-1">
                <p className="font-black text-slate-900">Zero-Luggage</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Full rental suite deployed at destination.</p>
              </div>
              {tripContext.luggageLevel === 'zero' && <CheckCircle2 className="h-6 w-6 text-primary" />}
            </Label>
            <Label
              htmlFor="luggage-hybrid"
              className="flex cursor-pointer items-center gap-6 rounded-3xl border-2 p-6 transition-all hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem value="hybrid" id="luggage-hybrid" className="sr-only" />
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400"><Briefcase className="h-6 w-6" /></div>
              <div className="flex-1">
                <p className="font-black text-slate-900">Hybrid Node</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Supplementary rentals for specific events.</p>
              </div>
              {tripContext.luggageLevel === 'hybrid' && <CheckCircle2 className="h-6 w-6 text-primary" />}
            </Label>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Itinerary Events</h3>
        <ScrollArea className="h-[300px] w-full rounded-3xl border-none shadow-inner bg-slate-50 p-6">
          <div className="space-y-3">
            {tripContext.events.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm group">
                <div>
                  <p className="font-black text-slate-900">{event.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.dressCode}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl hover:bg-red-50 hover:text-red-500"
                  onClick={() => removeEvent(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {tripContext.events.length === 0 && (
              <div className="py-12 text-center opacity-30 grayscale flex flex-col items-center gap-4">
                <CalendarIcon className="h-10 w-10" />
                <p className="text-xs font-black uppercase tracking-widest">No Event Nodes Added</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <Card className="border-none shadow-lg rounded-[2rem] p-6 bg-white space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">New Event Node</p>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="e.g. Rooftop Mixer"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              className="h-12 rounded-xl"
            />
            <div className="flex gap-2">
              <Select onValueChange={setNewDressCode} defaultValue={newDressCode}>
                <SelectTrigger className="rounded-xl h-12 flex-grow">
                  <SelectValue placeholder="Dress Code" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-2xl border-none">
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Smart Casual">Smart Casual</SelectItem>
                  <SelectItem value="Business Casual">Business Casual</SelectItem>
                  <SelectItem value="Cocktail">Cocktail</SelectItem>
                  <SelectItem value="Black Tie">Black Tie</SelectItem>
                  <SelectItem value="Activewear">Activewear</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="icon"
                onClick={addEvent}
                disabled={!newEventName.trim()}
                className="h-12 w-12 rounded-xl shadow-lg"
              >
                <PlusCircle className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Step4MagicMirror({
  requestData,
  recommendations,
  setRecommendations,
  selectedItems,
  onSelectionChange,
}: {
  requestData: RecommendWardrobeInput;
  recommendations: RecommendWardrobeOutput | null;
  setRecommendations: (recs: RecommendWardrobeOutput | null) => void;
  selectedItems: RecommendedItem[];
  onSelectionChange: (items: RecommendedItem[]) => void;
}) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(!recommendations)
  const [error, setError] = useState<string | null>(null);

  const onSelectionChangeCallback = useCallback(onSelectionChange, [onSelectionChange]);

  useEffect(() => {
    if (!recommendations && !error) {
        async function getRecommendations() {
            setIsLoading(true)
            try {
                const result = await recommendWardrobe(requestData)
                setRecommendations(result)
                const allItems = result.packingList.flatMap(outfit => outfit.items);
                onSelectionChangeCallback(allItems);
            } catch (err: any) {
                console.error('Error getting wardrobe recommendations:', err)
                const errorMessage = err.message || 'The styling engine encountered a logic shift. Please try again.';
                setError(errorMessage);
                toast({
                variant: 'destructive',
                title: 'Synthesis Failure',
                description: errorMessage,
                })
            } finally {
                setIsLoading(false)
            }
        }
        getRecommendations()
    } else if (recommendations) {
        setIsLoading(false);
    }
  }, [requestData, toast, recommendations, setRecommendations, onSelectionChangeCallback, error])

  const handleRetry = () => {
    setError(null);
    setRecommendations(null); 
  };

  const findImage = (hint: string): ImagePlaceholder | undefined => {
    if (!hint) return undefined;
    const hintWords = hint.toLowerCase().split(' ');
    let image = PlaceHolderImages.find(p => p.imageHint.toLowerCase() === hint.toLowerCase());
    if (image) return image;
    image = PlaceHolderImages.find(p => hintWords.some(h => p.imageHint.toLowerCase().includes(h)));
    return image;
  }

  const handleItemToggle = (itemToToggle: RecommendedItem) => {
    const isAlreadySelected = selectedItems.some(item => item.itemName === itemToToggle.itemName && item.description === itemToToggle.description);
    let newSelectedItems;
    if (isAlreadySelected) {
        newSelectedItems = selectedItems.filter(item => !(item.itemName === itemToToggle.itemName && item.description === itemToToggle.description));
    } else {
        newSelectedItems = [...selectedItems, itemToToggle];
    }
    onSelectionChange(newSelectedItems);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-8">
          <div className="relative w-32 h-32">
            <Loader2 className="w-full h-full animate-spin text-primary opacity-20" strokeWidth={1} />
            <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black font-headline tracking-tighter uppercase italic">Synthesizing Looks...</h3>
            <p className="text-slate-400 font-medium">Matching your DNA with destination climate nodes.</p>
          </div>
      </div>
    )
  }

    if (error) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-6">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
        <Alert variant="destructive" className="max-w-md border-none bg-red-50 text-red-900 rounded-2xl shadow-xl">
            <AlertTitle className="font-black font-headline">Synthesis Error</AlertTitle>
            <AlertDescription className="font-medium text-xs">{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRetry} className="rounded-xl h-12 px-8 font-bold shadow-lg">
            <RotateCcw className="mr-2 h-4 w-4" /> Re-Initialize Synthesis
        </Button>
      </div>
    )
  }

  if (!recommendations) return null;

  return (
    <div className="space-y-12">
        <Alert className="border-none shadow-xl bg-slate-900 text-white rounded-[2rem] p-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700"><Sparkles className="h-32 w-32 text-primary" /></div>
            <div className="relative z-10 flex gap-6 items-start">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white flex-shrink-0 shadow-lg"><Zap className="h-8 w-8" /></div>
              <div>
                <AlertTitle className="text-2xl font-black font-headline tracking-tighter uppercase mb-2">Architect Recommendation</AlertTitle>
                <AlertDescription className="text-slate-400 text-lg font-medium leading-relaxed italic">"{recommendations.summary}"</AlertDescription>
              </div>
            </div>
        </Alert>

        <Carousel opts={{ loop: true }} className="w-full max-w-4xl mx-auto">
            <CarouselContent>
                {recommendations.packingList.map((outfit, index) => (
                    <CarouselItem key={index}>
                        <Card className="overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white">
                            <CardHeader className="bg-slate-50 p-8 border-b border-slate-100 flex flex-row justify-between items-center">
                                <div>
                                  <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[9px] mb-2">Outfit Node 0{index + 1}</Badge>
                                  <CardTitle className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">{outfit.outfitName}</CardTitle>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300"><Briefcase className="h-6 w-6" /></div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {outfit.items.map((item, itemIndex) => {
                                        const itemImage = findImage(item.imageHint);
                                        const isSelected = selectedItems.some(selected => selected.itemName === item.itemName && selected.description === item.description);
                                        return (
                                            <div key={itemIndex} className="space-y-4 cursor-pointer group" onClick={() => handleItemToggle(item)}>
                                                <div className="aspect-square w-full bg-slate-50 rounded-[2rem] overflow-hidden relative border-4 border-transparent transition-all group-hover:border-primary/20 shadow-inner">
                                                    <Image 
                                                        src={itemImage?.imageUrl || 'https://placehold.co/400x400'}
                                                        alt={item.itemName}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        data-ai-hint={itemImage?.imageHint || 'placeholder'}
                                                    />
                                                     {isSelected && (
                                                      <div className="absolute inset-0 bg-primary/40 flex items-center justify-center backdrop-blur-[2px]">
                                                          <div className="h-14 w-14 rounded-3xl bg-white flex items-center justify-center text-primary shadow-2xl scale-110 animate-in zoom-in duration-300">
                                                            <CheckCircle2 className="h-8 w-8" />
                                                          </div>
                                                      </div>
                                                    )}
                                                     {!isSelected && (
                                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                          <p className="text-white font-black text-xs uppercase tracking-[0.2em]">Select Node</p>
                                                      </div>
                                                    )}
                                                </div>
                                                <div className="px-2">
                                                    <p className="font-black text-slate-900 text-sm truncate">{item.itemName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0 h-12 w-12 rounded-xl bg-white border-2 shadow-lg" />
              <CarouselNext className="static translate-y-0 h-12 w-12 rounded-xl bg-white border-2 shadow-lg" />
            </div>
        </Carousel>
    </div>
  )
}

function Step5Checkout({ selectedItems, language, onSuccess }: { selectedItems: RecommendedItem[]; language: string; onSuccess: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const [orderType, setOrderType] = useState<'rent' | 'purchase'>('rent');
  const [isProcessing, setIsProcessing] = useState(false);

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);

  const findImage = (hint: string): ImagePlaceholder | undefined => {
    if (!hint) return undefined;
    const hintWords = hint.toLowerCase().split(' ');
    let image = PlaceHolderImages.find(p => p.imageHint.toLowerCase() === hint.toLowerCase());
    if (image) return image;
    image = PlaceHolderImages.find(p => hintWords.some(h => p.imageHint.toLowerCase().includes(h)));
    return image;
  }

  const getPrice = (itemName: string, type: 'rent' | 'purchase') => {
    const basePrice = (itemName.length % 5 + 1) * 15;
    return type === 'rent' ? basePrice : basePrice * 4;
  }

  const orderTotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + getPrice(item.itemName, orderType), 0);
  }, [selectedItems, orderType]);

  const depositAmount = useMemo(() => {
    return orderType === 'rent' ? orderTotal * 0.5 : 0;
  }, [orderTotal, orderType]);

  const totalRequired = orderTotal + depositAmount;

  const handlePlaceOrder = async () => {
    if (!user || !firestore) return;

    const usdWallet = wallets?.find(w => w.currency === 'USD');
    if (!usdWallet || usdWallet.balance < totalRequired) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `Synthesis requires $${totalRequired.toFixed(2)} in your USD node.`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
      setDocumentNonBlocking(walletRef, {
        balance: increment(-totalRequired),
        updatedAt: serverTimestamp()
      }, { merge: true });

      addDocumentNonBlocking(collection(firestore, 'userProfiles', user.uid, 'transactions'), {
        type: 'debit',
        category: 'booking',
        amount: totalRequired,
        currency: 'USD',
        description: `Wardrobe ${orderType === 'rent' ? 'Rental' : 'Purchase'}: ${selectedItems.length} items`,
        timestamp: serverTimestamp()
      });

      const rentalsRef = collection(firestore, 'userProfiles', user.uid, 'rentals');
      const newRentalRef = doc(rentalsRef);
      setDocumentNonBlocking(newRentalRef, {
        id: newRentalRef.id,
        items: selectedItems,
        orderType,
        orderTotal,
        depositAmount,
        status: orderType === 'rent' ? 'active' : 'completed',
        isRentPaidInFull: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      try {
        await synthesizeWardrobeEmail({
          userName: user.displayName?.split(' ')[0] || 'Explorer',
          type: orderType === 'rent' ? 'rental' : 'purchase',
          itemNames: selectedItems.map(i => i.itemName),
          amount: orderTotal,
          language: language
        });
      } catch (e) {}
      
      onSuccess();
    } catch (error) {
      toast({ variant: 'destructive', title: "Order Failed", description: "Node authorization interrupted." });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="space-y-10">
        <h3 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tighter italic">Order Summary</h3>
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="divide-y divide-slate-50">
                {selectedItems.map((item, index) => {
                  const itemImage = findImage(item.imageHint);
                  return (
                    <div key={index} className="flex items-center gap-6 p-6 hover:bg-slate-50/50 transition-colors group">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                        <Image 
                            src={itemImage?.imageUrl || 'https://placehold.co/100x100'}
                            alt={item.itemName}
                            fill
                            className="object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-grow">
                          <p className="font-black text-sm text-slate-900">{item.itemName}</p>
                          <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400">{item.category}</p>
                      </div>
                      <p className="font-black text-lg text-primary">${getPrice(item.itemName, orderType)}</p>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Type</Label>
            <RadioGroup
                value={orderType}
                onValueChange={(value: any) => setOrderType(value)}
                className="grid grid-cols-2 gap-4"
            >
                <Label htmlFor="rent" className="flex flex-col gap-3 cursor-pointer rounded-3xl border-2 border-slate-100 bg-white p-6 transition-all hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value="rent" id="rent" className="sr-only" />
                    <div className="flex justify-between items-center">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><RotateCcw className="h-5 w-5" /></div>
                      {orderType === 'rent' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                        <p className="font-black text-slate-900">Rent Package</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">Pay for the duration of your odyssey.</p>
                    </div>
                </Label>
                 <Label htmlFor="purchase" className="flex flex-col gap-3 cursor-pointer rounded-3xl border-2 border-slate-100 bg-white p-6 transition-all hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value="purchase" id="purchase" className="sr-only" />
                    <div className="flex justify-between items-center">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><ShoppingCart className="h-5 w-5" /></div>
                      {orderType === 'purchase' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                        <p className="font-black text-slate-900">Purchase All</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">Permanent library addition.</p>
                    </div>
                </Label>
            </RadioGroup>
        </div>

        <div className="space-y-4 pt-8 border-t border-slate-100">
            <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                <span>Net Order Amount</span>
                <span className="text-slate-900">${orderTotal.toFixed(2)}</span>
            </div>
            {orderType === 'rent' && (
                <div className="flex justify-between items-center text-sm text-blue-600 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Security Deposit</span>
                    <span>+${depositAmount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between items-end pt-6 border-t border-slate-900/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Due</span>
                <p className="text-5xl font-black font-headline text-primary">${totalRequired.toFixed(2)} <span className="text-xs text-slate-400 font-bold uppercase">USD</span></p>
            </div>
        </div>
      </div>

      <div className="space-y-10">
          <Card className="border-none shadow-2xl bg-slate-950 text-white rounded-[3rem] overflow-hidden group">
              <CardHeader className="bg-primary p-8">
                  <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter italic">
                    <Wallet className="h-6 w-6 text-white" /> Smart Wallet Verification
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                  <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Available Node Balance</span>
                      <span className="font-headline text-3xl font-black text-accent">
                        ${wallets?.find(w => w.currency === 'USD')?.balance.toFixed(2) || '0.00'}
                      </span>
                  </div>
                  {wallets?.find(w => w.currency === 'USD') && wallets.find(w => w.currency === 'USD')!.balance < totalRequired && (
                    <Alert className="rounded-2xl border-none bg-red-500/10 p-6">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <AlertTitle className="text-xs font-black uppercase text-red-400">Insufficient Assets</AlertTitle>
                        <AlertDescription className="text-[10px] font-bold text-red-300">
                            Please top up your wallet node or exchange other currencies to authorize deployment.
                        </AlertDescription>
                    </Alert>
                  )}
              </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[3rem] bg-white">
              <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-headline font-black uppercase tracking-tighter">Logistics Protocol</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Explorer Name</Label>
                      <Input placeholder="John Doe" defaultValue={user?.displayName || ''} className="rounded-xl h-12 border-slate-200 font-bold" />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination Hub</Label>
                      <Input placeholder="The Grand London Hotel" className="rounded-xl h-12 border-slate-200 font-bold" />
                      <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Direct-to-destination delivery ensures zero-luggage freedom.</p>
                  </div>
              </CardContent>
          </Card>

           <div className="pt-4 space-y-6">
              <Button 
                className="w-full h-20 rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all bg-primary text-white" 
                onClick={handlePlaceOrder} 
                disabled={isProcessing || !wallets?.find(w => w.currency === 'USD') || (wallets && wallets.find(w => w.currency === 'USD')!.balance < totalRequired)}
              >
                {isProcessing ? <Loader2 className="animate-spin h-8 w-8" /> : <><CreditCard className="mr-3 h-8 w-8" /> Authorize & Pay</>}
              </Button>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest px-10 leading-relaxed">
                By authorizing, you agree to the temporary withholding of security funds for rental nodes. Deposits are automatically returned upon item verification at the end of your odyssey.
              </p>
          </div>
      </div>
    </div>
  )
}


"use client"

import { useEffect, useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { doc, serverTimestamp } from "firebase/firestore"
import { sendPasswordResetEmail } from "firebase/auth"
import { 
  User, 
  Map as MapIcon, 
  Globe, 
  ShieldCheck, 
  Camera, 
  Loader2, 
  Save, 
  Heart,
  Settings,
  Compass,
  Wallet,
  Sun,
  Moon,
  Laptop,
  Lock,
  Zap,
  Mail
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  useFirebase,
  useDoc,
  useMemoFirebase,
  setDocumentNonBlocking,
} from "@/firebase"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { availableLanguages, useTranslation } from "@/lib/i18n"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const interests = [
  { id: "history" },
  { id: "food" },
  { id: "hiking" },
  { id: "art" },
  { id: "nightlife" },
  { id: "shopping" },
  { id: "nature" },
  { id: "wellness" },
]

const travelStyles = [
  { value: "relaxed" },
  { value: "active" },
  { value: "adventurous" },
  { value: "packed" },
  { value: "familyFriendly" },
]

const currencies = [
  { code: "USD", name: "United States Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "INR", name: "Indian Rupee" },
  { code: "THB", name: "Thai Baht" },
]

const themeOptions = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Laptop },
]

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email({ message: "Please enter a valid email." }),
  nationality: z.string().min(1, "Nationality is required for Safety Assistant embassy matching."),
  homeBase: z.string().min(1, "Home base is required."),
  gender: z.string().optional(),
  preferredInterests: z.array(z.string()).optional(),
  preferredTravelStyle: z.string().optional(),
  preferredLanguage: z.string().optional(),
  defaultCurrency: z.string().min(1, "Please select a default currency."),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  photoURL: z.string().optional(),
})

export default function ProfilePage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isReseting, setIsReseting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user, auth, firestore, isUserLoading } = useFirebase()
  const { t, language, setLanguage } = useTranslation()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, "userProfiles", user.uid) : null),
    [user, firestore]
  )

  const { data: userProfile, isLoading } = useDoc(userProfileRef)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      nationality: "",
      homeBase: "",
      gender: "",
      preferredInterests: [],
      preferredTravelStyle: "relaxed",
      preferredLanguage: "en",
      defaultCurrency: "USD",
      theme: "system",
      photoURL: "",
    },
  })

  useEffect(() => {
    if (userProfile && !form.formState.isDirty) {
      form.reset({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || user?.email || "",
        nationality: userProfile.nationality || "",
        homeBase: userProfile.homeBase || "",
        gender: userProfile.gender || "",
        preferredInterests: userProfile.preferredInterests || [],
        preferredTravelStyle: userProfile.preferredTravelStyle || "relaxed",
        preferredLanguage: userProfile.preferredLanguage || "en",
        defaultCurrency: userProfile.defaultCurrency || "USD",
        theme: userProfile.theme || "system",
        photoURL: userProfile.photoURL || user?.photoURL || "",
      })
    }
  }, [userProfile, user, form])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue("photoURL", reader.result as string, { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResetPassword = async () => {
    if (!auth || !user?.email) return;
    setIsReseting(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Reset Node Dispatched",
        description: "Check your network inbox for the password reset link.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Node Interruption",
        description: "Failed to dispatch reset link. Please verify your connection.",
      });
    } finally {
      setIsReseting(false);
    }
  };

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!userProfileRef || !firestore) return
    setIsSaving(true)

    try {
      setDocumentNonBlocking(userProfileRef, {
        ...values,
        updatedAt: serverTimestamp()
      }, { merge: true })

      if (values.preferredLanguage) {
        setLanguage(values.preferredLanguage as any)
      }

      toast({
        title: t("profile.saveSuccessTitle"),
        description: t("profile.saveSuccessDescription"),
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to synchronize profile node.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!hasMounted || isUserLoading || isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8 max-w-5xl">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 md:col-span-2 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  const displayName = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 -mt-28 lg:-mt-32">
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-40 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 dark:from-slate-950 to-transparent" />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
          <div className="relative group">
            <Avatar className="w-40 h-40 border-8 border-white dark:border-slate-900 shadow-2xl">
              <AvatarImage src={form.watch("photoURL") || user.photoURL || ""} />
              <AvatarFallback className="bg-slate-900 text-white text-4xl font-black">
                {user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button 
              type="button"
              size="icon" 
              variant="secondary" 
              className="absolute bottom-2 right-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>
          <div className="text-center md:text-left flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-4xl font-black font-headline text-slate-900 dark:text-white tracking-tight uppercase italic">
                {displayName}
              </h1>
              <Badge className="bg-accent text-accent-foreground font-black uppercase tracking-widest text-[10px] py-1 px-3">
                {userProfile?.role || "Explorer"}
              </Badge>
              {userProfile?.role === "admin" && (
                <Badge variant="outline" className="border-primary text-primary font-black uppercase tracking-widest text-[10px] py-1 px-3">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
              <Globe className="h-4 w-4" /> {user.email}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="personal" className="w-full">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <TabsList className="flex flex-col h-auto bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-xl border-none w-full md:w-64">
                  <TabsTrigger value="personal" className="w-full justify-start gap-3 px-4 py-3 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-tighter text-[10px]">
                    <User className="h-4 w-4" /> {t("profile.tabs.identity")}
                  </TabsTrigger>
                  <TabsTrigger value="travel" className="w-full justify-start gap-3 px-4 py-3 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-tighter text-[10px]">
                    <MapIcon className="h-4 w-4" /> {t("profile.tabs.travelDna")}
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="w-full justify-start gap-3 px-4 py-3 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-tighter text-[10px]">
                    <Settings className="h-4 w-4" /> {t("profile.tabs.settings")}
                  </TabsTrigger>
                  <TabsTrigger value="security" className="w-full justify-start gap-3 px-4 py-3 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-tighter text-[10px]">
                    <Lock className="h-4 w-4" /> Security Node
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 w-full space-y-8">
                  <TabsContent value="personal" className="m-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                      <CardHeader className="bg-slate-900 text-white p-8">
                        <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic flex items-center gap-3">
                          <User className="h-6 w-6 text-primary" />
                          Identity Synthesis
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-medium">
                          Update your core traveler nodes.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("profile.personalInfo.firstName")}</FormLabel>
                                <FormControl>
                                  <Input placeholder="john" {...field} className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("profile.personalInfo.lastName")}</FormLabel>
                                <FormControl>
                                  <Input placeholder="jose" {...field} className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="nationality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Citizenship Node</FormLabel>
                                <FormControl>
                                  <Input placeholder="Country" {...field} className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
                                </FormControl>
                                <FormDescription className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Required for cross-border logic.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="homeBase"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Home Base Node</FormLabel>
                                <FormControl>
                                  <Input placeholder="City, Country" {...field} className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Network Address</FormLabel>
                              <FormControl>
                                <Input placeholder="explorer@aetheria.ai" {...field} disabled className="rounded-xl border-slate-100 bg-slate-100 dark:bg-slate-800 h-12 opacity-60" />
                              </FormControl>
                              <FormDescription className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Used for dispatching odyssey kits.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("profile.personalInfo.gender")}</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex flex-wrap gap-4"
                                >
                                  {["male", "female", "other", "prefer-not-to-say"].map((g) => (
                                    <FormItem key={g} className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={g} className="border-slate-300" />
                                      </FormControl>
                                      <FormLabel className="font-bold text-xs text-slate-600 dark:text-slate-400 capitalize cursor-pointer">
                                        {t(`profile.personalInfo.genders.${g === "prefer-not-to-say" ? "preferNotToSay" : g}` as any)}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="travel" className="m-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <div className="space-y-8">
                      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-primary text-white p-8">
                          <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic flex items-center gap-3">
                            <Compass className="h-6 w-6 text-white" />
                            Synthesize your movement profile
                          </CardTitle>
                          <CardDescription className="text-white/70 font-medium">
                            Set your behavioral travel nodes.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                          <FormField
                            control={form.control}
                            name="preferredTravelStyle"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                  >
                                    {travelStyles.map((style) => (
                                      <FormItem
                                        key={style.value}
                                        className={cn(
                                          "relative flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
                                          field.value === style.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-100 dark:border-slate-800"
                                        )}
                                      >
                                        <FormControl>
                                          <RadioGroupItem value={style.value} className="sr-only" />
                                        </FormControl>
                                        <div className="space-y-1">
                                          <FormLabel className="font-black text-sm text-slate-900 dark:text-slate-100 cursor-pointer uppercase tracking-tighter italic">{t(`profile.travelStyle.${style.value}.label`)}</FormLabel>
                                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{t(`profile.travelStyle.${style.value}.description`)}</p>
                                        </div>
                                        {field.value === style.value && <Badge className="absolute top-4 right-4 bg-primary text-white text-[8px] uppercase font-black">Active</Badge>}
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-xl rounded-[2.5rem]">
                        <CardHeader className="p-8 pb-4">
                          <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic flex items-center gap-3">
                            <Heart className="h-6 w-6 text-primary" />
                            Interest Nodes
                          </CardTitle>
                          <CardDescription className="font-medium text-slate-500">
                            Select thematic clusters for AI synthesis.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                          <FormField
                            control={form.control}
                            name="preferredInterests"
                            render={() => (
                              <FormItem>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {interests.map((interest) => (
                                    <FormField
                                      key={interest.id}
                                      control={form.control}
                                      name="preferredInterests"
                                      render={({ field }) => {
                                        const isChecked = field.value?.includes(interest.id);
                                        return (
                                          <FormItem
                                            key={interest.id}
                                            className={cn(
                                              "flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800",
                                              isChecked ? "border-primary/50 bg-primary/5" : "border-slate-100 dark:border-slate-800"
                                            )}
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                  const current = field.value || []
                                                  const updated = checked
                                                    ? [...current, interest.id]
                                                    : current.filter((value) => value !== interest.id)
                                                  field.onChange(updated)
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 cursor-pointer tracking-widest">
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
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="m-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <div className="space-y-8">
                      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-8">
                          <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic flex items-center gap-3">
                            <Settings className="h-6 w-6 text-primary" />
                            System Parameters
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                          <FormField
                            control={form.control}
                            name="preferredLanguage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Linguistic Node</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-12 font-bold">
                                      <SelectValue placeholder="English" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-2xl shadow-2xl border-none">
                                    {availableLanguages.map((lang) => (
                                      <SelectItem key={lang.code} value={lang.code} className="rounded-xl font-bold">
                                        {lang.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                                  Preferred language for AI synthesis.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visual Theme</FormLabel>
                            <FormField
                              control={form.control}
                              name="theme"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      value={field.value}
                                      className="grid grid-cols-3 gap-4"
                                    >
                                      {themeOptions.map((opt) => (
                                        <FormItem key={opt.value}>
                                          <FormControl>
                                            <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                                          </FormControl>
                                          <Label
                                            htmlFor={opt.value}
                                            className={cn(
                                              "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
                                              field.value === opt.value ? "border-primary bg-primary/5 text-primary" : "border-slate-100 dark:border-slate-800 text-slate-400"
                                            )}
                                          >
                                            <opt.icon className="h-6 w-6" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{opt.value}</span>
                                          </Label>
                                        </FormItem>
                                      ))}
                                    </RadioGroup>
                                  </FormControl>
                                  <FormDescription className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">System-wide aesthetic mode.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-emerald-50 dark:bg-emerald-950/30 p-8">
                          <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic flex items-center gap-3 text-emerald-900 dark:text-emerald-100">
                            <Wallet className="h-6 w-6 text-emerald-600" />
                            Financial DNA
                          </CardTitle>
                          <CardDescription className="text-emerald-700/70 dark:text-emerald-400/70 font-medium">
                            Set your default settlement currency.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                          <FormField
                            control={form.control}
                            name="defaultCurrency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Currency</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-12 font-bold">
                                      <SelectValue placeholder="USD" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-2xl shadow-2xl border-none">
                                    {currencies.map((curr) => (
                                      <SelectItem key={curr.code} value={curr.code} className="rounded-xl font-bold">
                                        {curr.code} - {curr.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                                  Used for standard price synthesis.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="m-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                      <CardHeader className="bg-slate-900 text-white p-8">
                        <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic flex items-center gap-3">
                          <Lock className="h-6 w-6 text-primary" />
                          Security Node
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-medium">
                          Manage your access keys and identity verification.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 space-y-10">
                        <div className="flex flex-col md:flex-row items-center justify-between p-8 rounded-[2rem] bg-slate-50 border border-slate-100 gap-8 transition-all hover:shadow-md">
                          <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                              <Mail className="h-8 w-8" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-xl uppercase tracking-tighter italic">Network Key Reset</h4>
                              <p className="text-sm font-medium text-slate-500 max-sm mt-1">Initialize a secure password reset link dispatched to your network address.</p>
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            onClick={handleResetPassword} 
                            disabled={isReseting}
                            className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-transform active:scale-95 whitespace-nowrap"
                          >
                            {isReseting ? <Loader2 className="animate-spin h-6 w-6" /> : <><Zap className="mr-2 h-5 w-5" /> Initialize Reset</>}
                          </Button>
                        </div>

                        <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                          <ShieldCheck className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
                            <strong>Guardian Grid Alert:</strong> Aetheria uses high-fidelity identity nodes. Password reset links are valid for 60 minutes. If you encounter a logic lock, contact the support hub immediately.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </div>
            </Tabs>

            <div className="flex justify-center md:justify-end">
              <Button type="submit" size="lg" className="rounded-2xl px-12 h-16 font-black text-xl shadow-2xl shadow-primary/30 transition-transform active:scale-95 uppercase italic tracking-tighter" disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> {t("common.loading")}</>
                ) : (
                  <><Save className="mr-3 h-6 w-6" /> Authorize Changes</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, serverTimestamp } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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
import { useToast } from "@/hooks/use-toast"
import { useFirebase, setDocumentNonBlocking, useOAuthSignIn } from "@/firebase"
import { FirebaseError } from "firebase/app"
import { useTranslation, availableLanguages } from "@/lib/i18n"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, EyeOff } from "lucide-react"

// Using relative import to ensure resolution in static export environment
import { synthesizeWelcomeEmail } from "../../../ai/flows/welcome-email-flow"

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email({ message: "Please enter a valid network address." }),
  password: z
    .string()
    .min(6, { message: "Security key must be at least 6 characters." }),
})

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { auth, firestore } = useFirebase()
  const { t, language } = useTranslation()
  const { handleOAuthSignIn, isOAuthLoading } = useOAuthSignIn()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || "English";

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  })

  async function handleEmailSubmit(values: z.infer<typeof signupSchema>) {
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "System Node Offline",
        description: "Authentication nodes are not yet initialized.",
      })
      return
    }

    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      )
      const user = userCredential.user

      const userProfileRef = doc(firestore, "userProfiles", user.uid)
      const newUserProfile = {
        id: user.uid,
        email: user.email,
        firstName: values.firstName,
        lastName: values.lastName,
        gender: "",
        dateJoined: serverTimestamp(),
        interests: [],
        travelStyle: "relaxed",
        role: "user",
        theme: "system",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      setDocumentNonBlocking(userProfileRef, newUserProfile, { merge: true })

      try {
        await synthesizeWelcomeEmail({
          firstName: values.firstName,
          language: currentLang
        });
        toast({
          title: "Welcome Kit Sent!",
          description: "Check your inbox for a personalized welcome from Aetheria AI.",
        })
      } catch (emailErr) {
        console.warn("Welcome email synthesis failed, continuing signup.", emailErr);
      }

      toast({
        title: t("signup.toast.successTitle"),
        description: t("signup.toast.successDescription"),
      })
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      let description = t("signup.toast.genericError")
      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          description = t("signup.toast.emailInUse")
        } else if (error.code === "auth/operation-not-allowed") {
          description = t("signup.toast.operationNotAllowed")
        }
      }
      toast({
        variant: "destructive",
        title: t("signup.toast.errorTitle"),
        description,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const anyLoading = isLoading || isOAuthLoading

  if (!hasMounted) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-12">
        <Skeleton className="w-full max-w-md h-[600px] rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="text-center bg-slate-900 text-white p-10">
          <CardTitle className="font-headline text-3xl font-black uppercase tracking-tighter">
            {t("signup.title")}
          </CardTitle>
          <CardDescription className="text-slate-400">{t("signup.description")}</CardDescription>
        </CardHeader>
        <CardContent className="p-10">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEmailSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="john" {...field} className="rounded-xl" />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="jose" {...field} className="rounded-xl" />
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
                    <FormLabel>{t("signup.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("signup.emailPlaceholder")}
                        {...field}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("signup.passwordLabel")}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder={t("login.passwordPlaceholder")} 
                          {...field} 
                          className="rounded-xl h-12 pr-12" 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg" disabled={anyLoading}>
                {isLoading
                  ? t("signup.creatingButton")
                  : t("signup.createButton")}
              </Button>
            </form>
          </Form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground font-black tracking-widest">
                Network Join
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn("google")}
              disabled={anyLoading}
              className="rounded-xl h-12 font-bold border-2"
            >
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn("apple")}
              disabled={anyLoading}
              className="rounded-xl h-12 font-bold border-2"
            >
              Apple
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
            {t("signup.haveAccount")}{" "}
            <Link
              href="/login"
              className="font-black text-primary hover:underline"
            >
              {t("signup.signInLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
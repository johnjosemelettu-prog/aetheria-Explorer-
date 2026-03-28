"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signInWithEmailAndPassword } from "firebase/auth"
import { NativeBiometric } from "capacitor-native-biometric";
import { Capacitor } from '@capacitor/core';

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
import { useFirebase, useOAuthSignIn } from "@/firebase"
import { FirebaseError } from "firebase/app"
import { useTranslation } from "@/lib/i18n"
import { ShieldAlert, Eye, EyeOff, Fingerprint } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const router = useRouter()
  const { toast } = useToast()
  const { auth } = useFirebase()
  const { t } = useTranslation()
  const { handleOAuthSignIn, isOAuthLoading } = useOAuthSignIn()

  const loginSchema = z.object({
    email: z.string().email({ message: t("login.validation.email") }),
    password: z
      .string()
      .min(6, { message: t("login.validation.passwordMinLength") }),
  })

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    setHasMounted(true)
    checkBiometricAvailability();
  }, [])

  async function checkBiometricAvailability() {
    if (Capacitor.isNativePlatform()) {
      const { isAvailable } = await NativeBiometric.isAvailable();
      setIsBiometricAvailable(isAvailable);
    }
  }

  async function handleBiometricLogin() {
    if (!auth) {
      toast({
        variant: "destructive",
        title: t("login.toast.systemNodeOfflineTitle"),
        description: t("login.toast.systemNodeOfflineDescription"),
      })
      return
    }

    if (!Capacitor.isNativePlatform()) {
      toast({
        variant: "destructive",
        title: t("login.toast.unsupportedFeatureTitle"),
        description: t("login.toast.unsupportedFeatureDescription"),
      });
      return;
    }

    try {
      const result = await NativeBiometric.getCredentials({
        server: "aetheria.travel",
      });

      if (result.username && result.password) {
        setIsLoading(true);
        await signInWithEmailAndPassword(auth, result.username, result.password);
        toast({
          title: t("login.toast.successTitle"),
          description: t("login.toast.successDescription"),
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: t("login.toast.biometricLoginFailedTitle"),
        description: t("login.toast.biometricLoginFailedDescription"),
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailSubmit(values: z.infer<typeof loginSchema>) {
    if (!auth) {
      toast({
        variant: "destructive",
        title: t("login.toast.systemNodeOfflineTitle"),
        description: t("login.toast.systemNodeOfflineDescription"),
      })
      return
    }

    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password)
      if (Capacitor.isNativePlatform()) {
        await NativeBiometric.setCredentials({
          username: values.email,
          password: values.password,
          server: "aetheria.travel",
        });
      }
      toast({
        title: t("login.toast.successTitle"),
        description: t("login.toast.successDescription"),
      })
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      let description = t("login.toast.genericError")
      if (error instanceof FirebaseError) {
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/invalid-credential"
        ) {
          description = t("login.toast.invalidCredentials")
        }
      }
      toast({
        variant: "destructive",
        title: t("login.toast.errorTitle"),
        description,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const anyLoading = isLoading || isOAuthLoading

  if (!hasMounted) return null

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="text-center bg-slate-950 text-white p-10">
          <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-normal">
            <ShieldAlert className="text-white h-6 w-6" />
          </div>
          <CardTitle className="font-headline text-3xl font-black uppercase tracking-tighter italic">
            {t("login.title")}
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium">{t("login.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="p-10">
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(handleEmailSubmit)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("login.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("login.emailPlaceholder")}
                        {...field}
                        className="rounded-xl h-12 border-slate-100 bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("login.passwordLabel")}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder={t("login.passwordPlaceholder")} 
                          {...field} 
                          className="rounded-xl h-12 border-slate-100 bg-slate-50 pr-12" 
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
              <Button type="submit" className="w-full h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20" disabled={anyLoading}>
                {isLoading
                  ? t("login.signingInButton")
                  : t("login.signInButton")}
              </Button>
            </form>
          </Form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-300 font-black tracking-widest">
                {t("login.authChannels")}
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
              {t("login.googleButton")}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn("apple")}
              disabled={anyLoading}
              className="rounded-xl h-12 font-bold border-2"
            >
              {t("login.appleButton")}
            </Button>
          </div>
          {isBiometricAvailable && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleBiometricLogin}
                disabled={anyLoading}
                className="w-full rounded-xl h-12 font-bold border-2 flex items-center justify-center gap-2"
              >
                <Fingerprint className="h-5 w-5" />
                <span>{t("login.biometricLoginButton")}</span>
              </Button>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            {t("login.noAccount")}{" "}
            <Link
              href="/signup"
              className="font-black text-primary hover:underline"
            >
              {t("login.signUpLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

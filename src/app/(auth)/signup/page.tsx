
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, serverTimestamp } from 'firebase/firestore'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
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
import { useToast } from '@/hooks/use-toast'
import { useFirebase, setDocumentNonBlocking, useOAuthSignIn } from '@/firebase'
import { FirebaseError } from 'firebase/app'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { synthesizeWelcomeEmail } from '@/ai/flows/welcome-email-flow'
import { Skeleton } from '@/components/ui/skeleton'

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email({ message: 'Please enter a valid network address.' }),
  password: z
    .string()
    .min(6, { message: 'Security key must be at least 6 characters.' }),
})

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.34 2.25-4.57 0-8.28-3.71-8.28-8.28s3.71-8.28 8.28-8.28c2.62 0 4.22 1.17 5.22 2.12l2.62-2.62C17.44 1.89 15.14 1 12.24 1 5.46 1 0 6.46 0 13.24s5.46 12.24 12.24 12.24c3.42 0 6.13-1.17 8.19-3.22 2.16-2.16 2.85-5.22 2.85-7.79 0-.58-.05-1.16-.14-1.72h-11.1z"
      fill="currentColor"
    />
  </svg>
)

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M19.35 15.49c-.53 1.6-1.54 3.03-2.93 4.14C14.93 20.8 13.43 21.5 12 21.5c-.32 0-1.22-.16-2.14-.5-1.27-.47-2.45-1.2-3.53-2.14-1.29-1.14-2.25-2.6-2.88-4.32-.08-.22-.12-.45-.12-.73 0-.16.02-.32.05-.48.2-.01.41-.01.62-.01.72 0 1.45.11 2.2.33.8.22 1.54.51 2.22.86.67.35 1.25.59 1.74.72.1-.06.27-.15.52-.29.25-.14.49-.29.74-.46.06-.03.41-.23.96-.51.55-.28 1.05-.53 1.49-.75.03-.31.05-.62.05-.93 0-.55-.09-1.09-.27-1.61-.18-.52-.44-1.01-.78-1.46-.34-.45-.76-.84-1.25-1.16-.49-.32-.98-.53-1.47-.63-.49-.1-1.04-.12-1.65-.05-.61.07-1.18.26-1.72.55-.54.29-1.02.68-1.44 1.16-.42.48-.77.99-1.04 1.53-.27.54-.48 1.08-.62 1.63-.14.55-.21 1.1-.21 1.65 0 .28.01.55.04.81-.03.04-.05.08-.06.12-.22.61-.33 1.25-.33 1.91 0 1.35.43 2.58 1.3 3.69.87 1.11 2.02 1.95 3.47 2.54.59.24 1.15.36 1.68.36.14 0 .28 0 .42-.02.83-.09 1.68-.42 2.55-1s1.58-1.43 2.12-2.54c.54-1.11.81-2.22.81-3.34 0-.13-.01-.26-.04-.39-.18-.04-.38-.07-.58-.1-.19-.03-.36-.05-.52-.05-.68 0-1.31.15-1.89.46-.58.31-1.1.7-1.56 1.18-.46.48-.85.99-1.17 1.53-.32.54-.56 1.08-.72 1.62h-2.11c.18-.69.49-1.32.93-1.88.44-.56.97-1.03 1.6-1.42s1.33-.67 2.1-.84c.77-.17 1.54-.26 2.3-.26.15 0 .29.01.42.02.13.01.26.03.38.05.28-1.2.14-2.45-.4-3.75zm-4.32-10.15c.62-.75 1.05-1.61 1.29-2.58-.33.02-.64.08-.94.17-.3.09-.62.24-.95.45-.33.21-.63.46-.89.76-.26.3-.46.6-.59.88-.13.28-.2.53-.2.75 0 .15.02.29.05.42.36-.18.72-.32 1.09-.43.37-.11.72-.16 1.05-.16.1 0 .19.01.28.03z"
      fill="black"
    />
  </svg>
)

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { auth, firestore } = useFirebase()
  const { t, language } = useTranslation()
  const { handleOAuthSignIn, isOAuthLoading } = useOAuthSignIn()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  async function handleEmailSubmit(values: z.infer<typeof signupSchema>) {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'System Node Offline',
        description: 'Authentication nodes are not yet initialized.',
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

      const userProfileRef = doc(firestore, 'userProfiles', user.uid)
      const newUserProfile = {
        id: user.uid,
        email: user.email,
        firstName: values.firstName,
        lastName: values.lastName,
        gender: '',
        dateJoined: serverTimestamp(),
        interests: [],
        travelStyle: 'relaxed',
        role: 'user',
        theme: 'system',
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
        title: t('signup.toast.successTitle'),
        description: t('signup.toast.successDescription'),
      })
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      let description = t('signup.toast.genericError')
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          description = t('signup.toast.emailInUse')
        } else if (error.code === 'auth/operation-not-allowed') {
          description = t('signup.toast.operationNotAllowed')
        }
      }
      toast({
        variant: 'destructive',
        title: t('signup.toast.errorTitle'),
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
            {t('signup.title')}
          </CardTitle>
          <CardDescription className="text-slate-400">{t('signup.description')}</CardDescription>
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
                    <FormLabel>{t('signup.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('signup.emailPlaceholder')}
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
                    <FormLabel>{t('signup.passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('login.passwordPlaceholder')} {...field} className="rounded-xl h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg" disabled={anyLoading}>
                {isLoading
                  ? t('signup.creatingButton')
                  : t('signup.createButton')}
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
              onClick={() => handleOAuthSignIn('google')}
              disabled={anyLoading}
              className="rounded-xl h-12 font-bold border-2"
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('apple')}
              disabled={anyLoading}
              className="rounded-xl h-12 font-bold border-2"
            >
              <AppleIcon className="mr-2 h-4 w-4" />
              Apple
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
            {t('signup.haveAccount')}{' '}
            <Link
              href="/login"
              className="font-black text-primary hover:underline"
            >
              {t('signup.signInLink')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

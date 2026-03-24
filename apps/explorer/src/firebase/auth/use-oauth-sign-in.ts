'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  getAdditionalUserInfo,
} from 'firebase/auth'
import { doc, serverTimestamp } from 'firebase/firestore'
import { useFirebase } from '../provider'
import { setDocumentNonBlocking } from '../non-blocking-updates'
import { useToast } from '@/hooks/use-toast'
import { FirebaseError } from 'firebase/app'
import { useTranslation } from '@/lib/i18n'

export function useOAuthSignIn() {
  const [isOAuthLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { auth, firestore } = useFirebase()
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleOAuthSignIn = async (providerName: 'google' | 'apple') => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'System Node Offline',
        description: 'Authentication services are initializing.',
      })
      return
    }

    setIsLoading(true)
    const provider =
      providerName === 'google'
        ? new GoogleAuthProvider()
        : new OAuthProvider('apple.com')

    try {
      const result = await signInWithPopup(auth!, provider)
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser

      if (isNewUser) {
        const user = result.user
        const userProfileRef = doc(firestore!, 'userProfiles', user.uid)

        const displayNameParts = user.displayName?.split(' ') || []
        const firstName = displayNameParts[0] || ''
        const lastName = displayNameParts.slice(1).join(' ') || ''

        const newUserProfile = {
          id: user.uid,
          email: user.email,
          firstName,
          lastName,
          displayName: user.displayName,
          gender: '',
          dateJoined: serverTimestamp(),
          interests: [],
          travelStyle: 'relaxed',
          role: 'user',
          theme: 'system',
        }
        setDocumentNonBlocking(userProfileRef, newUserProfile, { merge: true })
      }

      toast({
        title: t('login.toast.successTitle'),
        description: t('login.toast.successDescription'),
      })
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      let description = t('login.toast.genericError')
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/account-exists-with-different-credential') {
          description =
            'An account already exists with the same email. Please sign in using the original method.'
        } else if (error.code === 'auth/operation-not-allowed') {
          description = t('login.toast.operationNotAllowed')
        }
      }
      toast({
        variant: 'destructive',
        title: t('login.toast.errorTitle'),
        description,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { handleOAuthSignIn, isOAuthLoading }
}

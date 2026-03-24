'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import dynamic from 'next/dynamic'

import en from '@/locales/en.json'
import es from '@/locales/es.json'
import de from '@/locales/de.json'
import it from '@/locales/it.json'
import hi from '@/locales/hi.json'
import ar from '@/locales/ar.json'
import ms from '@/locales/ms.json'
import ta from '@/locales/ta.json'
import ml from '@/locales/ml.json'
import fr from '@/locales/fr.json'
import zh from '@/locales/zh.json'
import pt from '@/locales/pt.json'
import ru from '@/locales/ru.json'
import tl from '@/locales/tl.json'
import th from '@/locales/th.json'
import { useUser, useFirestore } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

/**
 * SplashScreen relies on immediate client-side timing and animation logic.
 * Bypassing SSR prevents flicker and hydration errors during the initial render.
 */
const SplashScreen = dynamic(() => import('@/components/layout/SplashScreen').then(m => m.SplashScreen), { ssr: false });

// A simple deep-getter for nested JSON objects.
const getTranslationValue = (
  translations: Record<string, any>,
  key: string
): string | undefined => {
  if (!key) return undefined;
  const value = key
    .split('.')
    .reduce((obj, k) => obj && obj[k], translations);
  
  // Ensure we return a string and not an object if the key path is incomplete
  return typeof value === 'string' ? value : undefined;
}

const translations: Record<string, any> = {
  en,
  es,
  de,
  it,
  hi,
  ar,
  ms,
  ta,
  ml,
  fr,
  zh,
  pt,
  ru,
  tl,
  th,
}

export type Language = keyof typeof translations

// Fixed list to avoid hydration mismatches from in-place sorting or localeCompare discrepancies
export const availableLanguages: { code: Language; name: string; englishName: string }[] = [
  { code: 'en', name: 'English', englishName: 'English' },
  { code: 'ar', name: 'العربية', englishName: 'Arabic' },
  { code: 'zh', name: '简体中文', englishName: 'Mandarin Chinese' },
  { code: 'fr', name: 'Français', englishName: 'French' },
  { code: 'de', name: 'Deutsch', englishName: 'German' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi' },
  { code: 'it', name: 'Italiano', englishName: 'Italian' },
  { code: 'ms', name: 'Bahasa Melayu', englishName: 'Malay' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese' },
  { code: 'ru', name: 'Русский', englishName: 'Russian' },
  { code: 'es', name: 'Español', englishName: 'Spanish' },
  { code: 'tl', name: 'Tagalog', englishName: 'Tagalog' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
  { code: 'th', name: 'ไทย', englishName: 'Thai' },
];

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, replacements?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en')
  const { user } = useUser()
  const firestore = useFirestore()

  // Set language from user profile or browser settings
  useEffect(() => {
    const fetchUserLanguage = async () => {
      if (user && firestore) {
        const userProfileRef = doc(firestore, 'userProfiles', user.uid)
        try {
          const docSnap = await getDoc(userProfileRef)
          if (docSnap.exists()) {
            const userLang = docSnap.data()?.preferredLanguage as Language
            if (userLang && translations[userLang]) {
              setLanguageState(userLang)
              return
            }
          }
        } catch (error) {
          console.error('Error fetching user language preference:', error)
        }
      }

      // Fallback to browser language if no user or no preference
      if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.split('-')[0] as Language;
        if (translations[browserLang]) {
          setLanguageState(browserLang);
        }
      }
    }

    fetchUserLanguage()
  }, [user, firestore])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (user && firestore) {
      const userProfileRef = doc(firestore, 'userProfiles', user.uid)
      setDoc(userProfileRef, { preferredLanguage: lang }, { merge: true })
    }
  }

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>): string => {
      // Always look up in current language first, then fallback to English
      let translation = getTranslationValue(translations[language], key);

      if (translation === undefined && language !== 'en') {
        translation = getTranslationValue(translations.en, key);
      }

      // If still not found, return the key itself
      if (translation === undefined) {
        return key;
      }

      if (replacements) {
        Object.entries(replacements).forEach(([pKey, value]) => {
          translation = (translation as string).replace(
            new RegExp(`\\{${pKey}\\}`, 'g'),
            String(value)
          )
        })
      }

      return translation as string;
    },
    [language]
  )

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      <SplashScreen />
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}

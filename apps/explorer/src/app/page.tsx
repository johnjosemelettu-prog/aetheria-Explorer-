"use client"

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { useUser } from '@/firebase'

export default function Home() {
  const { t } = useTranslation()
  const { user } = useUser()

  return (
    <div className="flex flex-col bg-slate-950 text-white selection:bg-primary selection:text-white overflow-x-hidden relative min-h-screen justify-center">
      <div className="noise" />

      <main className="flex-1 flex items-center">
        <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="mb-2 font-headline text-[clamp(3rem,15vw,10rem)] font-black tracking-tighter text-white leading-[0.75] uppercase italic mix-blend-difference">
            AETHERIA<span className="text-primary">.</span>
          </h1>

          <p className="max-w-3xl text-lg sm:text-2xl text-slate-300 mb-8 font-black tracking-tight leading-none uppercase italic">
            {t('home.hero.description1')} <br className="hidden sm:block" />
            <span className="text-white">{t('home.hero.description2')}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto relative z-30">
            {user ? (
                <Button asChild size="lg" className="h-16 sm:h-24 px-8 sm:px-16 rounded-full bg-white text-black hover:bg-slate-200 shadow-2xl font-black text-lg sm:text-2xl group active:scale-95 transition-all w-full sm:w-auto uppercase italic">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    {t('home.hero.enterGrid')} <ArrowUpRight className="h-6 w-6 sm:h-8 sm:w-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                  </Link>
                </Button>
            ) : (
                <>
                  <Button asChild size="lg" className="h-16 sm:h-24 px-8 sm:px-16 rounded-full bg-primary text-white hover:bg-primary/90 shadow-2xl animate-glow-pulse font-black text-lg sm:text-2xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto uppercase italic">
                    <Link href="/signup">{t('home.hero.signUp')}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-16 sm:h-24 px-8 sm:px-16 rounded-full border-white/60 bg-white/20 hover:bg-white/30 text-white font-black text-lg sm:text-2xl backdrop-blur-3xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto uppercase italic shadow-lg">
                    <Link href="/login">{t('home.hero.login')}</Link>
                  </Button>
                </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
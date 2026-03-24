
'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plane, BedDouble, Ship, Car, UtensilsCrossed, Wallet, Sparkles, Train, Bus, ShieldAlert } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection } from 'firebase/firestore'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

// Import consolidated views
import FlightBookingView from '@/components/booking/FlightBookingView'
import HotelBookingView from '@/components/booking/HotelBookingView'
import CruiseBookingView from '@/components/booking/CruiseBookingView'
import CabBookingView from '@/components/booking/CabBookingView'
import DiningBookingView from '@/components/booking/DiningBookingView'
import TrainBookingView from '@/components/booking/TrainBookingView'
import BusBookingView from '@/components/booking/BusBookingView'
import InsuranceBookingView from '@/components/booking/InsuranceBookingView'

export default function UnifiedBookingPage() {
  const { t } = useTranslation()
  const { user } = useUser()
  const firestore = useFirestore()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const walletsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'wallets');
    },
    [user, firestore]
  )
  const { data: wallets, isLoading: isWalletsLoading } = useCollection(walletsQuery)
  const usdWallet = wallets?.find(w => w.currency === 'USD')

  if (!hasMounted) return <Skeleton className="h-screen w-full" />

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px] mb-4">
            RESERVATION HUB
          </Badge>
          <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
            Booking Hub
          </h1>
          <p className="mt-4 text-xl text-slate-500 font-medium max-w-xl">
            Secure high-fidelity logistics for your next odyssey.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available USD</p>
            <p className="text-2xl font-black text-slate-900 font-headline">
              ${usdWallet?.balance.toFixed(2) || '0.00'} <span className="text-xs text-slate-400">USD</span>
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="hotels" className="space-y-10">
        <TabsList className="bg-slate-100 p-1.5 rounded-[2rem] h-20 w-full shadow-inner overflow-x-auto overflow-y-hidden flex flex-nowrap md:w-fit">
          <TabsTrigger value="hotels" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all whitespace-nowrap">
            <BedDouble className="mr-2 h-4 w-4" /> {t('header.hotels')}
          </TabsTrigger>
          <TabsTrigger value="flights" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all whitespace-nowrap">
            <Plane className="mr-2 h-4 w-4" /> {t('header.flights')}
          </TabsTrigger>
          <TabsTrigger value="insurance" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all whitespace-nowrap">
            <ShieldAlert className="mr-2 h-4 w-4" /> {t('header.insurance')}
          </TabsTrigger>
          <TabsTrigger value="trains" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all whitespace-nowrap">
            <Train className="mr-2 h-4 w-4" /> {t('header.trains')}
          </TabsTrigger>
          <TabsTrigger value="buses" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all whitespace-nowrap">
            <Bus className="mr-2 h-4 w-4" /> {t('header.buses')}
          </TabsTrigger>
          <TabsTrigger value="cruises" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all whitespace-nowrap">
            <Ship className="mr-2 h-4 w-4" /> {t('header.cruises')}
          </TabsTrigger>
          <TabsTrigger value="cabs" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all whitespace-nowrap">
            <Car className="mr-2 h-4 w-4" /> {t('header.cabs')}
          </TabsTrigger>
          <TabsTrigger value="dining" className="rounded-2xl px-8 h-full font-black text-sm uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:text-primary transition-all whitespace-nowrap">
            <UtensilsCrossed className="mr-2 h-4 w-4" /> {t('header.dining')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotels" className="animate-in fade-in duration-500">
          <HotelBookingView usdWallet={usdWallet} />
        </TabsContent>
        <TabsContent value="flights" className="animate-in fade-in duration-500">
          <FlightBookingView usdWallet={usdWallet} />
        </TabsContent>
        <TabsContent value="insurance" className="animate-in fade-in duration-500">
          <InsuranceBookingView usdWallet={usdWallet} />
        </TabsContent>
        <TabsContent value="trains" className="animate-in fade-in duration-500">
          <TrainBookingView usdWallet={usdWallet} />
        </TabsContent>
        <TabsContent value="buses" className="animate-in fade-in duration-500">
          <BusBookingView usdWallet={usdWallet} />
        </TabsContent>
        <TabsContent value="cruises" className="animate-in fade-in duration-500">
          <CruiseBookingView usdWallet={usdWallet} />
        </TabsContent>
        <TabsContent value="cabs" className="animate-in fade-in duration-500">
          <CabBookingView usdWallet={usdWallet} />
        </TabsContent>
        <TabsContent value="dining" className="animate-in fade-in duration-500">
          <DiningBookingView />
        </TabsContent>
      </Tabs>

      <footer className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-50">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <Sparkles className="h-4 w-4" />
          <span>Reward protocol enabled for all verified bookings.</span>
        </div>
      </footer>
    </div>
  )
}

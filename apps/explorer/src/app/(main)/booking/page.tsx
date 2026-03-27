
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
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <header className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 animate-in fade-in duration-700">
        <div className="space-y-3 md:space-y-4">
          <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[9px] md:text-[10px]">RESERVATION HUB</Badge>
          <h1 className="font-headline text-4xl sm:text-5xl font-black tracking-tighter md:text-8xl text-slate-900 leading-[0.9] md:leading-[0.85] italic uppercase">
            Booking <br className="hidden sm:block" />
            <span className="text-primary italic">Hub.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl">
            Secure high-fidelity logistics for your next odyssey.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 self-start md:self-auto">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Wallet className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Available USD</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 font-headline">${usdWallet?.balance.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="hotels" className="space-y-8 md:space-y-12">
        <TabsList className="bg-slate-100/50 p-1.5 md:p-2 rounded-2xl md:rounded-3xl h-auto flex flex-wrap md:flex-nowrap gap-1 md:gap-2 md:w-fit no-scrollbar overflow-x-auto">
          <TabsTrigger value="hotels" className="rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 font-black uppercase text-[10px] md:text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex-1 md:flex-none whitespace-nowrap">
            <BedDouble className="mr-2 h-4 w-4" /> {t('header.hotels')}
          </TabsTrigger>
          <TabsTrigger value="flights" className="rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 font-black uppercase text-[10px] md:text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex-1 md:flex-none whitespace-nowrap">
            <Plane className="mr-2 h-4 w-4" /> {t('header.flights')}
          </TabsTrigger>
          <TabsTrigger value="insurance" className="rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 font-black uppercase text-[10px] md:text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex-1 md:flex-none whitespace-nowrap">
            <ShieldAlert className="mr-2 h-4 w-4" /> {t('header.insurance')}
          </TabsTrigger>
          <TabsTrigger value="trains" className="rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 font-black uppercase text-[10px] md:text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex-1 md:flex-none whitespace-nowrap">
            <Train className="mr-2 h-4 w-4" /> {t('header.trains')}
          </TabsTrigger>
          <TabsTrigger value="buses" className="rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 font-black uppercase text-[10px] md:text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex-1 md:flex-none whitespace-nowrap">
            <Bus className="mr-2 h-4 w-4" /> {t('header.buses')}
          </TabsTrigger>
          <TabsTrigger value="cruises" className="rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 font-black uppercase text-[10px] md:text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex-1 md:flex-none whitespace-nowrap">
            <Ship className="mr-2 h-4 w-4" /> {t('header.cruises')}
          </TabsTrigger>
          <TabsTrigger value="cabs" className="rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 font-black uppercase text-[10px] md:text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex-1 md:flex-none whitespace-nowrap">
            <Car className="mr-2 h-4 w-4" /> {t('header.cabs')}
          </TabsTrigger>
          <TabsTrigger value="dining" className="rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 font-black uppercase text-[10px] md:text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex-1 md:flex-none whitespace-nowrap">
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

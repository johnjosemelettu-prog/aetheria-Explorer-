'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Loader2,
  X,
  Navigation,
  Building2,
  Waypoints,
  Shirt,
  ShieldCheck,
  Zap,
  ShieldAlert,
  Utensils,
  Globe
} from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useTranslation } from '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface POINode {
  id: string;
  name: string;
  category: string;
  icon: string;
  distance: string;
  lat: number;
  lon: number;
}

const iconMap: { [key: string]: React.ElementType } = {
  restaurant: Utensils,
  cafe: Utensils,
  museum: Building2,
  park: Waypoints,
  shop: Shirt,
  tourism: Globe,
}

export default function ARWayfindingPage() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [activePois, setActivePois] = useState<POINode[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState<POINode | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  const mapBgImage = PlaceHolderImages.find((img) => img.id === 'ar-map-background')

  // Watch Position
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError(t('arWayfinding.geolocationNotSupported'))
      setIsLocating(false)
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationError(null)
        setIsLocating(false)
      },
      (error) => {
        setLocationError(t('arWayfinding.locationAccessDenied'))
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [t])

  // Reverse Geocoding via Nominatim (OSM)
  useEffect(() => {
    if (location && !locationName) {
      const fetchAddress = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=10`,
            { headers: { 'User-Agent': 'AetheriaTravelApp/1.0' } }
          )
          const data = await response.json()
          setLocationName(data.address?.city || data.address?.town || data.address?.village || t('arWayfinding.globalHub'))
        } catch (e) {
          console.warn(t('arWayfinding.geocodingFailed'), e)
        }
      }
      fetchAddress()
    }
  }, [location, locationName, t])

  // POI Discovery via Overpass API (OSM)
  useEffect(() => {
    const handleSearch = async () => {
      if (!location || searchQuery.trim().length < 2) return

      setIsSearching(true)
      try {
        const query = `
          [out:json];
          (
            node(around:2000, ${location.latitude}, ${location.longitude})["amenity"~"restaurant|cafe|bar|pub|museum|park"];
            node(around:2000, ${location.latitude}, ${location.longitude})["shop"~"mall|clothes"];
            node(around:2000, ${location.latitude}, ${location.longitude})["tourism"~"attraction|museum|viewpoint"];
          );
          out 10;
        `
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        const data = await response.json()
        
        if (data.elements) {
          const processed: POINode[] = data.elements
            .filter((el: any) => el.tags?.name)
            .map((el: any) => ({
              id: el.id.toString(),
              name: el.tags.name,
              category: el.tags.amenity || el.tags.tourism || el.tags.shop || t('arWayfinding.establishment'),
              icon: el.tags.amenity || el.tags.tourism || el.tags.shop || 'tourism',
              distance: t('arWayfinding.nearby'),
              lat: el.lat,
              lon: el.lon,
            }))
          setActivePois(processed)
        }
      } catch (e) {
        console.error("Overpass Search Error:", e)
        toast({ variant: 'destructive', title: t('arWayfinding.signalLoss'), description: t('arWayfinding.fetchNodesError') })
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(handleSearch, 1000)
    return () => clearTimeout(timer)
  }, [searchQuery, location, toast, t])

  const handleSelectPoi = (poi: POINode) => {
    setSelectedPoi(poi)
    setIsNavigating(true)
  }

  const getPoiStyle = (poi: POINode) => {
    const hash = poi.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    const isSelected = selectedPoi?.id === poi.id
    return {
      top: `${30 + (hash % 40)}%`,
      left: `${15 + (hash % 70)}%`,
      transform: `translate(-50%, -50%) scale(${isSelected ? 1.2 : 1})`,
      zIndex: isSelected ? 20 : 10,
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-black text-primary-foreground -mt-28 lg:-mt-32 relative">
      {mapBgImage && (
        <Image
          src={mapBgImage.imageUrl}
          alt={mapBgImage.description}
          data-ai-hint={mapBgImage.imageHint}
          fill
          className="object-cover opacity-40 grayscale"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

      {locationError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <Card className="max-w-md border-none rounded-[2.5rem] bg-white p-10 text-center">
            <ShieldAlert className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-black font-headline uppercase tracking-tighter text-slate-900 mb-4 italic">{t('arWayfinding.signalLoss')}</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">{locationError}</p>
            <Button asChild className="w-full h-14 rounded-2xl font-black">
              <Link href="/dashboard">{t('arWayfinding.returnToCommandCenter')}</Link>
            </Button>
          </Card>
        </div>
      )}

      {isLocating && (
        <div className="absolute top-4 left-1/2 z-30 -translate-x-1/2">
          <Badge className="bg-primary/20 backdrop-blur-xl text-primary border-primary/30 px-4 py-2 font-black uppercase tracking-widest text-[10px]">
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> {t('arWayfinding.synchronizingGps')}
          </Badge>
        </div>
      )}

      {activePois.map((poi) => (
        <div key={poi.id} className="absolute transition-all duration-1000" style={getPoiStyle(poi)}>
          <ARMarker
            icon={iconMap[poi.icon] || MapPin}
            name={poi.name}
            distance={poi.distance}
            isSelected={selectedPoi?.id === poi.id}
            onClick={() => handleSelectPoi(poi)}
          />
        </div>
      ))}
      
      {isNavigating && selectedPoi ? (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <Card className="rounded-[2.5rem] border-none bg-slate-900/80 p-8 backdrop-blur-2xl text-white shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between gap-8">
              <div className="space-y-1">
                <Badge className="bg-primary text-white border-none font-bold uppercase text-[8px] mb-2">{t('arWayfinding.navigationLocked')}</Badge>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('arWayfinding.routingToNode')}</p>
                <p className="text-3xl font-black font-headline text-white italic">{selectedPoi.name}</p>
              </div>
              <Button onClick={() => setIsNavigating(false)} variant="destructive" className="h-14 w-14 rounded-2xl">
                <X className="h-6 w-6" />
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <Card className="rounded-[3rem] border-none bg-white/10 backdrop-blur-2xl p-6 shadow-2xl border border-white/10 max-w-2xl mx-auto">
            <div className="flex flex-col gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={t('arWayfinding.scanPlaceholder')}
                  className="h-14 w-full rounded-2xl bg-white/5 border-none pl-12 pr-12 text-white font-bold text-lg placeholder:text-white/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
                )}
              </div>
              
              {!isLocating && locationName && (
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                    {t('arWayfinding.auraSync', { locationName })}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function ARMarker({
  icon: Icon,
  name,
  distance,
  isSelected,
  onClick,
}: {
  icon: React.ElementType
  name: string
  distance: string
  isSelected: boolean
  onClick: () => void
}) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-3 transition-all duration-500 group',
        isSelected ? 'z-20 scale-110' : 'z-10 scale-90 opacity-60 hover:opacity-100'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-4 rounded-3xl border-2 p-4 px-6 text-center backdrop-blur-xl shadow-2xl transition-all',
          isSelected
            ? 'border-primary bg-primary/90 text-white'
            : 'bg-slate-900/60 border-white/10 text-white/80'
        )}
      >
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center",
          isSelected ? "bg-white text-primary" : "bg-white/10 text-white"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-black text-sm uppercase tracking-tighter italic">{name}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{distance}</p>
        </div>
      </div>
      {isSelected && (
        <Navigation className="h-8 w-8 text-primary animate-bounce drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
      )}
    </button>
  )
}

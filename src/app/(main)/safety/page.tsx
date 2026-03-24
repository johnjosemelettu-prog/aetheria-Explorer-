
'use client'

import { useState, useEffect } from 'react'
import {
  Siren,
  Ambulance,
  Flame,
  Building,
  Phone,
  MapPin,
  ShieldAlert,
  Loader2,
  Copy,
  Info,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  User,
  Globe
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { generateSafetyData, type GenerateSafetyDataOutput } from '@/ai/flows/generate-safety-data-flow'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import Link from 'next/link'

export default function SafetyPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { user } = useUser()
  const firestore = useFirestore()
  
  const [hasMounted, setHasMounted] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [safetyInfo, setSafetyInfo] = useState<GenerateSafetyDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid) : null),
    [user, firestore]
  )
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef)

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const getSafetyIntelligence = async (lat: number, lon: number) => {
    if (isProfileLoading) return;
    
    setIsSynthesizing(true);
    setError(null);
    try {
      // OpenStreetMap Reverse Geocoding via Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
        { headers: { 'User-Agent': 'AetheriaTravelApp/1.0' } }
      );
      const geoData = await geoRes.json();
      
      const cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Global Hub";
      setLocationName(cityName);

      const data = await generateSafetyData({
        latitude: lat,
        longitude: lon,
        userNationality: userProfile?.nationality || 'United States',
        userHomeBase: userProfile?.homeBase || 'Unknown',
        language: currentLang
      });
      setSafetyInfo(data);
    } catch (err) {
      console.error(err);
      setError("Protocol Error: Failed to synthesize safety nodes.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleLocate = () => {
    setIsLocating(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
        setLocation(coords);
        setIsLocating(false);
        if (!isProfileLoading) {
          getSafetyIntelligence(coords.lat, coords.lon);
        }
      },
      (err) => {
        setError("Location authorization required for Safety Assistant.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (hasMounted && !isProfileLoading) {
      handleLocate();
    }
  }, [hasMounted, isProfileLoading]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Signal Copied", description: "Node saved to clipboard." })
  }
  
  const iconMap: { [key: string]: React.ElementType } = {
    Siren,
    Ambulance,
    Flame,
    ShieldAlert,
  };

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Guardian Infrastructure</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Safety Assistant
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Localized emergency intelligence synthesized from global diplomatic nodes.
        </p>
      </header>

      {isLocating || isSynthesizing || isProfileLoading ? (
        <div className="space-y-8 animate-in fade-in duration-700">
          <Skeleton className="h-20 w-full rounded-[2.5rem]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="max-w-2xl mx-auto rounded-[2rem] border-none shadow-xl bg-red-50 text-red-900 p-10">
          <AlertTriangle className="h-10 w-10" />
          <AlertTitle className="font-black font-headline uppercase tracking-tighter mt-4">Node Disruption</AlertTitle>
          <AlertDescription className="text-lg font-medium mt-2">{error}</AlertDescription>
          <Button variant="outline" className="mt-8 bg-white border-red-200 text-red-900 rounded-xl h-12 font-bold" onClick={handleLocate}>
            <RefreshCw className="mr-2 h-4 w-4" /> Re-Initialize Radar
          </Button>
        </Alert>
      ) : safetyInfo ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex flex-col md:flex-row gap-6">
            <Alert className="flex-1 border-none bg-emerald-50 text-emerald-900 rounded-[2rem] p-8 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <AlertTitle className="font-black font-headline uppercase tracking-tighter text-lg">Location Verified</AlertTitle>
              <AlertDescription className="font-medium text-emerald-700">
                Detected in: {locationName || safetyInfo.locationName}
              </AlertDescription>
            </Alert>
            <Alert className="flex-1 border-none bg-blue-50 text-blue-900 rounded-[2rem] p-8 shadow-sm">
              <User className="h-6 w-6 text-blue-600" />
              <AlertTitle className="font-black font-headline uppercase tracking-tighter text-lg">Identity Context</AlertTitle>
              <AlertDescription className="font-medium text-blue-700">
                Matching assistance for: {userProfile?.nationality || 'Global'}
              </AlertDescription>
            </Alert>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-8">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-10">
                  <CardTitle className="text-2xl font-headline font-black uppercase tracking-tighter italic">Emergency Hub</CardTitle>
                  <CardDescription className="text-slate-400">Direct lines to local response nodes.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {safetyInfo.emergencyNumbers.map((unit, i) => {
                    const Icon = iconMap[unit.icon] || Siren;
                    return (
                      <a key={i} href={`tel:${unit.number}`} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform"><Icon className="h-6 w-6" /></div>
                          <span className="font-black text-slate-900 uppercase tracking-tighter italic">{unit.service}</span>
                        </div>
                        <span className="text-3xl font-black font-headline text-red-600">{unit.number}</span>
                      </a>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-[2rem] bg-slate-900 text-white p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Info className="h-24 w-24 text-primary" /></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">GLOBAL SUPPORT</h4>
                <p className="text-sm font-medium leading-relaxed opacity-80 italic">"{safetyInfo.safetyAdvice}"</p>
              </Card>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-10 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><Building className="h-8 w-8" /></div>
                  <div>
                    <CardTitle className="text-3xl font-black font-headline text-slate-900 leading-tight italic uppercase tracking-tighter">{safetyInfo.embassy.name}</CardTitle>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Diplomatic Node</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <p className="text-lg font-bold text-slate-700 leading-snug">{safetyInfo.embassy.address}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href={`tel:${safetyInfo.embassy.phone}`} className="flex-1">
                      <Button variant="outline" className="w-full h-16 rounded-2xl font-black border-2 border-slate-100 text-xl shadow-sm">
                        <Phone className="mr-3 h-6 w-6 text-primary" /> {safetyInfo.embassy.phone}
                      </Button>
                    </a>
                    <div className="flex-1 p-6 rounded-3xl bg-blue-50 text-blue-700 text-xs font-bold leading-relaxed italic border border-blue-100/50">
                      "{safetyInfo.embassy.note}"
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-10">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-2xl font-black font-headline text-slate-900 uppercase italic tracking-tighter">Essential Phrases</CardTitle>
                  <CardDescription className="font-medium text-slate-500">Emergency linguistic survival nodes.</CardDescription>
                </CardHeader>
                <div className="divide-y divide-slate-100">
                  {safetyInfo.emergencyPhrases.map((phrase, i) => (
                    <div key={i} className="py-8 flex items-center justify-between group transition-all">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{phrase.english}</p>
                        <p className="text-3xl font-black font-headline text-primary group-hover:translate-x-2 transition-transform italic uppercase">{phrase.local}</p>
                        <p className="text-xs font-bold text-slate-400 italic">Pronounce: {phrase.pronunciation}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full h-14 w-14 hover:bg-primary/5" onClick={() => handleCopy(phrase.local)}>
                        <Copy className="h-6 w-6 text-slate-200 group-hover:text-primary transition-colors" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between opacity-40 grayscale">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Protocol v2.4 • Guardian Sync Enabled</p>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest mt-6 md:mt-0">© 2026 Aetheria AI Intelligence Systems</p>
      </footer>
    </div>
  )
}

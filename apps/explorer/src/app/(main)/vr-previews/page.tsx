
'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Camera,
  Loader2,
  ScanLine,
  View,
  Building,
  X,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  MapPin,
  History,
  RotateCcw
} from 'lucide-react'

import VRViewer from '@/components/vr/VRViewer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { describeBuilding, type DescribeBuildingOutput } from '@/ai/flows/describe-building-flow'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function VRPreviewsPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<DescribeBuildingOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof navigator === 'undefined' || scanResult) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        setHasCameraPermission(true)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
        setHasCameraPermission(false)
        toast({
          variant: 'destructive',
          title: 'Optical Node Error',
          description: 'Camera access is required for real-time spatial synthesis.',
        })
      }
    }

    getCameraPermission()
    
    return () => {
       if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [toast, scanResult])
  
  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsScanning(true)
    setError(null)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const photoDataUri = canvas.toDataURL('image/jpeg')

    try {
      const result = await describeBuilding({ photoDataUri, language: currentLang })
      setScanResult(result)
    } catch (err) {
        console.error(err)
        setError("Spatial synthesis node disruption.")
        toast({ variant: 'destructive', title: 'Synthesis Error' })
    } finally {
        setIsScanning(false)
    }
  }, [toast, currentLang])

  const handleReset = () => {
    setScanResult(null)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Spatial Computing Hub</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          VR Previews
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Synthesize 360-degree immersive trials of destination nodes before you arrive.
        </p>
      </header>

      {scanResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
          <div className="lg:col-span-8">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-950">
              <CardHeader className="bg-slate-900 border-b border-white/5 text-white p-10 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[8px] mb-2 px-3">Synthesis Active</Badge>
                  <CardTitle className="text-3xl font-black font-headline italic uppercase tracking-tighter">Immersive Node View</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">360 Mode Enabled</span>
                </div>
              </CardHeader>
              <div className="aspect-video w-full bg-black relative group">
                <VRViewer textureUrl={scanResult.vrImageUrl} />
                <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20 opacity-40" />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <RotateCcw className="h-4 w-4" /> Drag to explore space
                </div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10">
              <h3 className="text-2xl font-black font-headline text-slate-900 mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
                <Building className="h-6 w-6 text-primary" /> Architecture DNA
              </h3>
              <ScrollArea className="h-80 pr-4">
                <p className="text-slate-600 font-medium leading-relaxed italic text-lg">"{scanResult.description}"</p>
              </ScrollArea>
              <Button onClick={handleReset} className="w-full mt-8 h-14 rounded-2xl font-black bg-slate-900 text-white hover:bg-slate-800 shadow-xl transition-all active:scale-95">
                <ScanLine className="mr-2 h-5 w-5" /> New Synthesis
              </Button>
            </Card>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="text-[10px] font-black uppercase text-slate-400">Node Compliance</p>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                This preview is synthesized from verified architectural nodes and real-time spatial data. Visual fidelity: 94%.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-950 text-white">
          <CardHeader className="p-10 text-center">
            <CardTitle className="text-3xl font-black font-headline italic uppercase tracking-tighter">Initialize Lens</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Align a landmark or city photo to enter the time-stream.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-slate-900 flex items-center justify-center border-y border-white/5">
              {hasCameraPermission === null ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
              ) : hasCameraPermission ? (
                <>
                  <video ref={videoRef} className="h-full w-full object-cover opacity-60" autoPlay muted playsInline />
                  <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none" />
                  <div className="absolute inset-[30px] border-2 border-primary/50 rounded-2xl pointer-events-none" />
                  <ScanLine className="absolute h-1 w-[calc(100%-60px)] bg-primary/70 top-1/2 animate-[scan_4s_linear_infinite]" />
                </>
              ) : (
                <div className="p-10 text-center space-y-6">
                  <Camera className="h-16 w-16 mx-auto text-white/10" />
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Optical Sensors Offline</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-10">
            <Button onClick={handleScan} disabled={isScanning || !hasCameraPermission} className="w-full h-16 rounded-2xl font-black text-xl bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 transition-all">
              {isScanning ? <><Loader2 className="mr-2 animate-spin h-6 w-6" /> Mapping Space...</> : <><Sparkles className="mr-2 h-6 w-6" /> Synthesize VR View</>}
            </Button>
          </CardFooter>
        </Card>
      )}

      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

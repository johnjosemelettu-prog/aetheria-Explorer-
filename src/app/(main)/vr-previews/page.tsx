'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Camera,
  Loader2,
  ScanLine,
  View,
  Building,
  X,
} from 'lucide-react'

import VRViewer from '@/components/vr/VRViewer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { describeBuilding, DescribeBuildingOutput } from '@/ai/flows/describe-building-flow'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { ScrollArea } from '@/components/ui/scroll-area'

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
      // Don't request if we're not on the client or already have a result
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
          title: t('vr.cameraDeniedTitle'),
          description: t('vr.cameraDeniedDescription'),
        })
      }
    }

    getCameraPermission()
    
    // Cleanup: stop video stream when component unmounts or scan is complete
    return () => {
       if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [toast, t, scanResult])
  
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
        const errorMessage = err instanceof Error ? err.message : t('vr.scanErrorGeneric')
        setError(errorMessage)
        toast({
            variant: 'destructive',
            title: t('vr.scanErrorTitle'),
            description: errorMessage
        })
    } finally {
        setIsScanning(false)
    }
  }, [toast, t, currentLang])

  const handleReset = () => {
    setScanResult(null)
    setError(null)
    // The useEffect will re-request camera permission
  }

  const renderContent = () => {
    if (scanResult) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <View className="w-6 h-6 text-primary" />
                            {t('vr.vrViewTitle')}
                        </CardTitle>
                        <CardDescription>
                            {t('vr.vrViewDescription')}
                        </CardDescription>
                    </CardHeader>
                    <div className="aspect-video w-full overflow-hidden rounded-b-lg border-t bg-secondary">
                        <VRViewer textureUrl={scanResult.vrImageUrl} />
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Building className="w-6 h-6 text-primary" />
                            {t('vr.detailsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <p className="text-muted-foreground whitespace-pre-wrap">{scanResult.description}</p>
                      </ScrollArea>
                      <Button onClick={handleReset} className="w-full mt-4">
                        <ScanLine className="mr-2"/>
                        {t('vr.scanAgainButton')}
                      </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      )
    }

    // Default view: Camera scanner
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            {t('vr.scanTitle')}
          </CardTitle>
          <CardDescription>{t('vr.scanDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-secondary flex items-center justify-center">
            {hasCameraPermission === null && <Loader2 className="h-8 w-8 animate-spin" />}
            {hasCameraPermission === false && (
                <Alert variant="destructive" className="m-4">
                  <Camera className="h-4 w-4" />
                  <AlertTitle>{t('vr.cameraErrorTitle')}</AlertTitle>
                  <AlertDescription>
                    {t('vr.cameraErrorDescription')}
                  </AlertDescription>
                </Alert>
            )}
             {hasCameraPermission && (
                <>
                    <video
                        ref={videoRef}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        playsInline
                    />
                    <ScanLine className="absolute h-1.5 w-full bg-primary/70 animate-[scan_4s_ease-in-out_infinite]" />
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </>
             )}
          </div>
           <style jsx>{`
              @keyframes scan {
                0% { top: 0; }
                50% { top: 100%; }
                100% { top: 0; }
              }
            `}</style>

          <Button onClick={handleScan} disabled={isScanning || !hasCameraPermission} className="w-full mt-4">
            {isScanning ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                {t('vr.scanningButton')}
              </>
            ) : (
              <>
                <ScanLine className="mr-2" />
                {t('vr.scanButton')}
              </>
            )}
          </Button>
          {error && (
             <Alert variant="destructive" className="mt-4">
                  <X className="h-4 w-4" />
                  <AlertTitle>{t('vr.scanErrorTitle')}</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          {t('vr.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('vr.subtitle')}
        </p>
      </div>
      {renderContent()}
    </div>
  )
}

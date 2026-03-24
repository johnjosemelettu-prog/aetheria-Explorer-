'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera, Loader2, ScanLine, ChefHat, Info, Flame, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { exploreMenu, type ExploreMenuOutput } from '@/ai/flows/explore-menu-flow'
import { useTranslation, availableLanguages } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function MenuExplorerPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()

  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ExploreMenuOutput | null>(null)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setHasCameraPermission(true)
    } catch (err) {
      setHasCameraPermission(false)
      toast({
        variant: 'destructive',
        title: t('ar.cameraErrorTitle'),
        description: t('menuExplorer.cameraDenied'),
      })
    }
  }

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsScanning(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    const photoDataUri = canvas.toDataURL('image/jpeg')

    try {
      const data = await exploreMenu({
        photoDataUri,
        targetLanguage: currentLang,
      })
      setResult(data)
      // Stop camera tracks
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('vr.scanErrorTitle'),
        description: t('vr.scanErrorGeneric'),
      })
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          {t('menuExplorer.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('menuExplorer.subtitle')}
        </p>
      </div>

      {!result ? (
        <Card className="max-w-2xl mx-auto overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="text-primary" />
              {t('menuExplorer.cardTitle')}
            </CardTitle>
            <CardDescription>
              {t('menuExplorer.cardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {hasCameraPermission === null ? (
                <Button onClick={startCamera}>{t('menuExplorer.startCameraButton')}</Button>
              ) : hasCameraPermission ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none m-8 rounded-lg" />
                  <ScanLine className="absolute h-1 w-full bg-primary/70 top-0 animate-[scan_4s_linear_infinite]" />
                </>
              ) : (
                <p className="text-white">{t('menuExplorer.cameraDenied')}</p>
              )}
            </div>
            <div className="p-6">
              <Button 
                onClick={handleCapture} 
                disabled={!hasCameraPermission || isScanning} 
                className="w-full h-12"
              >
                {isScanning ? <Loader2 className="mr-2 animate-spin" /> : <Camera className="mr-2" />}
                {isScanning ? t('menuExplorer.analyzing') : t('menuExplorer.scanButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-headline">{result.menuTitle}</h2>
            <Button variant="outline" onClick={() => { setResult(null); startCamera(); }}>
              {t('menuExplorer.scanAnother')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.dishes.map((dish, i) => (
              <Card key={i} className="flex flex-col h-full hover:border-primary transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg">{dish.translatedName}</CardTitle>
                      <CardDescription className="italic text-xs">{dish.originalName}</CardDescription>
                    </div>
                    {dish.spicinessLevel > 0 && (
                      <div className="flex items-center gap-0.5 text-red-500">
                        {Array.from({ length: dish.spicinessLevel }).map((_, i) => (
                          <Flame key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">{dish.description}</p>
                  <div className="flex wrap gap-2 mb-4">
                    {dish.keyIngredients.map(ing => (
                      <Badge key={ing} variant="secondary" className="text-[10px]">{ing}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {dish.dietaryInfo.isVegetarian && (
                      <div className="flex items-center text-xs text-green-600 gap-1">
                        <Check className="w-3 h-3" /> {t('menuExplorer.veg')}
                      </div>
                    )}
                    {dish.dietaryInfo.isVegan && (
                      <div className="flex items-center text-xs text-green-600 gap-1">
                        <Check className="w-3 h-3" /> {t('menuExplorer.vegan')}
                      </div>
                    )}
                    {dish.dietaryInfo.containsCommonAllergens && (
                      <div className="flex items-center text-xs text-amber-600 gap-1">
                        <Info className="w-3 h-3" /> {t('menuExplorer.allergenAlert')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
      `}</style>
    </div>
  )
}

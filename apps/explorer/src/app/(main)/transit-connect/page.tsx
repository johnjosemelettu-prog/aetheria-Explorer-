'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Camera,
  Loader2,
  ScanLine,
  CheckCircle2,
  Ticket,
  Users,
  Briefcase,
  Coffee,
  Gamepad2,
  Network,
  Plane,
  Ship,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import {
  parseBoardingPass,
  BoardingPassDetails,
} from '@/ai/flows/parse-boarding-pass-flow';
import {
  findTravelerMatches,
  Traveler,
} from '@/ai/flows/find-traveler-matches-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

type Vibe = 'networking' | 'coffee' | 'shareLounge' | 'cardGame';
type Step = 'verify' | 'setVibe' | 'active';

const vibeOptions: {
  id: Vibe;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'networking',
    titleKey: 'transitConnect.step2.vibes.networking',
    descriptionKey: 'transitConnect.step2.vibes.networkingDescription',
    icon: Briefcase,
  },
  {
    id: 'coffee',
    titleKey: 'transitConnect.step2.vibes.coffee',
    descriptionKey: 'transitConnect.step2.vibes.coffeeDescription',
    icon: Coffee,
  },
  {
    id: 'shareLounge',
    titleKey: 'transitConnect.step2.vibes.shareLounge',
    descriptionKey: 'transitConnect.step2.vibes.shareLoungeDescription',
    icon: Ticket,
  },
  {
    id: 'cardGame',
    titleKey: 'transitConnect.step2.vibes.cardGame',
    descriptionKey: 'transitConnect.step2.vibes.cardGameDescription',
    icon: Gamepad2,
  },
];

export default function TransitConnectPage() {
  const { t, language } = useTranslation();
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';
  
  const [step, setStep] = useState<Step>('verify');
  const [boardingPassDetails, setBoardingPassDetails] =
    useState<BoardingPassDetails | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [matches, setMatches] = useState<Traveler[]>([]);
  const [isFindingMatches, setIsFindingMatches] = useState(false);

  const handleVerificationComplete = (details: BoardingPassDetails) => {
    setBoardingPassDetails(details);
    setStep('setVibe');
  };

  const handleVibeSelected = async (vibe: Vibe) => {
    setSelectedVibe(vibe);
    setStep('active');
    setIsFindingMatches(true);
    try {
      const results = await findTravelerMatches({
        vibe,
        flight: boardingPassDetails?.flight || 'XX123',
        terminal: boardingPassDetails?.gate.charAt(0) || 'A',
        language: currentLang,
      });
      setMatches(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFindingMatches(false);
    }
  };

  return (
    <div className="container mx-auto min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          {t('transitConnect.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('transitConnect.subtitle')}
        </p>
      </div>

      <div className="mt-12">
        {step === 'verify' && (
          <BoardingPassScanner onScanComplete={handleVerificationComplete} language={currentLang} />
        )}
        {step === 'setVibe' && boardingPassDetails && (
          <VerificationSuccess
            details={boardingPassDetails}
            onNext={() => handleVibeSelected(selectedVibe || 'coffee')}
          >
            <VibeSelector onVibeSelect={setSelectedVibe} />
          </VerificationSuccess>
        )}
        {step === 'active' && boardingPassDetails && selectedVibe && (
          <ActiveNetwork
            details={boardingPassDetails}
            vibe={selectedVibe}
            matches={matches}
            isLoading={isFindingMatches}
          />
        )}
      </div>
    </div>
  );
}

function BoardingPassScanner({
  onScanComplete,
  language
}: {
  onScanComplete: (details: BoardingPassDetails) => void;
  language: string;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function getCameraPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setHasPermission(true);
      } catch (error) {
        setHasPermission(false);
      }
    }
    getCameraPermission();
  }, []);

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current || !hasPermission) {
      toast({
        variant: 'destructive',
        title: t('transitConnect.step1.cameraError'),
      });
      return;
    }
    setIsScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const photoDataUri = canvas.toDataURL('image/jpeg');

    try {
      const result = await parseBoardingPass({ photoDataUri, language });
      onScanComplete(result);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: t('transitConnect.step1.scanErrorTitle'),
        description: t('transitConnect.step1.scanErrorDescription'),
      });
    } finally {
      setIsScanning(false);
    }
  };

  const samplePass = PlaceHolderImages.find(
    (p) => p.id === 'boarding-pass-sample'
  )!;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{t('transitConnect.step1.title')}</CardTitle>
        <CardDescription>
          {t('transitConnect.step1.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-secondary">
          {hasPermission === true && (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              muted
              playsInline
            />
          )}
          {hasPermission === false && (
            <Alert variant="destructive" className="m-4">
              <Camera className="h-4 w-4" />
              <AlertTitle>{t('cameraErrorTitle')}</AlertTitle>
              <AlertDescription>
                {t('cameraPermissionDenied')}
              </AlertDescription>
            </Alert>
          )}
          {hasPermission === null && (
            <Loader2 className="h-8 w-8 animate-spin" />
          )}
          <Image
            src={samplePass.imageUrl}
            alt={samplePass.description}
            width={300}
            height={150}
            className="absolute opacity-70"
            data-ai-hint={samplePass.imageHint}
          />
          <ScanLine className="absolute h-1.5 w-full animate-[scan_4s_ease-in-out_infinite] bg-primary/70" />
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        <style jsx>{`
          @keyframes scan {
            0% {
              top: 0;
            }
            50% {
              top: 100%;
            }
            100% {
              top: 0;
            }
          }
        `}</style>
        <Button
          onClick={handleScan}
          disabled={isScanning || hasPermission !== true}
          className="mt-4 w-full"
        >
          {isScanning ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <ScanLine className="mr-2" />
          )}
          {isScanning
            ? t('transitConnect.step1.scanningButton')
            : t('transitConnect.step1.scanButton')}
        </Button>
      </CardContent>
    </Card>
  );
}

function VerificationSuccess({
  details,
  onNext,
  children,
}: {
  details: BoardingPassDetails;
  onNext: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            {t('transitConnect.verification.title')}
          </CardTitle>
          <CardDescription>
            {t('transitConnect.verification.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              {t('transitConnect.verification.passenger')}
            </p>
            <p className="text-lg font-bold">{details.passengerName}</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('transitConnect.verification.flight')}
                </p>
                <p className="font-semibold">{details.flight}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('transitConnect.verification.gate')}
                </p>
                <p className="font-semibold">{details.gate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('transitConnect.verification.seat')}
                </p>
                <p className="font-semibold">{details.seat}</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {t('transitConnect.verification.departs')}
              </p>
              <p className="font-semibold">{details.departureTime}</p>
            </div>
          </div>
          <Button onClick={onNext} className="w-full">
            <Sparkles className="mr-2" />
            {t('transitConnect.step2.goLiveButton')}
          </Button>
        </CardContent>
      </Card>
      <div>{children}</div>
    </div>
  );
}

function VibeSelector({
  onVibeSelect,
}: {
  onVibeSelect: (vibe: Vibe) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('transitConnect.step2.title')}</CardTitle>
        <CardDescription>{t('transitConnect.step2.description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {vibeOptions.map((vibe) => (
          <Card
            key={vibe.id}
            onClick={() => onVibeSelect(vibe.id)}
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <vibe.icon />
                {t(vibe.titleKey)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t(vibe.descriptionKey)}
              </p>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

function ActiveNetwork({
  details,
  vibe,
  matches,
  isLoading,
}: {
  details: BoardingPassDetails;
  vibe: Vibe;
  matches: Traveler[];
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleChat = (name: string) => {
    toast({
      title: t('transitConnect.step3.toast.chatTitle'),
      description: t('transitConnect.step3.toast.chatDescription', { name }),
    });
  };

  const arBgImage = PlaceHolderImages.find(
    (img) => img.id === 'ar-map-background'
  )!;

  const getTravelerStyle = (traveler: Traveler) => {
    const hash = traveler.id
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      top: `${30 + (hash % 40)}%`,
      left: `${15 + (hash % 70)}%`,
    };
  };

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-6 w-6 text-primary" />
          {t('transitConnect.step3.title')}
        </CardTitle>
        <CardDescription>
          {t('transitConnect.step3.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="nearby">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nearby">
              <Users className="mr-2" />
              {t('transitConnect.step3.nearbyTab')}
            </TabsTrigger>
            <TabsTrigger value="ar-view">
              <Camera className="mr-2" />
              {t('transitConnect.step3.arViewTab')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="nearby" className="mt-4">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {!isLoading && (
              <ul className="space-y-4">
                {matches.map((traveler) => (
                  <li
                    key={traveler.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={traveler.avatarUrl} />
                      <AvatarFallback>
                        {traveler.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{traveler.name}</p>
                        {traveler.onSameFlight && (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            <Plane className="mr-1 h-3 w-3" />
                            {t('transitConnect.step3.sameFlight')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Vibe: {traveler.vibe}
                      </p>
                    </div>
                    <Button onClick={() => handleChat(traveler.name)}>
                      {t('transitConnect.step3.chatButton')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="ar-view" className="mt-4">
            <p className="mb-4 text-center text-sm text-muted-foreground">
              {t('transitConnect.step3.arViewDescription')}
            </p>
            <div className="relative h-96 w-full overflow-hidden rounded-lg bg-secondary">
              <Image
                src={arBgImage.imageUrl}
                alt={arBgImage.description}
                fill
                className="object-cover"
                data-ai-hint={arBgImage.imageHint}
              />
              {matches.map((traveler) => (
                <div
                  key={traveler.id}
                  className="absolute"
                  style={getTravelerStyle(traveler)}
                >
                  <div className="group flex cursor-pointer flex-col items-center">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src={traveler.avatarUrl} />
                      <AvatarFallback>
                        {traveler.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="mt-1 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                      <MessageSquare className="h-3 w-3" />
                      <span>{traveler.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

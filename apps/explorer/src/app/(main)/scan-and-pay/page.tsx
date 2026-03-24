
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Loader2, 
  ScanLine, 
  Wallet, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  QrCode,
  Zap,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { parsePaymentQr, type ParsePaymentQrOutput } from '@/ai/flows/parse-payment-qr-flow';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp, increment, collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function ScanAndPayPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ParsePaymentQrOutput | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [paymentStep, setPaymentStep] = useState<'scan' | 'confirm' | 'success'>('scan');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentLangName = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  const walletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'userProfiles', user.uid, 'wallets') : null),
    [user, firestore]
  );
  const { data: wallets } = useCollection(walletsQuery);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Optical Node Error',
        description: 'Camera access is required for real-time QR synthesis.',
      });
    }
  };

  useEffect(() => {
    if (paymentStep === 'scan') {
      startCamera();
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [paymentStep]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const photoDataUri = canvas.toDataURL('image/jpeg');

    try {
      const data = await parsePaymentQr({ photoDataUri, language: currentLangName });
      setResult(data);
      setPaymentStep('confirm');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Synthesis Error',
        description: 'Could not resolve the merchant node. Ensure the code is clear.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handlePay = async () => {
    if (!user || !result || !firestore) return;
    
    const wallet = wallets?.find(w => w.currency === result.currency);
    if (!wallet || wallet.balance < result.amount) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Assets',
        description: `Your ${result.currency} node has insufficient liquidity for this $${result.amount} transaction.`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', result.currency);
      setDocumentNonBlocking(walletRef, {
        balance: increment(-result.amount),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
      addDocumentNonBlocking(transRef, {
        type: 'debit',
        category: 'payment',
        amount: result.amount,
        currency: result.currency,
        description: `Aetheria Scan & Pay: ${result.vendorName}`,
        timestamp: serverTimestamp(),
        reference: result.paymentReference
      });

      setPaymentStep('success');
      toast({ title: "Transaction Resolved", description: "Payment verified by Guardian Grid." });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Protocol Error',
        description: 'Failed to authorize payment.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-screen flex flex-col justify-center">
      <header className="text-center mb-12 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Merchant Protocol</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none italic uppercase">
          Scan & Pay
        </h1>
        <p className="text-xl text-slate-500 font-medium">Instant high-fidelity merchant settlement.</p>
      </header>

      {paymentStep === 'scan' && (
        <Card className="overflow-hidden border-none shadow-2xl rounded-[3rem] bg-slate-950">
          <CardHeader className="p-8 pb-4 text-center">
            <CardTitle className="text-white text-xl font-headline font-black uppercase tracking-tighter">Target Merchant QR</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Align the visual node within the frame</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-square bg-slate-900 flex items-center justify-center">
              {hasCameraPermission === null ? (
                <div className="flex flex-col items-center gap-4 opacity-30">
                  <Loader2 className="h-12 w-12 animate-spin text-white" />
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">Waking Sensors...</p>
                </div>
              ) : hasCameraPermission ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-[40px] border-black/60 pointer-events-none" />
                  <div className="absolute inset-[40px] border-2 border-primary/30 rounded-3xl pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                  </div>
                  <ScanLine className="absolute h-1 w-[calc(100%-80px)] bg-primary shadow-[0_0_15px_rgba(37,99,235,0.8)] top-1/2 left-10 animate-[scan_3s_linear_infinite]" />
                </>
              ) : (
                <div className="text-center p-12 text-white/20 flex flex-col items-center gap-6">
                  <AlertTriangle className="h-20 w-20" />
                  <p className="font-bold">Camera access restricted.</p>
                  <Button variant="outline" className="border-white/10 text-white" onClick={startCamera}>Retry Connection</Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-8 bg-slate-900">
            <Button 
              onClick={handleCapture} 
              disabled={!hasCameraPermission || isScanning} 
              className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/30 active:scale-95 transition-all bg-primary text-white"
            >
              {isScanning ? <Loader2 className="animate-spin h-6 w-6" /> : <Camera className="mr-2 h-6 w-6" />}
              {isScanning ? 'Decoding Logic...' : 'Authorize Scan'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {paymentStep === 'confirm' && result && (
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white">
          <div className="bg-slate-900 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-10 opacity-5"><Zap className="h-32 w-32 text-primary" /></div>
            <Badge className="mb-4 bg-primary text-white border-none font-bold uppercase tracking-widest px-3">Synthesis Resolved</Badge>
            <h2 className="text-4xl font-black font-headline leading-tight italic uppercase tracking-tighter">{result.vendorName}</h2>
            <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[9px]">Ref: {result.paymentReference}</p>
          </div>
          <CardContent className="p-10 space-y-10">
            <div className="text-center py-12 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount Requested</p>
              <p className="text-7xl font-black font-headline text-slate-900 tracking-tighter">
                {result.amount.toFixed(2)} <span className="text-2xl text-slate-400">{result.currency}</span>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Wallet Node</p>
              {wallets?.find(w => w.currency === result.currency) ? (
                <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-primary bg-primary/5 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {result.currency}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg">{result.currency} Wallet</p>
                      <p className="text-xs text-slate-500 font-bold">Available: ${wallets.find(w => w.currency === result.currency)?.balance.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm"><ShieldCheck className="h-6 w-6" /></div>
                </div>
              ) : (
                <Alert className="rounded-3xl border-amber-200 bg-amber-50 p-6">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertTitle className="font-black text-amber-900">CURRENCY NODE MISSING</AlertTitle>
                  <AlertDescription className="text-amber-800 font-medium">You don't have a {result.currency} node initialized. Convert funds in the <Link href="/wallet" className="font-bold underline">Wallet Hub</Link> first.</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-10 pt-0 gap-4">
            <Button variant="outline" className="h-16 rounded-2xl font-black flex-1 border-2" onClick={() => setPaymentStep('scan')}>
              Cancel
            </Button>
            <Button 
              className="h-16 rounded-2xl font-black text-xl flex-[2] shadow-2xl shadow-primary/20" 
              onClick={handlePay}
              disabled={isProcessing || !wallets?.find(w => w.currency === result.currency) || wallets.find(w => w.currency === result.currency)!.balance < result.amount}
            >
              {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <><CreditCard className="mr-2 h-6 w-6" /> Authorize Payment</>}
            </Button>
          </CardFooter>
        </Card>
      )}

      {paymentStep === 'success' && result && (
        <Card className="border-none shadow-2xl rounded-[3rem] text-center p-12 space-y-10 animate-in zoom-in duration-700 overflow-hidden relative bg-white">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
          <div className="space-y-6">
            <div className="h-24 w-24 rounded-[2rem] bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-900/10">
              <CheckCircle2 className="h-14 w-14" />
            </div>
            <div>
              <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold uppercase mb-4 px-3">Atomic Settlement Verified</Badge>
              <h2 className="text-4xl font-black font-headline text-slate-900 italic tracking-tighter uppercase">Transaction Resolved</h2>
              <p className="text-slate-500 font-medium text-lg mt-2">Paid {result.amount.toFixed(2)} {result.currency} to {result.vendorName}</p>
            </div>
          </div>
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4 text-left">
            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Reference</span>
              <span className="font-mono font-bold text-slate-700">{result.paymentReference}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Date</span>
              <span className="font-bold text-slate-700">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Rewards</span>
              <span className="text-emerald-600 font-black">+25 XP</span>
            </div>
          </div>
          <Button asChild className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20">
            <Link href="/dashboard">Return to Command Center <ArrowUpRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </Card>
      )}

      <footer className="mt-12 text-center opacity-40 grayscale flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Guardian Protocol v2.4 Encrypted</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

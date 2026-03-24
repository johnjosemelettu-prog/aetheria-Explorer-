
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Camera, 
  ImageIcon, 
  Sparkles, 
  Download, 
  Share2, 
  Loader2, 
  Wand2, 
  RefreshCw, 
  X,
  Palette,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { generatePostcard, type GeneratePostcardOutput } from '@/ai/flows/generate-postcard-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PostcardStudioPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [style, setStyle] = useState('Oil Painting');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratePostcardOutput | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    try {
      const data = await generatePostcard({
        photoDataUri: selectedImage,
        style: style as any,
        message,
        language: currentLang,
      });
      setResult(data);
      toast({
        title: "Artwork Resolved!",
        description: "Your custom postcard node has been synthesized.",
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: "Synthesis Error",
        description: "The AI studio is currently experiencing high load. Try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const styles = ['Vintage', 'Oil Painting', 'Watercolor', 'Cyberpunk', 'Cinematic', 'Sketch'];

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Aura Creative Node</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Postcard Studio
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Transform your travel snapshots into high-fidelity AI-generated art.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-2 uppercase tracking-tighter italic">
                <Palette className="h-5 w-5 text-primary" /> Visual Input
              </CardTitle>
              <CardDescription className="text-slate-400">Provide an anchor snap for transformation.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div 
                className={cn(
                  "relative aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
                  selectedImage ? "border-primary/50 shadow-inner" : "border-slate-200 hover:border-primary/30 bg-slate-50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <>
                    <Image src={selectedImage} alt="Input" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                      <RefreshCw className="text-white h-12 w-12" />
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto text-primary">
                      <Camera className="h-8 w-8" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Visual Node</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Synthesis Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl border-none">
                      {styles.map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Optional Message Node</Label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="Greetings from Kyoto..." 
                      className="pl-10 h-12 rounded-xl border-slate-100 bg-slate-50 font-medium" 
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={!selectedImage || isGenerating}
                className="w-full h-16 rounded-[1.5rem] font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <><Wand2 className="mr-2 h-6 w-6" /> Authorize Artistry</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-8 opacity-50">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <Loader2 className="w-full h-full animate-spin text-primary" strokeWidth={1} />
                <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-primary animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black font-headline tracking-tighter uppercase italic">Mixing Palette...</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Applying neural art protocols</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                <div className="relative aspect-[4/3] w-full">
                  <Image src={result.postcardImageUrl} alt="Result" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
                  <Badge className="absolute bottom-6 left-6 bg-primary text-white border-none font-black uppercase tracking-widest text-[10px] px-3">Art Node Resolved</Badge>
                </div>
                <CardContent className="p-10 space-y-8">
                  <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 italic text-xl text-slate-600 font-medium leading-relaxed text-center">
                    "{result.description}"
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-14 rounded-xl font-bold border-2" onClick={() => {
                      const link = document.createElement('a');
                      link.href = result.postcardImageUrl;
                      link.download = `postcard-${Date.now()}.png`;
                      link.click();
                    }}>
                      <Download className="mr-2 h-4 w-4" /> Save Asset
                    </Button>
                    <Button className="flex-[2] h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20">
                      <Share2 className="mr-2 h-5 w-5" /> Post to Global Feed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-32 opacity-20 grayscale gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
                <Sparkles className="h-40 w-40 text-primary relative mx-auto" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black font-headline uppercase tracking-tighter italic">Studio Idle</h2>
                <p className="max-w-xs mx-auto text-sm font-bold uppercase tracking-widest text-slate-500">Provide a visual anchor node to initialize the artistic time-stream.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Download, Share2, Loader2, Wand2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { generatePostcard, type GeneratePostcardOutput } from '@/ai/flows/generate-postcard-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function PostcardStudioPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [style, setStyle] = useState('Oil Painting');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratePostcardOutput | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

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
        title: "Artwork Created!",
        description: "Your custom postcard is ready.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: "Generation Failed",
        description: "Our AI artists are busy. Please try again in a moment.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.postcardImageUrl;
    link.download = `backpacker-postcard-${Date.now()}.png`;
    link.click();
  };

  const styles = ['Vintage', 'Oil Painting', 'Watercolor', 'Cyberpunk', 'Cinematic', 'Sketch'];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl flex items-center justify-center gap-3">
          <Wand2 className="text-primary h-10 w-10 animate-pulse" />
          {t('postcardStudio.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('postcardStudio.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Input Controls */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('postcardStudio.step1Title')}</CardTitle>
              <CardDescription>{t('postcardStudio.step1Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={cn(
                  "relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group",
                  selectedImage ? "border-primary/50" : "hover:border-primary/50 bg-muted/30"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <>
                    <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <RefreshCw className="text-white h-10 w-10" />
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{t('postcardStudio.uploadPlaceholder')}</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('postcardStudio.step2Title')}</CardTitle>
              <CardDescription>{t('postcardStudio.step2Desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('postcardStudio.styleLabel')}</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('postcardStudio.messageLabel')}</Label>
                <Input 
                  placeholder={t('postcardStudio.messagePlaceholder')} 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full h-12" 
                disabled={!selectedImage || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Artistry in progress...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" />
                    {t('postcardStudio.generateBtn')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Preview */}
        <div className="lg:sticky lg:top-24">
          <Card className="overflow-hidden border-2 shadow-2xl">
            <div className="aspect-[4/3] bg-muted relative flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center p-8 space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <Loader2 className="w-full h-full animate-spin text-primary opacity-20" />
                    <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-bounce" />
                  </div>
                  <p className="text-sm font-medium animate-pulse">Our AI is mixing the paints and prepping the canvas...</p>
                </div>
              ) : result ? (
                <Image 
                  src={result.postcardImageUrl} 
                  alt="Generated Postcard" 
                  fill 
                  className="object-cover animate-in fade-in zoom-in duration-1000" 
                />
              ) : (
                <div className="text-center p-8 opacity-20">
                  <ImageIcon className="h-24 w-24 mx-auto mb-4" />
                  <p className="font-headline text-xl">{t('postcardStudio.emptyState')}</p>
                </div>
              )}
            </div>
            
            {result && (
              <CardFooter className="flex flex-col items-stretch p-6 gap-4 bg-background">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 italic text-sm text-muted-foreground text-center">
                  "{result.description}"
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Save Image
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast({ title: "Shared!", description: "Postcard shared to your trip feed." });
                  }}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Post to Feed
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
          
          {result && (
            <div className="mt-6 flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => {setResult(null); setSelectedImage(null);}}>
                <X className="mr-2 h-4 w-4" />
                Discard & Start New
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

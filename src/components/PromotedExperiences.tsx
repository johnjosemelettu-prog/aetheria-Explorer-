
'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowUpRight, 
  Building2, 
  Globe, 
  Zap 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  partnerName: string;
  partnerType: 'cobrand' | 'affiliate' | 'tourism_dept';
  link: string;
  ctaText: string;
  badgeText: string;
}

export function PromotedExperiences({ promotions }: { promotions: Promotion[] }) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-accent" />
          <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-slate-800">Partner Spotlights</h2>
        </div>
        <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
          Verified Partners
        </Badge>
      </div>

      <Carousel opts={{ loop: true, align: 'start' }} className="w-full">
        <CarouselContent className="-ml-4">
          {promotions.map((promo) => (
            <CarouselItem key={promo.id} className="pl-4 md:basis-1/2 lg:basis-1/2">
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group h-full flex flex-col">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image 
                    src={promo.imageUrl} 
                    alt={promo.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white/90 text-slate-900 border-none font-black uppercase text-[9px] px-3 py-1 flex items-center gap-1.5">
                      {promo.partnerType === 'tourism_dept' && <Globe className="h-3 w-3 text-primary" />}
                      {promo.partnerType === 'cobrand' && <Zap className="h-3 w-3 text-accent" />}
                      {promo.partnerType === 'affiliate' && <Building2 className="h-3 w-3 text-blue-500" />}
                      {promo.partnerName}
                    </Badge>
                  </div>

                  <Badge className="absolute bottom-4 right-4 bg-accent text-slate-900 border-none font-black uppercase tracking-widest text-[8px] px-2">
                    {promo.badgeText}
                  </Badge>
                </div>

                <CardContent className="p-8 flex flex-col flex-grow">
                  <div className="space-y-3 flex-grow">
                    <h3 className="text-2xl font-black font-headline text-slate-900 leading-tight group-hover:text-primary transition-colors">
                      {promo.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
                      {promo.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exclusive Content</span>
                    </div>
                    <Button asChild variant="ghost" className="rounded-xl font-bold text-primary group-hover:gap-3 transition-all p-0 h-auto">
                      <a href={promo.link} target="_blank" rel="noopener noreferrer">
                        {promo.ctaText} <ArrowUpRight className="ml-1 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="-left-12 bg-white/80 backdrop-blur shadow-lg border-none hover:bg-white" />
          <CarouselNext className="-right-12 bg-white/80 backdrop-blur shadow-lg border-none hover:bg-white" />
        </div>
      </Carousel>
    </section>
  );
}

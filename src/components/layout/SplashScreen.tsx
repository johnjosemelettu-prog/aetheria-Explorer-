
'use client';

import { Backpack, Zap, Globe, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';

export function SplashScreen() {
  const { t } = useTranslation();
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    const destroyTimer = setTimeout(() => {
      setIsDestroyed(true);
    }, 1700);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  if (isDestroyed) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[101] flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-500 ease-in-out',
        isFadingOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'
      )}
    >
      <div className="flex flex-col items-center gap-10 animate-in fade-in zoom-in duration-1000">
        <div className="relative">
          <div className="absolute inset-0 bg-primary rounded-full blur-[80px] opacity-40 animate-pulse" />
          <div className="relative h-32 w-32 bg-white/5 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden">
            <Globe className="absolute h-24 w-24 text-white/5 animate-spin-slow" />
            <Backpack className="h-14 w-14 text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
            <div className="absolute -top-2 -right-2 h-12 w-12 bg-primary rounded-2xl flex items-center justify-center border-[6px] border-slate-950 shadow-2xl z-20">
              <Zap className="h-6 w-6 text-white fill-white animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -left-2 h-10 w-10 bg-secondary rounded-full flex items-center justify-center border-[6px] border-slate-950 shadow-xl z-20">
              <Users className="h-5 w-5 text-slate-950" strokeWidth={3} />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <span className="font-headline text-6xl font-black tracking-tighter text-white uppercase leading-none">
            AETHERIA<span className="text-accent italic">AI</span>
          </span>
          <span className="text-primary text-[10px] font-black tracking-[0.6em] uppercase opacity-60">Journey Synthesized</span>
        </div>
      </div>
      <div className="absolute bottom-16 w-full text-center px-4">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
          Initialising Aetheria Neural Grid...
        </p>
      </div>
    </div>
  );
}

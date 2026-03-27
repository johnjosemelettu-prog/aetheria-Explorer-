
'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';

export function SplashScreen() {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    const destroyTimer = setTimeout(() => {
      setIsDestroyed(true);
    }, 2000);

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
              'fixed inset-0 z-[101] flex flex-col items-center justify-center bg-slate-950 text-white transition-all duration-700 ease-in-out',
              isFadingOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'
          )}
      >
        {/* Background Neural Grid Simulation */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="flex flex-col items-center gap-12 animate-in fade-in zoom-in duration-1000">
          <BrandLogo size="xl" />

          <div className="flex flex-col items-center text-center space-y-4">
          <span className="font-headline text-6xl font-black tracking-tighter text-white uppercase leading-none italic">
            AETHERIA<span className="text-primary">AI</span>
          </span>
            <div className="flex flex-col items-center gap-2">
              <span className="text-primary text-[10px] font-black tracking-[0.6em] uppercase opacity-60">Journey Synthesized</span>
              <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40 rounded-full" />
            </div>
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

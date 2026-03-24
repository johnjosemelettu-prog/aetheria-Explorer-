
'use client';

import Image from 'next/image';
import { Backpack, Zap, Globe, Users, MountainSnow, Compass, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'admin' | 'partner';
  src?: string;
}

export function BrandLogo({ className, size = 'md', variant = 'default', src }: BrandLogoProps) {
  const containerSizes = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-11 w-11 rounded-2xl',
    lg: 'h-16 w-16 rounded-[1.5rem]',
    xl: 'h-32 w-32 rounded-[2rem]',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-14 w-14',
  };

  const bgColors = {
    default: 'bg-slate-950',
    admin: 'bg-slate-900',
    partner: 'bg-emerald-600',
  };

  // Fallback to a high-quality travel/AI themed image if no src is provided
  const logoSrc = src || "/logo.png";

  return (
    <div className={cn('relative group cursor-pointer', className)}>
      {/* Aura Glow Effect */}
      <div className={cn(
        "absolute inset-0 bg-primary/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-700",
        size === 'xl' && "blur-2xl opacity-40"
      )} />
      
      {/* Main Container */}
      <div className={cn(
        "relative flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-xl overflow-hidden border border-white/5",
        containerSizes[size],
        bgColors[variant]
      )}>
        {src ? (
          <Image 
            src={logoSrc} 
            alt="Logo" 
            fill 
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <>
            {/* Background Layer: The Mountain (Hiking) */}
            <MountainSnow className={cn(
              "absolute text-white/5 transition-transform duration-1000 group-hover:scale-125",
              size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-10 w-10' : size === 'lg' ? 'h-14 w-14' : 'h-28 w-28'
            )} />
            
            {/* Mid Layer: Compass Ring (Navigation) */}
            <Compass className={cn(
              "absolute text-white/10 animate-spin-slow",
              size === 'sm' ? 'h-10 w-10' : size === 'md' ? 'h-12 w-12' : size === 'lg' ? 'h-20 w-20' : 'h-40 w-40'
            )} />

            {/* Core Layer: The Backpack (Travel/Backpacking) */}
            <Backpack className={cn(
              "text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]",
              iconSizes[size]
            )} />
          </>
        )}

        {/* Accents: The Energy Node (Gen Z / AI) */}
        <div className={cn(
          "absolute bg-primary rounded-lg flex items-center justify-center border-2 border-slate-950 shadow-lg z-20 transition-all",
          size === 'sm' ? "-top-0.5 -right-0.5 h-3.5 w-3.5" : 
          size === 'md' ? "-top-1 -right-1 h-5 w-5" : 
          size === 'lg' ? "-top-1.5 -right-1.5 h-7 w-7" : 
          "-top-2 -right-2 h-12 w-12"
        )}>
          <Zap className={cn(
            "text-white fill-white animate-pulse",
            size === 'xl' ? 'h-6 w-6' : 'h-2.5 w-2.5'
          )} />
        </div>

        {/* Sparkle Nodes */}
        <Sparkles className={cn(
          "absolute text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          size === 'sm' ? "-bottom-0.5 -left-0.5 h-3 w-3" : 
          size === 'md' ? "-bottom-1 -left-1 h-4 w-4" : 
          size === 'lg' ? "-bottom-1.5 -left-1.5 h-6 w-6" : 
          "-bottom-2 -left-2 h-10 w-10"
        )} />
      </div>
    </div>
  );
}

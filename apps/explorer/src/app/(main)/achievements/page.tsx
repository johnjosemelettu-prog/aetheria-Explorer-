
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { allAchievements, Achievement } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, Trophy, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function AchievementCard({
  achievement,
  isUnlocked,
}: {
  achievement: Achievement;
  isUnlocked: boolean;
}) {
  const { t } = useTranslation();
  const Icon = (LucideIcons as any)[achievement.icon] || Lock;

  return (
    <Card
      className={cn(
        'transition-all duration-500 rounded-[2.5rem] border-none shadow-xl overflow-hidden group',
        isUnlocked
          ? 'bg-white hover:shadow-2xl hover:-translate-y-1'
          : 'bg-slate-50/50 opacity-60 grayscale'
      )}
    >
      <CardHeader className="p-8">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl transition-all shadow-inner',
              isUnlocked ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-slate-100 text-slate-300'
            )}
          >
            <Icon className="h-7 w-7" />
          </div>
          {isUnlocked ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[8px] uppercase tracking-widest px-3">
              <CheckCircle2 className="h-3 w-3 mr-1" /> UNLOCKED
            </Badge>
          ) : (
            <Badge variant="outline" className="border-slate-200 text-slate-300 font-black text-[8px] uppercase tracking-widest px-3">
              <Lock className="h-3 w-3 mr-1" /> LOCKED
            </Badge>
          )}
        </div>
        <CardTitle className="text-2xl font-black font-headline text-slate-900 mt-6 uppercase italic tracking-tighter">
          {t(`achievements.items.${achievement.id}.name` as any) || achievement.id.replace(/-/g, ' ')}
        </CardTitle>
        <CardDescription className="mt-2 text-slate-500 font-medium leading-relaxed italic">
          "{t(`achievements.items.${achievement.id}.description` as any) || 'Synthesis requirement pending.'}"
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function AchievementsPage() {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // In a real app, this would be fetched from Firestore
  const [unlockedIds] = useState([
    'first-flight',
    'culinary-explorer',
    'globetrotter',
  ]);

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="text-center mb-16 space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Legacy Protocol</Badge>
        <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
          Achievements
        </h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Earn high-fidelity medals by completing odyssey missions across the global grid.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={unlockedIds.includes(achievement.id)}
          />
        ))}
      </div>

      <footer className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between opacity-40 grayscale gap-8">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <p className="text-xs font-black uppercase tracking-widest">Season 01: The Path Finder</p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest">Rewards synthesized via Aetheria Grid</p>
        </div>
      </footer>
    </div>
  );
}

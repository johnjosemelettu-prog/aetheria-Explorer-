'use client';

import React, { useState } from 'react';
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
import { CheckCircle2, Lock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

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
        'transition-all duration-300',
        isUnlocked
          ? 'border-accent/50 bg-accent/5'
          : 'bg-muted/50 grayscale filter'
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              isUnlocked ? 'bg-accent/20 text-accent' : 'bg-muted-foreground/20 text-muted-foreground'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          {isUnlocked && (
            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t('achievements.unlocked')}</span>
            </div>
          )}
           {!isUnlocked && (
            <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>{t('achievements.locked')}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-xl">
          {t(`achievements.items.${achievement.id}.name`)}
        </CardTitle>
        <CardDescription className="mt-1">
          {t(`achievements.items.${achievement.id}.description`)}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export default function AchievementsPage() {
  const { t } = useTranslation();

  // In a real app, this would be fetched from Firestore, e.g., using useCollection
  const [unlockedIds] = useState([
    'first-flight',
    'culinary-explorer',
    'globetrotter',
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          {t('achievements.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('achievements.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={unlockedIds.includes(achievement.id)}
          />
        ))}
      </div>
    </div>
  );
}

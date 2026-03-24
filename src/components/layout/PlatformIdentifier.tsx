'use client';
import { usePlatform } from '@/hooks/use-platform';
import { useEffect } from 'react';

export const PlatformIdentifier = () => {
  const platform = usePlatform();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('ios', 'android', 'web');
    root.classList.add(platform);
  }, [platform]);

  return null;
};
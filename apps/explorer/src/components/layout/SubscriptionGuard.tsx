
'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePremiumStatus } from '@/hooks/use-premium-status';
import { canAccess, SubscriptionTier } from '@/lib/subscription-rules';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTier, isLoading } = usePremiumStatus();

  const isAllowed = canAccess(activeTier as SubscriptionTier, pathname);

  useEffect(() => {
    // We don't redirect automatically to give the user a chance to see the "Locked" state
    // and understand why they can't access the page.
    // However, if it's a critical page, we might want to redirect.
  }, [isAllowed, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black font-headline uppercase italic tracking-tighter">
            Premium Access Required
          </h2>
          <p className="text-slate-500 max-w-md mx-auto font-medium">
            This feature is reserved for our Voyager, Pathfinder, and Sovereign explorers. 
            Upgrade your subscription to unlock this trajectory.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Button asChild className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl">
            <Link href="/subscription">Upgrade Now</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl font-black uppercase tracking-widest border-2">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  Trophy, 
  Zap, 
  Package, 
  RotateCcw, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  Plane,
  CreditCard,
  Users,
  MapPin,
  ShieldAlert,
  Store,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection, serverTimestamp, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

export function SimulationTool() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: () => Promise<void>) => {
    if (!user) return;
    setIsLoading(id);
    try {
      await action();
      toast({ title: "Simulation Resolved", description: "System state has been updated successfully." });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: "Simulation Failed", description: "Internal database error." });
    } finally {
      setIsLoading(null);
    }
  };

  const fundWallet = async () => {
    if (!user || !firestore) return;
    const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD');
    setDocumentNonBlocking(walletRef, {
      currency: 'USD',
      balance: increment(10000),
      updatedAt: serverTimestamp()
    }, { merge: true });

    const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
    addDocumentNonBlocking(transRef, {
      type: 'credit',
      category: 'topup',
      amount: 10000,
      currency: 'USD',
      description: 'System Simulation Fund Injection',
      timestamp: serverTimestamp()
    });
  };

  const setRole = async (role: 'admin' | 'vendor' | 'user') => {
    if (!user || !firestore) return;
    const uid = user.uid;
    const userProfileRef = doc(firestore, 'userProfiles', uid);
    
    // 1. Update Profile Role field
    setDocumentNonBlocking(userProfileRef, {
      role: role,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Synchronize roles_admin node for security rules bypass
    const rolesAdminRef = doc(firestore, 'roles_admin', uid);
    if (role === 'admin') {
      setDocumentNonBlocking(rolesAdminRef, {
        userId: uid,
        email: user.email || 'admin@vibepack.ai',
        grantedAt: serverTimestamp()
      }, { merge: true });
    } else {
      deleteDocumentNonBlocking(rolesAdminRef);
    }
  };

  const setPlatinum = async () => {
    if (!user || !firestore) return;
    const loyaltyRef = doc(firestore, 'userProfiles', user.uid, 'loyalty', 'status');
    setDocumentNonBlocking(loyaltyRef, {
      points: 5000,
      tier: 'Platinum',
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const createEliteTrip = async () => {
    if (!user || !firestore) return;
    const tripRef = doc(collection(firestore, 'userProfiles', user.uid, 'itineraries'));
    setDocumentNonBlocking(tripRef, {
      id: tripRef.id,
      name: 'Global Odyssey (Test)',
      destination: 'Tokyo, Japan',
      startDate: '2025-01-01',
      endDate: '2025-01-14',
      status: 'active',
      subscriptionTier: 'elite',
      isGeneratedByAI: true,
      itinerarySummary: 'A high-stakes simulation of an elite level journey.',
      vibe: 'Luxurious and High-Tech',
      userId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const seedGroupEvent = async () => {
    if (!user || !firestore) return;
    const eventRef = doc(collection(firestore, 'destinationEvents'));
    const eventData = {
      id: eventRef.id,
      name: 'Sunset Rooftop Social (Test)',
      description: 'A simulated high-fidelity gathering for verified explorers.',
      location: 'Paris, 3rd District',
      startDateTime: '2026-06-15T18:00:00',
      maxParticipants: 20,
      participantIds: [user.uid],
      organizerId: user.uid,
      status: 'scheduled',
      vibe: 'Chic and Modern',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    setDocumentNonBlocking(eventRef, eventData, { merge: true });
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-white rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black font-headline flex items-center gap-2 text-slate-900">
            <ShieldAlert className="text-primary h-5 w-5" />
            Portal Access Node
          </CardTitle>
          <CardDescription>Switch between distinct app experiences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="default" 
            className="w-full justify-start h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold" 
            onClick={() => handleAction('admin', () => setRole('admin'))}
            disabled={!!isLoading}
          >
            {isLoading === 'admin' ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Promote to ADMIN Node
          </Button>
          <Button 
            variant="default" 
            className="w-full justify-start h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold" 
            onClick={() => handleAction('vendor', () => setRole('vendor'))}
            disabled={!!isLoading}
          >
            {isLoading === 'vendor' ? <Loader2 className="animate-spin mr-2" /> : <Store className="mr-2 h-4 w-4" />}
            Set Role: VENDOR
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 rounded-xl border-2 font-bold" 
            onClick={() => handleAction('user', () => setRole('user'))}
            disabled={!!isLoading}
          >
            {isLoading === 'user' ? <Loader2 className="animate-spin mr-2" /> : <UserIcon className="mr-2 h-4 w-4" />}
            Reset to EXPLORER
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-lg bg-white rounded-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black font-headline flex items-center gap-2 text-slate-900">
              <CreditCard className="text-primary h-4 w-4" />
              Financial & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start h-11 rounded-xl text-xs font-bold border-2" 
              onClick={() => handleAction('wallet', fundWallet)}
              disabled={!!isLoading}
            >
              {isLoading === 'wallet' ? <Loader2 className="animate-spin mr-2" /> : <Wallet className="mr-2 h-4 w-4" />}
              Inject $10,000 USD Assets
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start h-11 rounded-xl text-xs font-bold border-2" 
              onClick={() => handleAction('loyalty', setPlatinum)}
              disabled={!!isLoading}
            >
              {isLoading === 'loyalty' ? <Loader2 className="animate-spin mr-2" /> : <Trophy className="mr-2 h-4 w-4" />}
              Set Platinum Status
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white rounded-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black font-headline flex items-center gap-2 text-slate-900">
              <Sparkles className="text-accent h-4 w-4" />
              Trip & Social
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start h-11 rounded-xl text-xs font-bold border-2" 
              onClick={() => handleAction('trip', createEliteTrip)}
              disabled={!!isLoading}
            >
              {isLoading === 'trip' ? <Loader2 className="animate-spin mr-2" /> : <Plane className="mr-2 h-4 w-4" />}
              Seed Elite Odyssey
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start h-11 rounded-xl text-xs font-bold border-2" 
              onClick={() => handleAction('event', seedGroupEvent)}
              disabled={!!isLoading}
            >
              {isLoading === 'event' ? <Loader2 className="animate-spin mr-2" /> : <Users className="mr-2 h-4 w-4" />}
              Seed Destination Event
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

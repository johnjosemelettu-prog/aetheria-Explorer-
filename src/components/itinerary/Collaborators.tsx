'use client';

import React, { useState } from 'react';
import { useFirestore, updateDocumentNonBlocking, useUser } from '@/firebase';
import { doc, arrayUnion } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { findTravelerMatches } from '@/ai/flows/find-traveler-matches-flow';

interface CollaboratorsProps {
  itineraryId: string;
  memberIds: string[];
  tripVibe?: string;
}

export function Collaborators({ itineraryId, memberIds, tripVibe }: CollaboratorsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isFinding, setIsFinding] = useState(false);

  // In a real app, you would fetch collaborator profiles based on memberIds
  const getInitials = (id: string) => (id.substring(0, 2) || 'U').toUpperCase();
  
  const handleInvite = async () => {
      if (!inviteEmail || !user || !firestore) return;

      setIsInviting(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate network call

      toast({
          title: "Invitation Sent",
          description: `An invitation to collaborate has been dispatched to ${inviteEmail}.`,
      });
      setInviteEmail('');
      setIsInviting(false);
  }

  const handleFindCollaborator = async () => {
    if (!tripVibe || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Requirement Missing',
        description: 'Vibe context and database sync required to find matching travelers.',
      });
      return;
    }
    setIsFinding(true);
    try {
      const matches = await findTravelerMatches({
        vibe: tripVibe,
        flight: 'N/A',
        terminal: 'N/A',
      });

      const newCollaborator = matches.find(m => !memberIds.includes(m.id));

      if (newCollaborator) {
        const itineraryRef = doc(firestore, 'userProfiles', user.uid, 'itineraries', itineraryId);
        updateDocumentNonBlocking(itineraryRef, {
          members: arrayUnion(newCollaborator.id)
        });
        toast({
          title: "Collaborator Node Connected",
          description: `${newCollaborator.name} has been added to the odyssey.`,
        });
      } else {
        toast({
          title: 'Grid Scanned',
          description: 'All potential matches are already in this odyssey.',
        });
      }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Grid Disruption',
            description: 'Could not find matching travelers at this time.'
        });
    } finally {
        setIsFinding(false);
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-slate-100 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h4 className="font-black font-headline text-2xl text-slate-900 uppercase tracking-tighter italic">Collaborators</h4>
        <div className="flex -space-x-3">
          {memberIds.map(id => (
            <Avatar key={id} className="h-10 w-10 border-4 border-white shadow-lg ring-1 ring-slate-100">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${id}`} />
              <AvatarFallback className="bg-slate-900 text-white font-black text-[10px]">{getInitials(id)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invite Collaborator</p>
            <div className="flex items-center gap-2">
            <Input 
                placeholder="traveler@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
                className="h-12 rounded-xl bg-slate-50 border-none font-bold"
            />
            <Button onClick={handleInvite} disabled={!inviteEmail.trim() || isInviting} className="h-12 rounded-xl px-6 font-bold shadow-lg shadow-primary/20">
                {isInviting ? "..." : <Send className="h-4 w-4" />}
            </Button>
            </div>
        </div>
        <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Find Matching Vibe</p>
            <Button onClick={handleFindCollaborator} variant="outline" disabled={isFinding || !tripVibe} className="w-full h-12 rounded-xl border-2 font-black">
                {isFinding ? "Searching Grid..." : <><Sparkles className="mr-2 h-4 w-4" /> Find Fellow Explorers</>}
            </Button>
        </div>
      </div>
    </div>
  );
}

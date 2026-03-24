
'use client';

import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Pencil, 
  Globe, 
  Zap, 
  Building2, 
  Loader2, 
  Search
} from 'lucide-react';
import { useFirestore, useCollection, setDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

export default function PromotionsAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const promosQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'promotions') : null),
    [firestore]
  );
  const { data: promotions, isLoading } = useCollection(promosQuery);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    partnerName: '',
    partnerType: 'cobrand' as 'cobrand' | 'affiliate' | 'tourism_dept',
    link: '',
    ctaText: 'Learn More',
    badgeText: 'Featured',
    locationContext: 'global'
  });

  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      const promoId = editingId || doc(collection(firestore, 'promotions')).id;
      const promoRef = doc(firestore, 'promotions', promoId);
      
      await setDocumentNonBlocking(promoRef, {
        ...formData,
        id: promoId,
        updatedAt: serverTimestamp(),
        imageUrl: `https://picsum.photos/seed/promo-${promoId}/800/400`
      }, { merge: true });

      toast({ title: editingId ? "Promotion Updated" : "Promotion Created" });
      setIsDialogOpen(false);
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (promo: any) => {
    setEditingId(promo.id);
    setFormData({
      title: promo.title,
      description: promo.description,
      partnerName: promo.partnerName,
      partnerType: promo.partnerType,
      link: promo.link,
      ctaText: promo.ctaText,
      badgeText: promo.badgeText,
      locationContext: promo.locationContext || 'global'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const promoRef = doc(firestore, 'promotions', id);
    deleteDocumentNonBlocking(promoRef);
    toast({ title: "Promotion Removed", description: "Node has been cleared from the marketplace." });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      partnerName: '',
      partnerType: 'cobrand',
      link: '',
      ctaText: 'Learn More',
      badgeText: 'Featured',
      locationContext: 'global'
    });
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
            <Megaphone className="text-primary h-8 w-8" />
            Promotions Architect
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage context-aware partner spotlights and tourism ads.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Synthesize Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black font-headline uppercase tracking-tighter italic">Promotion Logic</DialogTitle>
              <DialogDescription>Define the parameters for this promotional node.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Promotion Title</label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Visit France: The Art of Zen" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Partner Entity</label>
                <Input value={formData.partnerName} onChange={e => setFormData({...formData, partnerName: e.target.value})} placeholder="e.g., JNTO Japan" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Node Architecture</label>
                <Select value={formData.partnerType} onValueChange={(v: any) => setFormData({...formData, partnerType: v})}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl border-none">
                    <SelectItem value="cobrand" className="rounded-xl p-3 font-bold">Cobrand (Zap)</SelectItem>
                    <SelectItem value="affiliate" className="rounded-xl p-3 font-bold">Affiliate (Building)</SelectItem>
                    <SelectItem value="tourism_dept" className="rounded-xl p-3 font-bold">Tourism Dept (Globe)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Context Anchor</label>
                <Input value={formData.locationContext} onChange={e => setFormData({...formData, locationContext: e.target.value})} placeholder="e.g., Tokyo or global" className="rounded-xl h-12" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Marketing Synthesis</label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Evocative description for the explorer..." className="rounded-xl p-4 font-medium" rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target URL</label>
                <Input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="https://partner-node.com/promo" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CTA Label</label>
                <Input value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} placeholder="e.g., Explore Nodes" className="rounded-xl h-12" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="rounded-xl h-12 px-6 font-bold" onClick={() => setIsDialogOpen(false)}>Abort</Button>
              <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20">
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : "Authorize Synthesis"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions?.map((promo) => (
            <Card key={promo.id} className="group border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white flex flex-col hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="relative h-48 w-full overflow-hidden">
                <Image src={promo.imageUrl} alt={promo.title} fill className="object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 border-none font-black text-[9px] px-3 py-1 flex items-center gap-1.5 shadow-sm">
                  {promo.partnerType === 'tourism_dept' && <Globe className="h-3 w-3 text-primary" />}
                  {promo.partnerType === 'cobrand' && <Zap className="h-3 w-3 text-accent" />}
                  {promo.partnerType === 'affiliate' && <Building2 className="h-3 w-3 text-blue-500" />}
                  {promo.partnerName}
                </Badge>
              </div>
              <CardHeader className="p-8 pb-2">
                <CardTitle className="text-xl font-black font-headline truncate uppercase italic tracking-tighter">{promo.title}</CardTitle>
                <CardDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target: {promo.locationContext}</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-4 flex-grow">
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium italic">"{promo.description}"</p>
              </CardContent>
              <CardFooter className="p-8 pt-0 gap-2">
                <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold border-2" onClick={() => handleEdit(promo)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Node
                </Button>
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/5" onClick={() => handleDelete(promo.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          {(!promotions || promotions.length === 0) && (
            <div className="md:col-span-3 py-32 text-center opacity-30 grayscale flex flex-col items-center gap-6">
              <Megaphone className="h-32 w-32 text-primary" />
              <div className="space-y-2">
                <h2 className="text-2xl font-black font-headline uppercase tracking-tighter">No Active Promotions</h2>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Initialize your first partner node to begin monetization.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

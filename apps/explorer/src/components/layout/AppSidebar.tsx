
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  Smartphone, 
  ShoppingBasket, 
  ShoppingBag, 
  Wallet, 
  BarChart3, 
  Camera, 
  Globe, 
  MapPin, 
  History, 
  Radio, 
  Wifi, 
  Clapperboard, 
  Wand2, 
  BookOpen, 
  Siren, 
  ShieldAlert, 
  ShieldCheck, 
  Plane, 
  Signal, 
  Leaf, 
  Backpack, 
  Activity, 
  Zap, 
  Dna,
  LayoutDashboard,
  Tag
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from '@/components/ui/sidebar';
import { BrandLogo } from './BrandLogo';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { UserNav } from './UserNav';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const menuGroups = [
    {
      label: t('header.categories.orchestration'),
      items: [
        { label: t('header.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { label: t('header.aiItinerary'), href: '/itinerary-generator', icon: Bot },
        { label: t('header.pathfinder'), href: '/pathfinder', icon: Smartphone },
        { label: t('header.vibeMarketplace'), href: '/marketplace', icon: ShoppingBasket },
        { label: t('header.vibeShopping'), href: '/store', icon: Tag },
        { label: t('header.bookingHub'), href: '/booking', icon: ShoppingBag },
        { label: t('header.wallet'), href: '/wallet', icon: Wallet },
        { label: t('header.budgetSynthesis'), href: '/budget-synthesis', icon: BarChart3 },
      ]
    },
    {
      label: t('header.categories.intelligence'),
      items: [
        { label: t('header.visionHub'), href: '/scanner', icon: Camera },
        { label: t('header.intelligenceCenter'), href: '/guide', icon: Globe },
        { label: t('header.arWayfinding'), href: '/ar-wayfinding', icon: MapPin },
        { label: t('header.localLegends'), href: '/local-legends', icon: History },
        { label: t('header.culturalPulse'), href: '/cultural-pulse', icon: Radio },
        { label: t('header.audioGuide'), href: '/audio-guide', icon: Wifi },
      ]
    },
    {
      label: t('header.categories.studios'),
      items: [
        { label: t('header.tripOdyssey'), href: '/video-teaser', icon: Clapperboard },
        { label: t('header.postcardStudio'), href: '/postcard-studio', icon: Wand2 },
        { label: t('header.heritageMirror'), href: '/heritage-mirror', icon: History },
        { label: t('header.journal'), href: '/journal', icon: BookOpen },
      ]
    },
    {
      label: t('header.categories.utility'),
      items: [
        { label: t('header.sos'), href: '/sos', icon: Siren },
        { label: t('header.insurance'), href: '/insurance', icon: ShieldAlert },
        { label: t('header.visaArchitect'), href: '/visa-architect', icon: ShieldCheck },
        { label: t('header.flightStatus'), href: '/flight-status', icon: Plane },
        { label: t('header.esim'), href: '/esim', icon: Signal },
        { label: t('header.carbonSynthesis'), href: '/carbon-synthesis', icon: Leaf },
        { label: t('header.packingassistant'), href: '/packing-assistant', icon: Backpack },
      ]
    }
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-100 bg-white/80 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <BrandLogo size="sm" />
          <div className="flex flex-col items-start leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-headline text-lg font-black tracking-tighter uppercase leading-none text-foreground">
              AETHERIA<span className="text-primary italic">AI</span>
            </span>
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-0.5 whitespace-nowrap">Journey Synthesized</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        {menuGroups.map((group, idx) => (
          <SidebarGroup key={idx} className="mb-6">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-2 mb-2">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-primary" : "text-slate-400")} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 border-t border-slate-50">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <UserNav />
          <div className="flex flex-col items-start leading-none group-data-[collapsible=icon]:hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Session Verified</p>
            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-2 w-2" /> Neural Link Active
            </p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

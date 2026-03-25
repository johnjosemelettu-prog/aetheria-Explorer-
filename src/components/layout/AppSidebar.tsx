'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Backpack,
  Bot,
  Camera,
  Clapperboard,
  Dna,
  Globe,
  History,
  Lock,
  MapPin,
  MessageCircle,
  MousePointer2,
  Music,
  PanelLeft,
  Plane,
  Plus,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  Signal,
  Smartphone,
  Siren,
  Tag,
  Trophy,
  Users,
  UtensilsCrossed,
  Wallet,
  Wand2,
  Zap,
  BookOpen,
  Briefcase,
  Leaf,
  BarChart3,
  Heart,
  ChefHat,
  Activity,
  Home,
  User,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Bell,
  Mail,
  Calendar,
  FileText,
  Info,
  Star,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  Timer,
  Radar,
  Play,
  Presentation,
  Wifi,
  Brain,
  Scale,
  X,
  CreditCard, // New Icon
  Languages, // New Icon
  Film, // New Icon
  Book, // New Icon
  AlertCircle, // New Icon
  Newspaper, // New Icon
  CalendarDays, // New Icon
  Clock, // New Icon
  Gift, // New Icon
  Handshake, // New Icon
  Ticket
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useUser } from '@/firebase';
import { usePremiumStatus } from '@/hooks/use-premium-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Define menu items with access control properties
const menuItems = (t: any, hasPremiumPass: boolean, isAdmin: boolean, isVendor: boolean) => [
  {
    id: 'main',
    label: t('sidebar.main'),
    items: [
      { href: '/dashboard', label: t('header.dashboard'), icon: LayoutDashboard, isFree: true },
      { href: '/profile', label: t('header.profile'), icon: User, isFree: true },
      { href: '/trips', label: t('header.trips'), icon: Globe, isFree: true },
      { href: '/manage-bookings', label: 'Manage Bookings', icon: Ticket, isFree: true }, // Added Manage Bookings
      { href: '/wallet', label: t('header.wallet'), icon: Wallet, isFree: true },
      { href: '/cart', label: t('header.cart'), icon: ShoppingBag, isFree: true },
      { href: '/achievements', label: t('header.achievements'), icon: Award, isFree: true },
    ],
  },
  {
    id: 'orchestration',
    label: t('header.categories.orchestration'),
    items: [
      { href: '/itinerary-generator', label: t('header.aiItinerary'), icon: Bot, isFree: true },
      { href: '/pathfinder', label: t('header.pathfinder'), icon: Smartphone, isFree: false },
      { href: '/marketplace', label: t('header.vibeMarketplace'), icon: ShoppingBasket, isFree: true },
      { href: '/store', label: t('header.vibeShopping'), icon: Tag, isFree: true },
      { href: '/booking', label: t('header.bookingHub'), icon: ShoppingBag, isFree: true },
      { href: '/budget-synthesis', label: t('header.budgetSynthesis'), icon: BarChart3, isFree: true },
      { href: '/corporate', label: t('header.corporate'), icon: Briefcase, isFree: false },
      { href: '/scan-and-pay', label: t('header.scanAndPay'), icon: CreditCard, isFree: true },
    ],
  },
  {
    id: 'intelligence',
    label: t('header.categories.intelligence'),
    items: [
      { href: '/scanner', label: t('header.visionHub'), icon: Camera, isFree: false },
      { href: '/guide', label: t('header.intelligenceCenter'), icon: Globe, isFree: false },
      { href: '/ar-wayfinding', label: t('header.arWayfinding'), icon: MapPin, isFree: false },
      { href: '/local-legends', label: t('header.localLegends'), icon: History, isFree: false },
      { href: '/cultural-pulse', label: t('header.culturalPulse'), icon: Radio, isFree: false },
      { href: '/audio-guide', label: t('header.audioGuide'), icon: Wifi, isFree: false },
      { href: '/mood-synthesis', label: t('header.moodSynthesis'), icon: Brain, isFree: false },
      { href: '/translator', label: t('header.translator'), icon: Languages, isFree: true },
    ],
  },
  {
    id: 'studios',
    label: t('header.categories.studios'),
    items: [
      { href: '/video-teaser', label: t('header.tripOdyssey'), icon: Clapperboard, isFree: false },
      { href: '/postcard-studio', label: t('header.postcardStudio'), icon: Wand2, isFree: false },
      { href: '/heritage-mirror', label: t('header.heritageMirror'), icon: History, isFree: false },
      { href: '/journal', label: t('header.journal'), icon: BookOpen, isFree: true },
      { href: '/soundtrack', label: t('header.auraBeats'), icon: Music, isFree: false },
      { href: '/vr-previews', label: t('header.vrPreviews'), icon: Eye, isFree: false },
      { href: '/video-brochure', label: t('header.videoBrochure'), icon: Film, isFree: false },
      { href: '/brochure-document', label: t('header.brochureDocument'), icon: Book, isFree: true },
    ],
  },
  {
    id: 'utility',
    label: t('header.categories.utility'),
    items: [
      { href: '/safety', label: t('header.safety'), icon: Siren, isFree: true },
      { href: '/sos', label: t('header.sos'), icon: AlertCircle, isFree: true },
      { href: '/insurance', label: t('header.insurance'), icon: ShieldAlert, isFree: false },
      { href: '/visa-architect', label: t('header.visaArchitect'), icon: ShieldCheck, isFree: false },
      { href: '/flight-status', label: t('header.flightStatus'), icon: Plane, isFree: true },
      { href: '/esim', label: t('header.esim'), icon: Signal, isFree: true },
      { href: '/carbon-synthesis', label: t('header.carbonSynthesis'), icon: Leaf, isFree: false },
      { href: '/packing-assistant', label: t('header.packingassistant'), icon: Backpack, isFree: true },
      { href: '/biometric-sync', label: t('header.equilibriumSync'), icon: Heart, isFree: false },
      { href: '/flavor-dna', label: t('header.flavorDna'), icon: ChefHat, isFree: false },
      { href: '/news', label: t('header.news'), icon: Newspaper, isFree: true },
      { href: '/events', label: t('header.events'), icon: CalendarDays, isFree: true },
      { href: '/jet-lag', label: t('header.jetLag'), icon: Clock, isFree: true },
      { href: '/wrapped', label: t('header.wrapped'), icon: Gift, isFree: true },
      { href: '/brochure', label: t('header.brochure'), icon: Presentation, isFree: true },
      { href: '/partners', label: t('header.partners'), icon: Handshake, isFree: true },
      { href: '/gift-odyssey', label: t('header.giftOdyssey'), icon: Gift, isFree: true },
      { href: '/street-food-roulette', label: t('header.streetFoodRoulette'), icon: ChefHat, isFree: true },
    ],
  },
  {
    id: 'legal',
    label: t('sidebar.legal'),
    items: [
      { href: '/terms', label: t('footer.terms'), icon: FileText, isFree: true },
      { href: '/privacy', label: t('footer.privacyProtocol'), icon: Lock, isFree: true },
      { href: '/data-security', label: t('footer.dataSecurity'), icon: ShieldAlert, isFree: true },
      { href: '/legal', label: t('footer.legalHub'), icon: Scale, isFree: true },
    ],
  },
  {
    id: 'support',
    label: t('sidebar.support'),
    items: [
      { href: '/contact', label: t('footer.supportHub'), icon: MessageCircle, isFree: true },
      { href: '/faq', label: t('sidebar.faq'), icon: HelpCircle, isFree: true },
    ],
  },
  {
    id: 'admin',
    label: t('sidebar.admin'),
    requiresAdmin: true,
    items: [
      { href: '/admin/dashboard', label: t('sidebar.adminDashboard'), icon: LayoutDashboard, isFree: false, requiresAdmin: true },
      { href: '/admin/users', label: t('sidebar.manageUsers'), icon: Users, isFree: false, requiresAdmin: true },
      { href: '/admin/settings', label: t('sidebar.adminSettings'), icon: Settings, isFree: false, requiresAdmin: true },
    ],
  },
  {
    id: 'vendor',
    label: t('sidebar.vendor'),
    requiresVendor: true,
    items: [
      { href: '/vendor/dashboard', label: t('sidebar.vendorDashboard'), icon: LayoutDashboard, isFree: false, requiresVendor: true },
      { href: '/vendor/products', label: t('sidebar.manageProducts'), icon: ShoppingBag, isFree: false, requiresVendor: true },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, isAdmin, isVendor } = useUser();
  const { hasPremiumPass } = usePremiumStatus();
  const { setOpenMobile } = useSidebar();

  const filteredMenuItems = menuItems(t, hasPremiumPass, isAdmin, isVendor).map(group => {
    if (group.requiresAdmin && !isAdmin) return null;
    if (group.requiresVendor && !isVendor) return null;

    const filteredItems = group.items.filter(item => {
      if (item.requiresAdmin && !isAdmin) return false;
      if (item.requiresVendor && !isVendor) return false;
      if (!item.isFree && !hasPremiumPass) return false;
      return true;
    });

    return { ...group, items: filteredItems };
  }).filter(Boolean);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 duration-500" />
            <div className={cn(
              "relative h-11 w-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-xl overflow-hidden",
              isAdmin ? "bg-slate-900" : isVendor ? "bg-emerald-600" : "bg-slate-950"
            )}>
              <Globe className="absolute h-10 w-10 text-white/5 animate-spin-slow" />
              <Backpack className="h-6 w-6 text-white relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]" />
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-lg flex items-center justify-center border-2 border-slate-950 shadow-lg z-20">
                <Zap className="h-2.5 w-2.5 text-white fill-white animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -left-1 h-5 w-5 bg-secondary rounded-full flex items-center justify-center border-2 border-slate-950 shadow-md z-20">
                <Users className="h-2.5 w-2.5 text-slate-950" strokeWidth={3} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-headline text-lg font-black tracking-tighter uppercase leading-none text-foreground">
              AETHERIA<span className="text-accent italic">AI</span>
            </span>
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-0.5">Journey Synthesized</span>
          </div>
        </Link>
        <SidebarTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <PanelLeft className="h-4 w-4" />
          </Button>
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarInput placeholder={t('sidebar.search')} />

      <SidebarContent>
        {filteredMenuItems.map(group => (
          <SidebarGroup key={group.id} defaultOpen={true}>
            <SidebarGroupLabel>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href} onClick={() => setOpenMobile(false)}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {!item.isFree && !hasPremiumPass && (
                          <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {!user ? (
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full rounded-xl h-10 font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> {t('login.signInButton')}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-xl h-10 font-black uppercase tracking-widest text-xs border-2 border-border hover:bg-primary/5 shadow-xl active:scale-95 transition-all">
              <Link href="/signup">
                <UserPlus className="mr-2 h-4 w-4" /> {t('login.signUpLink')}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-card shadow-lg">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="bg-muted text-muted-foreground font-black text-xs uppercase">{user.email?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-black text-sm text-foreground leading-none">{user.displayName || user.email}</p>
                <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[7px] py-0 px-1.5 mt-1">
                  {hasPremiumPass ? t('sidebar.premiumUser') : t('sidebar.freeUser')}
                </Badge>
              </div>
            </div>
            <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground">
              <Link href="/logout">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
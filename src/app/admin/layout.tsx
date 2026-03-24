
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { doc } from 'firebase/firestore'
import { 
  AlertTriangle, 
  Home, 
  Users, 
  DollarSign, 
  Zap, 
  Megaphone, 
  History, 
  Activity,
  LayoutDashboard,
  Backpack,
  ShieldAlert,
  Globe
} from 'lucide-react'

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { UserNav } from '@/components/layout/UserNav'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isUserLoading } = useUser()
  const firestore = useFirestore()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid) : null),
    [user, firestore]
  )
  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc(userProfileRef)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [isUserLoading, user, router])

  if (isUserLoading || isProfileLoading || !mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-64 w-full max-w-md rounded-3xl" />
      </div>
    )
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center bg-destructive p-10 text-white">
            <AlertTriangle className="mx-auto h-16 w-16 text-white" />
            <CardTitle className="mt-4 text-3xl font-black font-headline uppercase tracking-tighter">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-10">
            <p className="text-slate-500 font-medium">
              You do not have the required administrative clearance to access this sector.
            </p>
            <Button asChild className="mt-8 w-full rounded-xl h-12 font-bold">
              <Link href="/">Return to Odyssey</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const menuItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'User Hub', href: '/admin/users', icon: Users },
    { label: 'Promotions', href: '/admin/promotions', icon: Megaphone },
    { label: 'Audit Ledger', href: '/admin/transactions', icon: History },
    { label: 'Finance', href: '/admin/finance', icon: DollarSign },
    { label: 'Error Logs', href: '/admin/error-logs', icon: ShieldAlert },
    { label: 'AI Health', href: '/admin/ai-insights', icon: Activity },
  ]

  return (
    <SidebarProvider>
      <Sidebar className="border-r-0 shadow-xl">
        <SidebarHeader className="p-6">
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative h-10 w-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg overflow-hidden transition-all group-hover:scale-110">
              <Globe className="absolute h-8 w-8 text-white/5 animate-spin-slow" />
              <Backpack className="h-5 w-5 text-white relative z-10" />
              <div className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 bg-primary rounded-md flex items-center justify-center border border-slate-950 shadow-md z-20">
                <Zap className="h-2.5 w-2.5 text-white fill-white" />
              </div>
              <div className="absolute -bottom-0.5 -left-0.5 h-4 w-4 bg-secondary rounded-full flex items-center justify-center border border-slate-950 z-20">
                <Users className="h-2 w-2 text-slate-950" strokeWidth={3} />
              </div>
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-headline text-sm font-black tracking-tighter uppercase italic text-foreground">
                AETHERIA<span className="text-accent">AI</span>
              </span>
              <span className="text-[6px] font-black uppercase tracking-[0.3em] text-primary">ADMIN CONSOLE</span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator className="mx-4 opacity-50" />
        <SidebarContent className="px-4 mt-4">
          <SidebarMenu className="gap-2">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild className="rounded-xl h-11 font-bold" isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-slate-50/50">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-md px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Aetheria AI Console</h1>
          </div>
          <UserNav />
        </header>
        <main className="min-h-[calc(100vh-4rem)] p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

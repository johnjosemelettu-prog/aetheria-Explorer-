'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getAuth, signOut } from 'firebase/auth'
import { doc } from 'firebase/firestore'
import { LogOut, User as UserIcon, Shield, Store, CreditCard, Crown, LayoutDashboard, Backpack } from 'lucide-react'
import { useState, useEffect } from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'

export function UserNav() {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid) : null),
    [user, firestore]
  )
  const { data: userProfile } = useDoc(userProfileRef)

  const handleLogout = async () => {
    const auth = getAuth();
    if (!auth) return;
    
    try {
      await signOut(auth)
      toast({
        title: t('userNav.toast.logoutSuccessTitle' as any) || 'Session Terminated',
        description: t('userNav.toast.logoutSuccessDescription' as any) || 'Your Aetheria node is now offline.',
      })
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: 'destructive',
        title: 'Sign Out Error',
        description: 'Failed to terminate the neural link.',
      })
    }
  }

  if (!user || !hasMounted) {
    return null
  }

  const getInitials = (email: string | null) => {
    if (!email) return 'U'
    return email[0].toUpperCase()
  }

  const subscriptionTier = (userProfile?.subscriptionTier as string) || 'free';
  const role = userProfile?.role || 'user';

  const isAdminPortal = pathname.startsWith('/admin');
  const isVendorPortal = pathname.startsWith('/vendor');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-transparent hover:border-primary/20 transition-all">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userProfile?.photoURL || user.photoURL || ''} alt={user.email ?? ''} />
            <AvatarFallback className="bg-slate-900 text-white font-black">{getInitials(user.email)}</AvatarFallback>
          </Avatar>
          {subscriptionTier !== 'free' && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-sm">
              <Crown className="h-2 w-2 text-white fill-white" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-[2rem] shadow-2xl border-none glass" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black leading-none uppercase tracking-tighter italic">{userProfile?.firstName} {userProfile?.lastName}</p>
              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">{role}</Badge>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border/50 mx-2" />
        
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 focus:bg-primary/5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Explorer Hub</span>
            </Link>
          </DropdownMenuItem>

          {role === 'admin' && !isAdminPortal && (
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 focus:bg-primary/5">
              <Link href="/admin" className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Admin Console</span>
              </Link>
            </DropdownMenuItem>
          )}

          {role === 'vendor' && !isVendorPortal && (
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 focus:bg-emerald-500/5">
              <Link href="/vendor/dashboard" className="flex items-center gap-3">
                <Store className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-widest">Partner Hub</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 focus:bg-primary/5">
            <Link href="/profile" className="flex items-center gap-3">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] font-black uppercase tracking-widest">Identity Node</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border/50 mx-2" />
        
        <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer p-3 text-destructive focus:text-destructive focus:bg-destructive/5 transition-colors">
          <LogOut className="h-4 w-4 mr-3" />
          <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

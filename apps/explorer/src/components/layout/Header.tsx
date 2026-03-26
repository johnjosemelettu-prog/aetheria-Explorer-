
"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  ChevronDown,
  ChevronLeft,
  Globe,
  Wallet,
  Search,
  ShoppingBasket,
  Check,
  Siren,
  ShieldCheck,
  Menu,
  X,
  ArrowUpRight,
  Scissors
} from "lucide-react"
import { collection } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useFirebase, useMemoFirebase, useCollection } from "@/firebase"
import { UserNav } from "./UserNav"
import { useTranslation, availableLanguages } from "@/lib/i18n"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BrandLogo } from "./BrandLogo"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname()
  const router = useRouter()
  const { user, firestore } = useFirebase()
  const { t, language, setLanguage } = useTranslation()

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const cartQuery = useMemoFirebase(
      () => (user && firestore ? collection(firestore, "userProfiles", user.uid, "cart") : null),
      [user, firestore]
  );
  const { data: cartItems } = useCollection(cartQuery);
  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const isHome = pathname === "/";
  const isNotDashboard = pathname !== "/dashboard";

  return (
      <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
              "fixed top-0 z-50 w-full py-2 transition-all duration-500",
              scrolled ? "py-1" : "py-2"
          )}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className={cn(
              "flex h-12 items-center px-4 rounded-full transition-all duration-500 border",
              scrolled
                  ? "bg-slate-950/95 backdrop-blur-2xl border-white/20 shadow-2xl"
                  : isHome
                      ? "bg-slate-950/60 backdrop-blur-md border-white/20 shadow-none"
                      : "bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm"
          )}>
            {mounted ? (
                <>
                  <div className="flex items-center gap-2">
                    {!isHome && (
                        <SidebarTrigger className={cn(
                            "h-10 w-10 rounded-full transition-all shadow-sm border",
                            isHome || scrolled ? "border-white/10 hover:bg-white/10 text-white" : "border-slate-100 hover:bg-primary/5 hover:text-primary"
                        )} />
                    )}

                    {isNotDashboard && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-10 w-10 rounded-full shadow-lg transition-all active:scale-90",
                                isHome || scrolled ? "bg-white text-black hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"
                            )}
                            onClick={() => router.back()}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                    )}

                    <Link href="/" className="flex items-center gap-3 ml-2 group">
                      <BrandLogo size="sm" src="/logo.png" />
                      <div className="hidden sm:flex flex-col items-start leading-none group-hover:translate-x-1 transition-transform">
                    <span className={cn(
                        "font-headline text-sm font-black tracking-tighter uppercase italic leading-none",
                        isHome || scrolled ? "text-white" : "text-foreground"
                    )}>
                      AETHERIA<span className="text-primary">AI</span>
                    </span>
                        <span className={cn(
                            "text-[6px] font-black uppercase tracking-[0.3em] mt-0.5",
                            isHome || scrolled ? "text-white/40" : "text-muted-foreground"
                        )}>Journey Synthesized</span>
                      </div>
                    </Link>
                  </div>

                  <div className="flex-1" />

                  <div className="flex items-center justify-end gap-2 sm:gap-4">
                    {user && (
                        <div className="flex items-center gap-2">
                          <Link href="/sos">
                            <Button variant="destructive" size="sm" className="rounded-full px-3 sm:px-4 h-9 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-red-500/20 animate-pulse">
                              <Siren className="sm:mr-1.5 h-3.5 w-3.5" /> <span className="hidden sm:inline">SOS</span>
                            </Button>
                          </Link>
                          <Link href="/wallet">
                            <Button variant="ghost" size="icon" className={cn(
                                "rounded-full h-10 w-10 relative group",
                                isHome || scrolled ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                            )}>
                              <Wallet className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </Button>
                          </Link>
                          <Link href="/digital-tailor">
                            <Button variant="ghost" size="icon" className={cn(
                                "rounded-full h-10 w-10 relative group",
                                isHome || scrolled ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                            )}>
                              <Scissors className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </Button>
                          </Link>
                          <Link href="/cart">
                            <Button variant="ghost" size="icon" className={cn(
                                "rounded-full h-10 w-10 relative group",
                                isHome || scrolled ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                            )}>
                              <ShoppingBasket className="h-5 w-5 group-hover:scale-110 transition-transform" />
                              {cartCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-lg text-white">{cartCount}</span>}
                            </Button>
                          </Link>
                        </div>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn(
                            "rounded-full h-10 w-10 group",
                            isHome || scrolled ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                        )}>
                          <Globe className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-slate-950/90 backdrop-blur-2xl p-2 rounded-[2rem] shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                        <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase text-primary tracking-widest">Linguistic Grid</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10 mx-2" />
                        {availableLanguages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={cn(
                                    "rounded-xl cursor-pointer flex justify-between items-center px-4 py-3 transition-all mb-1 last:mb-0",
                                    language === lang.code ? "bg-primary text-white font-black" : "text-white/60 hover:bg-white/5 hover:text-white"
                                )}
                            >
                              <span className="font-black text-[9px] uppercase tracking-widest">{lang.name}</span>
                              {language === lang.code && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {user ? <UserNav /> : (
                        <div className="flex items-center gap-2">
                          <Button asChild variant="ghost" className={cn(
                              "flex font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-full transition-all",
                              isHome || scrolled
                                  ? "text-white hover:bg-white/20 hover:scale-105"
                                  : "text-slate-900 hover:bg-slate-100 hover:scale-105"
                          )}>
                            <Link href="/login">LOGIN</Link>
                          </Button>
                          <Button asChild className="rounded-full shadow-2xl animate-glow-pulse font-black uppercase tracking-widest text-[9px] h-10 px-6 bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all">
                            <Link href="/signup">SIGN UP</Link>
                          </Button>
                        </div>
                    )}
                  </div>
                </>
            ) : (
                <div className="h-10 w-full bg-muted/20 animate-pulse rounded-full" />
            )}
          </div>
        </div>
      </motion.header>
  )
}

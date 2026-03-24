
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  ArrowRightLeft, 
  Plus, 
  History, 
  TrendingUp, 
  CreditCard, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Globe,
  Download,
  Search,
  Filter,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, increment, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import Link from 'next/link';

const exchangeRates: Record<string, number> = {
  'USD': 1,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 150.45,
  'INR': 82.95,
  'THB': 35.85,
};

const currencyNames: Record<string, string> = {
  'USD': 'United States Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'JPY': 'Japanese Yen',
  'INR': 'Indian Rupee',
  'THB': 'Thai Baht',
};

const currencySymbols: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'INR': '₹',
  'THB': '฿',
};

export default function WalletPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpCurrency, setTopUpCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);

  const [exchangeFrom, setExchangeFrom] = useState('USD');
  const [exchangeTo, setExchangeTo] = useState('EUR');
  const [exchangeAmount, setExchangeAmount] = useState('');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid) : null),
    [user, firestore]
  )
  const { data: userProfile } = useDoc(userProfileRef);

  useEffect(() => {
    if (userProfile?.defaultCurrency) {
      setTopUpCurrency(userProfile.defaultCurrency);
      setExchangeFrom(userProfile.defaultCurrency);
    }
  }, [userProfile]);

  const walletsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'wallets');
    },
    [user, firestore]
  );
  const { data: wallets, isLoading: isWalletsLoading } = useCollection(walletsQuery);

  const transactionsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'userProfiles', user.uid, 'transactions'), orderBy('timestamp', 'desc'), limit(50));
    },
    [user, firestore]
  );
  const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsQuery);

  const handleTopUp = async () => {
    if (!user || !firestore || !topUpAmount) return;
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const amount = parseFloat(topUpAmount);
    const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', topUpCurrency);
    setDocumentNonBlocking(walletRef, {
      currency: topUpCurrency,
      balance: increment(amount),
      updatedAt: serverTimestamp()
    }, { merge: true });

    const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
    addDocumentNonBlocking(transRef, {
      type: 'credit',
      category: 'topup',
      amount: amount,
      currency: topUpCurrency,
      description: `Fund Node: Credit via VISA •••• 4242`,
      timestamp: serverTimestamp()
    });

    toast({
      title: "Assets Synthesized",
      description: `Successfully credited ${topUpAmount} ${topUpCurrency} to your node.`,
    });
    
    setIsTopUpOpen(false);
    setTopUpAmount('');
    setIsProcessing(false);
  };

  const handleExchange = async () => {
    if (!user || !firestore || !exchangeAmount) return;
    const amount = parseFloat(exchangeAmount);
    const fromWallet = wallets?.find(w => w.currency === exchangeFrom);
    
    if (!fromWallet || fromWallet.balance < amount) {
      toast({
        variant: 'destructive',
        title: "Insufficient Liquidity",
        description: `Your ${exchangeFrom} node has insufficient balance.`,
      });
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const rateFrom = exchangeRates[exchangeFrom];
    const rateTo = exchangeRates[exchangeTo];
    const convertedAmount = (amount / rateFrom) * rateTo;

    const fromRef = doc(firestore, 'userProfiles', user.uid, 'wallets', exchangeFrom);
    setDocumentNonBlocking(fromRef, {
      balance: increment(-amount),
      updatedAt: serverTimestamp()
    }, { merge: true });

    const toRef = doc(firestore, 'userProfiles', user.uid, 'wallets', exchangeTo);
    setDocumentNonBlocking(toRef, {
      currency: exchangeTo,
      balance: increment(convertedAmount),
      updatedAt: serverTimestamp()
    }, { merge: true });

    const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions');
    addDocumentNonBlocking(transRef, {
      type: 'debit',
      category: 'exchange',
      amount: amount,
      currency: exchangeFrom,
      description: `Asset Swap: ${exchangeFrom} → ${exchangeTo}`,
      timestamp: serverTimestamp()
    });
    addDocumentNonBlocking(transRef, {
      type: 'credit',
      category: 'exchange',
      amount: convertedAmount,
      currency: exchangeTo,
      description: `Asset Swap: Received ${exchangeTo}`,
      timestamp: serverTimestamp()
    });

    toast({
      title: "Exchange Resolved",
      description: `Swapped ${amount} ${exchangeFrom} for ${convertedAmount.toFixed(2)} ${exchangeTo}.`,
    });

    setIsExchangeOpen(false);
    setExchangeAmount('');
    setIsProcessing(false);
  };

  const baseCurrency = userProfile?.defaultCurrency || 'USD';
  const baseRate = exchangeRates[baseCurrency] || 1;
  const baseSymbol = currencySymbols[baseCurrency] || '$';

  const totalBalanceBase = wallets?.reduce((acc, wallet) => {
    const rate = exchangeRates[wallet.currency] || 1;
    return acc + (wallet.balance / rate) * baseRate;
  }, 0) || 0;

  if (!hasMounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">{t('wallet.badge')}</Badge>
          <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none">
            {t('wallet.title')}
          </h1>
          <p className="mt-4 text-lg text-slate-500 font-medium">
            {t('wallet.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-xl h-12 px-6 font-black border-2 border-primary text-primary hover:bg-primary/5 shadow-lg">
            <Link href="/scan-and-pay">
              <QrCode className="mr-2 h-5 w-5" /> {t('wallet.scanToPay')}
            </Link>
          </Button>

          <Dialog open={isExchangeOpen} onOpenChange={setIsExchangeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-2">
                <ArrowRightLeft className="mr-2 h-4 w-4" /> {t('wallet.exchangeBtn')}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black font-headline">Swap Currencies</DialogTitle>
                <DialogDescription>Convert your balances instantly at market rates.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">From</label>
                  <div className="flex gap-2">
                    <Select value={exchangeFrom} onValueChange={setExchangeFrom}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(exchangeRates).map(curr => (
                          <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="rounded-xl h-12 flex-1" 
                      value={exchangeAmount}
                      onChange={(e) => setExchangeAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <ArrowDownLeft className="h-4 w-4 text-slate-400 rotate-45" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">To</label>
                  <div className="flex gap-2">
                    <Select value={exchangeTo} onValueChange={setExchangeTo}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(exchangeRates).map(curr => (
                          <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="rounded-xl h-12 flex-1 bg-slate-50 border border-slate-200 flex items-center px-4 font-bold text-slate-400">
                      {exchangeAmount ? ((parseFloat(exchangeAmount) / exchangeRates[exchangeFrom]) * exchangeRates[exchangeTo]).toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex justify-between text-xs font-bold text-primary">
                    <span>Current Rate</span>
                    <span>1 {exchangeFrom} = {(exchangeRates[exchangeTo] / exchangeRates[exchangeFrom]).toFixed(4)} {exchangeTo}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleExchange} className="w-full h-12 rounded-xl font-bold" disabled={isProcessing || !exchangeAmount}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : "Confirm Swap"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-6 font-bold shadow-xl shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> {t('wallet.topUpBtn')}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black font-headline">Add Funds</DialogTitle>
                <DialogDescription>Deposit money into your multicurrency account.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">Currency</label>
                  <Select value={topUpCurrency} onValueChange={setTopUpCurrency}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(exchangeRates).map(curr => (
                        <SelectItem key={curr} value={curr}>{curr} - {currencyNames[curr]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">Amount</label>
                  <Input 
                    type="number" 
                    placeholder="Enter amount..." 
                    className="rounded-xl h-12" 
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Method</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <CreditCard className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">•••• 4242</p>
                      <p className="text-xs text-slate-400">VISA Card</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Change</Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleTopUp} className="w-full h-12 rounded-xl font-bold" disabled={isProcessing || !topUpAmount}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : "Authorize Deposit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-white/80 backdrop-blur-md shadow-xl border-none h-16 p-1.5 rounded-3xl">
          <TabsTrigger value="overview" className="rounded-[1.25rem] px-8 font-black text-sm uppercase tracking-tighter data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
            <Wallet className="mr-2 h-4 w-4" /> {t('wallet.overviewTab')}
          </TabsTrigger>
          <TabsTrigger value="statement" className="rounded-[1.25rem] px-8 font-black text-sm uppercase tracking-tighter data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
            <History className="mr-2 h-4 w-4" /> {t('wallet.statementTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <TrendingUp className="h-32 w-32" />
                </div>
                <CardHeader className="p-10 pb-4 relative z-10">
                  <CardDescription className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">{t('wallet.totalAssets')}</CardDescription>
                  <CardTitle className="text-6xl font-black font-headline mt-2 leading-none">
                    {baseSymbol}{totalBalanceBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest">{t('wallet.usdEquivalent', { currency: baseCurrency })}</p>
                </CardHeader>
                <CardContent className="p-10 pt-16 relative z-10">
                  <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white leading-tight">{t('wallet.proactiveSavings')}</p>
                      <p className="text-xs text-slate-400">{t('wallet.savingsDesc', { amount: '$42.50' })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-3xl p-8 bg-amber-50">
                <h3 className="font-headline text-xl font-black text-amber-900 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" /> {t('wallet.localIntel')}
                </h3>
                <p className="text-sm text-amber-800/70 font-medium leading-relaxed">
                  {t('wallet.localIntelDesc', { location: 'Japan' })}
                </p>
                <Button variant="link" className="p-0 h-auto mt-4 text-amber-900 font-black flex items-center gap-2">
                  {t('wallet.autoSwapBtn')} <ChevronRight className="h-4 w-4" />
                </Button>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-slate-800">{t('wallet.accountsTitle')}</h2>
                <Button variant="ghost" size="sm" className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('wallet.sortByBalance')} <RefreshCw className="ml-2 h-3 w-3" /></Button>
              </div>

              {isWalletsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wallets && wallets.length > 0 ? (
                    wallets.map((wallet) => (
                      <Card key={wallet.id} className={cn(
                        "border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-3xl p-6 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 group",
                        wallet.currency === baseCurrency ? "ring-2 ring-primary ring-offset-4" : ""
                      )}>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-colors duration-500",
                              wallet.currency === baseCurrency ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-primary group-hover:text-white"
                            )}>
                              {wallet.currency}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900">{currencyNames[wallet.currency]}</h4>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{wallet.currency}</p>
                                {wallet.currency === baseCurrency && <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[8px] px-1.5 h-4 uppercase">Base Node</Badge>}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold uppercase text-[9px]">{t('wallet.authorized')}</Badge>
                        </div>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl font-black font-headline text-slate-900">
                            {currencySymbols[wallet.currency] || ''}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 hover:bg-slate-100">
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 hover:bg-slate-100">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="md:col-span-2 py-20 text-center opacity-30 grayscale flex flex-col items-center">
                      <Wallet className="h-20 w-20 mb-4" />
                      <p className="text-2xl font-black font-headline">{t('wallet.noWallets')}</p>
                      <p className="text-sm font-medium">{t('wallet.addFundsDesc')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="statement">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-10 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <CardTitle className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tighter">{t('wallet.statementTitle')}</CardTitle>
                  <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">{t('wallet.statementDesc')}</CardDescription>
                </div>
                <div className="flex gap-3">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                    <Input placeholder="Search ledger..." className="pl-10 h-11 w-64 rounded-xl border-slate-100 bg-slate-50 focus:bg-white" />
                  </div>
                  <Button variant="outline" className="rounded-xl h-11 border-slate-100 font-bold">
                    <Filter className="mr-2 h-4 w-4 text-slate-400" /> {t('wallet.filter')}
                  </Button>
                  <Button variant="outline" className="rounded-xl h-11 border-slate-100 font-bold">
                    <Download className="mr-2 h-4 w-4 text-slate-400" /> {t('wallet.export')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isTransactionsLoading ? (
                <div className="p-10 space-y-4">
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {transactions.map((trans) => (
                    <div key={trans.id} className="p-8 flex items-center gap-8 hover:bg-slate-50/50 transition-all group">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                        trans.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'
                      )}>
                        {trans.type === 'credit' ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-black uppercase tracking-tighter",
                            trans.category === 'booking' ? "text-primary border-primary/20 bg-primary/5" :
                            trans.category === 'exchange' ? "text-blue-600 border-blue-200 bg-blue-50" :
                            trans.category === 'topup' ? "text-green-600 border-green-200 bg-green-50" :
                            "text-slate-400 border-slate-200 bg-slate-50"
                          )}>
                            {trans.category}
                          </Badge>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {trans.timestamp?.toDate ? format(trans.timestamp.toDate(), 'MMM dd, HH:mm') : 'Recently'}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-slate-900 mt-1 truncate">{trans.description}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-2xl font-black font-headline",
                          trans.type === 'credit' ? "text-green-600" : "text-slate-900"
                        )}>
                          {trans.type === 'credit' ? '+' : '-'}{trans.amount.toFixed(2)} <span className="text-sm text-slate-400 font-bold">{trans.currency}</span>
                        </p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Tx Ref: {trans.id.substring(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-20" />
                    <History className="h-32 w-32 text-primary relative" />
                  </div>
                  <h2 className="text-3xl font-black font-headline text-slate-900 mt-6 uppercase tracking-tighter">{t('wallet.noHistory')}</h2>
                  <p className="text-lg font-medium text-slate-500 max-sm">{t('wallet.noHistoryDesc')}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-center">
              <p className="text-xs font-bold text-slate-400 text-center">
                {t('wallet.footerNotice')}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

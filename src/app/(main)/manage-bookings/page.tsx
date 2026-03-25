'use client'

import React, { useState } from 'react'
import { useUser, useFirestore, useMemoFirebase, useCollection, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase'
import { collection, query, orderBy, doc, serverTimestamp, increment } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Plane, Calendar as CalendarIcon, XCircle, RefreshCw, Loader2, ShieldAlert, ArrowRight, DollarSign, Wallet } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'

export default function ManageBookingsPage() {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()

  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [modifyDate, setModifyDate] = useState('')

  const bookingsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'userProfiles', user.uid, 'flightBookings'), orderBy('bookedAt', 'desc')) : null),
    [user, firestore]
  )
  const { data: bookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery)

  const walletsQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return collection(firestore, 'userProfiles', user.uid, 'wallets');
    },
    [user, firestore]
  )
  const { data: wallets } = useCollection(walletsQuery)
  const usdWallet = wallets?.find(w => w.currency === 'USD')

  const CANCELLATION_FEE_PERCENTAGE = 0.20 // 20%
  const MODIFICATION_FEE = 50

  const processWalletTransaction = (amount: number, type: 'credit' | 'debit', category: string, description: string) => {
    if (!user || !firestore) return;
    
    const walletRef = doc(firestore, 'userProfiles', user.uid, 'wallets', 'USD')
    setDocumentNonBlocking(walletRef, {
      balance: increment(amount),
      updatedAt: serverTimestamp()
    }, { merge: true })

    const transRef = collection(firestore, 'userProfiles', user.uid, 'transactions')
    addDocumentNonBlocking(transRef, {
      type,
      category,
      amount: Math.abs(amount),
      currency: 'USD',
      description,
      timestamp: serverTimestamp()
    })
  }

  const handleCancelBooking = async (booking: any) => {
    if (!user || !firestore) return

    setIsProcessing(booking.id)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const refundAmount = booking.totalPrice * (1 - CANCELLATION_FEE_PERCENTAGE)
      const feeAmount = booking.totalPrice * CANCELLATION_FEE_PERCENTAGE

      const bookingRef = doc(firestore, 'userProfiles', user.uid, 'flightBookings', booking.id)
      await setDocumentNonBlocking(bookingRef, {
        bookingStatus: 'cancelled',
        refundAmount: refundAmount,
        cancellationFee: feeAmount,
        cancelledAt: serverTimestamp()
      }, { merge: true })

      processWalletTransaction(refundAmount, 'credit', 'refund', `Refund (less 20% fee) for cancelled flight ${booking.confirmationCode}`);

      toast({
        title: "Booking Cancelled",
        description: `Successfully cancelled. $${refundAmount.toFixed(2)} refunded to your wallet.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: "An error occurred while processing your cancellation.",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleModifyBooking = async (booking: any) => {
    if (!user || !firestore || !modifyDate) return

    if (!usdWallet || usdWallet.balance < MODIFICATION_FEE) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Funds',
        description: `A $${MODIFICATION_FEE} modification fee is required.`,
      });
      return;
    }

    setIsProcessing(booking.id + '-modify')
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const bookingRef = doc(firestore, 'userProfiles', user.uid, 'flightBookings', booking.id)
      await setDocumentNonBlocking(bookingRef, {
        bookingStatus: 'modified',
        departureDateTime: modifyDate,
        modificationFee: MODIFICATION_FEE,
        modifiedAt: serverTimestamp()
      }, { merge: true })

      processWalletTransaction(-MODIFICATION_FEE, 'debit', 'fee', `Modification fee for flight ${booking.confirmationCode}`);

      toast({
        title: "Booking Modified",
        description: `Flight rescheduled to ${modifyDate}. $${MODIFICATION_FEE} fee applied.`,
      })
      setModifyDate('')
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Modification Failed",
        description: "An error occurred while processing your modification.",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  if (isBookingsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px] mb-4">
            Itinerary Control
          </Badge>
          <h1 className="font-headline text-4xl font-black tracking-tight md:text-5xl text-slate-900 leading-none uppercase italic">
            Manage Bookings
          </h1>
          <p className="mt-4 text-slate-500 font-medium max-w-xl">
            Review your active reservations, modify dates, or process cancellations according to service provider terms.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-lg border border-slate-100">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Node Assets</p>
            <p className="text-2xl font-black text-slate-900 font-headline">
              ${usdWallet?.balance.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking: any) => {
            const isCancelled = booking.bookingStatus === 'cancelled';
            return (
              <Card key={booking.id} className={cn(
                "border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-500",
                isCancelled ? "bg-slate-50 opacity-70 grayscale-[0.5]" : "bg-white"
              )}>
                <div className="bg-slate-950 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg",
                      isCancelled ? "bg-slate-800 text-slate-400" : "bg-primary text-white"
                    )}>
                      <Plane className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black font-headline tracking-tighter">{booking.airlineName}</h3>
                        <Badge className={cn(
                          "font-black uppercase text-[8px] px-2 border-none",
                          isCancelled ? "bg-red-500 text-white" : "bg-emerald-500 text-white",
                          booking.bookingStatus === 'modified' ? "bg-amber-500 text-white" : ""
                        )}>
                          {booking.bookingStatus}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Confirmation: <span className="text-white">{booking.confirmationCode}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</p>
                    <p className="text-2xl font-black font-headline text-accent">${booking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
                
                <CardContent className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-6">
                      <div className="flex items-center gap-4 text-slate-600">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Departure</p>
                          <p className="text-xl font-black text-slate-900">{booking.departureAirportCode}</p>
                          <p className="text-sm font-bold flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> {booking.departureDateTime}</p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-slate-300 mx-4" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arrival</p>
                          <p className="text-xl font-black text-slate-900">{booking.arrivalAirportCode}</p>
                          {booking.returnDateTime && (
                            <p className="text-sm font-bold flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Return: {booking.returnDateTime}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Passengers</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.passengers.map((p: string, i: number) => (
                            <Badge key={i} variant="outline" className="font-bold text-slate-700 bg-slate-50 border-slate-200">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {!isCancelled && (
                      <div className="flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full rounded-xl font-bold border-2 hover:bg-slate-50 h-12">
                              <RefreshCw className="mr-2 h-4 w-4" /> Modify Date
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                            <div className="bg-slate-900 p-6 text-white">
                              <DialogTitle className="text-2xl font-black font-headline italic uppercase">Modify Reservation</DialogTitle>
                              <DialogDescription className="text-slate-400 font-medium mt-2">
                                Service provider terms mandate a <span className="font-bold text-white">${MODIFICATION_FEE} change fee</span> for altering travel dates.
                              </DialogDescription>
                            </div>
                            <div className="p-6 space-y-6">
                              <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">New Departure Date</Label>
                                <Input 
                                  type="date" 
                                  className="h-12 rounded-xl font-bold" 
                                  value={modifyDate}
                                  onChange={(e) => setModifyDate(e.target.value)}
                                  min={format(new Date(), 'yyyy-MM-dd')}
                                />
                              </div>
                              <Alert className="bg-amber-50 border-none text-amber-900 rounded-2xl">
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="font-black uppercase tracking-tighter text-xs">Provider Policy</AlertTitle>
                                <AlertDescription className="text-[10px] font-bold mt-1">
                                  Modifications are subject to availability. The ${MODIFICATION_FEE} fee will be deducted directly from your USD wallet.
                                </AlertDescription>
                              </Alert>
                            </div>
                            <DialogFooter className="p-6 pt-0 sm:justify-between flex-row items-center border-t border-slate-100">
                              <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modification Fee</p>
                                <p className="text-xl font-black text-slate-900">${MODIFICATION_FEE.toFixed(2)}</p>
                              </div>
                              <Button 
                                onClick={() => handleModifyBooking(booking)} 
                                disabled={isProcessing === booking.id + '-modify' || !modifyDate}
                                className="rounded-xl font-black px-8 shadow-lg"
                              >
                                {isProcessing === booking.id + '-modify' ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm Change"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" className="w-full rounded-xl font-bold shadow-lg shadow-red-500/20 h-12">
                              <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                            <div className="bg-red-500 p-6 text-white">
                              <DialogTitle className="text-2xl font-black font-headline italic uppercase">Cancel Reservation</DialogTitle>
                              <DialogDescription className="text-white/80 font-medium mt-2">
                                Please review the cancellation terms before proceeding. This action cannot be reversed.
                              </DialogDescription>
                            </div>
                            <div className="p-6 space-y-6">
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="font-bold text-slate-500">Original Price</span>
                                  <span className="font-black">${booking.totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-red-600">
                                  <span className="font-bold">Provider Cancellation Fee (20%)</span>
                                  <span className="font-black">-${(booking.totalPrice * CANCELLATION_FEE_PERCENTAGE).toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-slate-200 my-2" />
                                <div className="flex justify-between text-lg text-emerald-600">
                                  <span className="font-black uppercase tracking-tighter">Total Refund</span>
                                  <span className="font-black">+${(booking.totalPrice * (1 - CANCELLATION_FEE_PERCENTAGE)).toFixed(2)}</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 font-medium text-center">
                                The refund will be credited immediately to your Smart Wallet node.
                              </p>
                            </div>
                            <DialogFooter className="p-6 pt-0">
                              <Button 
                                variant="destructive"
                                onClick={() => handleCancelBooking(booking)} 
                                disabled={isProcessing === booking.id}
                                className="w-full rounded-xl font-black h-12 text-lg shadow-lg"
                              >
                                {isProcessing === booking.id ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirm Cancellation"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                    {isCancelled && (
                       <div className="flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 opacity-60">
                         <XCircle className="h-12 w-12 text-red-500 mb-2" />
                         <p className="font-black text-slate-900 uppercase tracking-tighter">Voided</p>
                         <p className="text-[10px] font-bold text-slate-500 text-center mt-1">Refund processed to wallet.</p>
                       </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-40 grayscale">
            <Plane className="h-24 w-24 text-slate-400 mb-6" />
            <h2 className="text-3xl font-black font-headline uppercase tracking-tighter text-slate-600">No active bookings</h2>
            <p className="text-sm font-bold uppercase tracking-widest mt-2">Initialize a reservation from the Booking Hub.</p>
          </div>
        )}
      </div>
    </div>
  )
}

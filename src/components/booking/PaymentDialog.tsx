'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CreditCard, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '../ui/separator'
import { useTranslation } from '@/lib/i18n'

const paymentSchema = z.object({
  cardholderName: z.string().min(2, 'Please enter a valid name.'),
  cardNumber: z
    .string()
    .regex(
      /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
      'Please enter a valid card number.'
    ),
  expiryDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/,
      'Please use MM/YY format.'
    ),
  cvc: z.string().regex(/^[0-9]{3,4}$/, 'Please enter a valid CVC.'),
})

interface PaymentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  hotelName: string
  price: number
}

export function PaymentDialog({
  isOpen,
  onOpenChange,
  hotelName,
  price,
}: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  })

  async function handlePayment(paymentMethod: 'card' | 'google') {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    onOpenChange(false)
    form.reset()
    toast({
      title: t('payment.toast.successTitle'),
      description: t('payment.toast.successDescription', { hotelName: hotelName, paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 'Google Pay' }),
    })
  }

  function onCardSubmit(values: z.infer<typeof paymentSchema>) {
    console.log('Card values', values)
    handlePayment('card')
  }

  function onGooglePaySubmit() {
    handlePayment('google')
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('payment.title')}</DialogTitle>
          <DialogDescription>
            {t('payment.description', { hotelName, price })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Button
            variant="outline"
            className="w-full h-12 border-black/50"
            onClick={onGooglePaySubmit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <p>{t('payment.payWith')}</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="54px"
                  fill="#000000"
                >
                  <path
                    d="M11.59,16.14L12,15.71L12.41,16.14C12.79,16.5 13.4,16.5 13.79,16.14L14.21,15.71L17.5,12.41C17.89,12.03 17.89,11.4 17.5,11L16.09,9.59C15.71,9.21 15.09,9.21 14.7,9.59L12,12.29L9.29,9.59C8.9,9.21 8.28,9.21 7.9,9.59L6.5,11C6.1,11.4 6.1,12.03 6.5,12.41L11.59,16.14M20,8.09V15.91C20,17 19.04,18 17.93,18H6.07C4.96,18 4,17 4,15.91V8.09C4,7 4.96,6 6.07,6H17.93C19.04,6 20,7 20,8.09M21.09,10.5L19,12.59V8.09C19,7.5 18.5,7 17.93,7H6.07C5.5,7 5,7.5 5,8.09V12.59L2.91,10.5C2.53,10.13 1.9,10.13 1.5,10.5L0.5,11.5C-0.17,12.17 -0.17,13.21 0.5,13.88L4.29,17.67C4.68,18.06 5.31,18.06 5.7,17.67L6.79,16.59L7.21,17C7.59,17.37 8.21,17.37 8.59,17L12,13.59L15.41,17C15.79,17.37 16.41,17.37 16.79,17L17.21,16.59L18.29,17.67C18.68,18.06 19.31,18.06 19.7,17.67L23.5,13.88C24.17,13.21 24.17,12.17 23.5,11.5L22.5,10.5C22.1,10.13 21.47,10.13 21.09,10.5Z"
                    fill="black"
                  />
                </svg>
              </div>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('payment.payWithCard')}
              </span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onCardSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payment.cardholderName')}</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payment.cardNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder="•••• •••• •••• ••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payment.expiryDate')}</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payment.cvc')}</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('payment.processing')}
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('payment.payAmount', { price })}
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

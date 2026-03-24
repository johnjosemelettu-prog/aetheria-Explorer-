'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  useUser,
  useFirestore,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { collection, doc } from 'firebase/firestore'
import { type InventoryItem } from './InventoryTable'
import { type WithId } from '@/firebase/firestore/use-collection'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Switch } from '../ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  size: z.string().min(1, 'Please select a size.'),
  color: z.string().min(2, 'Color is required.'),
  rentalPricePerDay: z.coerce
    .number()
    .min(0, 'Price must be a positive number.'),
  isAvailable: z.boolean(),
})

export function InventoryForm({ itemToEdit, onSuccess }: InventoryFormProps) {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: itemToEdit?.name ?? '',
      category: itemToEdit?.category ?? '',
      size: itemToEdit?.size ?? '',
      color: itemToEdit?.color ?? '',
      rentalPricePerDay: itemToEdit?.rentalPricePerDay ?? 0,
      isAvailable: itemToEdit?.isAvailable ?? true,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'System Node Offline',
        description: 'Unable to connect to the inventory grid.',
      })
      return
    }

    const itemData: InventoryItem = {
      ...values,
      vendorId: user.uid,
    }

    if (itemToEdit) {
      // Update existing item
      const itemRef = doc(firestore, 'inventoryItems', itemToEdit.id)
      updateDocumentNonBlocking(itemRef, itemData)
      toast({ title: 'Item Updated', description: `${itemData.name} has been updated.` })
    } else {
      // Add new item
      const collectionRef = collection(firestore, 'inventoryItems')
      addDocumentNonBlocking(collectionRef, itemData)
      toast({ title: 'Item Added', description: `${itemData.name} has been added to your inventory.` })
    }

    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Linen Blazer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Coat">Coat</SelectItem>
                    <SelectItem value="Jacket">Jacket</SelectItem>
                    <SelectItem value="Blazer">Blazer</SelectItem>
                    <SelectItem value="Shirt">Shirt</SelectItem>
                    <SelectItem value="Trousers">Trousers</SelectItem>
                    <SelectItem value="Dress">Dress</SelectItem>
                    <SelectItem value="Accessory">Accessory</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size Node</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="One Size">One Size</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Color Palette</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Midnight Blue" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="rentalPricePerDay"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Rental/Day</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Availability Node</FormLabel>
                <FormDescription>
                  Toggle if this item is ready for synthesis.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">
          {itemToEdit ? "Authorize Update" : "Authorize Addition"}
        </Button>
      </form>
    </Form>
  )
}

interface InventoryFormProps {
  itemToEdit?: WithId<InventoryItem>
  onSuccess: () => void
}

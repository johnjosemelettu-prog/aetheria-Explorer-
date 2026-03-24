'use client'

import { collection, query, where } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import {
  useFirestore,
  useCollection,
  useUser,
  useMemoFirebase,
} from '@/firebase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ItemActions } from './ItemActions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InventoryForm } from './InventoryForm'
import { type WithId } from '@/firebase/firestore/use-collection'
import { useTranslation } from '@/lib/i18n'

// This is a placeholder type. In a real app, you'd import this from your entity definitions.
export interface InventoryItem {
  name: string
  category: string
  size: string
  color: string
  rentalPricePerDay: number
  isAvailable: boolean
  imageUrl?: string
  vendorId: string
}

export function InventoryTable() {
  const { user } = useUser()
  const firestore = useFirestore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<
    WithId<InventoryItem> | undefined
  >(undefined)
  const { t } = useTranslation()
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => { setHasMounted(true) }, []);

  const inventoryQuery = useMemoFirebase(
    () => {
      if (!user || !firestore) return null;
      return query(
        collection(firestore, 'inventoryItems'),
        where('vendorId', '==', user.uid)
      );
    },
    [firestore, user]
  )

  const { data: items, isLoading } = useCollection<InventoryItem>(
    inventoryQuery
  )

  const handleAddItem = () => {
    setSelectedItem(undefined)
    setDialogOpen(true)
  }

  const handleEditItem = (item: WithId<InventoryItem>) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
  }

  if (!hasMounted || isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddItem}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price/Day</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items &&
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>${item.rentalPricePerDay.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.isAvailable ? 'default' : 'secondary'}
                      className={
                        item.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {item.isAvailable ? "Available" : "Rented"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ItemActions item={item} onEdit={handleEditItem} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedItem ? "Edit Item Node" : "Add Inventory Node"}
          </DialogTitle>
          <DialogDescription>
            {selectedItem
              ? "Update item parameters in the inventory grid."
              : "Initialize a new item for the Digital Tailor."}
          </DialogDescription>
        </DialogHeader>
        <InventoryForm
          key={selectedItem?.id} // Re-mount form on item change
          itemToEdit={selectedItem}
          onSuccess={closeDialog}
        />
      </DialogContent>
    </Dialog>
  )
}

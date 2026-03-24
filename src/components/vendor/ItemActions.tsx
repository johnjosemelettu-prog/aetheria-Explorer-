
'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  deleteDocumentNonBlocking,
  useFirestore,
} from '@/firebase'
import { WithId } from '@/firebase/firestore/use-collection'
import { useTranslation } from '@/lib/i18n'
import { doc } from 'firebase/firestore'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { InventoryItem } from './InventoryTable'

interface ItemActionsProps {
  item: WithId<InventoryItem>
  onEdit: (item: WithId<InventoryItem>) => void
}

export function ItemActions({ item, onEdit }: ItemActionsProps) {
  const firestore = useFirestore()
  const { t } = useTranslation()

  const handleDelete = () => {
    if (!firestore) return;
    const itemRef = doc(firestore!, 'inventoryItems', item.id)
    deleteDocumentNonBlocking(itemRef)
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t('vendor.itemActions.edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('vendor.itemActions.delete')}
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('vendor.itemActions.deleteDialogTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('vendor.itemActions.deleteDialogDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('vendor.itemActions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
          >
            {t('vendor.itemActions.continue')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

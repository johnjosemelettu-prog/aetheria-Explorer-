'use client'

import { doc } from 'firebase/firestore'

import { setDocumentNonBlocking, useFirestore } from '@/firebase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n'

interface RoleSwitcherProps {
  userId: string
  currentRole: 'admin' | 'user' | 'vendor'
}

export function RoleSwitcher({ userId, currentRole }: RoleSwitcherProps) {
  const firestore = useFirestore()
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleRoleChange = (newRole: 'admin' | 'user' | 'vendor') => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'System Node Offline',
        description: 'The identity ledger is currently unreachable.',
      });
      return;
    }
    
    const userProfileRef = doc(firestore, 'userProfiles', userId)
    setDocumentNonBlocking(userProfileRef, { role: newRole }, { merge: true })
    toast({
      title: 'Role Updated',
      description: `User role has been set to ${newRole}.`,
    })
  }

  return (
    <Select onValueChange={handleRoleChange} defaultValue={currentRole}>
      <SelectTrigger className="w-[110px]">
        <SelectValue placeholder="Set Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">Explorer</SelectItem>
        <SelectItem value="vendor">Partner</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  )
}

'use client'

import { collection } from 'firebase/firestore'
import { format } from 'date-fns'

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { RoleSwitcher } from './RoleSwitcher'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useTranslation } from '@/lib/i18n'

export function UserTable() {
  const firestore = useFirestore()
  const usersRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'userProfiles') : null),
    [firestore]
  )
  const { data: users, isLoading } = useCollection(usersRef)
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-none">
            <TableHead className="font-black uppercase tracking-widest text-[10px] h-14 pl-8">{t('admin.userTable.userHeader')}</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px] h-14">{t('admin.userTable.emailHeader')}</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px] h-14">{t('admin.userTable.dateJoinedHeader')}</TableHead>
            <TableHead className="text-right font-black uppercase tracking-widest text-[10px] h-14 pr-8">{t('admin.userTable.roleHeader')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users &&
            users.map((user) => (
              <TableRow key={user.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="font-medium py-6 pl-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                      <AvatarFallback className="bg-primary text-white font-black text-xs">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <span className="font-black text-slate-900 leading-none uppercase italic tracking-tighter">
                        {user.firstName || ''} {user.lastName || ''}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Node: {user.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-500">{user.email}</TableCell>
                <TableCell className="text-sm font-medium text-slate-500">
                  {user.dateJoined?.toDate
                    ? format(user.dateJoined.toDate(), 'PPP')
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right pr-8">
                  <RoleSwitcher userId={user.id} currentRole={user.role} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}

'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InventoryTable } from '@/components/vendor/InventoryTable'
import { useTranslation } from '@/lib/i18n'
import { Shirt } from 'lucide-react'

export default function InventoryPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt /> {t('vendor.inventory.title')}
          </CardTitle>
          <CardDescription>
            {t('vendor.inventory.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryTable />
        </CardContent>
      </Card>
    </div>
  )
}

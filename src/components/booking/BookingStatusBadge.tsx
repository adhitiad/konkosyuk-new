import { Badge } from '#/components/ui/badge'
import type { StatusBooking } from '#/generated/prisma/client.js'

const STATUS_VARIANTS: Record<
  StatusBooking,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING_PAYMENT: 'outline',
  CONFIRMED: 'default',
  CANCELLED: 'destructive',
  EXPIRED: 'destructive',
  ACTIVE: 'secondary',
  COMPLETED: 'default',
  DRAFT: 'outline',
}

const STATUS_LABELS: Record<StatusBooking, string> = {
  DRAFT: 'Draft',
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  CONFIRMED: 'Dikonfirmasi',
  ACTIVE: 'Aktif',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Kadaluarsa',
}

export function BookingStatusBadge({ status }: { status: StatusBooking }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  )
}

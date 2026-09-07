import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { History, Hash, Calendar, User } from 'lucide-react'
import type { InferRouterOutputs } from '@orpc/server'
import type router from '#/orpc/router'
import { orpc } from '#/orpc/client'
import { authClient } from '#/lib/auth-client'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/(protected)/pemilik/dashboard/history')({
  component: BookingHistoryPage,
})

type RouterOutput = InferRouterOutputs<typeof router>
type BookingOutput = RouterOutput['getDaftarRequestBooking'][number]

const STATUS_LABELS: Record<
  string,
  | {
      label: string
      variant: 'default' | 'secondary' | 'outline' | 'destructive'
    }
  | undefined
> = {
  SELESAI: { label: 'Selesai', variant: 'default' },
  SELESAI_DITOLAK: { label: 'Ditolak', variant: 'destructive' },
  DIBATALKAN: { label: 'Dibatalkan', variant: 'secondary' },
  PROSES_REFUND_DP: { label: 'Refund DP', variant: 'outline' },
  AKTIF: { label: 'Aktif', variant: 'default' },
  MENUNGGU_PELUNASAN: { label: 'Menunggu Pelunasan', variant: 'outline' },
}

function formatDateRange(start: Date, end: Date): string {
  return `${start.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} - ${end.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`
}

function BookingHistoryPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()

  if (sessionPending) {
    return <p className="text-sm text-[var(--sea-ink-soft)]">Memuat sesi...</p>
  }

  if (!session?.user) {
    return (
      <p className="text-sm text-[var(--sea-ink-soft)]">
        Kamu perlu masuk terlebih dahulu.
      </p>
    )
  }

  return <BookingHistoryContent />
}

function BookingHistoryContent() {
  const { data: bookings, isLoading } = useQuery(
    orpc.getDaftarRequestBooking.queryOptions({
      input: {
        statuses: [
          'SELESAI',
          'SELESAI_DITOLAK',
          'DIBATALKAN',
          'PROSES_REFUND_DP',
        ],
      },
    }),
  )

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--sea-ink-soft)]">
        Memuat riwayat booking...
      </p>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <History className="h-12 w-12 text-neutral-300" />
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Tidak ada riwayat booking.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
          Riwayat Booking
        </h2>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          {bookings.length} booking selesai
        </p>
      </div>

      {bookings.map((b) => (
        <BookingHistoryCard key={b.id} booking={b} />
      ))}
    </div>
  )
}

function BookingHistoryCard({ booking }: { booking: BookingOutput }) {
  const statusLabel = STATUS_LABELS[booking.status_booking] || {
    label: booking.status_booking,
    variant: 'outline' as const,
  }

  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">
            {booking.unit.property.name}
          </CardTitle>
          <Badge variant={statusLabel.variant}>{statusLabel.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
          <Hash className="h-4 w-4" />
          <span>Unit: {booking.unit.name}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDateRange(booking.tanggal_mulai, booking.tanggal_selesai)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
          <User className="h-4 w-4" />
          <span>{booking.penyewa.name}</span>
          <span className="text-xs">({booking.penyewa.email})</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-[var(--sea-ink-soft)]">Total Harga</span>
          <span className="font-medium text-[var(--sea-ink)]">
            Rp{Number(booking.total_harga).toLocaleString('id-ID')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

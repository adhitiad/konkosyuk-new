import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Hash,
  Calendar,
  User,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { InferRouterOutputs } from '@orpc/server'
import type router from '#/orpc/router'
import { orpc } from '#/orpc/client'
import { authClient } from '#/lib/auth-client'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { TableSkeleton } from '#/components/ui/skeleton-card'

export const Route = createFileRoute('/(protected)/pemilik/dashboard/active')({
  component: ActiveBookingsPage,
})

type RouterOutput = InferRouterOutputs<typeof router>
type BookingOutput = RouterOutput['getBookingAktif'][number]

const STATUS_LABELS: Record<string, string> = {
  AKTIF: 'Aktif',
  MENUNGGU_PELUNASAN: 'Menunggu Pelunasan',
  MENUNGGU_VERIFIKASI_DP: 'Menunggu Verifikasi DP',
  MENUNGGU_PERSETUJUAN: 'Menunggu Persetujuan',
  SELESAI: 'Selesai',
  SELESAI_DITOLAK: 'Selesai (Ditolak)',
  PROSES_REFUND_DP: 'Proses Refund DP',
  DIBATALKAN: 'Dibatalkan',
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

function ActiveBookingsPage() {
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

  return <ActiveBookingsContent />
}

function ActiveBookingsContent() {
  const { data: bookings, isLoading } = useQuery(
    orpc.getBookingAktif.queryOptions(),
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
            Booking Aktif
          </h2>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Memuat booking aktif...
          </p>
        </div>
        <TableSkeleton rows={4} />
      </div>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Bell className="h-12 w-12 text-neutral-300" />
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Tidak ada booking aktif saat ini.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
          Booking Aktif
        </h2>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          {bookings.length} booking sedang berlangsung
        </p>
      </div>

      {bookings.map((b) => (
        <BookingActiveCard key={b.id} booking={b} />
      ))}
    </div>
  )
}

function BookingActiveCard({ booking }: { booking: BookingOutput }) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_LABELS[booking.status_booking] || booking.status_booking

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">
            {booking.unit.property.name}
          </CardTitle>
          <Badge
            variant={
              booking.status_booking === 'AKTIF' ? 'default' : 'secondary'
            }
          >
            {status}
          </Badge>
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
        {booking.jumlahDP && Number(booking.jumlahDP) > 0 && (
          <div className="flex justify-between pt-2">
            <span className="text-[var(--sea-ink-soft)]">DP sudah dibayar</span>
            <span className="font-medium text-[var(--sea-ink)]">
              Rp{Number(booking.jumlahDP).toLocaleString('id-ID')}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t pt-2">
          <span className="text-[var(--sea-ink-soft)]">Total Harga</span>
          <span className="font-bold text-[var(--lagoon-deep)]">
            Rp{Number(booking.total_harga).toLocaleString('id-ID')}
          </span>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1 pt-1 text-xs font-medium text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'Tutup Detail' : 'Lihat Detail'}
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {expanded && (
          <div className="space-y-2 rounded-lg border border-[var(--line)] bg-neutral-50 p-3 text-xs text-[var(--sea-ink-soft)]">
            <div className="flex justify-between">
              <span>ID Booking</span>
              <span className="font-mono">{booking.id}</span>
            </div>
            {booking.jumlahDP && Number(booking.jumlahDP) > 0 && (
              <div className="flex justify-between">
                <span>Tanggal Bayar DP</span>
                <span>
                  {booking.tanggalBayarDP
                    ? new Date(booking.tanggalBayarDP).toLocaleDateString(
                        'id-ID',
                      )
                    : '-'}
                </span>
              </div>
            )}
            {booking.jumlahPelunasan && Number(booking.jumlahPelunasan) > 0 && (
              <div className="flex justify-between">
                <span>Tanggal Pelunasan</span>
                <span>
                  {booking.tanggalPelunasan
                    ? new Date(booking.tanggalPelunasan).toLocaleDateString(
                        'id-ID',
                      )
                    : '-'}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Harga Satuan</span>
              <span>
                Rp{Number(booking.unit.price).toLocaleString('id-ID')}/bulan
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dibuat pada</span>
              <span>
                {new Date(booking.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

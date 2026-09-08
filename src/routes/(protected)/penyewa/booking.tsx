import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ClipboardList,
  Calendar,
  User,
  Hash,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  LogIn,
  Search,
} from 'lucide-react'

import { authClient } from '#/lib/auth-client'
import { orpc } from '#/orpc/client'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { useState } from 'react'
import type { PemesananWithRelations } from '#/types/pemesanan'

export const Route = createFileRoute('/(protected)/penyewa/booking')({
  component: BookingListPage,
})

const STATUS_LABELS: Record<
  PemesananWithRelations['status'],
  {
    label: string
    icon: React.ElementType
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
  }
> = {
  MENUNGGU_PERSETUJUAN: {
    label: 'Menunggu Persetujuan',
    icon: Clock,
    variant: 'outline',
  },
  DITERIMA: {
    label: 'Diterima',
    icon: CheckCircle,
    variant: 'default',
  },
  DITOLAK: {
    label: 'Ditolak',
    icon: XCircle,
    variant: 'destructive',
  },
  DIBATALKAN: {
    label: 'Dibatalkan',
    icon: Ban,
    variant: 'secondary',
  },
}

function formatDateRange(start: Date, end: Date | null): string {
  const s = start.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  if (!end) return `${s} -`
  const e = end.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${s} - ${e}`
}

function BookingListPage() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">Memuat sesi...</p>
      </main>
    )
  }

  if (!session?.user) {
    return (
      <main className="page-wrap flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Akses Dibatasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Kamu perlu masuk terlebih dahulu untuk melihat pemesanan.
            </p>
          </CardContent>
          <CardContent className="flex justify-end">
            <Button asChild>
              <a href="/sign-in">
                <LogIn className="h-4 w-4" />
                Masuk
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return <BookingListContent />
}

function BookingListContent() {
  const { data: bookings, isLoading } = useQuery(
    orpc.listPemesananSaya.queryOptions(),
  )

  if (isLoading) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Memuat pemesanan...
        </p>
      </main>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <main className="page-wrap py-8">
        <EmptyState />
      </main>
    )
  }

  return (
    <main className="page-wrap py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="island-kicker mb-2">Pemesanan Saya</p>
          <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
            Riwayat Pemesanan
          </h1>
        </div>
        <Button asChild>
          <Link
            to="/penyewa/booking/baru"
            search={{ property_id: '', room_id: '' }}
          >
            <ClipboardList className="h-4 w-4" />
            Ajukan Pemesanan Baru
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} />
        ))}
      </div>
    </main>
  )
}

function BookingCard({ booking }: { booking: PemesananWithRelations }) {
  const queryClient = useQueryClient()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const cancelMutation = useMutation({
    mutationFn: async (input: { id: string }) => {
      return await orpc.batalPemesanan.call(input)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.listPemesananSaya.queryKey(),
      })
      setShowCancelDialog(false)
    },
  })

  const canCancel = booking.status === 'MENUNGGU_PERSETUJUAN'

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{booking.nama_properti}</CardTitle>
            <Badge
              variant={STATUS_LABELS[booking.status].variant}
              className="flex items-center gap-1"
            >
              {(() => {
                const Icon = STATUS_LABELS[booking.status].icon
                return <Icon className="h-3 w-3" />
              })()}
              {STATUS_LABELS[booking.status].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
            <Hash className="h-4 w-4" />
            <span>{booking.nama_unit}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDateRange(booking.tanggal_mulai, booking.tanggal_selesai)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
            <User className="h-4 w-4" />
            <span>{booking.jumlah_penghuni} penghuni</span>
          </div>
          {booking.catatan && (
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Catatan: {booking.catatan}
            </p>
          )}
        </CardContent>
        <CardContent className="flex items-center justify-between pt-0">
          <div className="text-lg font-bold text-[var(--lagoon-deep)]">
            Rp{Number(booking.total_harga).toLocaleString('id-ID')}
          </div>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelMutation.isPending}
            >
              <Ban className="h-3.5 w-3.5" />
              Batalkan
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Pemesanan?</DialogTitle>
            <DialogDescription>
              Pemesanan untuk unit {booking.nama_unit} pada{' '}
              {booking.nama_properti} akan dibatalkan. Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelDialog(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate({ id: booking.id })}
            >
              {cancelMutation.isPending ? 'Memproses...' : 'Batalkan Pemesanan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function EmptyState() {
  return (
    <>
      <div className="mb-6">
        <p className="island-kicker mb-2">Pemesanan Saya</p>
        <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
          Riwayat Pemesanan
        </h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ClipboardList className="h-12 w-12 text-neutral-300" />
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Kamu belum memiliki pemesanan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <Link to="/properties">
                <Search className="h-4 w-4" />
                Cari Properti
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                to="/penyewa/booking/baru"
                search={{ property_id: '', room_id: '' }}
              >
                <ClipboardList className="h-4 w-4" />
                Ajukan Pemesanan Baru
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

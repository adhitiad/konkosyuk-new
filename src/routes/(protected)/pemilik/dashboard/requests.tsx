import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  X,
  Clock,
  User,
  Hash,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { useState } from 'react'
import type { InferRouterOutputs } from '@orpc/server'
import type router from '#/orpc/router'
import { orpc } from '#/orpc/client'
import { authClient } from '#/lib/auth-client'
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
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import { TableSkeleton } from '#/components/ui/skeleton-card'

export const Route = createFileRoute('/(protected)/pemilik/dashboard/requests')(
  {
    component: BookingRequestsPage,
  },
)

type RouterOutput = InferRouterOutputs<typeof router>
type BookingOutput = RouterOutput['getDaftarRequestBooking'][number]

const STATUS_LABELS: Record<
  string,
  { label: string; icon: React.ElementType } | undefined
> = {
  MENUNGGU_PEMBAYARAN_DP: {
    label: 'Menunggu Pembayaran DP',
    icon: Clock,
  },
  MENUNGGU_VERIFIKASI_DP: {
    label: 'Menunggu Verifikasi DP',
    icon: Clock,
  },
  MENUNGGU_PERSETUJUAN: {
    label: 'Menunggu Persetujuan',
    icon: Clock,
  },
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

function BookingRequestsPage() {
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

  return <BookingRequestsContent />
}

function BookingRequestsContent() {
  const queryClient = useQueryClient()
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    bookingId: string
    bookingName: string
  }>({ open: false, bookingId: '', bookingName: '' })
  const [rejectReason, setRejectReason] = useState('')

  const { data: bookings, isLoading } = useQuery(
    orpc.getDaftarRequestBooking.queryOptions({
      input: {
        statuses: ['MENUNGGU_PERSETUJUAN', 'MENUNGGU_VERIFIKASI_DP'],
      },
    }),
  )

  const approveMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return await orpc.setujuiBooking.call({ booking_id: bookingId })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['daftarRequestBooking'] })
      void queryClient.invalidateQueries({ queryKey: ['statistikPemilik'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({
      bookingId,
      reason,
    }: {
      bookingId: string
      reason: string
    }) => {
      return await orpc.tolakBooking.call({
        booking_id: bookingId,
        alasan: reason,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['daftarRequestBooking'] })
      void queryClient.invalidateQueries({ queryKey: ['statistikPemilik'] })
      setRejectDialog({ open: false, bookingId: '', bookingName: '' })
      setRejectReason('')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
            Permintaan Booking Masuk
          </h2>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Memuat permintaan booking...
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
          <AlertCircle className="h-12 w-12 text-neutral-300" />
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Tidak ada permintaan booking yang perlu ditindaklanjuti.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
          Permintaan Booking Masuk
        </h2>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          {bookings.length} booking menunggu persetujuan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((b) => (
          <BookingRequestCard
            key={b.id}
            booking={b}
            onApprove={() => approveMutation.mutate(b.id)}
            onReject={(name) =>
              setRejectDialog({
                open: true,
                bookingId: b.id,
                bookingName: name,
              })
            }
            isMutating={approveMutation.isPending || rejectMutation.isPending}
          />
        ))}
      </div>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menolak Booking</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk booking {rejectDialog.bookingName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="alasan">Alasan Penolakan</Label>
            <Textarea
              id="alasan"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Misalnya: unit sudah dibooking orang lain, harga tidak sesuai, dll."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setRejectDialog({ open: false, bookingId: '', bookingName: '' })
              }
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={rejectMutation.isPending || rejectReason.length < 3}
              onClick={() =>
                rejectMutation.mutate({
                  bookingId: rejectDialog.bookingId,
                  reason: rejectReason,
                })
              }
            >
              {rejectMutation.isPending ? 'Memproses...' : 'Tolak Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function BookingRequestCard({
  booking,
  onApprove,
  onReject,
  isMutating,
}: {
  booking: BookingOutput
  onApprove: () => void
  onReject: (name: string) => void
  isMutating: boolean
}) {
  const statusLabel = STATUS_LABELS[booking.status_booking] || {
    label: booking.status_booking,
    icon: Clock,
  }
  const Icon = statusLabel.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">
            {booking.unit.property.name}
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {statusLabel.label}
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
        <div className="flex items-center justify-between pt-2">
          <div className="text-lg font-bold text-[var(--lagoon-deep)]">
            Rp{Number(booking.total_harga).toLocaleString('id-ID')}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isMutating}
              onClick={onApprove}
            >
              <Check className="h-3.5 w-3.5" />
              Setujui
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isMutating}
              onClick={() => onReject(booking.unit.property.name)}
            >
              <X className="h-3.5 w-3.5" />
              Tolak
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

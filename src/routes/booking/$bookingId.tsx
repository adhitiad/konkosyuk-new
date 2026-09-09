import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, User, Hash } from 'lucide-react'

import { orpc } from '#/orpc/client'
import { BookingStatusBadge } from '#/components/booking/BookingStatusBadge'
import { PaymentDeadlineCard } from '#/components/booking/PaymentDeadlineCard'
import { BookingTimeline } from '#/components/booking/BookingTimeline'
import { ExtendBookingDialog } from '#/components/booking/ExtendBookingDialog'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

export const Route = createFileRoute('/booking/$bookingId')({
  component: BookingDetailPage,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      orpc.getBookingDetail.queryOptions({
        input: { booking_id: params.bookingId },
      }),
    )
  },
  head: () => {
    return {
      meta: [
        { title: `Detail Booking — Konkosyuk` },
        { name: 'description', content: 'Detail booking properti Konkosyuk' },
      ],
    }
  },
})

function BookingDetailPage() {
  const { bookingId } = Route.useParams()

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery(
    orpc.getBookingDetail.queryOptions({
      input: { booking_id: bookingId },
    }),
  )

  if (isLoading) {
    return null
  }

  if (error || !booking) {
    return (
      <main className="page-wrap py-12">
        <p className="text-center text-sm text-destructive">
          Booking tidak ditemukan atau Anda tidak memiliki akses.
        </p>
        <div className="mt-4 text-center">
          <Button asChild variant="outline">
            <Link to="/properties">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Booking
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  const isPendingPayment = booking.status_booking === 'PENDING_PAYMENT'
  const isExpired = booking.status_booking === 'EXPIRED'
  const canExtend =
    (booking.status_booking === 'ACTIVE' ||
      booking.status_booking === 'COMPLETED') &&
    !booking.next_booking_id

  return (
    <main className="page-wrap py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Detail Booking
              </h1>
              <p className="text-sm text-muted-foreground">
                {booking.unit.property.name} — {booking.unit.name}
              </p>
            </div>
          </div>
          <BookingStatusBadge status={booking.status_booking} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kolom</TableHead>
                  <TableHead>Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">ID Booking</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Hash className="h-3.5 w-3.5" />
                      {booking.id}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Penyewa</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {booking.penyewa.name}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tanggal Mulai</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(booking.tanggal_mulai).toLocaleDateString(
                        'id-ID',
                      )}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tanggal Selesai</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(booking.tanggal_selesai).toLocaleDateString(
                        'id-ID',
                      )}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Harga</TableCell>
                  <TableCell className="font-medium">
                    Rp {Number(booking.total_harga).toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {isPendingPayment && <PaymentDeadlineCard bookingId={booking.id} />}

        {isPendingPayment && !isExpired && (
          <Button className="w-full">Bayar Sekarang</Button>
        )}

        {canExtend && (
          <ExtendBookingDialog
            bookingId={booking.id}
            currentCheckOutDate={new Date(booking.tanggal_selesai)}
          >
            <Button className="w-full">Perpanjang Sewa</Button>
          </ExtendBookingDialog>
        )}

        {isExpired && (
          <Button asChild variant="secondary" className="w-full">
            <Link to="/properties">Booking Ulang</Link>
          </Button>
        )}

        <BookingTimeline bookingId={booking.id} />
      </div>
    </main>
  )
}

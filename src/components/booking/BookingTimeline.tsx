import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { orpc } from '#/orpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'

const statusConfig = {
  PENDING_PAYMENT: {
    label: 'Menunggu Pembayaran',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  CONFIRMED: {
    label: 'Dikonfirmasi',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  ACTIVE: {
    label: 'Aktif',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  COMPLETED: {
    label: 'Selesai',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  EXPIRED: {
    label: 'Kedaluarsa',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-300',
  },
}

type BookingStatus = keyof typeof statusConfig

export function BookingTimeline({ bookingId }: { bookingId: string }) {
  const {
    data: history,
    isLoading,
    error,
  } = useQuery(
    orpc.getBookingExtensionHistory.queryOptions({
      input: { bookingId },
    }),
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Perpanjangan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !history || history.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Perpanjangan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:overflow-x-auto sm:pb-2">
          {history.map((booking, index) => {
            const config = statusConfig[booking.status_booking as BookingStatus]

            return (
              <div
                key={booking.id}
                className="flex flex-1 flex-col gap-2 sm:min-w-[220px]"
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium">
                        Booking {index + 1}
                      </CardTitle>
                      <Badge
                        variant={config.variant}
                        className={config.className}
                      >
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>
                        {format(
                          new Date(booking.check_in_date),
                          'dd MMM yyyy',
                          { locale: id },
                        )}{' '}
                        -{' '}
                        {format(
                          new Date(booking.check_out_date),
                          'dd MMM yyyy',
                          { locale: id },
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Periode:{' '}
                      {booking.rental_period.replace('_', ' ').toLowerCase()}
                    </p>
                  </CardContent>
                </Card>

                {index < history.length - 1 && (
                  <div className="hidden sm:flex items-center justify-center">
                    <div className="h-px w-full bg-border" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

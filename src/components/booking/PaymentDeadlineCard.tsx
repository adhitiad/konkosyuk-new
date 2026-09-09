import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { differenceInMinutes, format, isPast } from 'date-fns'
import { id } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { AlertTriangle, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { orpc } from '#/orpc/client'
import { Link } from '@tanstack/react-router'

export function PaymentDeadlineCard({ bookingId }: { bookingId: string }) {
  const [now, setNow] = useState(new Date())
  const toastShownRef = useRef(false)

  const { data, isLoading, error } = useQuery(
    orpc.getPaymentDeadline.queryOptions({
      input: { booking_id: bookingId },
    }),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!data || toastShownRef.current) return

    if (data.isExpired) {
      toast.error('Booking sudah kadaluarsa', {
        description: 'Batas waktu pembayaran telah terlewat.',
      })
      toastShownRef.current = true
    } else if (data.timeRemaining < 120) {
      toast.warning('Segera bayar', {
        description: `Booking akan hangus dalam ${Math.floor(data.timeRemaining / 60)} jam ${data.timeRemaining % 60} menit.`,
      })
      toastShownRef.current = true
    }
  }, [data])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Batas Waktu Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Batas Waktu Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Gagal memuat batas waktu pembayaran.
          </p>
        </CardContent>
      </Card>
    )
  }

  const deadline = new Date(data.deadline)
  const expired = data.isExpired || isPast(deadline)
  const minutesRemaining = expired ? 0 : differenceInMinutes(deadline, now)
  const hoursRemaining = Math.floor(minutesRemaining / 60)
  const minsRemaining = minutesRemaining % 60

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Batas Waktu Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Batas waktu pembayaran:{' '}
          <span className="font-medium text-foreground">
            {format(deadline, 'dd MMMM yyyy, HH:mm', { locale: id })}
          </span>
        </p>

        {!expired ? (
          <div className="text-sm font-medium">
            {hoursRemaining > 0 && (
              <span>
                {hoursRemaining} jam {minsRemaining} menit lagi
              </span>
            )}
            {hoursRemaining === 0 && <span>{minsRemaining} menit lagi</span>}
          </div>
        ) : (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Booking sudah expired</AlertTitle>
            <AlertDescription>
              Batas waktu pembayaran telah terlewat. Booking ini telah
              dibatalkan secara otomatis.
            </AlertDescription>
          </Alert>
        )}

        {!expired && minutesRemaining < 120 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Segera bayar</AlertTitle>
            <AlertDescription>
              Booking akan hangus dalam{' '}
              {hoursRemaining > 0 ? `${hoursRemaining} jam ` : ''}
              {minsRemaining} menit!
            </AlertDescription>
          </Alert>
        )}

        {expired ? (
          <Button asChild variant="secondary" className="w-full">
            <Link to="/properties">Booking Ulang</Link>
          </Button>
        ) : (
          <Button className="w-full">Bayar Sekarang</Button>
        )}
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { orpc } from '#/orpc/client'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'

type RentalPeriod = 'ONE_MONTH' | 'THREE_MONTHS' | 'SIX_MONTHS' | 'ONE_YEAR'

const rentalPeriodOptions: { value: RentalPeriod; label: string }[] = [
  { value: 'ONE_MONTH', label: '1 bulan' },
  { value: 'THREE_MONTHS', label: '3 bulan' },
  { value: 'SIX_MONTHS', label: '6 bulan' },
  { value: 'ONE_YEAR', label: '1 tahun' },
]

export function ExtendBookingDialog({
  bookingId,
  currentCheckOutDate,
  children,
}: {
  bookingId: string
  currentCheckOutDate: Date
  children?: React.ReactNode
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>('ONE_MONTH')
  const [checkInDate, setCheckInDate] = useState<string>(
    format(currentCheckOutDate, 'yyyy-MM-dd'),
  )

  const { data: history } = useQuery(
    orpc.getBookingExtensionHistory.queryOptions({
      input: { bookingId },
    }),
  )

  const hasNextBooking = history?.some((item) => item.next_booking_id !== null)

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await orpc.extendBooking.call({
        bookingId,
        newRentalPeriod: rentalPeriod,
        newCheckInDate: new Date(checkInDate),
      })
      return result
    },
    onSuccess: (result) => {
      toast.success(
        'Booking perpanjangan berhasil dibuat, silakan bayar dalam 7 jam',
      )
      setOpen(false)
      navigate({ to: `/booking/${result.newBookingId}` })
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Gagal memperpanjang booking'
      toast.error(message)
    },
  })

  const isSubmitting = mutation.status === 'pending'
  const disabled = hasNextBooking || isSubmitting

  const calculatedCheckOut = (() => {
    if (!checkInDate) return null
    const date = new Date(checkInDate)
    switch (rentalPeriod) {
      case 'ONE_MONTH':
        date.setMonth(date.getMonth() + 1)
        break
      case 'THREE_MONTHS':
        date.setMonth(date.getMonth() + 3)
        break
      case 'SIX_MONTHS':
        date.setMonth(date.getMonth() + 6)
        break
      case 'ONE_YEAR':
        date.setFullYear(date.getFullYear() + 1)
        break
    }
    return date
  })()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button
            disabled={disabled}
            title={
              hasNextBooking ? 'Booking ini sudah diperpanjang' : undefined
            }
          >
            Perpanjang Sewa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perpanjangan Booking</DialogTitle>
          <DialogDescription>
            Buat booking perpanjangan untuk periode selanjutnya.
          </DialogDescription>
        </DialogHeader>

        {hasNextBooking && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sudah diperpanjang</AlertTitle>
            <AlertDescription>
              Booking ini sudah memiliki perpanjangan. Tidak dapat melakukan
              perpanjangan lebih lanjut.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Periode Sewa</Label>
            <Select
              value={rentalPeriod}
              onValueChange={(value) => setRentalPeriod(value as RentalPeriod)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih periode sewa" />
              </SelectTrigger>
              <SelectContent>
                {rentalPeriodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tanggal Check-in</Label>
            <div className="relative">
              <input
                type="date"
                value={checkInDate}
                min={format(currentCheckOutDate, 'yyyy-MM-dd')}
                onChange={(e) => setCheckInDate(e.target.value)}
                disabled={disabled}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {calculatedCheckOut && (
            <p className="text-sm text-muted-foreground">
              Check-out diperkirakan:{' '}
              <span className="font-medium text-foreground">
                {format(calculatedCheckOut, 'dd MMMM yyyy', { locale: id })}
              </span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={disabled}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Perpanjang Sewa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { Button } from '#/components/ui/button'
import { useSnapPayment } from '#/hooks/useSnapPayment'
import { formatRupiah } from '#/types/search'
import { CreditCard } from 'lucide-react'

type PaymentButtonProps = {
  bookingId: string
  amount: number
}

export function PaymentButton({ bookingId, amount }: PaymentButtonProps) {
  const { state, pay } = useSnapPayment(bookingId)

  const isLoading = state === 'loading' || state === 'paying'

  return (
    <Button onClick={pay} disabled={isLoading} className="w-full" size="lg">
      <CreditCard className="size-4" />
      {state === 'idle' && `Bayar ${formatRupiah(amount)}`}
      {state === 'loading' && 'Memproses...'}
      {state === 'paying' && 'Menunggu pembayaran...'}
      {state === 'success' && 'Pembayaran Berhasil'}
      {state === 'failed' && 'Pembayaran Gagal - Coba Lagi'}
    </Button>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Search, Calendar, User } from 'lucide-react'
import { orpc } from '#/orpc/client'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { TableSkeleton } from '#/components/ui/skeleton-card'

export const Route = createFileRoute('/(protected)/admin/bookings')({
  component: AdminBookings,
})

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'MENUNGGU_PEMBAYARAN_DP', label: 'Menunggu Pembayaran DP' },
  { value: 'MENUNGGU_VERIFIKASI_DP', label: 'Menunggu Verifikasi DP' },
  { value: 'MENUNGGU_PERSETUJUAN', label: 'Menunggu Persetujuan' },
  { value: 'MENUNGGU_PELUNASAN', label: 'Menunggu Pelunasan' },
  { value: 'AKTIF', label: 'Aktif' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'PROSES_REFUND_DP', label: 'Proses Refund DP' },
  { value: 'SELESAI_DITOLAK', label: 'Selesai Ditolak' },
  { value: 'DIBATALKAN', label: 'Dibatalkan' },
]

function AdminBookings() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['allBookings', status, search, page],
    queryFn: async () =>
      await orpc.getAllBookings.call({
        status: status ? (status as any) : undefined,
        search: search || undefined,
        page,
        limit: 20,
      }),
  })

  const formatRupiah = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return 'Rp0'
    return `Rp${num.toLocaleString('id-ID')}`
  }

  const formatDate = (date: Date | null | string) => {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
              Semua Booking
            </h2>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Memuat data booking...
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-9 w-full sm:w-64" />
            <Skeleton className="h-9 w-full sm:w-56" />
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data || data.bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Belum ada data booking.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
            Semua Booking
          </h2>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Total {data.total} booking ditemukan
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--sea-ink-soft)]" />
            <Input
              type="search"
              placeholder="Cari properti, unit, atau penyewa..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-8 sm:w-64"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-[var(--sea-ink-soft)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Properti / Unit</th>
                  <th className="px-4 py-3 font-medium">Penyewa</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--sea-ink)]">
                        {booking.unit.property.name}
                      </div>
                      <div className="text-xs text-[var(--sea-ink-soft)]">
                        {booking.unit.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
                        <User className="h-3.5 w-3.5" />
                        <span>{booking.penyewa.name}</span>
                      </div>
                      <div className="text-xs text-[var(--sea-ink-soft)]">
                        {booking.penyewa.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDate(booking.tanggal_mulai)} -{' '}
                          {formatDate(booking.tanggal_selesai)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--lagoon-deep)]">
                      {formatRupiah(booking.total_harga)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-[var(--sea-ink)]">
                        {booking.status_booking}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Halaman {data.page} dari {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

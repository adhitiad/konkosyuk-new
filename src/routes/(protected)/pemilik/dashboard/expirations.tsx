import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { CalendarClock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { orpc } from '#/orpc/client'
import { Badge } from '#/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { TableSkeleton } from '#/components/ui/skeleton-card'

export const Route = createFileRoute(
  '/(protected)/pemilik/dashboard/expirations',
)({
  component: ExpirationsPage,
})

const DAY_OPTIONS = [7, 14, 30]

function ExpirationsPage() {
  const [days, setDays] = useState(7)

  const { data, isLoading } = useQuery(
    orpc.getUpcomingExpirations.queryOptions({ input: { days } }),
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
              Jatuh Tempo
            </h2>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Memuat data penyewa aktif...
            </p>
          </div>
        </div>
        <TableSkeleton rows={4} />
      </div>
    )
  }

  if (!data || data.bookings.length === 0) {
    return (
      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
              Jatuh Tempo
            </h2>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Tidak ada booking aktif yang jatuh tempo dalam {days} hari ke
              depan.
            </p>
          </div>
          <Select
            value={String(days)}
            onValueChange={(v) => setDays(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAY_OPTIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d} hari
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <CalendarClock className="h-12 w-12 text-neutral-300" />
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Tidak ada penyewa yang akan jatuh tempo.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
            Jatuh Tempo
          </h2>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            {data.count} booking aktif akan jatuh tempo dalam {days} hari ke
            depan
          </p>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAY_OPTIONS.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d} hari
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {data.bookings.map((b) => {
          const isUrgent = b.daysLeft <= 3
          return (
            <Card key={b.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">
                    {b.unit.property.name}
                  </CardTitle>
                  <Badge variant={isUrgent ? 'destructive' : 'secondary'}>
                    {b.daysLeft} hari lagi
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
                  <CalendarClock className="h-4 w-4" />
                  <span>{format(new Date(b.endDate), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
                  <span>Unit: {b.unit.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
                  <span>
                    {b.tenant.name} — {b.tenant.email}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-[var(--sea-ink-soft)]">
                    Total Harga
                  </span>
                  <span className="font-bold text-[var(--lagoon-deep)]">
                    Rp{Number(b.totalHarga).toLocaleString('id-ID')}
                  </span>
                </div>
                {isUrgent && (
                  <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Booking ini akan berakhir dalam {b.daysLeft} hari. Segera
                      hubungi penyewa untuk perpanjangan atau persiapan
                      checkout.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

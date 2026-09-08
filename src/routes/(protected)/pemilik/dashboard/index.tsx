import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  CheckCircle,
  Clock,
  DoorOpen,
  TrendingUp,
  CalendarClock,
} from 'lucide-react'
import { orpc } from '#/orpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { StatsCardSkeleton } from '#/components/ui/skeleton-card'

export const Route = createFileRoute('/(protected)/pemilik/dashboard/')({
  component: DashboardHome,
})

const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  MENUNGGU_PEMBAYARAN_DP: 'Menunggu Pembayaran DP',
  MENUNGGU_VERIFIKASI_DP: 'Menunggu Verifikasi DP',
  MENUNGGU_PERSETUJUAN: 'Menunggu Persetujuan',
  AKTIF: 'Aktif',
  MENUNGGU_PELUNASAN: 'Menunggu Pelunasan',
  SELESAI: 'Selesai',
  SELESAI_DITOLAK: 'Selesai (Ditolak)',
  PROSES_REFUND_DP: 'Proses Refund DP',
  DIBATALKAN: 'Dibatalkan',
}

function formatTgl(itemDate: Date) {
  if (!(itemDate instanceof Date) || Number.isNaN(itemDate.getTime()))
    return '-'
  return itemDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function DashboardHome() {
  const { data: stats, isLoading } = useQuery(
    orpc.getStatistikPemilik.queryOptions(),
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCardSkeleton count={5} />
      </div>
    )
  }

  if (!stats) return null

  const formatRupiah = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return 'Rp0'
    return `Rp${num.toLocaleString('id-ID')}`
  }

  const statCards = [
    {
      title: 'Jumlah Properti',
      value: stats.totalProperti,
      icon: Building2,
      desc: 'listing milik Anda',
    },
    {
      title: 'Jumlah Unit',
      value: stats.totalUnit,
      icon: DoorOpen,
      desc: 'unit tersedia',
    },
    {
      title: 'Permintaan Booking',
      value: stats.totalRequest,
      icon: Clock,
      desc: 'perlu persetujuan',
    },
    {
      title: 'Booking Aktif',
      value: stats.bookingAktif,
      icon: CheckCircle,
      desc: 'sedang berlangsung',
    },
    {
      title: 'Pendapatan Bulan Ini',
      value: formatRupiah(stats.pendapatanBulanIni),
      icon: TrendingUp,
      desc: 'pemasukan terkonfirmasi',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-[var(--sea-ink-soft)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--sea-ink)]">
                  {card.value}
                </div>
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  {card.desc}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.aktivitas.length > 0 ? (
            <ul className="divide-y divide-[var(--line)]">
              {stats.aktivitas.map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-3">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lagoon-deep)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-[var(--sea-ink)]">
                        {a.namaProperti} — {a.namaUnit}
                      </p>
                      <span className="text-xs text-[var(--sea-ink-soft)]">
                        {formatTgl(a.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                      Oleh {a.namaPenyewa} ·{' '}
                      {ACTIVITY_STATUS_LABELS[a.status] ?? a.status}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[var(--lagoon-deep)]">
                      Rp{Number(a.totalHarga).toLocaleString('id-ID')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Belum ada aktivitas sewa terbaru.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, TrendingUp, Clock } from 'lucide-react'
import { orpc } from '#/orpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/(protected)/pemilik/dashboard/')({
  component: DashboardHome,
})

function DashboardHome() {
  const { data: stats, isLoading } = useQuery(
    orpc.getStatistikPemilik.queryOptions(),
  )

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--sea-ink-soft)]">Memuat statistik...</p>
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
          <CardTitle className="text-base">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Kelola permintaan booking dan pantau properti Anda dari panel ini.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

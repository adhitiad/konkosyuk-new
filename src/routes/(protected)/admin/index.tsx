import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Building2,
  CalendarCheck,
  CheckCircle,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { orpc } from '#/orpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { StatsCardSkeleton } from '#/components/ui/skeleton-card'

export const Route = createFileRoute('/(protected)/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery(
    orpc.getStatistikPlatform.queryOptions(),
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatsCardSkeleton count={7} />
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
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: Users,
      desc: 'pengguna terdaftar',
    },
    {
      title: 'Total Properti',
      value: stats.totalProperties,
      icon: Building2,
      desc: 'properti terdaftar',
    },
    {
      title: 'Total Unit',
      value: stats.totalUnits,
      icon: Building2,
      desc: 'unit tersedia',
    },
    {
      title: 'Total Booking',
      value: stats.totalBookings,
      icon: CalendarCheck,
      desc: 'semua booking',
    },
    {
      title: 'Booking Aktif',
      value: stats.activeBookings,
      icon: CheckCircle,
      desc: 'sedang berlangsung',
    },
    {
      title: 'Menunggu Persetujuan',
      value: stats.pendingBookings,
      icon: AlertCircle,
      desc: 'perlu ditindaklanjuti',
    },
    {
      title: 'Total Pendapatan',
      value: formatRupiah(stats.totalRevenue),
      icon: TrendingUp,
      desc: 'pemasukan terkonfirmasi',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <p className="text-sm text-[var(--sea-ink-soft)] mb-3">
            Kelola booking, pengguna, dan konfigurasi platform dari panel admin
            ini.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/bookings">Pantau Booking</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/users">Kelola Pengguna</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/verification">Verifikasi &amp; Audit</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/konfigurasi">Konfigurasi Platform</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import {
  useLocation,
  Link,
  Outlet,
  createFileRoute,
} from '@tanstack/react-router'
import {
  LayoutDashboard,
  CheckCircle,
  Clock,
  History,
  CalendarClock,
  MessageSquare,
} from 'lucide-react'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/(protected)/pemilik/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  const { data: session, isPending } = authClient.useSession()
  const location = useLocation()

  if (isPending) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">Memuat sesi...</p>
      </main>
    )
  }

  if (!session?.user) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Kamu perlu masuk terlebih dahulu untuk mengakses halaman ini.
        </p>
      </main>
    )
  }

  if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Halaman ini hanya dapat diakses oleh pemilik properti.
        </p>
      </main>
    )
  }

  const navItems = [
    { to: '/pemilik/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { to: '/pemilik/dashboard/requests', label: 'Permintaan', icon: Clock },
    { to: '/pemilik/dashboard/active', label: 'Aktif', icon: CheckCircle },
    {
      to: '/pemilik/dashboard/expirations',
      label: 'Jatuh Tempo',
      icon: CalendarClock,
    },
    { to: '/pemilik/dashboard/history', label: 'Riwayat', icon: History },
    { to: '/pemilik/dashboard/messages', label: 'Pesan', icon: MessageSquare },
  ]

  const isActive = (to: string) => location.pathname === to

  return (
    <main className="page-wrap py-8">
      <div className="mb-6">
        <p className="island-kicker mb-2">Dashboard Pemilik</p>
        <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
          Panel Pengelolaan Properti
        </h1>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isActive(item.to)
                  ? 'bg-[var(--lagoon-deep)] text-white'
                  : 'bg-neutral-100 text-[var(--sea-ink)] hover:bg-neutral-200',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Outlet />
    </main>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

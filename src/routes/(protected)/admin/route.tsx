import {
  useLocation,
  Link,
  Outlet,
  createFileRoute,
} from '@tanstack/react-router'
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  Users,
  FileText,
  LogOut,
} from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/(protected)/admin')({
  component: AdminLayout,
})

function AdminLayout() {
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

  if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
    return (
      <main className="page-wrap py-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Akses Dibatasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Hanya administrator yang dapat mengakses halaman ini.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  const navItems = [
    { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
    { to: '/admin/bookings', label: 'Booking', icon: BookOpen },
    { to: '/admin/users', label: 'Kelola Pengguna', icon: Users },
    { to: '/admin/verification', label: 'Verifikasi & Audit', icon: FileText },
    { to: '/admin/konfigurasi', label: 'Konfigurasi', icon: Settings },
  ]

  const isActive = (to: string) => location.pathname === to

  return (
    <main className="page-wrap py-8">
      <div className="mb-6">
        <p className="island-kicker mb-2">Panel Admin</p>
        <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
          Kelola Platform
        </h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex flex-col gap-2 lg:w-56">
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
          <form action="/api/auth/sign-out" method="post">
            <Button
              type="submit"
              variant="ghost"
              className="mt-2 w-full justify-start gap-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </form>
        </nav>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

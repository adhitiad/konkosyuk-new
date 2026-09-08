import { createFileRoute } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'
import { PropertyWizard } from '#/components/property/PropertyWizard'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/owner/properties/new')({
  component: WizardPropertiBaru,
})

function WizardPropertiBaru() {
  const { data: session, isPending } = authClient.useSession()

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
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Akses Dibatasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Kamu perlu masuk sebagai pemilik properti untuk menambahkan
              properti.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
    return (
      <main className="page-wrap py-8">
        <Card>
          <CardHeader>
            <CardTitle>Akses Dibatasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Hanya pemilik properti yang dapat menambahkan properti baru.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="page-wrap py-8">
      <PropertyWizard title="Tambah Properti Baru" />
    </main>
  )
}

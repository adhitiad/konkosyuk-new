import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { BedDouble, Building2, LogIn, MapPin, Pencil, Plus } from 'lucide-react'

import { authClient } from '#/lib/auth-client'
import { listPropertiPemilik } from '#/server/property'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/owner/properties')({
  component: OwnerProperties,
})

const TIPE_LABEL = {
  KOST: 'Kost',
  KONTRAKAN: 'Kontrakan',
} as const

const STATUS_LABEL = {
  DRAFT: 'Draft',
  AKTIF: 'Aktif',
  NONAKTIF: 'Non-aktif',
} as const

const KETERSEDIAAN_LABEL = {
  TERSEDIA: 'Tersedia',
  TERISI: 'Terisi',
  DIPESAN: 'Dipesan',
  MAINTENANCE: 'Maintenance',
} as const

function OwnerProperties() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">Memuat...</p>
      </main>
    )
  }

  if (!session?.user) {
    return (
      <main className="page-wrap flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Akses Dibatasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Kamu perlu masuk sebagai pemilik properti untuk mengelola
              properti.
            </p>
          </CardContent>
          <CardContent className="flex justify-end">
            <Button asChild>
              <a href="/sign-in">
                <LogIn className="h-4 w-4" />
                Masuk
              </a>
            </Button>
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
              Hanya pemilik properti yang dapat mengakses halaman ini.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="page-wrap py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="island-kicker mb-2">Dashboard Owner</p>
          <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
            Properti Saya
          </h1>
        </div>
        <Button asChild>
          <a href="/owner/properties/new">
            <Plus className="h-4 w-4" />
            Tambah Properti
          </a>
        </Button>
      </div>

      <PropertiesList />
    </main>
  )
}

function PropertiesList() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properti-pemilik'],
    queryFn: () => listPropertiPemilik(),
  })

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--sea-ink-soft)]">Memuat properti...</p>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Building2 className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Kamu belum memiliki properti. Klik tombol di atas untuk menambahkan.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  )
}

function PropertyCard({
  property,
}: {
  property: NonNullable<Awaited<ReturnType<typeof listPropertiPemilik>>>[number]
}) {
  const statusVariant =
    property.status === 'AKTIF'
      ? 'default'
      : property.status === 'NONAKTIF'
        ? 'outline'
        : 'secondary'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{property.nama_properti}</CardTitle>
          <Badge variant={statusVariant}>{STATUS_LABEL[property.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="flex items-start gap-1.5 text-sm text-[var(--sea-ink-soft)]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{property.alamat_lengkap}</span>
        </p>
        <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
          Tipe: {TIPE_LABEL[property.tipe_properti]} · {property.unit_count}{' '}
          unit
        </p>

        {property.units.length > 0 && (
          <div className="mt-3 space-y-2">
            {property.units.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-[var(--lagoon-deep)]" />
                  <span className="text-sm font-medium text-[var(--sea-ink)]">
                    {u.nama_unit}
                  </span>
                  <span className="text-xs text-[var(--sea-ink-soft)]">
                    {u.kapasitas} orang
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--lagoon-deep)]">
                    Rp{Number(u.harga_bulanan).toLocaleString('id-ID')}/bulan
                  </span>
                  <Badge variant="secondary">
                    {KETERSEDIAAN_LABEL[u.status_ketersediaan]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button asChild size="sm" variant="outline">
            <a href={`/owner/properties/${property.id}`}>
              <Pencil className="h-3.5 w-3.5" />
              Kelola
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronLeft,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'

import { orpc } from '#/orpc/client'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { PropertyImageGallery } from '#/components/property/PropertyImageGallery'
import { UnitCard } from '#/components/property/UnitCard'
import {
  getTipePropertiLabel,
  getStatusPropertiLabel,
} from '#/lib/tipeProperti'

export const Route = createFileRoute('/(public)/properti/$propertyId')({
  component: PropertyDetailPage,
  notFoundComponent: () => (
    <main className="page-wrap py-12">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali
      </Link>
      <p className="text-center text-sm text-[var(--sea-ink-soft)]">
        Properti tidak ditemukan.
      </p>
    </main>
  ),
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      orpc.getPropertyWithRelations.queryOptions({
        input: { id: params.propertyId },
      }),
    )
  },
  head: () => ({
    meta: [
      {
        title: 'Detail Properti — Konkosyuk',
      },
      {
        name: 'description',
        content:
          'Cari kos nyaman di seluruh Indonesia. Booking langsung, harga transparan, tanpa perantara ribet.',
      },
    ],
  }),
})

function formatWhatsAppLink(phone: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits.startsWith('62') ? digits : digits.replace(/^0/, '62')}`
}

function minPrice(
  unitPropertis: Array<{ harga_bulanan: string }>,
): number | null {
  if (!unitPropertis.length) return null
  const prices = unitPropertis.map((u) => Number(u.harga_bulanan))
  return Math.min(...prices)
}

function PropertyDetailPage() {
  const { propertyId } = Route.useParams()
  const {
    data: property,
    isLoading,
    error,
  } = useQuery(
    orpc.getPropertyWithRelations.queryOptions({ input: { id: propertyId } }),
  )

  if (isLoading) {
    return <PropertyDetailSkeleton />
  }

  if (error) {
    return (
      <main className="page-wrap py-12">
        <p className="text-center text-sm text-[var(--sea-ink-soft)]">
          Gagal memuat properti. Silakan coba lagi nanti.
        </p>
      </main>
    )
  }

  if (!property) {
    return (
      <main className="page-wrap py-12">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Link>
        <p className="text-center text-sm text-[var(--sea-ink-soft)]">
          Properti tidak ditemukan.
        </p>
      </main>
    )
  }

  const lowestPrice = minPrice(property.unit_propertis)
  const waLink = formatWhatsAppLink(property.pemilik?.phone ?? null)
  const mapLink =
    property.latitude && property.longitude
      ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=16/${property.latitude}/${property.longitude}`
      : null

  return (
    <main className="page-wrap py-6">
      <Link
        to="/properti/$propertyId"
        params={{ propertyId }}
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2">
          <PropertyImageGallery
            photos={property.foto_propertis}
            name={property.nama_properti}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
              {property.nama_properti}
            </h1>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)]">
              <MapPin className="h-3.5 w-3.5" />
              <span>{property.alamat_lengkap}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {getTipePropertiLabel(property.tipe_properti)}
            </Badge>
            <Badge variant="secondary">
              {getStatusPropertiLabel(property.status)}
            </Badge>
            {property.unit_propertis.length > 0 && (
              <Badge>{property.unit_propertis.length} Unit</Badge>
            )}
          </div>

          {lowestPrice !== null && (
            <div>
              <p className="text-sm text-[var(--sea-ink-soft)]">Mulai dari</p>
              <p className="text-3xl font-bold text-[var(--lagoon-deep)]">
                Rp{lowestPrice.toLocaleString('id-ID')}
              </p>
            </div>
          )}

          {property.pemilik && property.pemilik.phone && waLink && (
            <Button
              asChild
              className="w-full rounded-full bg-[var(--lagoon-deep)] text-white hover:bg-[#246b73]"
            >
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Hubungi Pemilik via WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          {property.deskripsi && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deskripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--sea-ink-soft)] whitespace-pre-line">
                  {property.deskripsi}
                </p>
              </CardContent>
            </Card>
          )}

          {property.fasilitas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fasilitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.fasilitas.map((f) => (
                    <Badge key={f.id} variant="secondary">
                      {f.nama_fasilitas}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unit Tersedia</CardTitle>
            </CardHeader>
            <CardContent>
              {property.unit_propertis.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {property.unit_propertis.map((unit) => (
                    <UnitCard key={unit.id} unit={unit} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  Belum ada unit tersedia.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lokasi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                {property.alamat_lengkap}
              </p>
              {mapLink && (
                <Button variant="link" asChild className="mt-2 p-0">
                  <a href={mapLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Lihat di peta
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Info Properti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--sea-ink-soft)]">Tipe</span>
                <span>{getTipePropertiLabel(property.tipe_properti)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--sea-ink-soft)]">Status</span>
                <span>{getStatusPropertiLabel(property.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--sea-ink-soft)]">Jumlah Unit</span>
                <span>{property.unit_propertis.length}</span>
              </div>
            </CardContent>
          </Card>

          {property.pemilik && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pemilik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-medium text-[var(--sea-ink)]">
                  {property.pemilik.name || '-'}
                </p>
                {property.pemilik.phone && (
                  <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${property.pemilik.phone.replace(/\D/g, '')}`}
                    >
                      {property.pemilik.phone}
                    </a>
                  </div>
                )}
                {waLink && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}

function PropertyDetailSkeleton() {
  return (
    <main className="page-wrap py-6">
      <div className="mb-4 h-5 w-32">
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

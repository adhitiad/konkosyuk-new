import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, MapPin, Bed } from 'lucide-react'
import type { Prisma, PropertyType } from '#/generated/prisma/client'
import { useState } from 'react'

import { orpc } from '#/orpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { PROPERTY_TYPE_LABELS } from '#/utils/propertyType'
import { MapPicker } from '#/components/MapPicker'
import { GenderTypeSchema, RentalPeriodSchema } from '#/orpc/schema/properties'

export const Route = createFileRoute('/properties')({
  component: PropertiesList,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      orpc.listProperties.queryOptions({ input: {} }),
    )
  },
})

type Property = {
  id: string
  name: string
  description?: string | null
  address: string
  city?: string | null
  province?: string | null
  type: string
  base_price?: Prisma.Decimal | number | null
  latitude?: number | null
  longitude?: number | null
  is_featured?: boolean | null
  images?: unknown
  distance_km?: number | null
  units?: Array<{
    id: string
    name: string
    price: number
    capacity?: string | null
    size?: string | null
  }>
}

function PropertiesList() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const typeParam = searchParams.get('type') ?? undefined

  const [selectedType, setSelectedType] = useState<PropertyType | undefined>()
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [radiusKm, setRadiusKm] = useState(10)
  const [showMap, setShowMap] = useState(false)

  const genderType = typeParam ? GenderTypeSchema.safeParse(typeParam) : null
  const rentalPeriod = typeParam
    ? RentalPeriodSchema.safeParse(typeParam)
    : null

  const nearby =
    selectedLat && selectedLng
      ? { lat: selectedLat, lng: selectedLng, radius_km: radiusKm }
      : undefined

  const { data: properties, isLoading } = useQuery(
    orpc.listProperties.queryOptions({
      input: {
        type: selectedType,
        gender_type: genderType?.success ? genderType.data : undefined,
        rental_period: rentalPeriod?.success ? rentalPeriod.data : undefined,
        nearby,
      },
    }),
  )

  if (isLoading) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">Memuat properti...</p>
      </main>
    )
  }

  return (
    <main className="page-wrap py-8">
      <div className="mb-6">
        <p className="island-kicker mb-2">Properti</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
            Semua Properti
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={selectedType ?? ''}
              onValueChange={(v) =>
                setSelectedType(v === '' ? undefined : (v as PropertyType))
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua tipe</SelectItem>
                {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {PROPERTY_TYPE_LABELS[type]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <MapPin className="h-4 w-4 text-[var(--lagoon-deep)]" />
              <span>Cari di peta</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showMap ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {showMap && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[var(--sea-ink-soft)]">
              {selectedLat && selectedLng
                ? `Lokasi terpilih: ${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`
                : 'Pilih lokasi di peta atau cari di kolom pencarian'}
            </span>
            <Select
              value={String(radiusKm)}
              onValueChange={(v) => setRadiusKm(Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MapPicker
            lat={selectedLat}
            lng={selectedLng}
            onLocationSelect={(lat, lng) => {
              setSelectedLat(lat)
              setSelectedLng(lng)
            }}
          />
        </div>
      )}

      {properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Belum ada properti tersedia.
          </p>
        </div>
      )}
    </main>
  )
}

function PropertyCard({ property }: { property: Property }) {
  const image =
    Array.isArray(property.images) && property.images.length > 0
      ? String(property.images[0])
      : null

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <Link to="/properties/$id" params={{ id: property.id }}>
        {image ? (
          <img
            src={image}
            alt={property.name}
            className="h-48 w-full rounded-t-xl object-cover"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-t-xl bg-neutral-100 dark:bg-neutral-800">
            <Bed className="h-8 w-8 text-neutral-400" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{property.name}</CardTitle>
            {property.is_featured && (
              <Badge variant="secondary" className="text-xs">
                Unggulan
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)]">
            <MapPin className="h-3.5 w-3.5" />
            <span>{property.address}</span>
          </div>
          {property.distance_km != null && (
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              {property.distance_km.toFixed(1)} km dari lokasi pilihan
            </p>
          )}
        </CardHeader>
        <CardContent>
          {property.base_price !== null &&
            property.base_price !== undefined && (
              <div className="text-lg font-semibold text-[var(--lagoon-deep)]">
                Rp{property.base_price.toLocaleString('id-ID')}
              </div>
            )}
          {property.units && property.units.length > 0 && (
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
              {property.units.length} unit tersedia
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}

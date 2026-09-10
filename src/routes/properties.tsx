import {
  createFileRoute,
  Link,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, MapPin, Bed, Search, X, Loader2 } from 'lucide-react'
import type { Prisma, PropertyType } from '#/generated/prisma/client'
import { useMemo, useRef, useState } from 'react'

import { orpc } from '#/orpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { PROPERTY_TYPE_LABELS } from '#/utils/propertyType'
import { PropertyMap, MapPropertiesContext } from '#/components/property/PropertyMap'
import { GoogleMapsProvider } from '#/components/property/GoogleMapsProvider'
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
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const typeParam = searchParams.get('type') ?? undefined
  const cityParam = searchParams.get('city') ?? undefined
  const searchParam = searchParams.get('search') ?? undefined
  const checkinParam = searchParams.get('checkin') ?? undefined

  const [keyword, setKeyword] = useState(searchParam ?? '')
  const [city, setCity] = useState(cityParam ?? '')
  const [selectedType, setSelectedType] = useState<PropertyType | undefined>()
  const [showMap, setShowMap] = useState(false)
  const [bounds, setBounds] = useState<{
    north: number
    south: number
    east: number
    west: number
  } | null>(null)

  const genderType = typeParam ? GenderTypeSchema.safeParse(typeParam) : null
  const rentalPeriod = typeParam
    ? RentalPeriodSchema.safeParse(typeParam)
    : null

  const {
    data: properties,
    isLoading,
    isFetching,
  } = useQuery(
    orpc.listProperties.queryOptions({
      input: {
        type: selectedType,
        gender_type: genderType?.success ? genderType.data : undefined,
        rental_period: rentalPeriod?.success ? rentalPeriod.data : undefined,
        city: cityParam,
        search: searchParam,
        bounds: bounds ?? undefined,
      },
    }),
  )

  const mapPropertiesRef = useRef<
    Array<{
      id: string
      name: string
      latitude: number
      longitude: number
      address: string
    }>
  >([])

  const mapProperties = useMemo(() => {
    const next = (properties ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      latitude: p.latitude ?? 0,
      longitude: p.longitude ?? 0,
      address: p.address,
    }))

    const prev = mapPropertiesRef.current
    const sameLength = prev.length === next.length
    const sameIds =
      sameLength && next.every((p, i) => p.id === prev[i].id)

    if (sameIds) return prev
    mapPropertiesRef.current = next
    return next
  }, [properties])

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city.trim()) params.set('city', city.trim())
    if (keyword.trim()) params.set('search', keyword.trim())
    if (typeParam) params.set('type', typeParam)
    if (checkinParam) params.set('checkin', checkinParam)
    const qs = params.toString()
    navigate({ to: `/properties${qs ? `?${qs}` : ''}` })
  }

  function clearFilters() {
    setKeyword('')
    setCity('')
    setSelectedType(undefined)
    navigate({ to: '/properties' })
  }

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

        <form
          onSubmit={onSearch}
          className="mt-4 flex flex-col gap-2 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2 rounded-md border border-neutral-200 px-3 focus-within:ring-1 focus-within:ring-[var(--lagoon-deep)] dark:border-neutral-700">
            <Search className="h-4 w-4 shrink-0 text-[var(--lagoon-deep)]" />
            <Label htmlFor="katalog-keyword" className="sr-only">
              Cari properti
            </Label>
            <Input
              id="katalog-keyword"
              type="text"
              placeholder="Nama kos, area, atau kata kunci"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-auto w-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-md border border-neutral-200 px-3 focus-within:ring-1 focus-within:ring-[var(--lagoon-deep)] dark:border-neutral-700 sm:max-w-56">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--lagoon-deep)]" />
            <Label htmlFor="katalog-city" className="sr-only">
              Kota
            </Label>
            <Input
              id="katalog-city"
              type="text"
              placeholder="Kota"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-auto w-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button type="submit" size="sm" className="sm:h-9">
            Cari
          </Button>
          {(searchParam || cityParam) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="sm:h-9"
              onClick={clearFilters}
            >
              <X className="h-4 w-4" />
              Hapus filter
            </Button>
          )}
        </form>

        {(cityParam || searchParam) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {cityParam ? (
              <Badge variant="secondary" className="text-xs">
                Kota: {cityParam}
              </Badge>
            ) : null}
            {searchParam ? (
              <Badge variant="secondary" className="text-xs">
                Pencarian: {searchParam}
              </Badge>
            ) : null}
          </div>
        )}
      </div>

      {showMap && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[var(--sea-ink-soft)]">
              {bounds
                ? `Area: ${bounds.west.toFixed(2)},${bounds.south.toFixed(2)} - ${bounds.east.toFixed(2)},${bounds.north.toFixed(2)}`
                : 'Geser peta untuk memperbarui hasil pencarian'}
            </span>
            {isFetching && (
              <div className="flex items-center gap-1 text-xs text-[var(--lagoon-deep)]">
                <Loader2 className="h-3 w-3 animate-spin" />
                Memuat...
              </div>
            )}
          </div>
          <GoogleMapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <MapPropertiesContext.Provider value={mapProperties}>
              <PropertyMap onBoundsChange={setBounds} />
            </MapPropertiesContext.Provider>
          </GoogleMapsProvider>
        </div>
      )}

      {properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            {cityParam || searchParam || selectedType || typeParam
              ? 'Tidak ada properti yang cocok dengan filter pencarian.'
              : 'Belum ada properti tersedia.'}
          </p>
          {(cityParam || searchParam || selectedType || typeParam) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
              Hapus filter
            </button>
          )}
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

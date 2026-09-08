import { Link } from '@tanstack/react-router'
import { Bed, MapPin, Star } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { OptimizedImage } from '#/components/optimized-image'
import { WishlistButton } from '#/components/property/WishlistButton'
import type { PropertyType } from '#/generated/prisma/client'

export type FeaturedProperty = {
  id: string
  name: string
  description?: string | null
  address: string
  city?: string | null
  province?: string | null
  district?: string | null
  type: PropertyType
  gender_type?: string | null
  rental_period?: string | null
  is_featured?: boolean | null
  images?: unknown
  latitude?: number | null
  longitude?: number | null
  min_price: number | null
  unit_count: number
  average_rating: number | null
  total_reviews: number | null
  owner_name: string | null
  created_at?: Date | string | null
}

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  kost: 'Kost',
  kostan: 'Kost An',
  kontrakan: 'Kontrakan',
  ruko: 'Ruko',
  apartment: 'Apartemen',
  house: 'Rumah',
  room: 'Room',
  studio: 'Studio',
  boarding_house: 'Boarding House',
  homestay: 'Homestay',
}

function tipeLabel(type: PropertyType | string): string {
  return (
    PROPERTY_TYPE_LABEL[type] ??
    (typeof type === 'string' ? type : String(type))
  )
}

function pickImage(images: unknown): string | null {
  if (!images) return null
  if (Array.isArray(images) && typeof images[0] === 'string') return images[0]
  if (
    Array.isArray(images) &&
    typeof images[0] === 'object' &&
    images[0] !== null
  ) {
    const candidate = (images[0] as { url?: string }).url
    if (typeof candidate === 'string') return candidate
  }
  return null
}

function currency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function isNew(date: Date | string | null | undefined): boolean {
  if (!date) return false
  const d = new Date(date)
  const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 30
}

export function PropertyCard({ property }: { property: FeaturedProperty }) {
  const img = pickImage(property.images)
  const price = property.min_price
  const loc = [property.district, property.city, property.province]
    .filter(Boolean)
    .join(', ')
  const rating = property.average_rating ?? 0
  const reviewCount = property.total_reviews ?? 0
  const ownerName = property.owner_name
  const isNewLine = isNew(property.created_at)
  return (
    <Link
      to="/properties/$id"
      params={{ id: property.id }}
      className="no-underline"
    >
      <div className="island-shell feature-card rise-in group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-[var(--line)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[rgba(79,184,178,0.18)] to-[rgba(47,106,74,0.08)]">
          {img ? (
            <OptimizedImage
              src={img}
              alt={property.name}
              aspectRatio="video"
              className="group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-white/60">
              {property.name.charAt(0)}
            </div>
          )}
          <WishlistButton propertyId={property.id} />
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
            <Badge
              variant="outline"
              className="border-0 bg-white/90 text-[var(--sea-ink)] font-semibold"
            >
              {tipeLabel(property.type)}
            </Badge>
            {isNewLine && (
              <Badge
                variant="outline"
                className="border-0 bg-[var(--lagoon-deep)]/10 text-[var(--lagoon-deep)] font-semibold"
              >
                Baru
              </Badge>
            )}
          </div>
          {rating > 0 && (
            <div className="absolute right-3 top-10 flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-xs font-medium text-[var(--sea-ink)]">
              <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-[var(--sea-ink-soft)]">
                ({reviewCount})
              </span>
            </div>
          )}
          <Badge
            variant="outline"
            className="absolute inset-x-3 top-3 border-0 bg-gradient-to-r from-[var(--lagoon-deep)] to-[var(--palm)] text-white"
          >
            Unggulan
          </Badge>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-1 text-sm font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
            {property.name}
          </h3>
          {ownerName && (
            <p className="text-xs text-[var(--sea-ink-soft)]">
              oleh {ownerName}
            </p>
          )}
          {loc && (
            <div className="flex items-center gap-1 text-xs text-[var(--sea-ink-soft)]">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{loc}</span>
            </div>
          )}
          {price !== null && (
            <div className="mt-1 text-base font-bold text-[var(--lagoon-deep)]">
              {currency(price)}
              <span className="text-xs font-normal text-[var(--sea-ink-soft)]">
                /bulan
              </span>
            </div>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-[var(--sea-ink-soft)]">
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" /> {property.unit_count} Unit
            </span>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] hover:border-[var(--lagoon)]"
            >
              <span className="text-xs">Lihat Detail</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}

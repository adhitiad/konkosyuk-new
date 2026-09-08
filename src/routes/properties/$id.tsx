import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, ChevronLeft, Bed, Ruler, Zap, Armchair, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect, useRef, useCallback } from 'react'

import { orpc } from '#/orpc/client'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Input } from '#/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { getPropertyTypeName } from '#/utils/propertyType'

export const Route = createFileRoute('/properties/$id')({
  component: PropertyDetailPage,
  notFoundComponent: () => (
    <main className="page-wrap py-12">
      <p className="text-center text-sm text-[var(--sea-ink-soft)]">
        Properti tidak ditemukan.
      </p>
    </main>
  ),
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      orpc.getProperty.queryOptions({ input: { id: params.id } }),
    )
  },
  head: ({ params }) => {
    const title = `Detail Properti — Konkosyuk`
    const description =
      'Cari kos nyaman di seluruh Indonesia. Booking langsung, harga transparan, tanpa perantara ribet.'
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:title', content: title },
        { property: 'twitter:description', content: description },
      ],
      links: [
        {
          rel: 'canonical',
          href: `/properties/${params.id}`,
        },
      ],
    }
  },
})

type ImageGalleryProps = {
  images: string[]
  name: string
}

const BookingRequestSchema = z.object({
  unit_id: z.string().uuid('Pilih unit terlebih dahulu'),
  num_occupants: z
    .number({ message: 'Masukkan jumlah penghuni' })
    .min(1, 'Minimal 1 penghuni'),
  start_date: z.string().min(1, 'Pilih tanggal mulai'),
  agreed_price: z.number().optional(),
})

function ImageGallery({ images, name }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        {images[selectedIndex] ? (
          <img
            src={images[selectedIndex]}
            alt={name}
            className="h-full w-full object-cover"
            onClick={() => setShowLightbox(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Bed className="h-12 w-12 text-neutral-400" />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`h-20 w-24 shrink-0 rounded-lg border-2 object-cover transition ${
                idx === selectedIndex
                  ? 'border-[var(--lagoon-deep)]'
                  : 'border-[var(--line)]'
              }`}
            >
              <img
                src={img}
                alt={`${name} - ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {showLightbox && images[selectedIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowLightbox(false)}
        >
          <img
            src={images[selectedIndex]}
            alt={name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 rounded-full p-2 text-white hover:bg-white/20"
            aria-label="Tutup gambar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

type BookingRequestFormProps = {
  propertyId: string
  units: { id: string; name: string; price: number }[]
}

function BookingRequestForm({ propertyId, units }: BookingRequestFormProps) {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  const form = useForm<z.input<typeof BookingRequestSchema>>({
    resolver: zodResolver(BookingRequestSchema),
    defaultValues: {
      unit_id: '',
      num_occupants: 1,
      start_date: '',
      agreed_price: undefined,
    },
  })

  const mutation = useMutation({
    ...orpc.createBookingRequest.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['getPropertyBookingRequests'],
      })
      form.reset()
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) =>
          mutation.mutate({
            property_id: propertyId,
            unit_id: v.unit_id,
            tenant_id: session?.user.id,
            num_occupants: v.num_occupants,
            start_date: new Date(v.start_date),
            agreed_price: v.agreed_price,
          }),
        )}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="unit_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="booking-unit">Unit</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="booking-unit">
                    <SelectValue placeholder="Pilih unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} — Rp
                        {Number(unit.price).toLocaleString('id-ID')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="num_occupants"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="booking-occupants">Jumlah Penghuni</FormLabel>
              <FormControl>
                <Input
                  id="booking-occupants"
                  type="number"
                  min={1}
                  placeholder="Mis. 2"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="booking-start-date">Tanggal Mulai</FormLabel>
              <FormControl>
                <Input id="booking-start-date" type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreed_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="booking-price">
                Harga yang Disepakati (opsional)
              </FormLabel>
              <FormControl>
                <Input
                  id="booking-price"
                  type="number"
                  placeholder="Biarkan kosong untuk harga unit"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value
                    field.onChange(val ? Number(val) : undefined)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full rounded-full bg-[var(--lagoon-deep)] text-white hover:bg-[#246f76]"
          disabled={mutation.isPending || !session}
        >
          {mutation.isPending
            ? 'Mengirimkan...'
            : !session
              ? 'Masuk untuk request'
              : 'Kirim Request Booking'}
        </Button>
      </form>
    </Form>
  )
}

function PropertyDetailPage() {
  const { id } = Route.useParams()
  const { data: property, isLoading } = useQuery(
    orpc.getProperty.queryOptions({ input: { id } }),
  )

  if (isLoading) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Memuat detail properti...
        </p>
      </main>
    )
  }

  if (!property) {
    return (
      <main className="page-wrap py-12">
        <p className="text-center text-sm text-[var(--sea-ink-soft)]">
          Properti tidak ditemukan.
        </p>
      </main>
    )
  }

  const images: string[] = Array.isArray(property.images)
    ? property.images.map(String)
    : []

  const amenities: string[] = Array.isArray(property.amenities)
    ? property.amenities.map(String)
    : []

  const basePrice = property.base_price ? Number(property.base_price) : null

  useEffect(() => {
    const title = `${property.name} — Konkosyuk`
    const description =
      property.description?.slice(0, 160) ??
      'Cari kos nyaman di seluruh Indonesia. Booking langsung, harga transparan, tanpa perantara ribet.'

    document.title = title

    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', description)
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      name: property.name,
      description: property.description ?? undefined,
      address: property.address,
      ...(property.city ? { addressLocality: property.city } : {}),
      ...(property.province ? { addressRegion: property.province } : {}),
      ...(basePrice
        ? { priceRange: `IDR ${basePrice.toLocaleString('id-ID')}+` }
        : {}),
      ...(images.length > 0 ? { image: images[0] } : {}),
    }

    const existingScript = document.querySelector(
      'script[data-jsonld="property"]',
    )
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.setAttribute('data-jsonld', 'property')
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [property, basePrice, images])

  return (
    <main className="page-wrap py-6">
      <Link
        to="/properties"
        className="mb-4 flex items-center gap-1 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke daftar properti
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2">
          <ImageGallery images={images} name={property.name} />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
              {property.name}
            </h1>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)]">
              <MapPin className="h-3.5 w-3.5" />
              <span>{property.address}</span>
            </div>
            {property.city && (
              <p className="text-sm text-[var(--sea-ink-soft)]">
                {property.city}
                {property.province && `, ${property.province}`}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={property.status === 'aktif' ? 'default' : 'secondary'}
            >
              {property.status}
            </Badge>
            <Badge variant="outline">
              {getPropertyTypeName(property.type)}
            </Badge>
            {property.is_featured && (
              <Badge
                variant="default"
                className="bg-[var(--lagoon-deep)] text-white"
              >
                Unggulan
              </Badge>
            )}
          </div>

          {basePrice !== null && (
            <div>
              <p className="text-sm text-[var(--sea-ink-soft)]">Mulai dari</p>
              <p className="text-3xl font-bold text-[var(--lagoon-deep)]">
                Rp{basePrice.toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deskripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--sea-ink-soft)] whitespace-pre-line">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}

          {amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fasilitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {property.units.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unit Tersedia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {property.units.map((unit) => {
                    const unitPrice = Number(unit.price)
                    return (
                      <div
                        key={unit.id}
                        className="rounded-lg border border-[var(--line)] p-4"
                      >
                        <h3 className="font-semibold text-[var(--sea-ink)]">
                          {unit.name}
                        </h3>
                        {unit.description && (
                          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                            {unit.description}
                          </p>
                        )}
                        <p className="mt-2 font-semibold text-[var(--lagoon-deep)]">
                          Rp{unitPrice.toLocaleString('id-ID')}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--sea-ink-soft)]">
                          {unit.capacity && (
                            <span className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              {unit.capacity} orang
                            </span>
                          )}
                          {unit.size && (
                            <span className="flex items-center gap-1">
                              <Ruler className="h-3 w-3" />
                              {unit.size}
                            </span>
                          )}
                          {unit.electricity_included && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Listrik termasuk
                            </span>
                          )}
                          {unit.furniture_included && (
                            <span className="flex items-center gap-1">
                              <Armchair className="h-3 w-3" />
                              Perabot termasuk
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>

              {property.units.length > 0 && (
                <>
                  <div className="border-t px-6 py-4">
                    <p className="text-sm font-semibold text-[var(--sea-ink)]">
                      Request Booking Unit
                    </p>
                    <p className="text-xs text-[var(--sea-ink-soft)]">
                      Isi formulir di bawah untuk menghubungi pemilik.
                    </p>
                  </div>
                  <CardContent>
                    <BookingRequestForm
                      propertyId={property.id}
                      units={property.units.map((u) => ({
                        id: u.id,
                        name: u.name,
                        price: Number(u.price),
                      }))}
                    />
                  </CardContent>
                </>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lokasi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                {property.address}
                {property.city && (
                  <>
                    <br />
                    {property.city}
                    {property.province && `, ${property.province}`}
                  </>
                )}
                {property.district && (
                  <>
                    <br />
                    {property.district}
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Info Properti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--sea-ink-soft)]">Tipe</span>
                <span>{getPropertyTypeName(property.type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--sea-ink-soft)]">Status</span>
                <span>{property.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--sea-ink-soft)]">
                  GPS Terverifikasi
                </span>
                <span>{property.gps_verified ? 'Ya' : 'Tidak'}</span>
              </div>
              {property.units.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--sea-ink-soft)]">
                    Jumlah Unit
                  </span>
                  <span>{property.units.length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

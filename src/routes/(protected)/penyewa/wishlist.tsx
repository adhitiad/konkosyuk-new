import { Heart, LogIn } from 'lucide-react'

import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { authClient } from '#/lib/auth-client'
import { orpc } from '#/orpc/client'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { PropertyCardSkeleton } from '#/components/ui/skeleton-card'
import { PropertyCard } from '#/components/property/PropertyCard'

export const Route = createFileRoute('/(protected)/penyewa/wishlist')({
  component: WishlistPage,
})

function WishlistPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const qc = useQueryClient()

  const { data: items, isLoading: wishlistLoading } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: async () => {
      const result = await orpc.getMyWishlist.call()
      return result
    },
    enabled: !!session?.user,
  })

  const removeMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      return await orpc.removeFromWishlist.call({ propertyId })
    },
    onSuccess: () => {
      void qc.invalidateQueries()
    },
  })

  if (sessionPending) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">Memuat sesi...</p>
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
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Kamu perlu masuk terlebih dahulu untuk melihat daftar favorit.
            </p>
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

  const wishlisted = items ?? []

  return (
    <main className="page-wrap py-8">
      <div className="mb-6 flex items-center gap-3">
        <Heart className="h-5 w-5 text-[var(--lagoon-deep)]" />
        <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
          Properti Favorit
        </h1>
      </div>

      {wishlistLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : wishlisted.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="mb-3 h-10 w-10 text-[var(--sea-ink-soft)]" />
          <p className="text-base font-medium text-[var(--sea-ink)]">
            Belum ada properti favorit
          </p>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            Klik ikon hati di kartu properti untuk menambahkan ke daftar
            favorit.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Jelajahi Properti</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlisted.map((item) => {
            const prop = item.property
            const images: string[] = Array.isArray(prop.images)
              ? prop.images
                  .map((v: unknown) => {
                    if (typeof v === 'string') return v
                    if (
                      v !== null &&
                      typeof v === 'object' &&
                      'url' in v &&
                      typeof (v as { url: string }).url === 'string'
                    ) {
                      return (v as { url: string }).url
                    }
                    return ''
                  })
                  .filter(Boolean)
              : []

            return (
              <div key={item.id} className="relative">
                <PropertyCard
                  property={{
                    id: prop.id,
                    name: prop.name,
                    description: prop.description,
                    address: prop.address,
                    city: prop.city,
                    province: prop.province,
                    district: prop.district,
                    type: prop.type,
                    gender_type: null,
                    rental_period: null,
                    is_featured: prop.is_featured,
                    images,
                    latitude: prop.latitude,
                    longitude: prop.longitude,
                    min_price: prop.min_price,
                    unit_count: 0,
                    average_rating: prop.average_rating,
                    total_reviews: prop.total_reviews,
                    owner_name: prop.owner_name,
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-3 z-20 rounded-full bg-white/90 text-red-500 backdrop-blur-sm hover:bg-white hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    removeMutation.mutate(prop.id)
                  }}
                  disabled={removeMutation.isPending}
                  aria-label="Hapus dari favorit"
                >
                  <Heart
                    className="h-4 w-4"
                    fill="currentColor"
                    strokeWidth={2}
                  />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

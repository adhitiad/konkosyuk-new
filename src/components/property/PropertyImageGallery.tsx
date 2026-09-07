import { useState } from 'react'
import { X, Bed } from 'lucide-react'

import { Skeleton } from '#/components/ui/skeleton'
import type { FotoPropertiWithRelations } from '#/types/property'

type PropertyImageGalleryProps = {
  photos: FotoPropertiWithRelations[]
  name: string
  isLoading?: boolean
}

export function PropertyImageGallery({
  photos,
  name,
  isLoading,
}: PropertyImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const images = photos.map((p) => p.url_foto)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-24 shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const hasImages = images.length > 0

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        {hasImages ? (
          <img
            src={images[selectedIndex]}
            alt={`${name} #${selectedIndex + 1}`}
            className="h-full w-full object-cover"
            onClick={() => setShowLightbox(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Bed className="h-12 w-12 text-neutral-400" />
          </div>
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedIndex(idx)
                setShowLightbox(false)
              }}
              className={`relative h-20 w-24 shrink-0 rounded-lg border-2 object-cover transition ${
                idx === selectedIndex
                  ? 'border-[var(--lagoon-deep)]'
                  : 'border-[var(--line)]'
              }`}
              aria-label={`Foto ${idx + 1}`}
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

      {showLightbox && hasImages && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowLightbox(false)}
          role="button"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowLightbox(false)
          }}
        >
          <img
            src={images[selectedIndex]}
            alt={`${name} #${selectedIndex + 1}`}
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

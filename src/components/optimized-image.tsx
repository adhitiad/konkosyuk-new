import { useState } from 'react'
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait'
}

const aspectClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
}

export function OptimizedImage({
  src,
  alt,
  className,
  aspectRatio = 'video',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={cn(
          aspectClasses[aspectRatio],
          'bg-gray-100 flex items-center justify-center',
          className,
        )}
      >
        <span className="text-gray-400 text-sm">Gambar tidak tersedia</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100',
        aspectClasses[aspectRatio],
        className,
      )}
    >
      {isLoading && <Skeleton className="absolute inset-0 rounded-none" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        className={cn(
          'w-full h-full object-cover object-center transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
        )}
      />
    </div>
  )
}

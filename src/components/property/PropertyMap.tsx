'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Map, Marker } from 'maplibre-gl'

interface PropertyMapProps {
  lat: number
  lng: number
  address?: string | null
}

const MAP_STYLE = 'https://demotiles.maplibre.org/style.json'
const DEFAULT_ZOOM = 16

export function PropertyMap({ lat, lng, address }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    let disposed = false

    void (async () => {
      const { Map, Marker, Popup } = await import('maplibre-gl')

      const map = new Map({
        container: containerRef.current!,
        style: MAP_STYLE,
        center: [lng, lat],
        zoom: DEFAULT_ZOOM,
      })

      mapRef.current = map

      const marker = new Marker({
        color: '#3178F6',
      })
        .setLngLat([lng, lat])
        .addTo(map)

      markerRef.current = marker

      if (address) {
        marker.setPopup(new Popup({ offset: 20 }).setText(address))
        marker.togglePopup()
      }

      map.on('load', () => {
        if (!disposed) setIsMapReady(true)
      })
    })()

    return () => {
      disposed = true
      markerRef.current?.remove()
      mapRef.current?.remove()
    }
  }, [lat, lng, address])

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg border">
      <div ref={containerRef} className="absolute inset-0" />

      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/80">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--lagoon-deep)]" />
        </div>
      )}
    </div>
  )
}

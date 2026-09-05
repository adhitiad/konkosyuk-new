'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin, Search } from 'lucide-react'
import type { Map, Marker } from 'maplibre-gl'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { client } from '#/orpc/client'

interface MapPickerProps {
  lat: number | null
  lng: number | null
  onLocationSelect: (lat: number, lng: number) => void
}

interface SearchResult {
  lat: number
  lng: number
  displayName: string
}

const DEFAULT_LAT = -6.2
const DEFAULT_LNG = 106.8
const MAP_STYLE = 'https://demotiles.maplibre.org/style.json'

const SEARCH_DEBOUNCE_MS = 500

export function MapPicker({ lat, lng, onLocationSelect }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const searchDebounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    void (async () => {
      const { Map, Marker } = await import('maplibre-gl')

      const map = new Map({
        container: mapContainerRef.current!,
        style: MAP_STYLE,
        center: [lng ?? DEFAULT_LNG, lat ?? DEFAULT_LAT],
        zoom: 13,
      })

      mapRef.current = map

      const marker = new Marker({
        draggable: true,
        color: '#3178F6',
      })
        .setLngLat([lng ?? DEFAULT_LNG, lat ?? DEFAULT_LAT])
        .addTo(map)

      markerRef.current = marker

      marker.on('dragend', () => {
        const pos = marker.getLngLat()
        onLocationSelect(pos.lat, pos.lng)
      })

      map.on('click', (e) => {
        marker.setLngLat(e.lngLat)
        onLocationSelect(e.lngLat.lat, e.lngLat.lng)
      })

      map.on('load', () => {
        setIsMapReady(true)
      })
    })()

    return () => {
      markerRef.current?.remove()
      mapRef.current?.remove()
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) return
    setIsSearching(true)
    try {
      const results = await client.searchLocations({ q: searchQuery, limit: 5 })

      setSearchResults(
        results.map((r) => ({
          lat: r.lat,
          lng: r.lng,
          displayName: r.displayName,
        })),
      )
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const debouncedSearch = (value: string) => {
    setSearchQuery(value)
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    if (value.length >= 3) {
      searchDebounceRef.current = window.setTimeout(() => {
        void handleSearch()
      }, SEARCH_DEBOUNCE_MS)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    const map = mapRef.current
    const marker = markerRef.current
    if (map && marker) {
      map.flyTo({ center: [result.lng, result.lat], zoom: 15 })
      marker.setLngLat([result.lng, result.lat])
      onLocationSelect(result.lat, result.lng)
    }
    setSearchResults([])
    setSearchQuery('')
  }

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg border">
      <div ref={mapContainerRef} className="absolute inset-0" />

      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <div className="flex gap-1">
          <Input
            type="text"
            placeholder="Cari lokasi..."
            value={searchQuery}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="h-8 w-48 text-sm"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void handleSearch()}
            disabled={isSearching || searchQuery.length < 3}
            className="h-8 w-8 p-0"
          >
            {isSearching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Search className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {searchResults.length > 0 ? (
        <div className="absolute top-12 left-2 z-10 flex max-h-48 flex-col gap-1 overflow-y-auto rounded border bg-white dark:bg-neutral-900">
          {searchResults.map((result, i) => (
            <button
              key={i}
              onClick={() => handleResultClick(result)}
              className="whitespace-nowrap px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {result.displayName}
            </button>
          ))}
        </div>
      ) : null}

      {lat != null && lng != null && (
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded bg-white/90 px-2 py-1 text-xs dark:bg-neutral-900/90">
          <MapPin className="h-3 w-3 text-[var(--lagoon-deep)]" />
          <span>
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
        </div>
      )}

      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/80">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--lagoon-deep)]" />
        </div>
      )}
    </div>
  )
}

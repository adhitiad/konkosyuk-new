'use client'

import { createContext, memo, useContext, useEffect, useRef } from 'react'
import { Map as GMap, useMap } from '@vis.gl/react-google-maps'

export interface Property {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string | null
}

export interface PropertyMapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  onBoundsChange?: (bounds: {
    north: number
    south: number
    east: number
    west: number
  }) => void
}

const DEFAULT_CENTER = { lat: -6.2, lng: 106.8 }
const DEFAULT_ZOOM = 12

export const MapPropertiesContext = createContext<Property[]>([])

function BoundsHandler({
  onBoundsChange,
}: {
  onBoundsChange?: (bounds: any) => void
}) {
  const map = useMap()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!map || !onBoundsChange) return
    const handleBoundsChanged = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const bounds = map.getBounds()
        const zoom = map.getZoom()
        if (!bounds) return
        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()
        const next = {
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng(),
        }
        const key = `${next.north.toFixed(4)},${next.south.toFixed(4)},${next.east.toFixed(4)},${next.west.toFixed(4)},${zoom?.toFixed(2) ?? ''}`
        if (key === lastKeyRef.current) return
        lastKeyRef.current = key
        onBoundsChange(next)
      }, 1000)
    }
    const listener = map.addListener('idle', handleBoundsChanged)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      listener.remove()
    }
  }, [map, onBoundsChange])

  return null
}

const Markers = memo(function Markers() {
  const properties = useContext(MapPropertiesContext)
  const map = useMap()
  const markersMap = useRef(new Map<string, any>())

  useEffect(() => {
    if (!map) return

    const propertyIds = new Set(properties.map((p) => p.id))

    markersMap.current.forEach((marker: any, id: string) => {
      if (!propertyIds.has(id)) {
        marker.setMap(null)
        markersMap.current.delete(id)
      }
    })

    properties.forEach((prop) => {
      if (!prop.latitude || !prop.longitude) return
      if (markersMap.current.has(prop.id)) return

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: prop.latitude, lng: prop.longitude },
        title: prop.name,
      })
      markersMap.current.set(prop.id, marker)
    })
  }, [map, properties])

  useEffect(() => {
    return () => {
      markersMap.current.forEach((marker: any) => marker.setMap(null))
      markersMap.current.clear()
    }
  }, [])

  return null
})

const PropertyMapInner = memo(function PropertyMapInner({
  center,
  zoom = DEFAULT_ZOOM,
  onBoundsChange,
}: PropertyMapProps) {
  const mapCenter = center || DEFAULT_CENTER

  return (
    <GMap
      defaultCenter={mapCenter}
      defaultZoom={zoom}
      gestureHandling={'greedy'}
      className="w-full h-full rounded-lg"
      mapId="konkosyuk-map"
    >
      <BoundsHandler onBoundsChange={onBoundsChange} />
      <Markers />
    </GMap>
  )
})

export const PropertyMap = memo(function PropertyMap(props: PropertyMapProps) {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-800">
      <PropertyMapInner
        center={props.center}
        zoom={props.zoom}
        onBoundsChange={props.onBoundsChange}
      />
    </div>
  )
})

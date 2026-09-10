'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Map } from 'maplibre-gl'

interface Property {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string | null
  images?: unknown
}

interface PropertyMapProps {
  properties: Property[]
  center?: { lat: number; lng: number }
  zoom?: number
  onBoundsChange?: (bounds: {
    north: number
    south: number
    east: number
    west: number
  }) => void
}

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      type: 'Point'
      coordinates: [number, number]
    }
    properties: {
      id: string
      name: string
      address?: string | null
    }
  }>
}

const MAP_STYLE_LIGHT =
  'https://tiles.openfreemap.org/styles/liberty'
const MAP_STYLE_DARK =
  'https://tiles.openfreemap.org/styles/dark'
const DEFAULT_ZOOM = 13
const DEFAULT_CENTER: [number, number] = [106.8, -6.2]

function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

function sanitizeProperties(props: Property[]): Property[] {
  return props
    .filter((p) => isValidCoordinate(p.latitude, p.longitude))
    .map((p) => ({
      ...p,
      latitude: Math.max(-90, Math.min(90, p.latitude)),
      longitude: Math.max(-180, Math.min(180, p.longitude)) % 360,
    }))
}

export function PropertyMap({
  properties,
  center,
  zoom = DEFAULT_ZOOM,
  onBoundsChange,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const moveEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onBoundsChangeRef = useRef(onBoundsChange)
  const propertiesRef = useRef(properties)

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange
  }, [onBoundsChange])
  useEffect(() => {
    propertiesRef.current = properties
  }, [properties])

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      const isDark = root.classList.contains('dark')
      setTheme(isDark ? 'dark' : 'light')
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    const isDark = root.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
    return () => observer.disconnect()
  }, [])

  const safeCenter: [number, number] =
    center && isValidCoordinate(center.lat, center.lng)
      ? [center.lng, center.lat]
      : DEFAULT_CENTER
  const safeCenterRef = useRef(safeCenter)
  safeCenterRef.current = safeCenter
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  useEffect(() => {
    if (!containerRef.current) return
    let disposed = false

    const timer = setTimeout(() => {
      if (disposed || !containerRef.current) return

      void (async () => {
        try {
          const { Map } = await import('maplibre-gl')

          console.log('📐 Container dimensions:', {
            width: containerRef.current!.offsetWidth,
            height: containerRef.current!.offsetHeight,
          })

          const map = new Map({
            container: containerRef.current!,
            style: theme === 'dark' ? MAP_STYLE_DARK : MAP_STYLE_LIGHT,
            center: safeCenterRef.current,
            zoom: zoomRef.current,
          })
          mapRef.current = map

          map.on('error', (e) => {
            console.error('❌ MapLibre error:', e.error)
          })

          map.on('styleimagemissing', (e) => {
            console.warn('⚠️ Image missing in style:', e.id)
          })

          map.on('load', () => {
            if (disposed) return
            const canvas = map.getCanvas()
            console.log('✅ Map loaded')
            console.log('🎨 Canvas element:', canvas)
            console.log('📏 Canvas dimensions:', {
              offsetWidth: canvas.offsetWidth,
              offsetHeight: canvas.offsetHeight,
              clientWidth: canvas.clientWidth,
              clientHeight: canvas.clientHeight,
              style: canvas.style.cssText,
            })
            if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
              console.error('❌ Canvas memiliki dimensi 0!')
            }

            map.resize()
            map.triggerRepaint()
            setIsMapReady(true)
            addPropertySources(map, propertiesRef.current)

            let repaintAttempts = 0
            const repaintInterval = setInterval(() => {
              map.triggerRepaint()
              repaintAttempts++
              console.log(`🔄 Repaint attempt ${repaintAttempts}`)
              if (repaintAttempts >= 5) {
                clearInterval(repaintInterval)
              }
            }, 1000)
          })

          map.on('tileloaded', (e) => {
            console.log('✅ Tile loaded:', e.tile?.tileID)
          })

          map.on('dataloading', (e) => {
            console.log('📥 Data loading:', e.dataType)
          })

          map.on('data', (e) => {
            console.log('📦 Data event:', e.dataType)
          })

          map.on('moveend', () => {
            if (moveEndRef.current) {
              clearTimeout(moveEndRef.current)
            }
            moveEndRef.current = setTimeout(() => {
              if (!onBoundsChangeRef.current) return
              const bounds = map.getBounds()
              onBoundsChangeRef.current({
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
              })
            }, 600)
          })

          map.on('click', 'cluster', () => {
            const features = map.queryRenderedFeatures(
              [
                map.getCanvas().clientWidth / 2,
                map.getCanvas().clientHeight / 2,
              ],
              { layers: ['cluster'] },
            )
            if (features.length > 0) {
              const cluster = features[0]
              const source = map.getSource('properties')
              if (!source || source.type !== 'geojson') return
              const geoSource = source as unknown as {
                getClusterExpansionZoom: (id: number) => number
              }
              if (typeof geoSource.getClusterExpansionZoom !== 'function')
                return
              const clusterId = (cluster.properties as { cluster_id: number })
                .cluster_id
              const expansionZoom = geoSource.getClusterExpansionZoom(clusterId)
              const geom = cluster.geometry as { coordinates: number[] }
              const [lng, lat] = geom.coordinates
              if (!isValidCoordinate(lat, lng)) return
              map.flyTo({
                center: [lng, lat] as [number, number],
                zoom: expansionZoom,
              })
            }
          })
        } catch (error) {
          console.error('❌ Gagal inisialisasi MapLibre:', error)
        }
      })()
    }, 100)

    return () => {
      disposed = true
      clearTimeout(timer)
      mapRef.current?.remove()
    }
  }, [theme])

  useEffect(() => {
    const map = mapRef.current
    const source = map?.getSource('properties')
    if (!source) return

    const validProperties = sanitizeProperties(propertiesRef.current)
    const geojson: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: validProperties.map((p) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          id: p.id,
          name: p.name,
          address: p.address,
        },
      })),
    }

    ;(
      source as unknown as { setData: (data: GeoJsonFeatureCollection) => void }
    ).setData(geojson)
  }, [properties])

  function addPropertySources(map: Map, props: Property[]) {
    const geojson: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: props.map((p) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          id: p.id,
          name: p.name,
          address: p.address,
        },
      })),
    }

    map.addSource('properties', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    addClusterLayers(map)
  }

  function addClusterLayers(map: Map) {
    map.addLayer({
      id: 'cluster',
      type: 'circle',
      source: 'properties',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'point_count'],
          0,
          '#3178F6',
          100,
          '#1e3a5f',
          750,
          '#0f1f33',
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'point_count'],
          0,
          20,
          1000,
          30,
        ],
        'circle-opacity': 0.85,
      },
    })

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'properties',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'properties',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#3178F6',
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })
  }

  return (
    <div className="relative h-96 w-full overflow-hidden rounded-lg border">
      <div ref={containerRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/80">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--lagoon-deep)]" />
        </div>
      )}
    </div>
  )
}

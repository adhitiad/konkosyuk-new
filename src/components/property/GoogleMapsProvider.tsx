'use client'

import { type ReactNode, memo, useMemo } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'

const MAP_LIBRARIES = ['marker'] as const

export const GoogleMapsProvider = memo(function GoogleMapsProvider({
  apiKey,
  children,
}: {
  apiKey: string
  children: ReactNode
}) {
  const libraries = useMemo(() => [...MAP_LIBRARIES], [])

  return (
    <APIProvider apiKey={apiKey} libraries={libraries}>
      {children}
    </APIProvider>
  )
})

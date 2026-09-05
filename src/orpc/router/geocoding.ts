import { z } from 'zod'
import { os } from '#/orpc/server'
import axios from 'axios'

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  address?: Record<string, string>
}

export const searchLocations = os
  .input(
    z.object({
      q: z.string().min(3),
      limit: z.coerce.number().min(1).max(20).optional().default(10),
    }),
  )
  .handler(async ({ input }) => {
    const { data } = await axios.get<NominatimResult[]>(
      `${NOMINATIM_BASE}/search`,
      {
        params: {
          q: input.q,
          format: 'json',
          addressdetails: 1,
          limit: input.limit,
        },
        headers: {
          'User-Agent': 'Konkosyuk/1.0 (https://konkosyuk.id)',
          Referer: 'https://konkosyuk.id/',
        },
      },
    )

    return data.map((r) => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      displayName: r.display_name,
      type: r.class,
      importance: r.importance,
      address: r.address,
    }))
  })

export const reverseGeocode = os
  .input(
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  )
  .handler(async ({ input }) => {
    const { data } = await axios.get<{
      display_name: string
      address: Record<string, string>
    }>(`${NOMINATIM_BASE}/reverse`, {
      params: {
        lat: input.lat,
        lon: input.lng,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'Konkosyuk/1.0 (https://konkosyuk.id)',
        Referer: 'https://konkosyuk.id/',
      },
    })

    return {
      displayName: data.display_name,
      address: data.address,
    }
  })

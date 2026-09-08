import { Wifi, Snowflake, Bath } from 'lucide-react'

export type SearchRoomRow = {
  id: string
  name: string
  price: number
  status: string
  facilities: string[]
  property_id: string
  property_name: string
  property_city: string | null
  property_type: string
  property_address: string
  property_images: string[]
  property_base_price: number | null
}

export const FACILITY_OPTIONS = [
  { value: 'WiFi', label: 'WiFi', icon: Wifi },
  { value: 'AC', label: 'AC', icon: Snowflake },
  { value: 'Kamar Mandi Dalam', label: 'Kamar Mandi Dalam', icon: Bath },
] as const

export const HARGA_MIN = 0
export const HARGA_MAX = 10_000_000
export const HARGA_STEP = 100_000

export const ROOM_STATUS_LABELS: Record<string, string> = {
  available: 'Tersedia',
  booked: 'Terisi',
  maintenance: 'Perbaikan',
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

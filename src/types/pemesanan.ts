import type { z } from 'zod'

import type { StatusPemesananSchema } from '#/lib/validators/pemesanan'

export type StatusPemesanan = z.infer<typeof StatusPemesananSchema>

export interface PemesananWithRelations {
  id: string
  room_id: string
  tenant_id: string
  nama_unit: string
  nama_properti: string
  nama_tenant: string
  jumlah_penghuni: number
  tanggal_mulai: Date
  tanggal_selesai: Date | null
  total_harga: string
  status: StatusPemesanan
  catatan: string | null
  created_at: Date
  updated_at: Date
}

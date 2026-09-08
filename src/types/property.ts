import type { z } from 'zod'

import type {
  step1InfoDasarSchema,
  step2UnitSchema,
  step3FasilitasFotoSchema,
  unitPropertiSchema,
  fasilitasSchema,
  fotoPropertiSchema,
} from '#/lib/validators/property'

export type Step1InfoDasarInput = z.infer<typeof step1InfoDasarSchema>
export type Step2UnitInput = z.infer<typeof step2UnitSchema>
export type Step3FasilitasFotoInput = z.infer<typeof step3FasilitasFotoSchema>
export type UnitPropertiInput = z.infer<typeof unitPropertiSchema>
export type FasilitasInput = z.infer<typeof fasilitasSchema>
export type FotoPropertiInput = z.infer<typeof fotoPropertiSchema>

export interface PropertyWithRelations {
  id: string
  nama_properti: string
  deskripsi: string | null
  alamat_lengkap: string
  latitude: string | null
  longitude: string | null
  tipe_properti: 'KOST' | 'KONTRAKAN'
  status: 'DRAFT' | 'AKTIF' | 'NONAKTIF'
  pemilik_id: string
  pemilik?: { name: string; phone: string | null }
  created_at: Date
  updated_at: Date
  unit_propertis: UnitPropertiWithRelations[]
  fasilitas: FasilitasWithRelations[]
  foto_propertis: FotoPropertiWithRelations[]
}

export interface UnitPropertiWithRelations {
  id: string
  property_id: string
  nama_unit: string
  luas_meter: string
  harga_bulanan: string
  kapasitas: number
  status_ketersediaan: 'TERSEDIA' | 'TERISI' | 'DIPESAN' | 'MAINTENANCE'
  created_at: Date
  updated_at: Date
}

export interface FasilitasWithRelations {
  id: string
  nama_fasilitas: string
  ikon: string | null
  property_id: string
  unit_id: string | null
  created_at: Date
  updated_at: Date
}

export interface FotoPropertiWithRelations {
  id: string
  property_id: string
  url_foto: string
  urutan: number
  apakah_utama: boolean
  created_at: Date
  updated_at: Date
}

export interface SavedWizardStep1Result {
  property_id: string
  message: string
}

export interface SavedWizardStep2Result {
  property_id: string
  units_count: number
  message: string
}

export interface SavedWizardStep3Result {
  property_id: string
  fasilitas_count: number
  foto_count: number
  message: string
}

export interface PublishPropertyResult {
  property_id: string
  status: 'AKTIF' | 'NONAKTIF' | 'DRAFT'
  message: string
}

export interface UnitPropertyListResult {
  id: string
  nama_unit: string
  harga_bulanan: string
  kapasitas: number
  status_ketersediaan: 'TERSEDIA' | 'TERISI' | 'DIPESAN' | 'MAINTENANCE'
}

export interface PropertyListResult {
  id: string
  nama_properti: string
  alamat_lengkap: string
  tipe_properti: 'KOST' | 'KONTRAKAN'
  status: 'DRAFT' | 'AKTIF' | 'NONAKTIF'
  created_at: Date
  unit_count: number
  units: UnitPropertyListResult[]
}

import { z } from 'zod'

export const TipePropertiSchema = z.enum(['KOST', 'KONTRAKAN'])

export type TipeProperti = z.infer<typeof TipePropertiSchema>

export const StatusPropertiSchema = z.enum(['DRAFT', 'AKTIF', 'NONAKTIF'])

export type StatusProperti = z.infer<typeof StatusPropertiSchema>

export const StatusKetersediaanSchema = z.enum([
  'TERSEDIA',
  'TERISI',
  'DIPESAN',
  'MAINTENANCE',
])

export type StatusKetersediaan = z.infer<typeof StatusKetersediaanSchema>

export const step1InfoDasarSchema = z.object({
  nama_properti: z.string().min(3, 'Nama properti minimal 3 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter').optional(),
  alamat_lengkap: z.string().min(5, 'Alamat lengkap diperlukan'),
  latitude: z.union([z.string(), z.number()]).optional(),
  longitude: z.union([z.string(), z.number()]).optional(),
  tipe_properti: TipePropertiSchema,
})

export type Step1InfoDasarInput = z.infer<typeof step1InfoDasarSchema>

export const unitPropertiSchema = z.object({
  nama_unit: z.string().min(1, 'Nama unit diperlukan'),
  luas_meter: z.number().positive('Luas meter harus lebih dari 0'),
  harga_bulanan: z.number().min(0, 'Harga bulanan tidak boleh negatif'),
  kapasitas: z.number().int().positive('Kapasitas harus lebih dari 0'),
  status_ketersediaan: StatusKetersediaanSchema.optional(),
})

export type UnitPropertiInput = z.infer<typeof unitPropertiSchema>

export const step2UnitSchema = z.object({
  units: z.array(unitPropertiSchema).min(1, 'Minimal satu unit diperlukan'),
})

export type Step2UnitInput = z.infer<typeof step2UnitSchema>

export const fasilitasSchema = z.object({
  nama_fasilitas: z.string().min(1, 'Nama fasilitas diperlukan'),
  ikon: z.string().optional(),
  unit_id: z.string().uuid().optional(),
})

export type FasilitasInput = z.infer<typeof fasilitasSchema>

export const fotoPropertiSchema = z.object({
  url_foto: z.string().url('URL foto tidak valid'),
  urutan: z.number().int().min(0, 'Urutan foto tidak boleh negatif'),
  apakah_utama: z.boolean().optional(),
})

export type FotoPropertiInput = z.infer<typeof fotoPropertiSchema>

export const step3FasilitasFotoSchema = z.object({
  fasilitas: z.array(fasilitasSchema).optional(),
  foto_properti: z
    .array(fotoPropertiSchema)
    .min(1, 'Minimal satu foto diperlukan'),
})

export type Step3FasilitasFotoInput = z.infer<typeof step3FasilitasFotoSchema>

export const publishPropertySchema = z.object({
  property_id: z.string().uuid(),
})

export type PublishPropertyInput = z.infer<typeof publishPropertySchema>

export const getPropertyByIdSchema = z.object({
  id: z.string().uuid(),
})

export type GetPropertyByIdInput = z.infer<typeof getPropertyByIdSchema>

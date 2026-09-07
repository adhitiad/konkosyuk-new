import { z } from 'zod'

export const SkemaRole = z.enum(['PENYEWA', 'PEMILIK', 'ADMIN', 'STAFF'])

export type TipeRole = z.infer<typeof SkemaRole>

export const SkemaStatusKyc = z.enum([
  'BELUM_VERIFIKASI',
  'MENUNGGU',
  'TERVERIFIKASI',
  'DITOLAK',
])

export type TipeStatusKyc = z.infer<typeof SkemaStatusKyc>

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z
    .string()
    .min(8, 'Nomor WhatsApp tidak valid')
    .max(20, 'Nomor WhatsApp tidak valid')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter')
    .max(72, 'Kata sandi terlalu panjang'),
  role: SkemaRole,
})

export type RegisterInput = z.infer<typeof registerSchema>

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  phone: z
    .string()
    .min(8, 'Nomor WhatsApp tidak valid')
    .max(20, 'Nomor WhatsApp tidak valid')
    .optional()
    .or(z.literal('')),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const changeRoleSchema = z.object({
  role: SkemaRole,
})

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>

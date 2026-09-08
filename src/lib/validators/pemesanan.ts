import { z } from 'zod'

export const StatusPemesananSchema = z.enum([
  'MENUNGGU_PERSETUJUAN',
  'DITERIMA',
  'DITOLAK',
  'DIBATALKAN',
])

export type StatusPemesanan = z.infer<typeof StatusPemesananSchema>

export const AjukanPemesananInput = z
  .object({
    room_id: z.string().uuid('Kamar tidak valid'),
    tanggal_mulai: z.date({ message: 'Tanggal mulai diperlukan' }),
    tanggal_selesai: z.date().optional(),
    jumlah_penghuni: z
      .number({ message: 'Jumlah penghuni diperlukan' })
      .int()
      .min(1, 'Minimal 1 penghuni'),
    catatan: z.string().optional(),
  })
  .refine(
    (data) =>
      data.tanggal_selesai ? data.tanggal_selesai > data.tanggal_mulai : true,
    {
      message: 'Tanggal selesai harus setelah tanggal mulai',
      path: ['tanggal_selesai'],
    },
  )
  .refine(
    (data) => {
      if (!data.tanggal_selesai) return true
      const diffDay =
        (data.tanggal_selesai.getTime() - data.tanggal_mulai.getTime()) /
        (24 * 60 * 60 * 1000)
      return diffDay >= 30
    },
    {
      message: 'Durasi minimal pemesanan adalah 1 bulan (30 hari)',
      path: ['tanggal_selesai'],
    },
  )

export type AjukanPemesananInput = z.infer<typeof AjukanPemesananInput>

export const SetujuiPemesananInput = z.object({
  id: z.string().uuid(),
})

export type SetujuiPemesananInput = z.infer<typeof SetujuiPemesananInput>

export const TolakPemesananInput = z.object({
  id: z.string().uuid(),
})

export type TolakPemesananInput = z.infer<typeof TolakPemesananInput>

export const BatalPemesananInput = z.object({
  id: z.string().uuid(),
})

export type BatalPemesananInput = z.infer<typeof BatalPemesananInput>

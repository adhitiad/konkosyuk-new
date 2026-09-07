import { z } from 'zod'

export const StatusBookingSchema = z.enum([
  'MENUNGGU_PEMBAYARAN_DP',
  'MENUNGGU_VERIFIKASI_DP',
  'MENUNGGU_PERSETUJUAN',
  'MENUNGGU_PELUNASAN',
  'AKTIF',
  'SELESAI',
  'PROSES_REFUND_DP',
  'SELESAI_DITOLAK',
  'DIBATALKAN',
])

export type StatusBooking = z.infer<typeof StatusBookingSchema>

export const StatusRefundDPSchema = z.enum([
  'BELUM_REFUND',
  'MENUNGGU_PROSES',
  'SEDANG_DIPROSES',
  'BERHASIL',
  'GAGAL',
])

export type StatusRefundDP = z.infer<typeof StatusRefundDPSchema>

export const TipeTransaksiSchema = z.enum(['DP', 'PELUNASAN', 'REFUND'])

export type TipeTransaksi = z.infer<typeof TipeTransaksiSchema>

export const StatusTransaksiSchema = z.enum([
  'PENDING',
  'BERHASIL',
  'GAGAL',
  'DIBATALKAN',
])

export type StatusTransaksi = z.infer<typeof StatusTransaksiSchema>

export const MetodePembayaranSchema = z.enum([
  'TRANSFER',
  'E_WALLET',
  'CREDIT_CARD',
  'VA',
])

export type MetodePembayaran = z.infer<typeof MetodePembayaranSchema>

export const StatusPembayaranSchema = z.enum(['PENDING', 'BERHASIL', 'GAGAL'])

export type StatusPembayaran = z.infer<typeof StatusPembayaranSchema>

export const StatusRefundSchema = z.enum(['MENUNGGU', 'DISETUJUI', 'DITOLAK'])

export type StatusRefund = z.infer<typeof StatusRefundSchema>

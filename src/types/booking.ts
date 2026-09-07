import type { z } from 'zod'

import type {
  StatusBookingSchema,
  StatusRefundDPSchema,
  TipeTransaksiSchema,
  StatusTransaksiSchema,
} from '#/lib/validators/booking'

export type StatusBooking = z.infer<typeof StatusBookingSchema>

export type StatusRefundDP = z.infer<typeof StatusRefundDPSchema>

export type TipeTransaksi = z.infer<typeof TipeTransaksiSchema>

export type StatusTransaksi = z.infer<typeof StatusTransaksiSchema>

export interface PaymentTransactionData {
  id: string
  tipeTransaksi: TipeTransaksi
  jumlah: string
  status: StatusTransaksi
  referensiGateway: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

export interface PaymentData {
  id: string
  booking_id: string
  jumlah_bayar: string
  metode_pembayaran: 'TRANSFER' | 'E_WALLET' | 'CREDIT_CARD' | 'VA'
  status_pembayaran: 'PENDING' | 'BERHASIL' | 'GAGAL'
  bukti_transfer_url: string | null
  created_at: Date
  updated_at: Date
}

export interface RefundRequestData {
  id: string
  booking_id: string
  alasan: string
  jumlah_refund: string
  status_refund: 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK'
  created_at: Date
  updated_at: Date
}

export interface BookingWithRelations {
  id: string
  unit_id: string
  penyewa_id: string
  tanggal_mulai: Date
  tanggal_selesai: Date
  total_harga: string
  status_booking: StatusBooking
  jumlahDP: string
  jumlahPelunasan: string
  tanggalBayarDP: Date | null
  tanggalPelunasan: Date | null
  tanggalDitolak: Date | null
  alasanPenolakan: string | null
  statusRefundDP: StatusRefundDP | null
  transaksiDP_id: string | null
  transaksiPelunasan_id: string | null
  transaksiRefund_id: string | null
  created_at: Date
  updated_at: Date
  units: {
    id: string
    property_id: string
    nama_unit: string
    harga_bulanan: string
    status_ketersediaan: string
  }
  users: {
    id: string
    name: string
    email: string
    phone: string | null
    image: string | null
  }
  payments: PaymentData[]
  refund_requests: RefundRequestData[]
  transaksiDP: PaymentTransactionData | null
  transaksiPelunasan: PaymentTransactionData | null
  transaksiRefund: PaymentTransactionData | null
}

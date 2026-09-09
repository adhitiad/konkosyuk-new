import { z } from 'zod'

export const StatusBookingSchema = z.enum([
  'DRAFT',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
])

export const MetodePembayaranSchema = z.enum([
  'TRANSFER',
  'E_WALLET',
  'CREDIT_CARD',
  'VA',
])

export const PaymentChannelSchema = z.enum([
  'QRIS_DYNAMIC',
  'QRIS_STATIC',
  'E_WALLET',
  'VA',
  'MERCHANT',
  'DIRECT_TRANSFER',
])

export const StatusPembayaranSchema = z.enum(['PENDING', 'BERHASIL', 'GAGAL'])

export const StatusKycSchema = z.enum(['MENUNGGU', 'TERVERIFIKASI', 'DITOLAK'])

export const StatusRefundSchema = z.enum(['MENUNGGU', 'DISETUJUI', 'DITOLAK'])

export const createBookingSchema = z.object({
  unit_id: z.string().uuid(),
  penyewa_id: z.string().uuid(),
  tanggal_mulai: z.coerce.date(),
  tanggal_selesai: z.coerce.date(),
  total_harga: z.number().min(0),
  status_booking: StatusBookingSchema.optional(),
  rental_period: z.enum([
    'ONE_MONTH',
    'THREE_MONTHS',
    'SIX_MONTHS',
    'ONE_YEAR',
  ]),
  check_in_date: z.coerce.date().refine((date) => date >= new Date(), {
    message: 'Tanggal check-in tidak boleh di masa lalu',
  }),
})

export const createPaymentSchema = z.object({
  booking_id: z.string().uuid(),
  jumlah_bayar: z.number().min(0),
  metode_pembayaran: MetodePembayaranSchema,
  bukti_transfer_url: z.string().url().optional(),
})

export const getTransactionStatusSchema = z.object({
  booking_id: z.string().uuid(),
})

export const createMidtransPaymentSchema = z.object({
  booking_id: z.string().uuid(),
})

export const createPemesananPaymentSchema = z.object({
  pemesanan_id: z.string().uuid(),
  payment_method: z.enum(['TRANSFER', 'E_WALLET', 'CREDIT_CARD', 'VA']),
  amount: z.number().min(0),
})

export const PemesananPaymentWebhookPayloadSchema = z.object({
  event_id: z.string().min(1),
  transaction_id: z.string().uuid(),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED']),
  amount: z.number().min(0).optional(),
  paid_at: z.coerce.date().optional(),
  external_id: z.string().optional(),
  snapshot_data: z.record(z.string(), z.unknown()).optional(),
})

export const verifyPaymentSchema = z.object({
  payment_id: z.string().uuid(),
  status_pembayaran: StatusPembayaranSchema,
})

export const submitKycSchema = z.object({
  user_id: z.string().uuid(),
  nama_lengkap: z.string().min(1),
  nomor_ktp: z.string().min(1),
  url_foto_ktp: z.string().url(),
  url_foto_selfie: z.string().url(),
})

export const approveKycSchema = z.object({
  kyc_request_id: z.string().uuid(),
  status_kyc: StatusKycSchema,
  catatan: z.string().optional(),
})

export const createRefundRequestSchema = z.object({
  booking_id: z.string().uuid(),
  alasan: z.string().min(1),
  jumlah_refund: z.number().min(0),
})

export const updateRefundStatusSchema = z.object({
  refund_request_id: z.string().uuid(),
  status_refund: StatusRefundSchema,
})

export const konfirmasiPembayaranDPSchema = z.object({
  booking_id: z.string().uuid(),
})

export const setujuiBookingSchema = z.object({
  booking_id: z.string().uuid(),
})

export const tolakBookingSchema = z.object({
  booking_id: z.string().uuid(),
  alasan: z.string().min(1),
})

export const konfirmasiPelunasanSchema = z.object({
  booking_id: z.string().uuid(),
})

export const listDaftarRequestBookingSchema = z.object({
  statuses: StatusBookingSchema.array().optional(),
})

export const batalkanBookingSchema = z.object({
  booking_id: z.string().uuid(),
  alasan: z.string().min(1),
})

export const getPaymentDeadlineSchema = z.object({
  booking_id: z.string().uuid(),
})

export const getBookingDetailSchema = z.object({
  booking_id: z.string().uuid(),
})

export const refundSchema = z.object({
  booking_id: z.string().uuid(),
  alasan: z.string().min(1).optional(),
})

export const prosesRefundDPSchema = z.object({
  booking_id: z.string().uuid(),
})

export const getRefundStatusSchema = z.object({
  booking_id: z.string().uuid(),
})

export const createPaymentLinkSchema = z.object({
  booking_id: z.string().uuid(),
  amount: z.number().min(0),
  method: PaymentChannelSchema,
  provider: z.string().min(1).max(120).optional(),
  channel: z.string().min(1).max(120).optional(),
  expired_at: z.coerce.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const getPaymentStatusSchema = z.object({
  transaction_id: z.string().uuid().optional(),
  booking_id: z.string().uuid().optional(),
})

export const PaymentWebhookSchema = z.object({
  event_id: z.string().min(1),
  transaction_id: z.string().uuid(),
  status: z.enum(['PENDING', 'BERHASIL', 'GAGAL', 'DIBATALKAN']),
  amount: z.number().min(0).optional(),
  paid_at: z.coerce.date().optional(),
  provider: z.string().min(1).optional(),
  channel: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

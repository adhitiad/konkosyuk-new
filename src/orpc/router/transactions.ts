import { z } from 'zod'
import { ORPCError } from '@orpc/server'
import { os } from '#/orpc/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import type { Prisma } from '#/generated/prisma/client.js'
import {
  createPayment as createGatewayPayment,
  refundPayment as refundGatewayPayment,
  verifyPayment as verifyGatewayPayment,
} from '#/lib/payments/mock-gateway.js'
import { calculateDpAmount } from '#/lib/services/platform-config.js'
import { scheduleBookingExpiry } from '#/lib/services/booking-expiry.js'
import { logAudit } from '#/lib/services/audit'

import {
  createBookingSchema,
  createPaymentSchema,
  verifyPaymentSchema,
  submitKycSchema,
  approveKycSchema,
  createRefundRequestSchema,
  updateRefundStatusSchema,
  konfirmasiPembayaranDPSchema,
  setujuiBookingSchema,
  tolakBookingSchema,
  konfirmasiPelunasanSchema,
  listDaftarRequestBookingSchema,
  StatusBookingSchema,
  batalkanBookingSchema,
  getRefundStatusSchema,
  refundSchema,
  prosesRefundDPSchema,
  createPaymentLinkSchema,
  getPaymentStatusSchema,
  PaymentWebhookSchema,
} from '#/orpc/schema/transaction'

const withSession = os.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers })
  if (!session?.user) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'Authentication required',
    })
  }
  return next({
    context: {
      user: session.user,
    },
  })
})

const requireAdmin = withSession.use(async ({ context, next }) => {
  if (context.user.role !== 'ADMIN' && context.user.role !== 'STAFF') {
    throw new ORPCError('FORBIDDEN', {
      message: 'Admin or staff role required',
    })
  }
  return next()
})

const requireOwnerOrAdmin = withSession.use(async ({ context, next }) => {
  if (
    context.user.role !== 'PEMILIK' &&
    context.user.role !== 'ADMIN' &&
    context.user.role !== 'STAFF'
  ) {
    throw new ORPCError('FORBIDDEN', {
      message: 'Owner, admin, or staff role required',
    })
  }
  return next()
})

export const createTransaksiBooking = withSession
  .input(createBookingSchema)
  .handler(async ({ input }) => {
    const unit = await prisma.units.findUnique({
      where: { id: input.unit_id },
      select: { id: true, price: true, status: true, property_id: true },
    })
    if (!unit) {
      throw new ORPCError('NOT_FOUND', { message: 'Unit not found' })
    }
    if (unit.status !== 'available') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Unit is not available for booking',
      })
    }

    const overlapping = await prisma.booking.findMany({
      where: {
        unit_id: input.unit_id,
        status_booking: { in: ['MENUNGGU_PEMBAYARAN_DP', 'AKTIF'] },
        OR: [
          {
            tanggal_mulai: { lt: input.tanggal_selesai },
            tanggal_selesai: { gt: input.tanggal_mulai },
          },
        ],
      },
    })
    if (overlapping.length > 0) {
      throw new ORPCError('CONFLICT', {
        message: 'Unit is already booked for the selected dates',
      })
    }

    const booking = await prisma.booking.create({
      data: {
        unit_id: input.unit_id,
        penyewa_id: input.penyewa_id,
        tanggal_mulai: input.tanggal_mulai,
        tanggal_selesai: input.tanggal_selesai,
        total_harga: input.total_harga,
        status_booking: input.status_booking ?? 'MENUNGGU_PEMBAYARAN_DP',
      },
    })

    const dpAmount = await calculateDpAmount(Number(input.total_harga))

    const dpPayment = await createGatewayPayment({
      tipeTransaksi: 'DP',
      jumlah: dpAmount,
      bookingId: booking.id,
    })

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        jumlahDP: dpAmount,
        transaksiDP_id: dpPayment.transactionId,
      },
      include: {
        units: true,
        users: true,
        payments: true,
        refund_requests: true,
        transaksiDP: true,
      },
    })

    await scheduleBookingExpiry(booking.id)

    return updatedBooking
  })

export const createPayment = withSession
  .input(createPaymentSchema)
  .handler(async ({ input }) => {
    const booking = await prisma.booking.findUnique({
      where: { id: input.booking_id },
      select: { id: true, total_harga: true, status_booking: true },
    })
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }

    if (input.jumlah_bayar < Number(booking.total_harga)) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Payment amount is less than the booking total',
      })
    }

    const payment = await prisma.payment.create({
      data: {
        booking_id: input.booking_id,
        jumlah_bayar: input.jumlah_bayar,
        metode_pembayaran: input.metode_pembayaran,
        status_pembayaran: 'PENDING',
        bukti_transfer_url: input.bukti_transfer_url,
      },
      include: {
        bookings: true,
      },
    })

    return payment
  })

export const verifyPayment = requireOwnerOrAdmin
  .input(verifyPaymentSchema)
  .handler(async ({ input, context }) => {
    const payment = await prisma.payment.findUnique({
      where: { id: input.payment_id },
      include: { bookings: true },
    })
    if (!payment) {
      throw new ORPCError('NOT_FOUND', { message: 'Payment not found' })
    }

    const updated = await prisma.payment.update({
      where: { id: input.payment_id },
      data: {
        status_pembayaran: input.status_pembayaran,
      },
      include: {
        bookings: true,
      },
    })

    if (input.status_pembayaran === 'BERHASIL') {
      await prisma.booking.update({
        where: { id: payment.booking_id },
        data: {
          status_booking: 'AKTIF',
        },
      })
    }

    await logAudit({
      adminId: context.user.id,
      action: 'verify_payment',
      targetType: 'payment',
      targetId: input.payment_id,
      details: { status_pembayaran: input.status_pembayaran },
    })

    return updated
  })

export const submitKyc = withSession
  .input(submitKycSchema)
  .handler(async ({ input }) => {
    const kyc = await prisma.kycRequest.create({
      data: {
        user_id: input.user_id,
        nama_lengkap: input.nama_lengkap,
        nomor_ktp: input.nomor_ktp,
        url_foto_ktp: input.url_foto_ktp,
        url_foto_selfie: input.url_foto_selfie,
        status_kyc: 'MENUNGGU',
      },
      include: {
        users: true,
      },
    })

    return kyc
  })

export const listKycRequests = withSession.handler(async () => {
  const kycRequests = await prisma.kycRequest.findMany({
    include: {
      users: true,
    },
    orderBy: { created_at: 'desc' },
  })
  return kycRequests
})

export const approveKyc = requireAdmin
  .input(approveKycSchema)
  .handler(async ({ input, context }) => {
    const kycRequest = await prisma.kycRequest.findUnique({
      where: { id: input.kyc_request_id },
      select: { id: true, user_id: true },
    })
    if (!kycRequest) {
      throw new ORPCError('NOT_FOUND', { message: 'KYC request not found' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.kycRequest.update({
        where: { id: input.kyc_request_id },
        data: {
          status_kyc: input.status_kyc,
        },
        include: {
          users: true,
        },
      })

      if (input.status_kyc === 'TERVERIFIKASI') {
        await tx.users.update({
          where: { id: kycRequest.user_id },
          data: {
            kyc_status: 'TERVERIFIKASI',
          },
        })
      } else if (input.status_kyc === 'DITOLAK') {
        await tx.users.update({
          where: { id: kycRequest.user_id },
          data: {
            kyc_status: 'DITOLAK',
          },
        })
      }

      return result
    })

    await logAudit({
      adminId: context.user.id,
      action:
        input.status_kyc === 'TERVERIFIKASI' ? 'approve_kyc' : 'reject_kyc',
      targetType: 'kyc_request',
      targetId: input.kyc_request_id,
      details: { status_kyc: input.status_kyc },
    })

    return updated
  })

export const createRefund = withSession
  .input(createRefundRequestSchema)
  .handler(async ({ input }) => {
    const booking = await prisma.booking.findUnique({
      where: { id: input.booking_id },
      select: { id: true, total_harga: true },
    })
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }

    if (input.jumlah_refund > Number(booking.total_harga)) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Refund amount exceeds booking total',
      })
    }

    const refund = await prisma.refundRequest.create({
      data: {
        booking_id: input.booking_id,
        alasan: input.alasan,
        jumlah_refund: input.jumlah_refund,
        status_refund: 'MENUNGGU',
      },
      include: {
        bookings: true,
      },
    })

    return refund
  })

export const updateRefundStatus = requireOwnerOrAdmin
  .input(updateRefundStatusSchema)
  .handler(async ({ input }) => {
    const refund = await prisma.refundRequest.findUnique({
      where: { id: input.refund_request_id },
      select: { id: true, booking_id: true },
    })
    if (!refund) {
      throw new ORPCError('NOT_FOUND', { message: 'Refund request not found' })
    }

    const updated = await prisma.refundRequest.update({
      where: { id: input.refund_request_id },
      data: {
        status_refund: input.status_refund,
      },
      include: {
        bookings: true,
      },
    })

    return updated
  })

export const listPayments = withSession
  .input(z.object({ booking_id: z.string().uuid().optional() }))
  .handler(async ({ input }) => {
    const payments = await prisma.payment.findMany({
      where: input.booking_id ? { booking_id: input.booking_id } : undefined,
      include: {
        bookings: true,
      },
      orderBy: { created_at: 'desc' },
    })
    return payments
  })

const bookingSelect = {
  id: true,
  unit_id: true,
  penyewa_id: true,
  tanggal_mulai: true,
  tanggal_selesai: true,
  total_harga: true,
  status_booking: true,
  jumlahDP: true,
  jumlahPelunasan: true,
  tanggalBayarDP: true,
  tanggalPelunasan: true,
  tanggalDitolak: true,
  alasanPenolakan: true,
  statusRefundDP: true,
  transaksiDP_id: true,
  transaksiPelunasan_id: true,
  transaksiRefund_id: true,
  units: {
    select: {
      id: true,
      name: true,
      price: true,
      properties: { select: { id: true, name: true, owner_id: true } },
    },
  },
  users: { select: { id: true, name: true, email: true, role: true } },
  transaksiDP: {
    select: {
      id: true,
      jumlah: true,
      status: true,
      referensiGateway: true,
      createdAt: true,
    },
  },
  transaksiPelunasan: {
    select: {
      id: true,
      jumlah: true,
      status: true,
      referensiGateway: true,
      createdAt: true,
    },
  },
  transaksiRefund: {
    select: {
      id: true,
      jumlah: true,
      status: true,
      referensiGateway: true,
      createdAt: true,
    },
  },
  created_at: true,
  updated_at: true,
} as const

async function loadBooking(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    select: bookingSelect,
  })
}

type BookingRecord = NonNullable<Awaited<ReturnType<typeof loadBooking>>>

function decimalStr(value: unknown): string {
  if (value === null || value === undefined) return '0'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return String(value)
}

function serializeTransaction(tx: BookingRecord['transaksiDP']) {
  if (!tx) return null
  return {
    id: tx.id,
    jumlah: decimalStr(tx.jumlah),
    status: tx.status,
    referensiGateway: tx.referensiGateway,
    createdAt: tx.createdAt,
  }
}

function serializeBooking(raw: BookingRecord) {
  return {
    id: raw.id,
    unit_id: raw.unit_id,
    penyewa_id: raw.penyewa_id,
    tanggal_mulai: raw.tanggal_mulai,
    tanggal_selesai: raw.tanggal_selesai,
    total_harga: decimalStr(raw.total_harga),
    status_booking: raw.status_booking,
    jumlahDP: decimalStr(raw.jumlahDP),
    jumlahPelunasan: decimalStr(raw.jumlahPelunasan),
    tanggalBayarDP: raw.tanggalBayarDP,
    tanggalPelunasan: raw.tanggalPelunasan,
    tanggalDitolak: raw.tanggalDitolak,
    alasanPenolakan: raw.alasanPenolakan,
    statusRefundDP: raw.statusRefundDP,
    transaksiDP: serializeTransaction(raw.transaksiDP),
    transaksiPelunasan: serializeTransaction(raw.transaksiPelunasan),
    transaksiRefund: serializeTransaction(raw.transaksiRefund),
    unit: {
      id: raw.units.id,
      name: raw.units.name,
      price: decimalStr(raw.units.price),
      property: {
        id: raw.units.properties.id,
        name: raw.units.properties.name,
        owner_id: raw.units.properties.owner_id,
      },
    },
    penyewa: {
      id: raw.users.id,
      name: raw.users.name,
      email: raw.users.email,
      role: raw.users.role,
    },
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  }
}

type SessionUser = { id: string; role?: string }

function isAdminRole(role: string | undefined | null): boolean {
  return role === 'ADMIN' || role === 'STAFF'
}

function isTenantOf(booking: BookingRecord, userId: string): boolean {
  return booking.penyewa_id === userId
}

function isOwnerOf(booking: BookingRecord, userId: string): boolean {
  return booking.units.properties.owner_id === userId
}

function canAccessBooking(booking: BookingRecord, user: SessionUser): boolean {
  return (
    isTenantOf(booking, user.id) ||
    isOwnerOf(booking, user.id) ||
    isAdminRole(user.role)
  )
}

function isOwnerOrAdminOfBooking(
  booking: BookingRecord,
  user: SessionUser,
): boolean {
  return isOwnerOf(booking, user.id) || isAdminRole(user.role)
}

const REJECTABLE_STATUSES: readonly string[] = [
  'MENUNGGU_PEMBAYARAN_DP',
  'MENUNGGU_VERIFIKASI_DP',
  'MENUNGGU_PERSETUJUAN',
  'MENUNGGU_PELUNASAN',
]

export const konfirmasiPembayaranDP = withSession
  .input(konfirmasiPembayaranDPSchema)
  .handler(async ({ input, context }) => {
    const booking = await loadBooking(input.booking_id)
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }
    if (!canAccessBooking(booking, context.user)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Not authorized to confirm this booking',
      })
    }
    if (booking.status_booking !== 'MENUNGGU_PEMBAYARAN_DP') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'DP confirmation is not allowed for this booking status',
      })
    }

    const updated = await prisma.booking.update({
      where: { id: input.booking_id },
      data: {
        status_booking: 'MENUNGGU_VERIFIKASI_DP',
        tanggalBayarDP: new Date(),
      },
      select: bookingSelect,
    })

    return serializeBooking(updated)
  })

export const setujuiBooking = requireOwnerOrAdmin
  .input(setujuiBookingSchema)
  .handler(async ({ input, context }) => {
    const booking = await loadBooking(input.booking_id)
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }
    if (!isOwnerOrAdminOfBooking(booking, context.user)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Owner or admin required for this booking',
      })
    }
    if (booking.status_booking !== 'MENUNGGU_VERIFIKASI_DP') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Booking is not awaiting DP verification',
      })
    }
    if (!booking.transaksiDP_id) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'DP transaction not found for this booking',
      })
    }

    const dpTx = await verifyGatewayPayment(booking.transaksiDP_id)
    if (dpTx.status !== 'BERHASIL') {
      throw new ORPCError('BAD_REQUEST', {
        message: `DP payment is ${dpTx.status}`,
      })
    }

    const updated = await prisma.booking.update({
      where: { id: input.booking_id },
      data: {
        status_booking: 'MENUNGGU_PELUNASAN',
        tanggalBayarDP: booking.tanggalBayarDP ?? new Date(),
      },
      select: bookingSelect,
    })

    await logAudit({
      adminId: context.user.id,
      action: 'approve_booking',
      targetType: 'booking',
      targetId: input.booking_id,
    })

    return serializeBooking(updated)
  })

export const tolakBooking = requireOwnerOrAdmin
  .input(tolakBookingSchema)
  .handler(async ({ input, context }) => {
    const booking = await loadBooking(input.booking_id)
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }
    if (!isOwnerOrAdminOfBooking(booking, context.user)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Owner or admin required for this booking',
      })
    }
    if (!REJECTABLE_STATUSES.includes(booking.status_booking)) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Booking cannot be rejected in its current status',
      })
    }

    const dpNeedsRefund =
      !!booking.transaksiDP_id &&
      Number(booking.jumlahDP) > 0 &&
      booking.statusRefundDP !== 'BERHASIL'

    const updated = await prisma.$transaction(async (tx) => {
      const bookingUpdate = await tx.booking.update({
        where: { id: input.booking_id },
        data: {
          status_booking: 'PROSES_REFUND_DP',
          alasanPenolakan: input.alasan,
          tanggalDitolak: new Date(),
          ...(dpNeedsRefund ? { statusRefundDP: 'MENUNGGU_PROSES' } : {}),
        },
        select: bookingSelect,
      })

      await tx.units.update({
        where: { id: booking.unit_id },
        data: { status: 'available' },
      })

      return bookingUpdate
    })

    await logAudit({
      adminId: context.user.id,
      action: 'reject_booking',
      targetType: 'booking',
      targetId: input.booking_id,
      details: { alasan: input.alasan },
    })

    return serializeBooking(updated)
  })

export const batalkanBooking = withSession
  .input(batalkanBookingSchema)
  .handler(async ({ input, context }) => {
    const booking = await loadBooking(input.booking_id)
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }
    if (!canAccessBooking(booking, context.user)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Not authorized to cancel this booking',
      })
    }
    if (!REJECTABLE_STATUSES.includes(booking.status_booking)) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Booking cannot be cancelled in its current status',
      })
    }

    const dpNeedsRefund =
      !!booking.transaksiDP_id &&
      Number(booking.jumlahDP) > 0 &&
      booking.statusRefundDP !== 'BERHASIL'

    const updated = await prisma.$transaction(async (tx) => {
      const bookingUpdate = await tx.booking.update({
        where: { id: input.booking_id },
        data: {
          status_booking: 'DIBATALKAN',
          alasanPenolakan: input.alasan,
          tanggalDitolak: new Date(),
          ...(dpNeedsRefund ? { statusRefundDP: 'MENUNGGU_PROSES' } : {}),
        },
        select: bookingSelect,
      })

      await tx.units.update({
        where: { id: booking.unit_id },
        data: { status: 'available' },
      })

      return bookingUpdate
    })

    return serializeBooking(updated)
  })

export const refund = requireOwnerOrAdmin
  .input(refundSchema)
  .handler(async ({ input }) => {
    const booking = await loadBooking(input.booking_id)
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }
    if (booking.statusRefundDP !== 'GAGAL') {
      throw new ORPCError('BAD_REQUEST', {
        message:
          'Refund can only be re-triggered when the previous attempt failed',
      })
    }

    const updated = await prisma.booking.update({
      where: { id: input.booking_id },
      data: { statusRefundDP: 'MENUNGGU_PROSES' },
      select: bookingSelect,
    })

    return serializeBooking(updated)
  })

export const prosesRefundDP = requireAdmin
  .input(prosesRefundDPSchema)
  .handler(async ({ input, context }) => {
    const booking = await loadBooking(input.booking_id)
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }
    if (booking.statusRefundDP !== 'MENUNGGU_PROSES') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Booking is not pending refund processing',
      })
    }
    if (!booking.transaksiDP_id) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'DP transaction not found for this booking',
      })
    }

    const dpTx = await prisma.paymentTransaction.findUnique({
      where: { id: booking.transaksiDP_id },
      select: { status: true },
    })
    if (!dpTx) {
      throw new ORPCError('NOT_FOUND', {
        message: 'DP transaction not found for this booking',
      })
    }
    if (dpTx.status !== 'BERHASIL') {
      throw new ORPCError('BAD_REQUEST', {
        message: `DP payment is ${dpTx.status}`,
      })
    }

    try {
      const refundTx = await refundGatewayPayment({
        originalTransactionId: booking.transaksiDP_id,
        jumlah: Number(booking.jumlahDP),
        bookingId: booking.id,
        isOwner: false,
      })

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          statusRefundDP: 'BERHASIL',
          transaksiRefund_id: refundTx.transactionId,
        },
        select: bookingSelect,
      })

      await logAudit({
        adminId: context.user.id,
        action: 'process_refund_dp',
        targetType: 'booking',
        targetId: booking.id,
        details: {
          statusRefundDP: 'BERHASIL',
          jumlah: Number(booking.jumlahDP),
          transaksiRefund_id: refundTx.transactionId,
        },
      })

      return {
        success: true,
        booking_id: booking.id,
        statusRefundDP: 'BERHASIL',
        transaksiRefund_id: refundTx.transactionId,
        message: 'Refund berhasil diproses',
      }
    } catch (error) {
      console.info(
        `[prosesRefundDP] Gagal memproses refund DP untuk booking ${booking.id}:`,
        error,
      )

      await prisma.booking.update({
        where: { id: booking.id },
        data: { statusRefundDP: 'GAGAL' },
        select: bookingSelect,
      })

      await logAudit({
        adminId: context.user.id,
        action: 'process_refund_dp',
        targetType: 'booking',
        targetId: booking.id,
        details: {
          statusRefundDP: 'GAGAL',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      return {
        success: false,
        booking_id: booking.id,
        statusRefundDP: 'GAGAL',
        message: 'Refund gagal, silakan coba lagi',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

export const getRefundStatus = withSession
  .input(getRefundStatusSchema)
  .handler(async ({ input, context }) => {
    const booking = await loadBooking(input.booking_id)
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }
    if (!canAccessBooking(booking, context.user)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Not authorized to view this booking',
      })
    }

    let transaksiRefund: ReturnType<typeof serializeTransaction> | null = null
    if (booking.transaksiRefund_id) {
      const ref = await prisma.paymentTransaction.findUnique({
        where: { id: booking.transaksiRefund_id },
        select: {
          id: true,
          jumlah: true,
          status: true,
          referensiGateway: true,
          createdAt: true,
        },
      })
      transaksiRefund = ref ? serializeTransaction(ref) : null
    }

    return {
      booking_id: booking.id,
      status_booking: booking.status_booking,
      statusRefundDP: booking.statusRefundDP,
      jumlahDP: decimalStr(booking.jumlahDP),
      transaksiRefund,
    }
  })

export const createPaymentLink = withSession
  .input(createPaymentLinkSchema)
  .handler(async ({ input, context }) => {
    const booking = await loadBooking(input.booking_id)
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }
    if (!canAccessBooking(booking, context.user)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Not authorized to create payment for this booking',
      })
    }

    const expiredAt =
      input.expired_at ?? new Date(Date.now() + 24 * 60 * 60 * 1000)

    const referensiGateway = `${input.method.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const transaction = await prisma.paymentTransaction.create({
      data: {
        tipeTransaksi: 'DP',
        jumlah: input.amount,
        status: 'PENDING',
        referensiGateway,
        metadata: {
          provider: input.provider ?? 'mock_gateway',
          channel: input.channel ?? input.method,
          method: input.method,
          booking_id: input.booking_id,
          created_by: context.user.id,
          expired_at: expiredAt.toISOString(),
          simulated: true,
          ...input.metadata,
        },
      },
    })

    const payment = await prisma.payment.create({
      data: {
        booking_id: input.booking_id,
        jumlah_bayar: input.amount,
        metode_pembayaran:
          input.method === 'QRIS_DYNAMIC' || input.method === 'QRIS_STATIC'
            ? 'TRANSFER'
            : input.method === 'VA'
              ? 'VA'
              : input.method === 'E_WALLET'
                ? 'E_WALLET'
                : 'TRANSFER',
        status_pembayaran: 'PENDING',
        transaction_id: transaction.id,
        provider: input.provider ?? 'mock_gateway',
        metadata: {
          channel: input.channel,
          method: input.method,
          referensiGateway,
          expired_at: expiredAt.toISOString(),
          ...input.metadata,
        },
      },
      include: { bookings: true },
    })

    const paymentLink = `/pay/${transaction.id}?ref=${referensiGateway}`

    await logAudit({
      adminId: context.user.id,
      action: 'create_payment_link',
      targetType: 'payment',
      targetId: payment.id,
      details: {
        method: input.method,
        channel: input.channel,
        referensiGateway,
      },
    })

    return {
      payment_id: payment.id,
      transaction_id: transaction.id,
      referensiGateway,
      payment_link: paymentLink,
      amount: decimalStr(transaction.jumlah),
      status: transaction.status,
      method: input.method,
      channel: input.channel,
      expired_at: expiredAt.toISOString(),
      provider: input.provider ?? 'mock_gateway',
    }
  })

export const getPaymentStatus = withSession
  .input(getPaymentStatusSchema)
  .handler(async ({ input, context }) => {
    if (!input.transaction_id && !input.booking_id) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'transaction_id or booking_id is required',
      })
    }

    let transaction = null
    if (input.transaction_id) {
      transaction = await prisma.paymentTransaction.findUnique({
        where: { id: input.transaction_id },
      })
    } else if (input.booking_id) {
      const booking = await loadBooking(input.booking_id)
      if (!booking) {
        throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
      }
      if (!canAccessBooking(booking, context.user)) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Not authorized to view this payment',
        })
      }
      transaction = await prisma.paymentTransaction.findFirst({
        where: {
          metadata: {
            path: ['booking_id'],
            equals: input.booking_id,
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    if (!transaction) {
      throw new ORPCError('NOT_FOUND', { message: 'Transaction not found' })
    }

    return {
      transaction_id: transaction.id,
      status: transaction.status,
      referensiGateway: transaction.referensiGateway,
      amount: decimalStr(transaction.jumlah),
      metadata: (transaction.metadata ?? {}) as Record<string, unknown>,
    }
  })

export const processPaymentWebhook = os
  .input(PaymentWebhookSchema)
  .handler(async ({ input }) => {
    const existingEvent = await prisma.webhook_events.findFirst({
      where: {
        provider: input.provider ?? 'qstash',
        event_id: input.event_id,
      },
    })

    if (existingEvent?.processed_at) {
      return {
        success: true,
        idempotent: true,
        transaction_id: input.transaction_id,
        status: input.status,
        message: 'Webhook already processed',
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.paymentTransaction.findUnique({
        where: { id: input.transaction_id },
      })
      if (!transaction) {
        throw new ORPCError('NOT_FOUND', { message: 'Transaction not found' })
      }

      const previousStatus = transaction.status
      const updatedTransaction = await tx.paymentTransaction.update({
        where: { id: input.transaction_id },
        data: {
          status: input.status,
          metadata: {
            ...((transaction.metadata ?? {}) as Record<string, unknown>),
            webhook_status: input.status,
            webhook_paid_at: input.paid_at?.toISOString() ?? null,
            webhook_provider: input.provider,
            webhook_channel: input.channel,
            ...input.metadata,
          },
        },
      })

      const metadata = (updatedTransaction.metadata ?? {}) as Record<
        string,
        unknown
      >
      const bookingId = metadata.booking_id as string | undefined

      let updatedPayment = null
      let updatedBooking = null
      let updatedPemesanan = null

      if (bookingId) {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          select: { id: true, status_booking: true, unit_id: true },
        })

        if (booking) {
          let nextBookingStatus: 'AKTIF' | 'MENUNGGU_PEMBAYARAN_DP' | undefined
          if (input.status === 'BERHASIL') {
            nextBookingStatus = 'AKTIF'
          } else if (input.status === 'GAGAL') {
            nextBookingStatus = 'MENUNGGU_PEMBAYARAN_DP'
          }

          if (
            nextBookingStatus &&
            booking.status_booking !== nextBookingStatus
          ) {
            updatedBooking = await tx.booking.update({
              where: { id: bookingId },
              data: {
                status_booking: nextBookingStatus,
                ...(input.status === 'BERHASIL'
                  ? { tanggalBayarDP: input.paid_at ?? new Date() }
                  : {}),
              },
              select: { id: true, status_booking: true },
            })
          }
        }

        updatedPayment = await tx.payment.updateMany({
          where: {
            booking_id: bookingId,
            transaction_id: updatedTransaction.id,
          },
          data: {
            status_pembayaran:
              input.status === 'BERHASIL'
                ? 'BERHASIL'
                : input.status === 'GAGAL'
                  ? 'GAGAL'
                  : 'PENDING',
            paid_at: input.paid_at ?? null,
          },
        })

        if (updatedPayment.count > 0) {
          const pemesanan = await tx.pemesanan.findFirst({
            where: {
              property_id: booking ? undefined : undefined,
              unit_properti_id: booking?.unit_id,
            },
          })

          if (pemesanan) {
            let nextPemesananStatus:
              'MENUNGGU_PERSETUJUAN' | 'DITERIMA' | undefined
            if (input.status === 'BERHASIL') {
              nextPemesananStatus = 'DITERIMA'
            } else if (input.status === 'GAGAL') {
              nextPemesananStatus = 'MENUNGGU_PERSETUJUAN'
            }

            if (
              nextPemesananStatus &&
              pemesanan.status !== nextPemesananStatus
            ) {
              updatedPemesanan = await tx.pemesanan.update({
                where: { id: pemesanan.id },
                data: { status: nextPemesananStatus },
                select: { id: true, status: true },
              })
            }
          }
        }
      }

      await tx.webhook_events.create({
        data: {
          provider: input.provider ?? 'qstash',
          event_id: input.event_id,
          event_type: 'payment.update',
          payload: (input.metadata ?? {}) as Prisma.InputJsonValue,
          signature_valid: true,
          details: {
            previous_status: previousStatus,
            new_status: input.status,
            transaction_id: input.transaction_id,
            booking_id: bookingId,
          },
          processed_at: new Date(),
        },
      })

      return {
        transaction: updatedTransaction,
        payment: updatedPayment,
        booking: updatedBooking,
        pemesanan: updatedPemesanan,
      }
    })

    return {
      success: true,
      idempotent: false,
      transaction_id: input.transaction_id,
      status: input.status,
      booking_status: result.booking?.status_booking,
      pemesanan_status: result.pemesanan?.status,
      message: 'Payment status updated',
    }
  })

export const konfirmasiPelunasan = withSession
  .input(konfirmasiPelunasanSchema)
  .handler(async ({ input, context }) => {
    const booking = await loadBooking(input.booking_id)
    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' })
    }
    if (!canAccessBooking(booking, context.user)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Not authorized to confirm this booking',
      })
    }
    if (booking.status_booking !== 'MENUNGGU_PELUNASAN') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Booking is not awaiting settlement',
      })
    }

    const remaining = Number(booking.total_harga) - Number(booking.jumlahDP)

    let transaksiPelunasanId: string
    if (booking.transaksiPelunasan_id) {
      const existing = await verifyGatewayPayment(booking.transaksiPelunasan_id)
      if (existing.status !== 'BERHASIL') {
        throw new ORPCError('BAD_REQUEST', {
          message: `Pelunasan payment is ${existing.status}`,
        })
      }
      transaksiPelunasanId = booking.transaksiPelunasan_id
    } else {
      const created = await createGatewayPayment({
        tipeTransaksi: 'PELUNASAN',
        jumlah: remaining,
        bookingId: booking.id,
      })
      const verified = await verifyGatewayPayment(created.transactionId)
      if (verified.status !== 'BERHASIL') {
        throw new ORPCError('BAD_REQUEST', {
          message: `Pelunasan payment is ${verified.status}`,
        })
      }
      transaksiPelunasanId = created.transactionId
    }

    const updated = await prisma.booking.update({
      where: { id: input.booking_id },
      data: {
        jumlahPelunasan: remaining,
        transaksiPelunasan_id: transaksiPelunasanId,
        tanggalPelunasan: new Date(),
        status_booking: 'AKTIF',
      },
      select: bookingSelect,
    })

    return serializeBooking(updated)
  })

export const getBookingSaya = withSession
  .input(z.object({ status: StatusBookingSchema.optional() }))
  .handler(async ({ context, input }) => {
    const bookings = await prisma.booking.findMany({
      where: {
        penyewa_id: context.user.id,
        ...(input.status ? { status_booking: input.status } : {}),
      },
      select: bookingSelect,
      orderBy: { created_at: 'desc' },
    })

    return bookings.map(serializeBooking)
  })

export const getDaftarRequestBooking = requireOwnerOrAdmin
  .input(listDaftarRequestBookingSchema)
  .handler(async ({ context, input }) => {
    const statusFilter = input.statuses?.length ? input.statuses : undefined
    const isSuperOwner = isAdminRole(context.user.role)

    const bookings = await prisma.booking.findMany({
      where: isSuperOwner
        ? statusFilter
          ? { status_booking: { in: statusFilter } }
          : {}
        : {
            units: {
              properties: { owner_id: context.user.id },
            },
            ...(statusFilter ? { status_booking: { in: statusFilter } } : {}),
          },
      select: bookingSelect,
      orderBy: { created_at: 'desc' },
    })

    return bookings.map(serializeBooking)
  })

export const getStatistikPemilik = requireOwnerOrAdmin.handler(
  async ({ context }) => {
    const ownerId = context.user.id
    const isAdmin = isAdminRole(context.user.role)

    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const ownerWhere = isAdmin
      ? {}
      : { units: { properties: { owner_id: ownerId } } }

    const [
      totalRequest,
      bookingAktif,
      pendapatanResult,
      totalProperti,
      totalUnit,
      aktivitasRows,
    ] = await Promise.all([
      prisma.booking.count({
        where: isAdmin
          ? { status_booking: 'MENUNGGU_PERSETUJUAN' }
          : {
              units: { properties: { owner_id: ownerId } },
              status_booking: 'MENUNGGU_PERSETUJUAN',
            },
      }),
      prisma.booking.count({
        where: isAdmin
          ? { status_booking: 'AKTIF' }
          : {
              units: { properties: { owner_id: ownerId } },
              status_booking: 'AKTIF',
            },
      }),
      prisma.booking.aggregate({
        where: {
          ...ownerWhere,
          status_booking: {
            in: ['AKTIF', 'SELESAI', 'MENUNGGU_PELUNASAN'],
          },
          tanggalBayarDP: { not: null },
          tanggalPelunasan: { gte: firstOfMonth },
        },
        _sum: { total_harga: true },
      }),
      prisma.properties.count({
        where: isAdmin ? {} : { owner_id: ownerId },
      }),
      prisma.units.count({
        where: isAdmin ? {} : { properties: { owner_id: ownerId } },
      }),
      prisma.booking.findMany({
        where: ownerWhere,
        select: {
          id: true,
          status_booking: true,
          tanggal_mulai: true,
          tanggal_selesai: true,
          total_harga: true,
          created_at: true,
          units: {
            select: { name: true, properties: { select: { name: true } } },
          },
          users: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
    ])

    return {
      totalProperti,
      totalUnit,
      totalRequest,
      bookingAktif,
      pendapatanBulanIni: decimalStr(pendapatanResult._sum.total_harga),
      aktivitas: aktivitasRows.map((a) => ({
        id: a.id,
        namaProperti: a.units.properties.name,
        namaUnit: a.units.name,
        namaPenyewa: a.users.name,
        status: a.status_booking,
        tanggalMulai: a.tanggal_mulai,
        tanggalSelesai: a.tanggal_selesai,
        totalHarga: decimalStr(a.total_harga),
        createdAt: a.created_at,
      })),
    }
  },
)

export const getBookingAktif = requireOwnerOrAdmin.handler(
  async ({ context }) => {
    const ownerId = context.user.id
    const isAdmin = isAdminRole(context.user.role)

    const bookings = await prisma.booking.findMany({
      where: isAdmin
        ? { status_booking: 'AKTIF' }
        : {
            units: { properties: { owner_id: ownerId } },
            status_booking: 'AKTIF',
          },
      select: bookingSelect,
      orderBy: { tanggal_mulai: 'desc' },
    })

    return bookings.map(serializeBooking)
  },
)

export const ajukanBooking = createTransaksiBooking

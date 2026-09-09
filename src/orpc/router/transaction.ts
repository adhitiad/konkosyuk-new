import { ORPCError } from '@orpc/server'
import { z } from 'zod'
import { os } from '#/orpc/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { createSnapTransaction } from '#/lib/midtrans'
import { createNotification } from '#/lib/services/notifications'

import {
  getTransactionStatusSchema,
  createMidtransPaymentSchema,
  createPemesananPaymentSchema,
  PemesananPaymentWebhookPayloadSchema,
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

function generateMidtransOrderId(bookingId: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `ORDER-${bookingId.slice(0, 8)}-${ts}-${rand}`.toUpperCase()
}

function generateKonkosOrderId(bookingId: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `KONKOS-${bookingId.slice(0, 8)}-${ts}-${rand}`.toUpperCase()
}

export const createMidtransPayment = withSession
  .input(createMidtransPaymentSchema)
  .handler(async ({ input, context }) => {
    const booking = await prisma.booking.findUnique({
      where: { id: input.booking_id },
      select: {
        id: true,
        total_harga: true,
        status_booking: true,
        payment_deadline: true,
        penyewa_id: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        units: {
          select: {
            id: true,
            name: true,
            properties: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!booking) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Booking tidak ditemukan',
      })
    }

    if (booking.penyewa_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Anda tidak memiliki akses ke booking ini',
      })
    }

    if (booking.status_booking !== 'PENDING_PAYMENT') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Booking tidak bisa dibayar',
      })
    }

    if (new Date() > new Date(booking.payment_deadline)) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Booking sudah expired, silakan booking ulang',
      })
    }

    const expectedAmount = Number(booking.total_harga)
    const midtransOrderId = generateKonkosOrderId(booking.id)

    let snapResult: { token: string; redirect_url: string } | null = null
    try {
      snapResult = await createSnapTransaction({
        orderId: midtransOrderId,
        grossAmount: expectedAmount,
        customerDetails: {
          first_name: booking.users.name,
          email: booking.users.email,
        },
        itemDetails: [
          {
            id: booking.id,
            name: `${booking.units.name} - ${booking.units.properties.name}`,
            price: expectedAmount,
            quantity: 1,
          },
        ],
      })
    } catch (error) {
      console.error(
        '[createMidtransPayment] Gagal membuat transaksi Midtrans:',
        error,
      )
      throw new ORPCError('BAD_GATEWAY', {
        message: 'Gagal membuat transaksi pembayaran Midtrans',
      })
    }

    const transaction = await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        amount: expectedAmount,
        paymentMethod: null,
        midtransOrderId,
        status: 'PENDING',
        webhookPayload: {
          payment_url: snapResult.redirect_url,
          token: snapResult.token,
          provider: 'midtrans',
          simulated: false,
        },
      },
    })

    return {
      transaction_id: transaction.id,
      external_id: transaction.midtransOrderId,
      payment_url: snapResult.redirect_url,
      token: snapResult.token,
      amount: Number(transaction.amount),
      status: transaction.status,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  })

export const createPayment = withSession
  .input(createPemesananPaymentSchema)
  .handler(async ({ input, context }) => {
    const booking = await prisma.booking.findUnique({
      where: { id: input.pemesanan_id },
      select: {
        id: true,
        total_harga: true,
        status_booking: true,
        penyewa_id: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        units: {
          select: {
            id: true,
            name: true,
            properties: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!booking) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Booking tidak ditemukan',
      })
    }

    if (booking.penyewa_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Anda tidak memiliki akses ke booking ini',
      })
    }

    const expectedAmount = Number(booking.total_harga)
    if (input.amount < expectedAmount) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Jumlah pembayaran kurang dari total booking (Rp${expectedAmount.toLocaleString('id-ID')})`,
      })
    }

    const midtransOrderId = generateMidtransOrderId(booking.id)

    let snapResult: { token: string; redirect_url: string } | null = null
    try {
      snapResult = await createSnapTransaction({
        orderId: midtransOrderId,
        grossAmount: input.amount,
        customerDetails: {
          first_name: booking.users.name,
          email: booking.users.email,
        },
        itemDetails: [
          {
            id: booking.id,
            name: `Pembayaran ${booking.units.name} - ${booking.units.properties.name}`,
            price: input.amount,
            quantity: 1,
          },
        ],
      })
    } catch (error) {
      console.error('[createPayment] Gagal membuat transaksi Midtrans:', error)
      throw new ORPCError('BAD_GATEWAY', {
        message: 'Gagal membuat transaksi pembayaran',
      })
    }

    const transaction = await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        amount: input.amount,
        paymentMethod: input.payment_method,
        midtransOrderId,
        status: 'PENDING',
        webhookPayload: {
          payment_url: snapResult.redirect_url,
          token: snapResult.token,
          provider: 'midtrans',
          simulated: false,
        },
      },
    })

    return {
      transaction_id: transaction.id,
      external_id: transaction.midtransOrderId,
      payment_url: snapResult.redirect_url,
      token: snapResult.token,
      amount: Number(transaction.amount),
      status: transaction.status,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  })

export const getTransactionStatus = withSession
  .input(getTransactionStatusSchema)
  .handler(async ({ input, context }) => {
    const booking = await prisma.booking.findUnique({
      where: { id: input.booking_id },
      select: {
        id: true,
        penyewa_id: true,
        transaction: {
          select: {
            id: true,
            status: true,
            amount: true,
            paymentMethod: true,
            midtransOrderId: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    })

    if (!booking) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Booking tidak ditemukan',
      })
    }

    if (booking.penyewa_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Anda tidak memiliki akses ke booking ini',
      })
    }

    const transaction = booking.transaction

    if (!transaction) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Transaksi tidak ditemukan',
      })
    }

    return {
      transaction_id: transaction.id,
      status: transaction.status,
      amount: Number(transaction.amount),
      payment_method: transaction.paymentMethod,
      external_id: transaction.midtransOrderId,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    }
  })

export const getPaymentStatus = withSession
  .input(z.object({ transaction_id: z.string().uuid() }))
  .handler(async ({ input, context }) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id: input.transaction_id },
      include: {
        booking: {
          select: {
            id: true,
            status_booking: true,
            total_harga: true,
            users: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!transaction) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Transaksi tidak ditemukan',
      })
    }

    if (transaction.booking.users.id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Anda tidak memiliki akses ke transaksi ini',
      })
    }

    return {
      transaction_id: transaction.id,
      external_id: transaction.midtransOrderId,
      amount: Number(transaction.amount),
      payment_method: transaction.paymentMethod,
      status: transaction.status,
      booking_id: transaction.bookingId,
      booking_status: transaction.booking.status_booking,
      snapshot: transaction.webhookPayload,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    }
  })

export const processPaymentWebhook = os
  .input(PemesananPaymentWebhookPayloadSchema)
  .handler(async ({ input }) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id: input.transaction_id },
      include: {
        booking: {
          select: {
            id: true,
            status_booking: true,
            users: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!transaction) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Transaksi tidak ditemukan',
      })
    }

    const previousStatus = transaction.status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: input.transaction_id },
      data: {
        status:
          input.status === 'SUCCESS'
            ? 'SUCCESS'
            : input.status === 'FAILED'
              ? 'FAILED'
              : 'EXPIRED',
        midtransTransactionId:
          input.external_id ?? transaction.midtransTransactionId,
        webhookPayload: {
          ...((transaction.webhookPayload ?? {}) as Record<string, unknown>),
          webhook_status: input.status,
          webhook_paid_at: input.paid_at?.toISOString() ?? null,
          webhook_provider: 'midtrans',
          webhook_external_id: input.external_id,
        },
      },
    })

    let updatedBooking = null

    if (
      input.status === 'SUCCESS' &&
      transaction.booking.status_booking === 'PENDING_PAYMENT'
    ) {
      updatedBooking = await prisma.booking.update({
        where: { id: transaction.bookingId },
        data: { status_booking: 'ACTIVE' },
        include: {
          users: {
            select: {
              id: true,
              name: true,
            },
          },
          units: {
            select: {
              id: true,
              name: true,
              properties: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      await createNotification({
        userId: transaction.booking.users.id,
        type: 'PAYMENT_SUCCESS',
        title: 'Pembayaran Berhasil',
        message: `Pembayaran untuk booking ${transaction.booking.id} telah berhasil.`,
        referenceId: transaction.booking.id,
      })
    }

    return {
      transaction: updatedTransaction,
      booking: updatedBooking,
      previous_status: previousStatus,
    }
  })

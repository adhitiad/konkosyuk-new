import { ORPCError } from '@orpc/server'
import { z } from 'zod'
import { os } from '#/orpc/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'

import {
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

function generateMockPaymentToken(pemesananId: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `midtrans-mock-${pemesananId.slice(0, 8)}-${ts}-${rand}`
}

export const createPayment = withSession
  .input(createPemesananPaymentSchema)
  .handler(async ({ input, context }) => {
    const pemesanan = await prisma.pemesanan.findUnique({
      where: { id: input.pemesanan_id },
      select: {
        id: true,
        total_harga: true,
        status: true,
        tenant_id: true,
      },
    })

    if (!pemesanan) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Pemesanan tidak ditemukan',
      })
    }

    if (pemesanan.tenant_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Anda tidak memiliki akses ke pemesanan ini',
      })
    }

    const expectedAmount = Number(pemesanan.total_harga)
    if (input.amount < expectedAmount) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Jumlah pembayaran kurang dari total pemesanan (Rp${expectedAmount.toLocaleString('id-ID')})`,
      })
    }

    const token = generateMockPaymentToken(pemesanan.id)
    const paymentUrl = `${process.env.SERVER_URL ?? 'http://localhost:3000'}/mock-payment/${token}`

    const transaction = await prisma.transaction.create({
      data: {
        pemesananId: pemesanan.id,
        amount: input.amount,
        paymentMethod: input.payment_method,
        externalId: token,
        status: 'PENDING',
        snapshotData: {
          payment_url: paymentUrl,
          token,
          provider: 'mock_midtrans',
          simulated: true,
        },
      },
    })

    return {
      transaction_id: transaction.id,
      external_id: transaction.externalId,
      payment_url: paymentUrl,
      token,
      amount: Number(transaction.amount),
      status: transaction.status,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  })

export const getPaymentStatus = withSession
  .input(z.object({ transaction_id: z.string().uuid() }))
  .handler(async ({ input, context }) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id: input.transaction_id },
      include: {
        pemesanan: {
          select: {
            id: true,
            status: true,
            total_harga: true,
            tenant_id: true,
          },
        },
      },
    })

    if (!transaction) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Transaksi tidak ditemukan',
      })
    }

    if (transaction.pemesanan.tenant_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Anda tidak memiliki akses ke transaksi ini',
      })
    }

    return {
      transaction_id: transaction.id,
      external_id: transaction.externalId,
      amount: Number(transaction.amount),
      payment_method: transaction.paymentMethod,
      status: transaction.status,
      pemesanan_id: transaction.pemesananId,
      pemesanan_status: transaction.pemesanan.status,
      snapshot: transaction.snapshotData,
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
        pemesanan: {
          select: {
            id: true,
            status: true,
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
        snapshotData: {
          ...((transaction.snapshotData ?? {}) as Record<string, unknown>),
          webhook_status: input.status,
          webhook_paid_at: input.paid_at?.toISOString() ?? null,
          webhook_external_id: input.external_id,
        },
      },
    })

    let updatedPemesanan = null

    if (
      input.status === 'SUCCESS' &&
      transaction.pemesanan.status === 'MENUNGGU_PERSETUJUAN'
    ) {
      updatedPemesanan = await prisma.pemesanan.update({
        where: { id: transaction.pemesananId },
        data: { status: 'DITERIMA' },
        include: {
          room: {
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
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    return {
      transaction: updatedTransaction,
      pemesanan: updatedPemesanan,
      previous_status: previousStatus,
    }
  })

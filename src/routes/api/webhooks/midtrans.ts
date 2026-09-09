import '#/polyfill'

import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '#/db'
import { z } from 'zod'
import { verifyMidtransSignature } from '#/lib/midtrans'
import { createNotification } from '#/lib/services/notifications'

const midtransNotificationSchema = z.object({
  order_id: z.string().min(1),
  transaction_status: z.enum([
    'capture',
    'settlement',
    'pending',
    'deny',
    'expire',
    'cancel',
    'refund',
    'partial_refund',
    'chargeback',
    'installment_confirm',
    'installment_reject',
    'bca_klik_b2b_confirm',
    'bca_klik_b2b_reject',
  ]),
  fraud_status: z.enum(['accept', 'challenge', 'deny']).optional(),
  transaction_id: z.string().optional(),
  gross_amount: z.string().optional(),
  payment_type: z.string().optional(),
  status_code: z.string().optional(),
  status_message: z.string().optional(),
})

async function handle({ request }: { request: Request }) {
  const rawBody = await request.text()
  const signature = request.headers.get('X-Signature') ?? ''

  if (!verifyMidtransSignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: Record<string, unknown>

  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const parsed = midtransNotificationSchema.safeParse(payload)

  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid payload',
        errors: parsed.error.flatten(),
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const orderId = parsed.data.order_id
  const transactionStatus = parsed.data.transaction_status
  const fraudStatus = parsed.data.fraud_status

  const transaction = await prisma.transaction.findUnique({
    where: { midtransOrderId: orderId },
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
    return new Response('Transaction not found', { status: 404 })
  }

  if (transaction.status === 'SUCCESS') {
    return new Response(JSON.stringify({ status: 'ok', idempotent: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const shouldMarkSuccess =
    transactionStatus === 'capture' || transactionStatus === 'settlement'

  const isFraudAccepted = fraudStatus === undefined || fraudStatus === 'accept'

  if (shouldMarkSuccess && isFraudAccepted) {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'SUCCESS',
          midtransTransactionId:
            parsed.data.transaction_id ?? transaction.midtransTransactionId,
          webhookPayload: {
            ...((transaction.webhookPayload ?? {}) as Record<string, unknown>),
            webhook_status: transactionStatus,
            webhook_provider: 'midtrans',
            webhook_external_id: parsed.data.transaction_id,
          },
        },
      })

      if (transaction.booking.status_booking === 'PENDING_PAYMENT') {
        await tx.booking.update({
          where: { id: transaction.bookingId },
          data: { status_booking: 'ACTIVE' },
        })
      }

      await createNotification({
        userId: transaction.booking.users.id,
        type: 'PAYMENT_SUCCESS',
        title: 'Pembayaran Berhasil',
        message: `Pembayaran untuk booking ${transaction.booking.id} telah berhasil.`,
        referenceId: transaction.bookingId,
      })
    })
  } else if (transactionStatus === 'expire') {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'EXPIRED',
        webhookPayload: {
          ...((transaction.webhookPayload ?? {}) as Record<string, unknown>),
          webhook_status: transactionStatus,
          webhook_provider: 'midtrans',
          webhook_external_id: parsed.data.transaction_id,
        },
      },
    })
  } else if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'FAILED',
        webhookPayload: {
          ...((transaction.webhookPayload ?? {}) as Record<string, unknown>),
          webhook_status: transactionStatus,
          webhook_provider: 'midtrans',
          webhook_external_id: parsed.data.transaction_id,
        },
      },
    })
  }

  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const Route = createFileRoute('/api/webhooks/midtrans')({
  server: {
    handlers: {
      POST: handle,
    },
  },
})

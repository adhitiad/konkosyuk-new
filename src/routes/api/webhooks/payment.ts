import '#/polyfill'

import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '#/db'
import type { Prisma } from '#/generated/prisma/client.js'
import { z } from 'zod'
import { createNotification } from '#/lib/services/notifications'

const webhookSchema = z.object({
  event_id: z.string().min(1),
  transaction_id: z.string().uuid(),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED']),
  amount: z.number().min(0).optional(),
  paid_at: z.coerce.date().optional(),
  external_id: z.string().optional(),
  snapshot_data: z.record(z.string(), z.unknown()).optional(),
})

async function handle({ request }: { request: Request }) {
  const body = await request.text()

  let payload: Record<string, unknown>

  try {
    payload = JSON.parse(body) as Record<string, unknown>
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const parsed = webhookSchema.safeParse(payload)

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

  const eventId = parsed.data.event_id
  const provider = 'midtrans-mock'

  const existingEvent = await prisma.webhook_events.findFirst({
    where: {
      provider,
      event_id: eventId,
    },
  })

  if (existingEvent?.processed_at) {
    return new Response(
      JSON.stringify({
        success: true,
        idempotent: true,
        message: 'Webhook already processed',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const transactionId = parsed.data.transaction_id
  const status = parsed.data.status
  const paidAt = parsed.data.paid_at
  const metadata = parsed.data.snapshot_data ?? {}

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
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
      throw new Error('Transaction not found')
    }

    const previousStatus = transaction.status
    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status:
          status === 'SUCCESS'
            ? 'SUCCESS'
            : status === 'FAILED'
              ? 'FAILED'
              : 'EXPIRED',
        webhookPayload: {
          ...((transaction.webhookPayload ?? {}) as Record<string, unknown>),
          webhook_status: status,
          webhook_paid_at: paidAt?.toISOString() ?? null,
          webhook_provider: provider,
          webhook_external_id: parsed.data.external_id,
          ...metadata,
        },
      },
    })

    let updatedBooking = null

    if (
      status === 'SUCCESS' &&
      transaction.booking.status_booking === 'PENDING_PAYMENT'
    ) {
      updatedBooking = await tx.booking.update({
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
              nama_unit: true,
              properties: {
                select: {
                  id: true,
                  nama_properti: true,
                },
              },
            },
          },
        },
      })
    }

    await tx.webhook_events.create({
      data: {
        provider,
        event_id: eventId,
        event_type: 'payment.update',
        payload: metadata as Prisma.InputJsonValue,
        signature_valid: true,
        details: {
          previous_status: previousStatus,
          new_status: status,
          transaction_id: transactionId,
          booking_id: transaction.bookingId,
        },
        processed_at: new Date(),
      },
    })

    if (status === 'SUCCESS') {
      await createNotification({
        userId: transaction.booking.users.id,
        type: 'PAYMENT_SUCCESS',
        title: 'Pembayaran Berhasil',
        message: `Pembayaran untuk booking ${transaction.booking.id} telah berhasil.`,
        referenceId: transaction.bookingId,
      })
    }

    return {
      transaction: updatedTransaction,
      booking: updatedBooking,
    }
  })

  return new Response(
    JSON.stringify({
      success: true,
      idempotent: false,
      transaction_id: transactionId,
      status,
      booking_status: result.booking?.status_booking,
      message: 'Payment status updated',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

export const Route = createFileRoute('/api/webhooks/payment')({
  server: {
    handlers: {
      POST: handle,
    },
  },
})

import '#/polyfill'

import { createFileRoute } from '@tanstack/react-router'
import { qstashReceiver } from '#/lib/qstash'
import { processBookingExpiry } from '#/lib/services/booking-expiry-processor'
import { prisma } from '#/db'
import type { Prisma } from '#/generated/prisma/client.js'

async function handle({ request }: { request: Request }) {
  const signature = request.headers.get('upstash-signature') || ''
  const body = await request.text()

  let payload: Record<string, unknown>

  try {
    payload = JSON.parse(body) as Record<string, unknown>
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  try {
    const isValid = await qstashReceiver.verify({
      signature,
      body,
      url: request.url,
    })

    if (!isValid) {
      return new Response('Invalid signature', { status: 401 })
    }
  } catch {
    return new Response('Signature verification failed', { status: 401 })
  }

  const eventType =
    (payload.event_type as string | undefined) ??
    (payload.type as string | undefined)

  if (eventType === 'payment.update' || payload.transaction_id) {
    const eventId =
      (payload.event_id as string | undefined) ??
      `${payload.transaction_id}_${Date.now()}`
    const provider = (payload.provider as string | undefined) ?? 'qstash'

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

    const transactionId = payload.transaction_id as string | undefined
    const status = (payload.status as string | undefined) ?? 'PENDING'
    const paidAt = payload.paid_at
      ? new Date(payload.paid_at as string)
      : undefined
    const channel = payload.channel as string | undefined
    const metadata = (payload.metadata ?? {}) as Record<string, unknown>

    if (!transactionId) {
      return new Response('Missing transaction_id in payload', { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.paymentTransaction.findUnique({
        where: { id: transactionId },
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      const previousStatus = transaction.status
      const updatedTransaction = await tx.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          status: status as 'PENDING' | 'BERHASIL' | 'GAGAL' | 'DIBATALKAN',
          metadata: {
            ...((transaction.metadata ?? {}) as Record<string, unknown>),
            webhook_status: status,
            webhook_paid_at: paidAt?.toISOString() ?? null,
            webhook_provider: provider,
            webhook_channel: channel,
            ...metadata,
          },
        },
      })

      const txMetadata = (updatedTransaction.metadata ?? {}) as Record<
        string,
        unknown
      >
      const bookingId = txMetadata.booking_id as string | undefined

      let updatedPayment = null
      let updatedBooking = null

      if (bookingId) {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          select: { id: true, status_booking: true, unit_id: true },
        })

        if (booking) {
          let nextBookingStatus: string | undefined
          if (status === 'BERHASIL') {
            nextBookingStatus = 'AKTIF'
          } else if (status === 'GAGAL') {
            nextBookingStatus = 'MENUNGGU_PEMBAYARAN_DP'
          }

          if (
            nextBookingStatus &&
            booking.status_booking !== nextBookingStatus
          ) {
            updatedBooking = await tx.booking.update({
              where: { id: bookingId },
              data: {
                status_booking: nextBookingStatus as
                  'AKTIF' | 'MENUNGGU_PEMBAYARAN_DP',
                ...(status === 'BERHASIL'
                  ? { tanggalBayarDP: paidAt ?? new Date() }
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
              status === 'BERHASIL'
                ? 'BERHASIL'
                : status === 'GAGAL'
                  ? 'GAGAL'
                  : 'PENDING',
            paid_at: paidAt ?? null,
          },
        })

        if (updatedPayment.count > 0 && booking) {
        }
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
            booking_id: bookingId,
          },
          processed_at: new Date(),
        },
      })

      return {
        transaction: updatedTransaction,
        payment: updatedPayment,
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
        pemesanan_status: undefined,
        message: 'Payment status updated',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  if (eventType === 'booking.expiry' || payload.booking_id) {
    const bookingId = payload.booking_id as string | undefined
    if (!bookingId) {
      return new Response('Missing booking_id in payload', { status: 400 })
    }

    await processBookingExpiry(bookingId)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response('Unsupported event type', { status: 400 })
}

export const Route = createFileRoute('/api/webhooks/qstash/$')({
  server: {
    handlers: {
      POST: handle,
    },
  },
})

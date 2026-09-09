import { prisma } from '#/db'
import { createBookingNotification } from '#/lib/services/notifications'

const BATCH_SIZE = 100

export interface CancelExpiredBookingsResult {
  cancelled: number
  skipped: number
  errors: string[]
}

export async function cancelExpiredBookings(): Promise<CancelExpiredBookingsResult> {
  const now = new Date()

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status_booking: 'PENDING_PAYMENT',
      payment_deadline: { lt: now },
    },
    select: {
      id: true,
      unit_id: true,
      penyewa_id: true,
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
      users: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: BATCH_SIZE,
  })

  let cancelled = 0
  let skipped = 0
  const errors: string[] = []

  for (const booking of expiredBookings) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status_booking: 'EXPIRED',
            cancelled_at: now,
            cancelled_reason: 'Pembayaran tidak diterima dalam batas waktu',
          },
        })

        await tx.units.update({
          where: { id: booking.unit_id },
          data: { status: 'available' },
        })
      })

      await createBookingNotification({
        userId: booking.penyewa_id,
        type: 'booking',
        title: 'Booking Kadaluarsa',
        message: `Booking Anda untuk ${booking.units.properties.name} - ${booking.units.name} telah kadaluarsa karena pembayaran tidak diterima dalam batas waktu.`,
        referenceId: booking.id,
      })

      cancelled++
    } catch (error) {
      skipped++
      errors.push(
        `Failed to cancel booking ${booking.id}: ${(error as Error).message}`,
      )
    }
  }

  return { cancelled, skipped, errors }
}

import { prisma } from '#/db'

export interface BookingExpiryResult {
  bookingId: string
  expired: boolean
  reason: string
}

export async function processBookingExpiry(
  bookingId: string,
): Promise<BookingExpiryResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status_booking: true,
      transaksiDP_id: true,
      transaksiDP: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  })

  if (!booking) {
    return { bookingId, expired: false, reason: 'Booking not found' }
  }

  if (booking.status_booking !== 'PENDING_PAYMENT') {
    return {
      bookingId,
      expired: false,
      reason: `Booking status is ${booking.status_booking}`,
    }
  }

  if (booking.transaksiDP && booking.transaksiDP.status === 'BERHASIL') {
    return {
      bookingId,
      expired: false,
      reason: 'DP payment already verified',
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status_booking: 'CANCELLED',
        alasanPenolakan:
          'Booking dibatalkan karena DP tidak dibayar dalam waktu yang ditentukan',
        tanggalDitolak: new Date(),
      },
    })

    if (booking.transaksiDP && booking.transaksiDP.status === 'PENDING') {
      await tx.paymentTransaction.update({
        where: { id: booking.transaksiDP.id },
        data: { status: 'DIBATALKAN' },
      })
    }
  })

  return {
    bookingId,
    expired: true,
    reason: 'Booking expired due to unpaid DP',
  }
}

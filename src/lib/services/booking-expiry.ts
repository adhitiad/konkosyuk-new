import { qstashClient } from '#/lib/qstash'

export const BOOKING_EXPIRY_DELAY_SECONDS = 1800

export interface ScheduleBookingExpiryResult {
  messageId: string
}

export async function scheduleBookingExpiry(
  bookingId: string,
  delaySeconds: number = BOOKING_EXPIRY_DELAY_SECONDS,
): Promise<ScheduleBookingExpiryResult> {
  const baseUrl =
    process.env.SERVER_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'

  const webhookUrl = `${baseUrl}/api/webhooks/qstash/booking-expiry`

  const response = await qstashClient.publishJSON({
    url: webhookUrl,
    body: {
      booking_id: bookingId,
      scheduled_at: new Date().toISOString(),
    },
    delay: delaySeconds,
  })

  return { messageId: response.messageId }
}

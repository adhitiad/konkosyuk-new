import '#/polyfill'

import { createFileRoute } from '@tanstack/react-router'
import { cancelExpiredBookings } from '#/server/jobs/cancel-expired-bookings'

async function handle({ request }: { request: Request }) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  const expectedToken = process.env.CRON_SECRET

  if (!expectedToken || token !== expectedToken) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const result = await cancelExpiredBookings()

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: (error as Error).message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

export const Route = createFileRoute('/api/cron/cancel-expired-bookings')({
  server: {
    handlers: {
      POST: handle,
    },
  },
})

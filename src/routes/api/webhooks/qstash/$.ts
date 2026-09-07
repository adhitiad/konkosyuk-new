import '#/polyfill'

import { createFileRoute } from '@tanstack/react-router'
import { qstashReceiver } from '#/lib/qstash'
import { processBookingExpiry } from '#/lib/services/booking-expiry-processor'

async function handle({ request }: { request: Request }) {
  const signature = request.headers.get('upstash-signature') || ''
  const body = await request.text()

  let payload: { booking_id?: string }

  try {
    payload = JSON.parse(body) as { booking_id?: string }
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

  if (!payload.booking_id) {
    return new Response('Missing booking_id in payload', { status: 400 })
  }

  await processBookingExpiry(payload.booking_id)

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const Route = createFileRoute('/api/webhooks/qstash/$')({
  server: {
    handlers: {
      POST: handle,
    },
  },
})

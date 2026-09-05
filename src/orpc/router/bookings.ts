import { os } from '#/orpc/server'
import { z } from 'zod'
import { prisma } from '#/db'
import {
  CreateBookingInput,
  CreateBookingRequestInput,
} from '#/orpc/schema/bookings'

export const createBookingRequest = os
  .input(CreateBookingRequestInput)
  .handler(async ({ input }) => {
    const bookingRequest = await prisma.booking_requests.create({
      data: {
        property_id: input.property_id,
        unit_id: input.unit_id,
        tenant_id: input.tenant_id,
        num_occupants: input.num_occupants,
        start_date: input.start_date,
        agreed_price: input.agreed_price,
      },
      include: {
        properties: true,
        units: true,
        users: true,
      },
    })
    return bookingRequest
  })

export const getPropertyBookingRequests = os
  .input(z.object({ property_id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const bookingRequests = await prisma.booking_requests.findMany({
      where: { property_id: input.property_id },
      include: {
        properties: true,
        units: true,
        users: true,
        bookings: true,
      },
      orderBy: { created_at: 'desc' },
    })
    return bookingRequests
  })

export const getPropertyBookings = os
  .input(z.object({ property_id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const bookings = await prisma.bookings.findMany({
      where: { property_id: input.property_id },
      include: {
        properties: true,
        units: true,
        users: true,
        booking_requests: true,
        payments: true,
      },
      orderBy: { created_at: 'desc' },
    })
    return bookings
  })

export const createBooking = os
  .input(CreateBookingInput)
  .handler(async ({ input }) => {
    const booking = await prisma.bookings.create({
      data: {
        property_id: input.property_id,
        unit_id: input.unit_id,
        user_id: input.user_id,
        booking_type: input.booking_type,
        start_date: input.start_date,
        end_date: input.end_date,
        base_price_at_booking: input.base_price_at_booking,
        security_deposit: input.security_deposit,
        discount_amount: input.discount_amount ?? 0,
        tax_amount: input.tax_amount ?? 0,
        total_amount: input.total_amount,
        currency: input.currency,
        source: input.source,
        referral_code: input.referral_code,
        utm_source: input.utm_source,
        utm_medium: input.utm_medium,
        utm_campaign: input.utm_campaign,
        booking_request_id: input.booking_request_id,
      },
      include: {
        properties: true,
        units: true,
        users: true,
        booking_requests: true,
      },
    })
    return booking
  })

export const confirmBookingRequest = os
  .input(z.object({ booking_request_id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const bookingRequest = await prisma.booking_requests.findUnique({
      where: { id: input.booking_request_id },
      include: { properties: true, units: true },
    })

    if (!bookingRequest) {
      throw new Error('Booking request not found')
    }

    const booking = await prisma.bookings.create({
      data: {
        property_id: bookingRequest.property_id,
        unit_id: bookingRequest.unit_id,
        user_id: bookingRequest.tenant_id,
        booking_type: 'daily',
        start_date: bookingRequest.start_date,
        end_date: bookingRequest.start_date,
        base_price_at_booking: bookingRequest.agreed_price ?? 0,
        security_deposit: 0,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: bookingRequest.agreed_price ?? 0,
        currency: 'IDR',
        source: 'direct',
        booking_request_id: bookingRequest.id,
      },
      include: {
        properties: true,
        units: true,
        users: true,
        booking_requests: true,
      },
    })

    await prisma.booking_requests.update({
      where: { id: input.booking_request_id },
      data: { status: 'accepted' },
    })

    return booking
  })

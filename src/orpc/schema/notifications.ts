import { z } from 'zod'

export const NotificationTypeSchema = z.enum([
  'BOOKING_APPROVED',
  'BOOKING_REJECTED',
  'PAYMENT_SUCCESS',
  'NEW_MESSAGE',
  'booking',
  'payment',
  'maintenance',
  'message',
  'review',
  'referral',
  'system',
  'promotion',
  'security',
  'reminder',
])

export const getNotificationsSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().max(1000).optional(),
})

export const markNotificationReadSchema = z.object({
  notification_id: z.string().uuid(),
})

export const markAllNotificationsReadSchema = z.object({})

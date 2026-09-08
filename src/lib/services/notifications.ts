import { prisma } from '#/db'
import type { z } from 'zod'
import type { NotificationTypeSchema } from '#/orpc/schema/notifications'

export type NotificationType = z.infer<typeof NotificationTypeSchema>

export async function createNotification({
  userId,
  type,
  title,
  message,
  referenceId,
}: {
  userId: string
  type: z.infer<typeof NotificationTypeSchema>
  title: string
  message: string
  referenceId?: string
}) {
  await prisma.notifications.create({
    data: {
      user_id: userId,
      type,
      title,
      message,
      reference_id: referenceId ?? null,
    },
  })
}

export async function createBookingNotification({
  userId,
  type,
  title,
  message,
  referenceId,
}: {
  userId: string
  type: 'booking' | 'payment'
  title: string
  message: string
  referenceId?: string
}) {
  await prisma.notifications.create({
    data: {
      user_id: userId,
      type,
      title,
      message,
      reference_id: referenceId ?? null,
    },
  })
}

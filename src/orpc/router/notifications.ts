import type { z } from 'zod'
import { ORPCError } from '@orpc/server'
import { os } from '#/orpc/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import {
  getNotificationsSchema,
  markNotificationReadSchema,
  markAllNotificationsReadSchema,
} from '#/orpc/schema/notifications'
import type { NotificationTypeSchema } from '#/orpc/schema/notifications'

const withSession = os.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers })
  if (!session?.user) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'Authentication required',
    })
  }
  return next({
    context: {
      user: session.user,
    },
  })
})

export const getNotifications = withSession
  .input(getNotificationsSchema)
  .handler(async ({ input, context }) => {
    const limit = input.limit ?? 20
    const offset = input.offset ?? 0

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where: { user_id: context.user.id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notifications.count({
        where: { user_id: context.user.id },
      }),
    ])

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        reference_id: n.reference_id,
        is_read: n.is_read,
        created_at: n.created_at,
        updated_at: n.updated_at,
      })),
      total,
      limit,
      offset,
    }
  })

export const getUnreadNotifications = withSession
  .input(getNotificationsSchema)
  .handler(async ({ input, context }) => {
    const limit = input.limit ?? 50

    const notifications = await prisma.notifications.findMany({
      where: {
        user_id: context.user.id,
        is_read: false,
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    })

    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      reference_id: n.reference_id,
      is_read: n.is_read,
      created_at: n.created_at,
      updated_at: n.updated_at,
    }))
  })

export const markNotificationRead = withSession
  .input(markNotificationReadSchema)
  .handler(async ({ input, context }) => {
    const notification = await prisma.notifications.findUnique({
      where: { id: input.notification_id },
      select: { id: true, user_id: true, is_read: true },
    })

    if (!notification) {
      throw new ORPCError('NOT_FOUND', { message: 'Notification not found' })
    }

    if (notification.user_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Not authorized to modify this notification',
      })
    }

    if (notification.is_read) {
      return { id: notification.id, is_read: true }
    }

    const updated = await prisma.notifications.update({
      where: { id: input.notification_id },
      data: { is_read: true, updated_at: new Date() },
      select: { id: true, is_read: true },
    })

    return updated
  })

export const markAllNotificationsRead = withSession
  .input(markAllNotificationsReadSchema)
  .handler(async ({ context }) => {
    const result = await prisma.notifications.updateMany({
      where: {
        user_id: context.user.id,
        is_read: false,
      },
      data: { is_read: true, updated_at: new Date() },
    })

    return { updatedCount: result.count }
  })

export type NotificationType = z.infer<typeof NotificationTypeSchema>

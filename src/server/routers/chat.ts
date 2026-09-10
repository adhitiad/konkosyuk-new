import { ORPCError } from '@orpc/server'
import { os } from '#/orpc/server'
import { z } from 'zod'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import cloudinary from '#/lib/cloudinary'
import { SSEManager } from '#/server/sse'
import { getOrCreateConversation } from '#/lib/conversation'
import {
  publishNewMessage,
  publishMessageRead,
  publishTypingIndicator,
  publishPresenceUpdate,
} from '#/websocket/publisher'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const MAX_ATTACHMENTS = 5
const MAX_TOTAL_SIZE = 10 * 1024 * 1024
const TYPING_EXPIRE_MS = 5_000

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ALLOWED_EXTENSIONS = [
  '.csv',
  '.txt',
  '.md',
  '.xls',
  '.xlsx',
  '.doc',
  '.docx',
]

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

const conversationParticipantWhere = (
  conversationId: string,
  userId: string,
) => ({
  id: conversationId,
  OR: [{ userId }, { ownerId: userId }],
})

const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  if (diffHour < 24) return `${diffHour} jam lalu`
  if (diffDay < 7) return `${diffDay} hari lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const typingTimers = new Map<string, NodeJS.Timeout>()

export const getConversations = withSession.handler(async ({ context }) => {
  const userId = context.user.id

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userId }, { ownerId: userId }],
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      owner: {
        select: { id: true, name: true, image: true },
      },
      booking: {
        select: {
          id: true,
          unit: {
            select: {
              id: true,
              name: true,
              property: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
      property: {
        select: { id: true, name: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          content: true,
          isRead: true,
          createdAt: true,
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  const conversationIds = conversations.map((conv) => conv.id)
  const unreadCounts =
    conversationIds.length > 0
      ? await prisma.message.groupBy({
          by: ['conversationId'],
          where: {
            conversationId: { in: conversationIds },
            isRead: false,
            senderId: { not: userId },
          },
          _count: { id: true },
        })
      : []

  const unreadCountMap = new Map(
    unreadCounts.map((u) => [u.conversationId, u._count.id]),
  )

  return conversations.map((conv) => {
    const otherParticipant = conv.userId === userId ? conv.owner : conv.user
    const lastMessage: {
      id: string
      content: string | null
      isRead: boolean
      createdAt: Date
      sender: {
        id: string
        name: string
        image: string | null
      }
    } | null = conv.messages.at(0) ?? null

    return {
      id: conv.id,
      lastMessageAt: conv.lastMessageAt,
      createdAt: conv.createdAt,
      otherParticipant: {
        id: otherParticipant.id,
        name: otherParticipant.name,
        image: otherParticipant.image,
      },
      relatedBooking: conv.booking
        ? {
            id: conv.booking.id,
            unit: conv.booking.unit,
          }
        : null,
      relatedProperty: conv.property ?? null,
      unreadCount: unreadCountMap.get(conv.id) ?? 0,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            content: lastMessage.content,
            isRead: lastMessage.isRead,
            createdAt: lastMessage.createdAt,
            sender: {
              id: lastMessage.sender.id,
              name: lastMessage.sender.name,
              image: lastMessage.sender.image,
            },
          }
        : null,
    }
  })
})

export const getConversationMessages = withSession
  .input(
    z.object({
      conversationId: z.string().uuid(),
      cursor: z.string().uuid().optional(),
      limit: z.number().int().positive().max(100).default(50),
    }),
  )
  .handler(async ({ input, context }) => {
    const { conversationId, cursor, limit } = input
    const userId = context.user.id

    const conversation = await prisma.conversation.findFirst({
      where: conversationParticipantWhere(conversationId, userId),
      select: { id: true },
    })

    if (!conversation) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Conversation not found',
      })
    }

    const where: Record<string, unknown> = { conversationId }
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) }
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit + 1,
    })

    let nextCursor: string | undefined
    if (messages.length > limit) {
      const nextMessage = messages.pop()
      nextCursor = nextMessage!.createdAt.toISOString()
    }

    return {
      messages: messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        attachments: msg.attachments,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          image: msg.sender.image,
        },
      })),
      nextCursor,
    }
  })

export const sendMessage = withSession
  .input(
    z.object({
      conversationId: z.string().uuid(),
      content: z.string().max(2000).optional(),
      attachments: z
        .array(
          z.object({
            url: z.string().url(),
            type: z.string(),
            filename: z.string(),
            size: z.number().positive(),
          }),
        )
        .max(MAX_ATTACHMENTS)
        .optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { conversationId, content, attachments } = input
    const userId = context.user.id

    if (!content && (!attachments || attachments.length === 0)) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Pesan harus memiliki konten atau minimal satu attachment',
      })
    }

    if (attachments && attachments.length > 0) {
      const totalSize = attachments.reduce((sum, att) => sum + att.size, 0)
      if (totalSize > MAX_TOTAL_SIZE) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Total ukuran attachment maksimal 10MB',
        })
      }
    }

    const conversation = await prisma.conversation.findFirst({
      where: conversationParticipantWhere(conversationId, userId),
      select: { id: true, userId: true, ownerId: true },
    })

    if (!conversation) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Conversation not found',
      })
    }

    const now = new Date()
    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: content ?? null,
          attachments: attachments ?? undefined,
          createdAt: now,
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
      })

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: now },
      })

      return created
    })

    const recipientId =
      conversation.userId === userId
        ? conversation.ownerId
        : conversation.userId

    if (recipientId) {
      const sender = await prisma.users.findUnique({
        where: { id: userId },
        select: { name: true },
      })

      const preview = content
        ? content.slice(0, 100)
        : `Attachment: ${attachments?.[0]?.filename ?? 'file'}`

      await prisma.notifications.create({
        data: {
          user_id: recipientId,
          title: 'Pesan Baru',
          message: `${sender?.name ?? 'Seseorang'} mengirimkan pesan: ${preview}`,
          type: 'NEW_MESSAGE',
          reference_id: conversationId,
        },
      })
    }

    SSEManager.broadcastToConversation(conversationId, 'new-message', {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      attachments: message.attachments,
      isRead: message.isRead,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        image: message.sender.image,
      },
    })

    publishNewMessage(conversationId, message.id, userId).catch(() => {
      console.warn('Failed to publish new message via WebSocket')
    })

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      attachments: message.attachments,
      isRead: message.isRead,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        image: message.sender.image,
      },
    }
  })

export const markMessagesAsRead = withSession
  .input(
    z.object({
      conversationId: z.string().uuid(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { conversationId } = input
    const userId = context.user.id

    const conversation = await prisma.conversation.findFirst({
      where: conversationParticipantWhere(conversationId, userId),
      select: { id: true },
    })

    if (!conversation) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Conversation not found',
      })
    }

    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    })

    SSEManager.broadcastToConversation(conversationId, 'messages-read', {
      conversationId,
      userId,
    })

    publishMessageRead(conversationId, userId).catch(() => {
      console.warn('Failed to publish message read via WebSocket')
    })

    return { markedCount: result.count }
  })

export const createConversationFromBooking = withSession
  .input(
    z.object({
      bookingId: z.string().uuid(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { bookingId } = input
    const userId = context.user.id

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, penyewa_id: true, unit_id: true },
    })

    if (!booking) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Booking not found',
      })
    }

    if (booking.penyewa_id !== userId) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Anda tidak memiliki akses ke booking ini',
      })
    }

    const unit = await prisma.units.findUnique({
      where: { id: booking.unit_id },
      select: { property_id: true },
    })

    if (!unit) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Unit not found',
      })
    }

    const conversation = await getOrCreateConversation({
      userId: booking.penyewa_id,
      ownerId: unit.property_id,
      bookingId,
    })

    return conversation
  })

export const createConversationFromProperty = withSession
  .input(
    z.object({
      propertyId: z.string().uuid(),
      ownerId: z.string().uuid(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { propertyId, ownerId } = input
    const userId = context.user.id

    if (userId === ownerId) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Tidak dapat membuat percakapan dengan diri sendiri',
      })
    }

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, owner_id: true },
    })

    if (!property) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Property not found',
      })
    }

    if (property.owner_id !== ownerId) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Owner ID tidak cocok dengan property',
      })
    }

    const conversation = await getOrCreateConversation({
      userId,
      ownerId,
      propertyId,
    })

    return conversation
  })

export const subscribeToConversation = withSession
  .input(
    z.object({
      conversationId: z.string().uuid(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { conversationId } = input
    const userId = context.user.id

    const conversation = await prisma.conversation.findFirst({
      where: conversationParticipantWhere(conversationId, userId),
      select: { id: true },
    })

    if (!conversation) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Conversation not found',
      })
    }

    let streamController: ReadableStreamDefaultController<any> | undefined

    const stream = new ReadableStream({
      start(controller) {
        streamController = controller
        SSEManager.addConversationController(conversationId, controller)

        controller.enqueue(
          new TextEncoder().encode('event: connected\ndata: {}\n\n'),
        )
      },
      cancel() {
        if (streamController) {
          SSEManager.removeConversationController(
            conversationId,
            streamController,
          )
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  })

export const getPresence = withSession
  .input(
    z.object({
      userId: z.string().uuid(),
    }),
  )
  .handler(async ({ input }) => {
    const presence = await prisma.userPresence.findUnique({
      where: { userId: input.userId },
      select: { isOnline: true, lastSeenAt: true },
    })

    return {
      isOnline: presence?.isOnline ?? false,
      lastSeenAt: presence?.lastSeenAt
        ? formatRelativeTime(presence.lastSeenAt)
        : 'Baru saja',
    }
  })

export const updatePresence = withSession
  .input(
    z.object({
      isOnline: z.boolean(),
    }),
  )
  .handler(async ({ input, context }) => {
    const userId = context.user.id
    const now = new Date()

    await prisma.userPresence.upsert({
      where: { userId },
      update: { isOnline: input.isOnline, updatedAt: now },
      create: { userId, isOnline: input.isOnline, updatedAt: now },
    })

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ userId }, { ownerId: userId }],
      },
      select: { id: true, userId: true, ownerId: true },
    })

    const participantIds = new Set<string>()
    for (const conv of conversations) {
      if (conv.userId !== userId) participantIds.add(conv.userId)
      if (conv.ownerId !== userId) participantIds.add(conv.ownerId)
    }

    SSEManager.broadcastToUser(userId, 'presence-update', {
      userId,
      isOnline: input.isOnline,
      lastSeenAt: now,
    })

    for (const id of participantIds) {
      SSEManager.broadcastToUser(id, 'presence-update', {
        userId,
        isOnline: input.isOnline,
        lastSeenAt: now,
      })
    }

    publishPresenceUpdate(userId, input.isOnline).catch(() => {
      console.warn('Failed to publish presence update via WebSocket')
    })

    return { isOnline: input.isOnline, lastSeenAt: now }
  })

export const sendTypingIndicator = withSession
  .input(
    z.object({
      conversationId: z.string().uuid(),
      isTyping: z.boolean(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { conversationId, isTyping } = input
    const userId = context.user.id

    const conversation = await prisma.conversation.findFirst({
      where: conversationParticipantWhere(conversationId, userId),
      select: { id: true, userId: true, ownerId: true },
    })

    if (!conversation) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Conversation not found',
      })
    }

    const event = isTyping ? 'typing-start' : 'typing-end'
    SSEManager.broadcastToConversation(conversationId, event, {
      conversationId,
      userId,
    })

    publishTypingIndicator(conversationId, userId, isTyping).catch(() => {
      console.warn('Failed to publish typing indicator via WebSocket')
    })

    const timerKey = `${conversationId}:${userId}`
    if (typingTimers.has(timerKey)) {
      clearTimeout(typingTimers.get(timerKey))
    }

    if (isTyping) {
      const timer = setTimeout(() => {
        SSEManager.broadcastToConversation(conversationId, 'typing-end', {
          conversationId,
          userId,
        })
        typingTimers.delete(timerKey)
      }, TYPING_EXPIRE_MS)

      typingTimers.set(timerKey, timer)
    }

    return { success: true }
  })

export const uploadAttachment = withSession
  .input(
    z.object({
      file: z.instanceof(File),
    }),
  )
  .handler(async ({ input, context }) => {
    const file = input.file

    if (file.size > MAX_FILE_SIZE) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Ukuran file maksimal 8MB',
      })
    }

    const lastDotIndex = file.name.lastIndexOf('.')
    const ext =
      lastDotIndex !== -1 ? file.name.slice(lastDotIndex).toLowerCase() : ''
    const isValidType =
      ALLOWED_MIME_TYPES.includes(file.type) ||
      (ext ? ALLOWED_EXTENSIONS.includes(ext) : false)

    if (!isValidType) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Tipe file tidak diizinkan',
      })
    }

    const folder = `konkosyuk/chat/${context.user.id}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<{
      secure_url: string
      public_id: string
      resource_type: string
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, res) => {
            if (error) {
              reject(error)
            } else {
              resolve(res!)
            }
          },
        )
        .end(buffer)
    })

    return {
      url: result.secure_url,
      type: file.type,
      filename: file.name,
      size: file.size,
    }
  })

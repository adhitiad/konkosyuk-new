import { prisma } from '#/db'
import { SSEManager } from '#/server/sse'

export async function publishNewMessage(messageId: string) {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
        conversation: {
          select: { userId: true, ownerId: true },
        },
      },
    })

    if (!message) return

    const conversation = message.conversation
    const participants = [conversation.userId, conversation.ownerId]

    const payload = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        image: message.sender.image,
      },
    }

    for (const participantId of participants) {
      if (participantId !== message.senderId) {
        try {
          SSEManager.broadcastToUser(participantId, 'new-message', payload)
        } catch {
          console.warn(`SSE broadcast failed for user ${participantId}`)
        }
      }
    }
  } catch {
    console.warn('Failed to publish new message event')
  }
}

export async function publishMessageRead(
  conversationId: string,
  readBy: string,
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userId: true, ownerId: true },
    })

    if (!conversation) return

    const participants = [conversation.userId, conversation.ownerId]
    const payload = { conversationId, readBy }

    for (const participantId of participants) {
      if (participantId !== readBy) {
        try {
          SSEManager.broadcastToUser(participantId, 'messages-read', payload)
        } catch {
          console.warn(`SSE broadcast failed for user ${participantId}`)
        }
      }
    }
  } catch {
    console.warn('Failed to publish message read event')
  }
}

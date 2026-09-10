import { prisma } from '#/db'
import { WebSocketManager } from '#/server/websocket'

const wsManager = WebSocketManager.getInstance()

export async function publishNewMessage(
  _conversationId: string,
  messageId: string,
  senderId: string,
) {
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
    const recipientId =
      conversation.userId === senderId
        ? conversation.ownerId
        : conversation.userId

    const payload = {
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

    if (recipientId) {
      wsManager.broadcastToUser(recipientId, 'new-message', payload)
    }
  } catch {
    console.warn('Failed to publish new message via WebSocket')
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

    const recipientId =
      conversation.userId === readBy
        ? conversation.ownerId
        : conversation.userId

    if (recipientId) {
      wsManager.broadcastToUser(recipientId, 'message-read', {
        conversationId,
        readBy,
      })
    }
  } catch {
    console.warn('Failed to publish message read via WebSocket')
  }
}

export async function publishTypingIndicator(
  conversationId: string,
  userId: string,
  isTyping: boolean,
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userId: true, ownerId: true },
    })

    if (!conversation) return

    const recipientId =
      conversation.userId === userId
        ? conversation.ownerId
        : conversation.userId

    if (recipientId) {
      wsManager.broadcastToUser(
        recipientId,
        isTyping ? 'typing-start' : 'typing-end',
        { conversationId, userId },
      )
    }
  } catch {
    console.warn('Failed to publish typing indicator via WebSocket')
  }
}

export async function publishPresenceUpdate(userId: string, isOnline: boolean) {
  try {
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

    const event = isOnline ? 'user-online' : 'user-offline'
    for (const id of participantIds) {
      wsManager.broadcastToUser(id, event, {
        userId,
        isOnline,
        lastSeenAt: new Date().toISOString(),
      })
    }
  } catch {
    console.warn('Failed to publish presence update via WebSocket')
  }
}

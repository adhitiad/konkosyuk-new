import { defineWebSocketHandler } from 'nitro'
import { WebSocketManager } from '#/server/websocket'

const wsManager = WebSocketManager.getInstance()

export default defineWebSocketHandler({
  upgrade(request) {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      throw new Response('Missing userId', { status: 4001 })
    }

    return {
      context: { userId },
    }
  },

  open(peer) {
    const userId = peer.context.userId as string | undefined
    if (!userId) {
      peer.close(4001, 'Unauthorized')
      return
    }

    wsManager.addConnection(userId, peer)

    peer.send(JSON.stringify({ type: 'connected', userId }))
  },

  message(peer, message) {
    const userId = peer.context.userId as string | undefined
    if (!userId) {
      peer.close(4001, 'Unauthorized')
      return
    }

    try {
      const data = JSON.parse(message.text())
      switch (data.type) {
        case 'join-conversation':
          if (data.conversationId) {
            wsManager.joinConversation(userId, data.conversationId)
            peer.send(
              JSON.stringify({
                type: 'joined',
                conversationId: data.conversationId,
              }),
            )
          }
          break

        case 'leave-conversation':
          if (data.conversationId) {
            wsManager.leaveConversation(userId, data.conversationId)
            peer.send(
              JSON.stringify({
                type: 'left',
                conversationId: data.conversationId,
              }),
            )
          }
          break

        case 'typing-start':
          if (data.conversationId) {
            wsManager.broadcastToConversation(
              data.conversationId,
              'typing-start',
              { conversationId: data.conversationId, userId },
              userId,
            )
          }
          break

        case 'typing-end':
          if (data.conversationId) {
            wsManager.broadcastToConversation(
              data.conversationId,
              'typing-end',
              { conversationId: data.conversationId, userId },
              userId,
            )
          }
          break

        default:
          peer.send(JSON.stringify({ error: 'Unknown message type' }))
      }
    } catch {
      peer.send(JSON.stringify({ error: 'Invalid message format' }))
    }
  },

  close(peer) {
    const userId = peer.context.userId as string | undefined
    if (userId) {
      wsManager.removeConnection(userId, peer)
    }
  },

  error(peer, error) {
    console.error('[ws] error', peer.id, error)
    const userId = peer.context.userId as string | undefined
    if (userId) {
      wsManager.removeConnection(userId, peer)
    }
  },
})

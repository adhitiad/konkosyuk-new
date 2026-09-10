type NitroPeer = {
  send: (data: string) => void
  close: (code?: number, reason?: string) => void
  id: string
  context: Record<string, unknown>
}

type ChatPeer = NitroPeer & {
  userId?: string
  conversationIds?: Set<string>
}

const MAX_MESSAGES_PER_MINUTE = 100
const MAX_TYPING_PER_MINUTE = 10

export class WebSocketManager {
  private static instance: WebSocketManager | undefined
  private userConnections = new Map<string, Set<ChatPeer>>()
  private conversationParticipants = new Map<string, Set<string>>()
  private messageRateLimits = new Map<string, number[]>()
  private typingRateLimits = new Map<string, number[]>()

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  addConnection(userId: string, peer: ChatPeer) {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set())
    }
    this.userConnections.get(userId)!.add(peer)
    peer.userId = userId
    peer.conversationIds = new Set()
  }

  removeConnection(userId: string, peer: ChatPeer) {
    const connections = this.userConnections.get(userId)
    if (!connections) return

    connections.delete(peer)
    if (connections.size === 0) {
      this.userConnections.delete(userId)
    }

    for (const [conversationId, participants] of this
      .conversationParticipants) {
      if (
        participants.has(userId) &&
        !this.isUserInConversation(userId, conversationId)
      ) {
        participants.delete(userId)
        if (participants.size === 0) {
          this.conversationParticipants.delete(conversationId)
        }
      }
    }
  }

  joinConversation(userId: string, conversationId: string) {
    if (!this.conversationParticipants.has(conversationId)) {
      this.conversationParticipants.set(conversationId, new Set())
    }
    this.conversationParticipants.get(conversationId)!.add(userId)

    const peer = this.getConnectionByUserId(userId)
    if (peer) {
      peer.conversationIds!.add(conversationId)
    }
  }

  leaveConversation(userId: string, conversationId: string) {
    const participants = this.conversationParticipants.get(conversationId)
    if (participants) {
      participants.delete(userId)
      if (participants.size === 0) {
        this.conversationParticipants.delete(conversationId)
      }
    }

    const peer = this.getConnectionByUserId(userId)
    if (peer) {
      peer.conversationIds!.delete(conversationId)
    }
  }

  broadcastToUser(userId: string, event: string, data: unknown) {
    const connections = this.userConnections.get(userId)
    if (!connections || connections.size === 0) return

    const payload = JSON.stringify({ event, data })
    for (const peer of connections) {
      try {
        peer.send(payload)
      } catch {
        this.removeConnection(userId, peer)
      }
    }
  }

  broadcastToConversation(
    conversationId: string,
    event: string,
    data: unknown,
    excludeUserId?: string,
  ) {
    const participants = this.conversationParticipants.get(conversationId)
    if (!participants || participants.size === 0) return

    const payload = JSON.stringify({ event, data })
    for (const userId of participants) {
      if (excludeUserId && userId === excludeUserId) continue

      const connections = this.userConnections.get(userId)
      if (!connections || connections.size === 0) continue

      for (const peer of connections) {
        try {
          peer.send(payload)
        } catch {
          this.removeConnection(userId, peer)
        }
      }
    }
  }

  isUserOnline(userId: string): boolean {
    const connections = this.userConnections.get(userId)
    return connections !== undefined && connections.size > 0
  }

  getUserConversations(userId: string): string[] {
    const conversations: string[] = []
    for (const [conversationId, participants] of this
      .conversationParticipants) {
      if (participants.has(userId)) {
        conversations.push(conversationId)
      }
    }
    return conversations
  }

  checkMessageRateLimit(userId: string): boolean {
    const now = Date.now()
    const windowMs = 60_000
    const timestamps = this.messageRateLimits.get(userId) || []

    const recent = timestamps.filter((ts) => now - ts < windowMs)
    if (recent.length >= MAX_MESSAGES_PER_MINUTE) {
      return false
    }

    recent.push(now)
    this.messageRateLimits.set(userId, recent)
    this.cleanupRateLimits(this.messageRateLimits, windowMs)
    return true
  }

  checkTypingRateLimit(userId: string): boolean {
    const now = Date.now()
    const windowMs = 60_000
    const timestamps = this.typingRateLimits.get(userId) || []

    const recent = timestamps.filter((ts) => now - ts < windowMs)
    if (recent.length >= MAX_TYPING_PER_MINUTE) {
      return false
    }

    recent.push(now)
    this.typingRateLimits.set(userId, recent)
    this.cleanupRateLimits(this.typingRateLimits, windowMs)
    return true
  }

  cleanup() {
    for (const [_userId, connections] of this.userConnections) {
      for (const peer of connections) {
        try {
          peer.close(1000, 'Server shutting down')
        } catch {
          // ignore
        }
      }
    }
    this.userConnections.clear()
    this.conversationParticipants.clear()
    this.messageRateLimits.clear()
    this.typingRateLimits.clear()
  }

  private getConnectionByUserId(userId: string): ChatPeer | undefined {
    const connections = this.userConnections.get(userId)
    if (!connections || connections.size === 0) return undefined
    return Array.from(connections)[0]
  }

  private isUserInConversation(
    userId: string,
    conversationId: string,
  ): boolean {
    const peer = this.getConnectionByUserId(userId)
    return peer?.conversationIds?.has(conversationId) ?? false
  }

  private cleanupRateLimits(
    map: Map<string, number[]>,
    windowMs: number,
  ): void {
    if (map.size > 10_000) {
      const now = Date.now()
      const cutoff = now - windowMs
      for (const [key, stamps] of map) {
        const filtered = stamps.filter((ts) => ts > cutoff)
        if (filtered.length === 0) {
          map.delete(key)
        } else {
          map.set(key, filtered)
        }
      }
    }
  }
}

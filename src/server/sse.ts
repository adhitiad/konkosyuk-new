type SSEConnection = {
  response: Response
  controller: ReadableStreamDefaultController
}

const userConnections = new Map<string, Set<SSEConnection>>()
const conversationControllers = new Map<
  string,
  Set<ReadableStreamDefaultController>
>()

export class SSEManager {
  static addUserConnection(userId: string, connection: SSEConnection) {
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set())
    }
    userConnections.get(userId)!.add(connection)
  }

  static removeUserConnection(userId: string, connection: SSEConnection) {
    const connections = userConnections.get(userId)
    if (!connections) return

    connections.delete(connection)
    if (connections.size === 0) {
      userConnections.delete(userId)
    }
  }

  static broadcastToUser(userId: string, event: string, data: unknown) {
    const connections = userConnections.get(userId)
    if (!connections || connections.size === 0) {
      return
    }

    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    const payload = new TextEncoder().encode(message)

    for (const connection of connections) {
      try {
        connection.controller.enqueue(payload)
      } catch {
        SSEManager.removeUserConnection(userId, connection)
      }
    }
  }

  static addConversationController(
    conversationId: string,
    controller: ReadableStreamDefaultController,
  ) {
    if (!conversationControllers.has(conversationId)) {
      conversationControllers.set(conversationId, new Set())
    }
    conversationControllers.get(conversationId)!.add(controller)
  }

  static removeConversationController(
    conversationId: string,
    controller: ReadableStreamDefaultController,
  ) {
    const controllers = conversationControllers.get(conversationId)
    if (!controllers) return

    controllers.delete(controller)
    if (controllers.size === 0) {
      conversationControllers.delete(conversationId)
    }
  }

  static broadcastToConversation(
    conversationId: string,
    event: string,
    data: unknown,
  ) {
    const controllers = conversationControllers.get(conversationId)
    if (!controllers || controllers.size === 0) {
      return
    }

    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    const payload = new TextEncoder().encode(message)

    for (const controller of controllers) {
      try {
        controller.enqueue(payload)
      } catch {
        SSEManager.removeConversationController(conversationId, controller)
      }
    }
  }

  static cleanup() {
    for (const [, connections] of userConnections) {
      for (const connection of connections) {
        try {
          connection.controller.close()
        } catch {
          // ignore cleanup errors
        }
      }
    }
    userConnections.clear()
    conversationControllers.clear()
  }
}

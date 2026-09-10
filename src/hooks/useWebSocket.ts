import { useEffect, useState, useCallback, useRef } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/api/ws/chat'

type WebSocketEvent =
  | 'connected'
  | 'new-message'
  | 'message-read'
  | 'typing-start'
  | 'typing-end'
  | 'user-online'
  | 'user-offline'
  | 'error'

type WebSocketEventHandler = (data: unknown) => void

export function useWebSocket(userId?: string) {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const reconnectDelayRef = useRef(1000)
  const listenersRef = useRef<Map<WebSocketEvent, Set<WebSocketEventHandler>>>(
    new Map(),
  )
  const currentUserIdRef = useRef(userId)

  const scheduleReconnect = useCallback((targetUserId: string) => {
    clearTimeout(reconnectTimerRef.current)

    reconnectTimerRef.current = setTimeout(() => {
      if (targetUserId && wsRef.current?.readyState !== WebSocket.OPEN) {
        // Trigger reconnect by creating a custom event
        const event = new CustomEvent('ws-reconnect', {
          detail: { userId: targetUserId },
        })
        window.dispatchEvent(event)
      }
    }, reconnectDelayRef.current)

    reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000)
  }, [])

  const connect = useCallback(
    (targetUserId: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }

      currentUserIdRef.current = targetUserId
      const url = `${WS_URL}?userId=${encodeURIComponent(targetUserId)}`
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        reconnectDelayRef.current = 1000
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          const eventType = message.type as WebSocketEvent
          const handlers = listenersRef.current.get(eventType)
          if (handlers) {
            handlers.forEach((handler) => handler(message))
          }
        } catch {
          console.error('Failed to parse WebSocket message', event.data)
        }
      }

      ws.onerror = () => {
        const handlers = listenersRef.current.get('error')
        if (handlers) {
          handlers.forEach((handler) =>
            handler({ message: 'WebSocket error occurred' }),
          )
        }
      }

      ws.onclose = () => {
        setConnected(false)
        scheduleReconnect(targetUserId)
      }
    },
    [scheduleReconnect],
  )

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimerRef.current)
    reconnectTimerRef.current = undefined
    if (wsRef.current !== null) {
      wsRef.current.close(1000, 'Client disconnecting')
      wsRef.current = null
    }
    setConnected(false)
  }, [])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const on = useCallback(
    (event: WebSocketEvent, handler: WebSocketEventHandler) => {
      if (!listenersRef.current.has(event)) {
        listenersRef.current.set(event, new Set())
      }
      listenersRef.current.get(event)!.add(handler)

      return () => {
        listenersRef.current.get(event)?.delete(handler)
      }
    },
    [],
  )

  const off = useCallback(
    (event: WebSocketEvent, handler: WebSocketEventHandler) => {
      listenersRef.current.get(event)?.delete(handler)
    },
    [],
  )

  useEffect(() => {
    if (userId && !connected) {
      connect(userId)
    }

    return () => {
      disconnect()
    }
  }, [userId, connected, connect, disconnect])

  useEffect(() => {
    const handleReconnect = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string }>
      if (customEvent.detail.userId && !connected) {
        connect(customEvent.detail.userId)
      }
    }

    window.addEventListener('ws-reconnect', handleReconnect)
    return () => {
      window.removeEventListener('ws-reconnect', handleReconnect)
    }
  }, [connected, connect])

  return {
    connected,
    userId: currentUserIdRef.current,
    connect,
    disconnect,
    send,
    on,
    off,
  }
}

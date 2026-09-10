import { useCallback, useEffect, useRef, useState } from 'react'

import { client } from '#/orpc/client'
import { authClient } from '#/lib/auth-client'

type PresenceData = {
  isOnline: boolean
  lastSeenAt: Date
  formattedLastSeen: string
}

type UsePresenceOptions = {
  userId: string
  pollingInterval?: number
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/api/ws/chat'

export function usePresence(options: UsePresenceOptions) {
  const { userId, pollingInterval = 30_000 } = options
  const [presence, setPresence] = useState<PresenceData>({
    isOnline: false,
    lastSeenAt: new Date(),
    formattedLastSeen: 'Baru saja',
  })
  const [isConnected, setIsConnected] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const formatLastSeen = useCallback((date: Date): string => {
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
  }, [])

  const fetchPresence = useCallback(async () => {
    try {
      const data = await client.getPresence({ userId })
      setPresence({
        isOnline: data.isOnline,
        lastSeenAt: new Date(),
        formattedLastSeen: data.lastSeenAt,
      })
    } catch {
      // ignore polling errors
    }
  }, [client, userId])

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    const { data: session } = authClient.useSession()
    if (!session) {
      return
    }
    const currentUserId = session.user.id

    if (!currentUserId) return

    const url = `${WS_URL}?userId=${encodeURIComponent(currentUserId)}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      setIsConnected(true)
      reconnectAttemptsRef.current = 0
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return

      try {
        const data = JSON.parse(event.data)

        if (data.type === 'user-online' && data.userId === userId) {
          setPresence({
            isOnline: true,
            lastSeenAt: new Date(),
            formattedLastSeen: 'Online',
          })
        }

        if (
          data.type === 'user-offline' &&
          data.userId === userId &&
          data.lastSeenAt
        ) {
          const lastSeen = new Date(data.lastSeenAt)
          setPresence({
            isOnline: false,
            lastSeenAt: lastSeen,
            formattedLastSeen: formatLastSeen(lastSeen),
          })
        }
      } catch {
        // ignore malformed payloads
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setIsConnected(false)

      if (reconnectAttemptsRef.current < 5) {
        const delay = Math.min(
          1_000 * 2 ** reconnectAttemptsRef.current,
          30_000,
        )
        reconnectAttemptsRef.current += 1

        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connect()
          }
        }, delay)
      }
    }

    ws.onerror = () => {
      if (!mountedRef.current) return
      console.error('Presence WebSocket error')
    }
  }, [formatLastSeen, userId])

  useEffect(() => {
    mountedRef.current = true

    const init = async () => {
      await fetchPresence()
      connect()

      if (pollingInterval > 0) {
        pollingTimerRef.current = setInterval(() => {
          if (mountedRef.current && !isConnected) {
            fetchPresence()
          }
        }, pollingInterval)
      }
    }

    init()

    const handleOnline = () => {
      if (reconnectAttemptsRef.current >= 5) {
        reconnectAttemptsRef.current = 0
        connect()
      }
    }

    window.addEventListener('online', handleOnline)

    return () => {
      mountedRef.current = false

      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current)
        pollingTimerRef.current = null
      }

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }

      window.removeEventListener('online', handleOnline)

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting')
        wsRef.current = null
      }
    }
  }, [connect, fetchPresence, isConnected, pollingInterval])

  return {
    isOnline: presence.isOnline,
    lastSeenAt: presence.lastSeenAt,
    formattedLastSeen: presence.formattedLastSeen,
    isConnected,
    refetch: fetchPresence,
  }
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { client } from '#/orpc/client'
import { authClient } from '#/lib/auth-client'

type ConnectionState = 'connecting' | 'connected' | 'disconnected'

type Participant = {
  id: string
  name: string
  image: string | null
}

type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string | null
  attachments?:
    { url: string; type: string; filename: string; size: number }[] | null
  isRead: boolean
  createdAt: Date
  sender: Participant
}

type UseChatOptions = {
  conversationId?: string | null
}

type WSMessage = {
  type:
    | 'connected'
    | 'new-message'
    | 'message-read'
    | 'typing-start'
    | 'typing-end'
    | 'user-online'
    | 'user-offline'
    | 'error'
  conversationId?: string
  userId?: string
  isTyping?: boolean
  content?: string | null
  isRead?: boolean
  lastSeenAt?: string
  sender?: Participant
  message?: string
}

const MAX_RECONNECT_DELAY = 30_000
const BASE_RECONNECT_DELAY = 1_000
const MAX_RECONNECT_ATTEMPTS = 5
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/api/ws/chat'

export function useChat(options: UseChatOptions = {}) {
  const { conversationId } = options
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected')
  const [typingUsers, setTypingUsers] = useState<Map<string, Participant>>(
    new Map(),
  )
  const [presence, setPresence] = useState<
    Map<string, { isOnline: boolean; lastSeenAt: Date }>
  >(new Map())

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userIdRef = useRef<string | null>(null)
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  )

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    for (const timer of typingTimersRef.current.values()) {
      clearTimeout(timer)
    }
    typingTimersRef.current.clear()
  }, [])

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

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }

    setConnectionState('connecting')
    clearTimers()

    const userId = userIdRef.current
    if (!userId) return

    const url = `${WS_URL}?userId=${encodeURIComponent(userId)}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      setConnectionState('connected')
      setIsConnected(true)
      reconnectAttemptsRef.current = 0

      ws.send(
        JSON.stringify({
          type: 'join-conversation',
          conversationId,
        }),
      )
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return

      try {
        const data = JSON.parse(event.data) as WSMessage

        if (data.type === 'new-message') {
          queryClient.invalidateQueries({
            queryKey: ['conversations'],
          })

          if (conversationId && data.conversationId === conversationId) {
            queryClient.invalidateQueries({
              queryKey: ['messages', conversationId],
            })
          }

          toast.success('Pesan baru', {
            description: data.content ?? 'Anda menerima pesan baru',
          })
        }

        if (data.type === 'message-read') {
          if (conversationId && data.conversationId === conversationId) {
            queryClient.invalidateQueries({
              queryKey: ['messages', conversationId],
            })
          }
        }

        if (
          data.type === 'typing-start' &&
          data.userId &&
          data.conversationId === conversationId
        ) {
          const typingUserId = data.userId
          setTypingUsers((prev) => {
            const next = new Map(prev)
            next.set(typingUserId, {
              id: typingUserId,
              name: 'Pengguna',
              image: null,
            })
            return next
          })

          const existingTimer = typingTimersRef.current.get(typingUserId)
          if (existingTimer) {
            clearTimeout(existingTimer)
          }

          const timer = setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Map(prev)
              next.delete(typingUserId)
              return next
            })
            typingTimersRef.current.delete(typingUserId)
          }, 5_000)

          typingTimersRef.current.set(typingUserId, timer)
        }

        if (data.type === 'typing-end' && data.userId) {
          const typingUserId = data.userId
          setTypingUsers((prev) => {
            const next = new Map(prev)
            next.delete(typingUserId)
            return next
          })

          const existingTimer = typingTimersRef.current.get(typingUserId)
          if (existingTimer) {
            clearTimeout(existingTimer)
            typingTimersRef.current.delete(typingUserId)
          }
        }

        if (data.type === 'user-online' && data.userId) {
          const onlineUserId = data.userId
          setPresence((prev) => {
            const next = new Map(prev)
            next.set(onlineUserId, {
              isOnline: true,
              lastSeenAt: new Date(),
            })
            return next
          })
        }

        if (data.type === 'user-offline' && data.userId && data.lastSeenAt) {
          const offlineUserId = data.userId
          const lastSeen = new Date(data.lastSeenAt)
          setPresence((prev) => {
            const next = new Map(prev)
            next.set(offlineUserId, {
              isOnline: false,
              lastSeenAt: lastSeen,
            })
            return next
          })
        }
      } catch {
        // ignore malformed WebSocket payloads
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setIsConnected(false)
      setConnectionState('disconnected')

      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          BASE_RECONNECT_DELAY * 2 ** reconnectAttemptsRef.current,
          MAX_RECONNECT_DELAY,
        )
        reconnectAttemptsRef.current += 1

        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connect()
          }
        }, delay)
      } else {
        toast.error('Koneksi chat terputus. Menggunakan mode offline.')
      }
    }

    ws.onerror = () => {
      if (!mountedRef.current) return
      console.error('WebSocket error')
    }
  }, [clearTimers, client, conversationId, formatLastSeen, queryClient])

  useEffect(() => {
    const init = async () => {
      const { data: session } = await authClient.useSession()
      if (!session) {
        return
      }
      const userId = session.user.id
      userIdRef.current = userId

      if (!userId) {
        return
      }

      connect()
    }

    init()

    const handleOnline = () => {
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current = 0
        connect()
      }
    }

    window.addEventListener('online', handleOnline)

    return () => {
      mountedRef.current = false
      clearTimers()
      window.removeEventListener('online', handleOnline)

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting')
        wsRef.current = null
      }
    }
  }, [clearTimers, connect])

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      return client.getConversations()
    },
    refetchInterval: isConnected ? false : 5_000,
    refetchIntervalInBackground: false,
  })

  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return { messages: [], nextCursor: undefined }
      return client.getConversationMessages({
        conversationId,
        limit: 50,
      })
    },
    enabled: Boolean(conversationId),
    refetchInterval: isConnected ? false : 5_000,
    refetchIntervalInBackground: false,
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (input: {
      conversationId: string
      content: string
      attachments?: {
        url: string
        type: string
        filename: string
        size: number
      }[]
    }) => {
      return client.sendMessage(input)
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: ['messages', input.conversationId],
      })

      const previousMessages = queryClient.getQueryData([
        'messages',
        input.conversationId,
      ])

      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}`,
        conversationId: input.conversationId,
        senderId: '',
        content: input.content,
        attachments: input.attachments,
        isRead: false,
        createdAt: new Date(),
        sender: {
          id: '',
          name: 'Anda',
          image: null,
        },
      }

      queryClient.setQueryData(
        ['messages', input.conversationId],
        (old: unknown) => {
          const current = old as
            { messages: Message[]; nextCursor?: string } | undefined
          return {
            messages: [...(current?.messages ?? []), optimisticMessage],
            nextCursor: current?.nextCursor,
          }
        },
      )

      return { previousMessages, optimisticMessage }
    },
    onError: (_error, input, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['messages', input.conversationId],
          context.previousMessages,
        )
      }
      toast.error('Gagal mengirim pesan')
    },
    onSettled: (_data, _error, input) => {
      if (input.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['messages', input.conversationId],
        })
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (input: { conversationId: string }) => {
      return client.markMessagesAsRead(input)
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', input.conversationId],
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: () => {
      toast.error('Gagal menandai pesan sebagai dibaca')
    },
  })

  const uploadAttachmentMutation = useMutation({
    mutationFn: async (file: File) => {
      return client.uploadAttachment({ file })
    },
    onError: () => {
      toast.error('Gagal mengunggah attachment')
    },
  })

  const sendTypingIndicator = useCallback(
    (targetConversationId: string, isTyping: boolean) => {
      if (!isConnected || !wsRef.current) return

      wsRef.current.send(
        JSON.stringify({
          type: isTyping ? 'typing-start' : 'typing-end',
          conversationId: targetConversationId,
        }),
      )
    },
    [isConnected],
  )

  const presenceArray = Array.from(presence.entries()).map(
    ([userId, data]) => ({
      userId,
      isOnline: data.isOnline,
      lastSeenAt: data.lastSeenAt,
      formattedLastSeen: formatLastSeen(data.lastSeenAt),
    }),
  )

  const isLoading = conversationsQuery.isLoading || messagesQuery.isLoading

  return {
    conversations: conversationsQuery.data ?? [],
    messages: messagesQuery.data?.messages ?? [],
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutate,
    markAsReadAsync: markAsReadMutation.mutateAsync,
    uploadAttachment: uploadAttachmentMutation.mutate,
    uploadAttachmentAsync: uploadAttachmentMutation.mutateAsync,
    sendTypingIndicator,
    isConnected,
    connectionState,
    typingUsers: Array.from(typingUsers.values()),
    presence: presenceArray,
    isLoading,
    isSending: sendMessageMutation.isPending,
    isMarkingRead: markAsReadMutation.isPending,
    isUploading: uploadAttachmentMutation.isPending,
    currentUserId: userIdRef.current,
    refetchConversations: conversationsQuery.refetch,
    refetchMessages: messagesQuery.refetch,
  }
}

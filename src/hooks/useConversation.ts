import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { client } from '#/orpc/client'

type Participant = {
  id: string
  name: string
  image: string | null
}

type RelatedBooking = {
  id: string
  unit: {
    id: string
    name: string
    property: {
      id: string
      name: string
    }
  }
}

type Conversation = {
  id: string
  lastMessageAt: Date | null
  createdAt: Date
  otherParticipant: Participant
  relatedBooking: RelatedBooking | null
  relatedProperty: {
    id: string
    name: string
  } | null
  unreadCount: number
  lastMessage: {
    id: string
    content: string | null
    isRead: boolean
    createdAt: Date
    sender: Participant
  } | null
}

type UseConversationOptions = {
  conversationId: string | null
  pollingInterval?: number
}

export function useConversation(options: UseConversationOptions) {
  const { conversationId, pollingInterval = 30_000 } = options
  const queryClient = useQueryClient()

  const conversationQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      return client.getConversations()
    },
    enabled: Boolean(conversationId),
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
  })

  const conversation =
    conversationQuery.data?.find(
      (item: Conversation) => item.id === conversationId,
    ) ?? null

  const unreadCount = conversation?.unreadCount ?? 0

  const refetch = useCallback(() => {
    return conversationQuery.refetch()
  }, [conversationQuery])

  const prefetchMessages = useCallback(async () => {
    if (!conversationId) return
    await queryClient.prefetchQuery({
      queryKey: ['messages', conversationId],
      queryFn: async () => {
        return client.getConversationMessages({
          conversationId,
          limit: 50,
        })
      },
    })
  }, [conversationId, queryClient])

  return {
    conversation,
    unreadCount,
    isLoading: conversationQuery.isLoading,
    isFetching: conversationQuery.isFetching,
    refetch,
    prefetchMessages,
  }
}

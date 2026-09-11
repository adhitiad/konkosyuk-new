'use client'

import { useCallback, useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'

import { useChat } from '#/hooks/useChat'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Skeleton } from '#/components/ui/skeleton'
import {
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '#/components/ui/message-scroller'
import { MessageBubble } from '#/components/chat/MessageBubble'
import { TypingIndicator } from '#/components/chat/TypingIndicator'
import { ChatInput } from '#/components/chat/ChatInput'

type Attachment = {
  url: string
  type: string
  filename: string
  size: number
}

type ChatWindowProps = {
  conversationId: string
  onBack?: () => void
}

function formatRelativeTime(date: Date): string {
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

  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const { data: session } = authClient.useSession()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const userId = session?.user?.id ?? null

  const {
    conversations,
    messages,
    presence,
    isConnected,
    sendMessageAsync,
    markAsReadAsync,
    uploadAttachmentAsync,
    isSending,
    isUploading,
    isLoading,
    typingUsers,
    currentUserId,
  } = useChat({ conversationId, userId })

  const conversation = conversations.find((c) => c.id === conversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const otherPresence = conversation
    ? presence.find((p) => p.userId === conversation.otherParticipant.id)
    : undefined

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (conversationId) {
      markAsReadAsync({ conversationId })
    }
  }, [conversationId])

  const handleSend = useCallback(
    async (input: { text: string; attachments: Attachment[] }) => {
      await sendMessageAsync({
        conversationId,
        content: input.text,
        attachments:
          input.attachments.length > 0 ? input.attachments : undefined,
      })
    },
    [conversationId, sendMessageAsync],
  )

  if (!conversation && !isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Pilih percakapan untuk mulai chat
        </p>
      </div>
    )
  }

  const otherParticipantName =
    conversation?.otherParticipant.name ?? 'Percakapan'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--line)] p-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="h-8 w-8 md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Avatar size="default" className="h-10 w-10">
          <AvatarImage
            src={conversation?.otherParticipant.image ?? undefined}
          />
          <AvatarFallback>
            {otherParticipantName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--sea-ink)]">
            {otherParticipantName}
          </h3>
          <p className="text-xs text-[var(--sea-ink-soft)]">
            {otherPresence?.isOnline
              ? 'Online'
              : `Terakhir dilihat ${formatRelativeTime(otherPresence?.lastSeenAt ?? new Date())}`}
          </p>
        </div>
        {!isConnected && <span className="text-xs text-red-500">Terputus</span>}
      </div>

      <div className="flex-1 overflow-hidden">
        {isLoading && messages.length === 0 ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent>
                {messages.map((msg, index) => (
                  <MessageScrollerItem
                    key={msg.id}
                    scrollAnchor={index === messages.length - 1}
                  >
                    <MessageBubble
                      message={msg}
                      isOwnMessage={msg.senderId === currentUserId}
                    />
                  </MessageScrollerItem>
                ))}
                {typingUsers.length > 0 && (
                  <TypingIndicator
                    isTyping
                    userName={typingUsers[0].name || otherParticipantName}
                  />
                )}
                <div ref={messagesEndRef} />
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton direction="end" />
          </MessageScroller>
        )}
      </div>

      <div className="border-t border-[var(--line)] p-4">
        <ChatInput
          onSend={handleSend}
          uploadFile={uploadAttachmentAsync}
          disabled={isSending || isUploading}
          placeholder="Tulis pesan..."
          maxLength={2000}
        />
      </div>
    </div>
  )
}

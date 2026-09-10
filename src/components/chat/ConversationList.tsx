import { useMemo } from 'react'
import { format } from 'date-fns'

import { useChat } from '#/hooks/useChat'
import { cn } from '#/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'

type Conversation = {
  id: string
  otherParticipant: {
    id: string
    name: string
    image: string | null
  }
  lastMessage: {
    content: string | null
    createdAt: Date
  } | null
  unreadCount: number
  createdAt: Date
}

type ConversationListProps = {
  selectedId?: string | null
  onSelect: (id: string) => void
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

  return format(date, 'dd MMM yyyy')
}

export function ConversationList({
  selectedId,
  onSelect,
}: ConversationListProps) {
  const { conversations, isLoading, presence } = useChat({})

  const getPresenceForUser = useMemo(
    () => (userId: string) => presence.find((p) => p.userId === userId),
    [presence],
  )

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Belum ada percakapan.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conv: Conversation) => {
        const otherPresence = getPresenceForUser(conv.otherParticipant.id)
        const lastMessagePreview = useMemo(() => {
          if (!conv.lastMessage) return ''
          if (conv.lastMessage.content) {
            return conv.lastMessage.content.length > 30
              ? conv.lastMessage.content.slice(0, 30) + '...'
              : conv.lastMessage.content
          }
          return '📎 Attachment'
        }, [conv.lastMessage])

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              'flex w-full flex-col gap-1 border-b border-[var(--line)] p-3 text-left transition-colors hover:bg-[var(--link-bg-hover)]',
              selectedId === conv.id ? 'bg-[var(--lagoon)]/10' : '',
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar size="sm" className="h-10 w-10">
                    <AvatarImage
                      src={conv.otherParticipant.image ?? undefined}
                    />
                    <AvatarFallback>
                      {conv.otherParticipant.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {otherPresence?.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--sea-ink)]">
                  {conv.otherParticipant.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--sea-ink-soft)]">
                  {formatRelativeTime(
                    new Date(conv.lastMessage?.createdAt ?? conv.createdAt),
                  )}
                </span>
                {conv.unreadCount > 0 && (
                  <Badge variant="default" className="h-4 min-w-4 px-1 text-xs">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
            {lastMessagePreview && (
              <p className="truncate pl-12 text-xs text-[var(--sea-ink-soft)]">
                {lastMessagePreview}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}

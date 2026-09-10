import { useEffect, useRef, useState } from 'react'
import { X, Send } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '#/lib/auth-client'
import { orpc } from '#/orpc/client'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'

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
    sender: {
      id: string
      name: string
    }
  } | null
  unreadCount: number
}

type Message = {
  id: string
  content: string | null
  isRead: boolean
  createdAt: Date
  sender: {
    id: string
    name: string
    image: string | null
  }
}

type ChatDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedConversationId?: string | null
}

export function ChatDialog({
  open,
  onOpenChange,
  preselectedConversationId,
}: ChatDialogProps) {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(preselectedConversationId ?? null)
  const [messageContent, setMessageContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  if (!session?.user) {
    return null
  }

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      return orpc.getConversations.call()
    },
    enabled: open && !!session.user,
  })

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId)
        return { messages: [], nextCursor: undefined }
      return orpc.getConversationMessages.call({
        conversationId: selectedConversationId,
        limit: 50,
      })
    },
    enabled: open && !!selectedConversationId,
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (input: { conversationId: string; content: string }) => {
      return orpc.sendMessage.call(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages', selectedConversationId],
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setMessageContent('')
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return orpc.markMessagesAsRead.call({ conversationId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages', selectedConversationId],
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate(selectedConversationId)
    }
  }, [selectedConversationId])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messagesData?.messages])

  useEffect(() => {
    if (preselectedConversationId) {
      setSelectedConversationId(preselectedConversationId)
    }
  }, [preselectedConversationId])

  const handleSend = () => {
    if (!selectedConversationId || !messageContent.trim()) return
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: messageContent.trim(),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const selectedConversation = conversations?.find(
    (c: Conversation) => c.id === selectedConversationId,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[90vh] w-[95vw] max-w-4xl overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-2xl">
        <div className="flex w-full">
          <div className="flex h-full w-72 flex-col border-r border-[var(--line)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
              <h2 className="font-semibold text-[var(--sea-ink)]">Pesan</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversationsLoading && (
                <p className="p-4 text-sm text-[var(--sea-ink-soft)]">
                  Memuat percakapan...
                </p>
              )}

              {!conversationsLoading &&
                conversations?.map((conv: Conversation) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`flex w-full flex-col gap-1 border-b border-[var(--line)] p-3 text-left transition-colors hover:bg-[var(--link-bg-hover)] ${
                      selectedConversationId === conv.id
                        ? 'bg-[var(--lagoon)]/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--sea-ink)]">
                        {conv.otherParticipant.name}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--lagoon-deep)] px-1 text-xs text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="truncate text-xs text-[var(--sea-ink-soft)]">
                        {conv.lastMessage.sender.id === session.user.id
                          ? 'Anda: '
                          : ''}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </button>
                ))}

              {!conversationsLoading && conversations?.length === 0 && (
                <p className="p-4 text-sm text-[var(--sea-ink-soft)]">
                  Belum ada percakapan.
                </p>
              )}
            </div>
          </div>

          <div className="flex h-full flex-1 flex-col">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
                  <div>
                    <h3 className="font-semibold text-[var(--sea-ink)]">
                      {selectedConversation.otherParticipant.name}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {messagesLoading && (
                    <p className="text-sm text-[var(--sea-ink-soft)]">
                      Memuat pesan...
                    </p>
                  )}

                  {!messagesLoading &&
                    (messagesData?.messages ?? []).map((msg: Message) => (
                      <div
                        key={msg.id}
                        className={`mb-3 flex ${
                          msg.sender.id === session.user.id
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.sender.id === session.user.id
                              ? 'bg-[var(--lagoon-deep)] text-white'
                              : 'bg-neutral-100 text-[var(--sea-ink)]'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span className="mt-1 block text-xs opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString(
                              'id-ID',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex items-end gap-2 border-t border-[var(--line)] p-4">
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tulis pesan..."
                    className="min-h-[40px] max-h-[120px] resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={
                      !messageContent.trim() || sendMessageMutation.isPending
                    }
                    size="icon"
                    className="h-10 w-10 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  Pilih percakapan untuk mulai chat
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

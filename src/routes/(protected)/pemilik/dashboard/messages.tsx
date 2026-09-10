import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'

import { orpc } from '#/orpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/(protected)/pemilik/dashboard/messages')(
  {
    component: PemilikMessagesPage,
  },
)

function PemilikMessagesPage() {
  const { data: conversations, isLoading } = useQuery(
    orpc.getConversations.queryOptions(),
  )

  if (isLoading) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">Memuat pesan...</p>
      </main>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <main className="page-wrap py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-[var(--sea-ink-soft)]" />
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Belum ada percakapan. Percakapan akan muncul ketika ada penyewa
              yang menghubungi Anda.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="page-wrap py-8">
      <div className="mb-6">
        <p className="island-kicker mb-2">Pesan</p>
        <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
          Semua Percakapan
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {conversations.map((conversation) => (
          <Card key={conversation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {conversation.otherParticipant.name}
                </CardTitle>
                {conversation.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {conversation.lastMessage ? (
                <div className="space-y-1">
                  <p className="text-sm text-[var(--sea-ink-soft)]">
                    {conversation.lastMessage.content}
                  </p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">
                    {new Date(
                      conversation.lastMessage.createdAt,
                    ).toLocaleString('id-ID')}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  Belum ada pesan
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}

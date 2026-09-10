import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { ChatWindow } from '#/components/chat/ChatWindow'
import { ConversationList } from '#/components/chat/ConversationList'

export const Route = createFileRoute('/(protected)/pemilik/dashboard/messages')(
  {
    component: PemilikMessagesPage,
  },
)

function PemilikMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)

  return (
    <main className="page-wrap py-8">
      <div className="mb-6">
        <p className="island-kicker mb-2">Pesan</p>
        <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
          Semua Percakapan
        </h1>
      </div>

      <div className="flex h-[75vh] overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm">
        <div className="hidden w-72 border-r border-[var(--line)] md:block">
          <ConversationList
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>

        <div className="flex w-full flex-col md:w-auto md:flex-1">
          {selectedConversationId ? (
            <ChatWindow
              conversationId={selectedConversationId}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Pilih percakapan untuk mulai chat
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

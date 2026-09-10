import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'

import { ChatWindow } from '#/components/chat/ChatWindow'
import { ConversationList } from '#/components/chat/ConversationList'

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
  const { data: session } = authClient.useSession()
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(preselectedConversationId ?? null)

  if (!session?.user) {
    return null
  }

  useEffect(() => {
    if (preselectedConversationId) {
      setSelectedConversationId(preselectedConversationId)
    }
  }, [preselectedConversationId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[90vh] w-[95vw] max-w-4xl overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-2xl">
        <div className="hidden w-72 flex-col border-r border-[var(--line)] md:flex">
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
          <ConversationList
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>

        <div className="flex h-full flex-1 flex-col">
          {selectedConversationId ? (
            <ChatWindow
              conversationId={selectedConversationId}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-[var(--line)] p-4 md:hidden">
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
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  Pilih percakapan untuk mulai chat
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '#/lib/auth-client'
import { orpc } from '#/orpc/client'
import { Button } from '#/components/ui/button'
import { ChatDialog } from '#/components/chat/ChatDialog'

export function ChatButton() {
  const { data: session } = authClient.useSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) {
    return null
  }

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread', session.user.id],
    queryFn: async () => {
      return orpc.getUnreadNotifications.call({ limit: 1 })
    },
    enabled: !!session.user.id,
  })

  const unreadCount = unreadData?.length ?? 0

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        aria-label="Buka chat"
      >
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

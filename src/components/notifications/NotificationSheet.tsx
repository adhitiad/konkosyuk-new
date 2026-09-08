import { Bell, Check, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { authClient } from '#/lib/auth-client'
import { orpc } from '#/orpc/client'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '#/components/ui/sheet'

const TYPE_LABELS: Record<string, string> = {
  BOOKING_APPROVED: 'Booking Disetujui',
  BOOKING_REJECTED: 'Booking Ditolak',
  PAYMENT_SUCCESS: 'Pembayaran Berhasil',
  NEW_MESSAGE: 'Pesan Baru',
  booking: 'Booking',
  payment: 'Pembayaran',
  maintenance: 'Maintenance',
  message: 'Pesan',
  review: 'Review',
  referral: 'Referral',
  system: 'Sistem',
  promotion: 'Promosi',
  security: 'Keamanan',
  reminder: 'Pengingat',
}

export default function NotificationSheet() {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  if (!session?.user) {
    return null
  }

  const userId = session.user.id

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery(
    {
      queryKey: ['notifications', 'list', userId],
      queryFn: async () => {
        if (!userId) throw new Error('Unauthenticated')
        const result = await orpc.getNotifications.call({
          limit: 50,
          offset: 0,
        })
        return result
      },
      enabled: !!userId && open,
    },
  )

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Unauthenticated')
      const result = await orpc.getUnreadNotifications.call({
        limit: 1,
      })
      return result
    },
    enabled: !!userId,
  })

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await orpc.markNotificationRead.call({
        notification_id: notificationId,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return await orpc.markAllNotificationsRead.call({})
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })
    },
  })

  const notifications = notificationsData?.notifications ?? []
  const unreadCount = unreadData?.length ?? 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        aria-label="Notifikasi"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <SheetTitle>Notifikasi</SheetTitle>
            <SheetDescription>
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca`
                : 'Semua notifikasi sudah dibaca'}
            </SheetDescription>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tandai semua dibaca
            </Button>
          )}
        </SheetHeader>

        <div className="mt-4 flex flex-1 flex-col gap-2 overflow-y-auto">
          {notificationsLoading && (
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Memuat notifikasi...
            </p>
          )}

          {!notificationsLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Bell className="h-8 w-8 text-neutral-300" />
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Belum ada notifikasi.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`flex flex-col gap-1 rounded-xl border border-transparent p-3 text-left transition hover:border-[var(--line)] hover:bg-[var(--link-bg-hover)] ${notification.is_read ? 'opacity-75' : 'bg-[var(--chip-bg)]'}`}
                onClick={() => {
                  if (!notification.is_read) {
                    markReadMutation.mutate(notification.id)
                  }
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--sea-ink)]">
                      {TYPE_LABELS[notification.type] ?? notification.type}
                    </span>
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-[var(--lagoon)]" />
                    )}
                  </div>
                  <span className="text-xs text-[var(--sea-ink-soft)]">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--sea-ink)]">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="text-xs text-[var(--sea-ink-soft)]">
                    {notification.message}
                  </p>
                )}
                {!notification.is_read && (
                  <div className="flex items-center gap-1 text-xs text-[var(--lagoon-deep)]">
                    <Check className="h-3 w-3" />
                    <span>Klik untuk menandai dibaca</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

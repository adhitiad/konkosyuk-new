import { Heart } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { orpc } from '#/orpc/client'

interface WishlistButtonProps {
  propertyId: string
}

export function WishlistButton({ propertyId }: WishlistButtonProps) {
  const { data: session } = authClient.useSession()
  const qc = useQueryClient()
  const [pending, setPending] = useState(false)

  const { data: status } = useQuery({
    queryKey: ['wishlist-status', propertyId],
    queryFn: async () => {
      const result = await orpc.checkWishlistStatus.call({ propertyId })
      return result
    },
    enabled: !!session?.user.id,
  })

  const inWishlist = !!status?.inWishlist

  const addMutation = useMutation({
    mutationFn: async () => {
      return await orpc.addToWishlist.call({ propertyId })
    },
    onSuccess: () => {
      void qc.invalidateQueries()
    },
  })

  const removeMutation = useMutation({
    mutationFn: async () => {
      return await orpc.removeFromWishlist.call({ propertyId })
    },
    onSuccess: () => {
      void qc.invalidateQueries()
    },
  })

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()

    if (!session?.user) {
      return
    }

    setPending(true)
    try {
      if (inWishlist) {
        await removeMutation.mutateAsync()
      } else {
        await addMutation.mutateAsync()
      }
    } finally {
      setPending(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-3 top-3 z-10 rounded-full bg-white/90 text-[var(--sea-ink)] backdrop-blur-sm hover:bg-white hover:text-[var(--lagoon-deep)]"
      onClick={toggle}
      disabled={pending || addMutation.isPending || removeMutation.isPending}
      aria-label={inWishlist ? 'Hapus dari favorit' : 'Tambah ke favorit'}
    >
      <Heart
        className="h-4 w-4"
        fill={inWishlist ? 'currentColor' : 'none'}
        strokeWidth={inWishlist ? 0 : 2}
      />
    </Button>
  )
}

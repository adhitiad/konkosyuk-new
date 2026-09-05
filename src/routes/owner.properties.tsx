import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Edit, Trash2, Home, LogIn } from 'lucide-react'

import { authClient } from '#/lib/auth-client'
import { orpc } from '#/orpc/client'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

export const Route = createFileRoute('/owner/properties')({
  component: OwnerProperties,
})

function OwnerProperties() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">Memuat...</p>
      </main>
    )
  }

  if (!session?.user) {
    return (
      <main className="page-wrap flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Akses Dibatasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Kamu perlu masuk sebagai pemilik properti untuk mengelola
              properti.
            </p>
          </CardContent>
          <CardContent className="flex justify-end">
            <Button asChild>
              <a href="/sign-in">
                <LogIn className="h-4 w-4" />
                Masuk
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (session.user.role !== 'owner' && session.user.role !== 'admin') {
    return (
      <main className="page-wrap py-8">
        <Card>
          <CardHeader>
            <CardTitle>Akses Dibatasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Hanya pemilik properti yang dapat mengakses halaman ini.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="page-wrap py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="island-kicker mb-2">Dashboard Owner</p>
          <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
            Properti Saya
          </h1>
        </div>
        <Button asChild>
          <a href="/owner/properties/new">
            <Plus className="h-4 w-4" />
            Tambah Properti
          </a>
        </Button>
      </div>

      <PropertiesList userId={session.user.id} />
    </main>
  )
}

function PropertiesList({ userId }: { userId: string }) {
  const { data: properties, isLoading } = useQuery(
    orpc.listProperties.queryOptions({ input: { owner_id: userId } }),
  )

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--sea-ink-soft)]">Memuat properti...</p>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Home className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Kamu belum memiliki properti. Klik tombol di atas untuk menambahkan.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {properties.map((p) => (
        <OwnerPropertyCard key={p.id} property={p} />
      ))}
    </div>
  )
}

type Property = {
  id: string
  name: string
  address: string
  city?: string | null
  type: string
  is_active?: boolean | null
  is_featured?: boolean | null
  units?: unknown[]
}

function OwnerPropertyCard({ property }: { property: Property }) {
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (input: { id: string }) => {
      return await orpc.deleteProperty.call(input)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      setShowDeleteDialog(false)
    },
  })

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{property.name}</CardTitle>
            <div className="flex gap-2">
              {property.is_featured && (
                <Badge variant="secondary">Unggulan</Badge>
              )}
              <Badge variant={property.is_active ? 'default' : 'secondary'}>
                {property.is_active ? 'Aktif' : 'Non-aktif'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            {property.address}, {property.city}
          </p>
          <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
            Tipe: {property.type}
          </p>
          {property.units && (
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              {property.units.length} unit
            </p>
          )}
        </CardContent>
        <CardContent className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <a href={`/owner/properties/${property.id}`}>
              <Edit className="h-3.5 w-3.5" />
              Edit
            </a>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Properti</DialogTitle>
            <DialogDescription>
              Apakah kamu yakin ingin menghapus "{property.name}"? Tindakan ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate({ id: property.id })}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

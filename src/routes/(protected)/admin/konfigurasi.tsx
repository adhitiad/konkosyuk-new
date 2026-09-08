import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { orpc } from '#/orpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute('/(protected)/admin/konfigurasi')({
  component: AdminKonfigurasi,
})

function AdminKonfigurasi() {
  const queryClient = useQueryClient()
  const { data: config, isLoading } = useQuery(
    orpc.getKonfigurasiPlatform.queryOptions(),
  )

  const [platformFee, setPlatformFee] = useState('')
  const [featuredPrice, setFeaturedPrice] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (config) {
      setPlatformFee(String(config.platform_fee_percent))
      setFeaturedPrice(String(config.featured_listing_price))
    }
  }, [config])

  const updateMutation = useMutation({
    mutationFn: async (input: {
      platform_fee_percent: number
      featured_listing_price: number
    }) => {
      return await orpc.updateKonfigurasiPlatform.call(input)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['getKonfigurasiPlatform'],
      })
      setMessageType('success')
      setMessage('Konfigurasi berhasil disimpan')
      setTimeout(() => setMessage(''), 3000)
    },
    onError: () => {
      setMessageType('error')
      setMessage('Gagal menyimpan konfigurasi')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--sea-ink-soft)]">
        Memuat konfigurasi...
      </p>
    )
  }

  if (!config) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fee = parseFloat(platformFee)
    const price = parseFloat(featuredPrice)
    if (isNaN(fee) || isNaN(price)) return
    updateMutation.mutate({
      platform_fee_percent: fee,
      featured_listing_price: price,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Konfigurasi Platform</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform_fee_percent">Biaya Platform (%)</Label>
            <Input
              id="platform_fee_percent"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={platformFee}
              onChange={(e) => setPlatformFee(e.target.value)}
              placeholder={String(config.platform_fee_percent)}
            />
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Persentase biaya platform dari setiap transaksi.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featured_listing_price">
              Harga Listing Unggulan (Rp)
            </Label>
            <Input
              id="featured_listing_price"
              type="number"
              min="0"
              value={featuredPrice}
              onChange={(e) => setFeaturedPrice(e.target.value)}
              placeholder={String(config.featured_listing_price)}
            />
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Harga untuk menampilkan properti di daftar unggulan.
            </p>
          </div>

          {message && (
            <p
              className={`text-sm ${
                messageType === 'error'
                  ? 'text-red-600'
                  : 'text-[var(--lagoon-deep)]'
              }`}
            >
              {message}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

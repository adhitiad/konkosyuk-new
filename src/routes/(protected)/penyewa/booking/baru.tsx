import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronLeft, User, Hash, LogIn } from 'lucide-react'
import { format, addDays } from 'date-fns'

import { authClient } from '#/lib/auth-client'
import { orpc } from '#/orpc/client'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'

export const Route = createFileRoute('/(protected)/penyewa/booking/baru')({
  component: BookingFormPage,
  validateSearch: (search: Record<string, unknown>) => ({
    property_id: (search.property_id ?? '') as string,
    unit_id: (search.unit_id ?? '') as string,
  }),
})

function BookingFormPage() {
  const { data: session, isPending } = authClient.useSession()
  const { property_id, unit_id } = Route.useSearch()
  const redirect = `/penyewa/booking/baru?property_id=${encodeURIComponent(
    property_id,
  )}&unit_id=${encodeURIComponent(unit_id)}`

  if (isPending) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">Memuat sesi...</p>
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
              Kamu perlu masuk terlebih dahulu untuk mengajukan pemesanan.
            </p>
          </CardContent>
          <CardContent className="flex justify-end">
            <Button asChild>
              <Link to="/sign-in" search={{ redirect }}>
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return <BookingFormContent />
}

function BookingFormContent() {
  const { property_id, unit_id } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [jumlahPenghuni, setJumlahPenghuni] = useState('1')
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState<string | null>(null)

  const {
    data: property,
    isLoading,
    error: loadError,
  } = useQuery(
    orpc.getPropertyWithRelations.queryOptions({
      input: { id: property_id },
      enabled: !!property_id,
    }),
  )

  const unit = property?.unit_propertis.find((u) => u.id === unit_id)

  const minEndDate = tanggalMulai
    ? format(addDays(new Date(tanggalMulai), 30), 'yyyy-MM-dd')
    : undefined

  const createMutation = useMutation({
    mutationFn: async (input: {
      unit_properti_id: string
      tanggal_mulai: Date
      tanggal_selesai?: Date
      jumlah_penghuni: number
      catatan?: string
    }) => {
      return await orpc.ajukanPemesanan.call(input)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.listPemesananSaya.queryKey(),
      })
      void navigate({ to: '/penyewa/booking' })
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!unit) {
      setError('Unit properti tidak ditemukan')
      return
    }

    if (unit.status_ketersediaan !== 'TERSEDIA') {
      setError('Unit ini tidak tersedia')
      return
    }

    if (!tanggalMulai) {
      setError('Tanggal mulai diperlukan')
      return
    }

    if (!tanggalSelesai) {
      setError('Tanggal selesai diperlukan')
      return
    }

    const start = new Date(tanggalMulai)
    const end = new Date(tanggalSelesai)

    if (end <= start) {
      setError('Tanggal selesai harus setelah tanggal mulai')
      return
    }

    const diffDay = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    if (diffDay < 30) {
      setError('Durasi minimal pemesanan adalah 1 bulan (30 hari)')
      return
    }

    const penghuni = parseInt(jumlahPenghuni, 10)
    if (penghuni < 1) {
      setError('Minimal 1 penghuni')
      return
    }

    if (penghuni > unit.kapasitas) {
      setError(
        `Kapasitas unit adalah ${unit.kapasitas} orang. Kurangi jumlah penghuni.`,
      )
      return
    }

    try {
      await createMutation.mutateAsync({
        unit_properti_id: unit.id,
        tanggal_mulai: start,
        tanggal_selesai: end,
        jumlah_penghuni: penghuni,
        catatan: catatan || undefined,
      })
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    }
  }

  if (isLoading || loadError) {
    return (
      <main className="page-wrap py-8">
        <Link
          to="/properti/$propertyId"
          params={{ propertyId: property_id }}
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Link>
        {loadError && (
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Gagal memuat properti. Silakan coba lagi nanti.
          </p>
        )}
      </main>
    )
  }

  if (!property || !unit) {
    return (
      <main className="page-wrap py-8">
        <Link
          to="/penyewa/booking"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Link>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Properti atau unit tidak ditemukan.
        </p>
      </main>
    )
  }

  return (
    <main className="page-wrap py-8">
      <Link
        to="/properti/$propertyId"
        params={{ propertyId: property.id }}
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Detail Properti
      </Link>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <p className="island-kicker mb-2">Pemesanan Kos</p>
          <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
            Ajukan Pemesanan
          </h1>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            Isi formulir di bawah untuk mengajukan pemesanan unit{' '}
            {unit.nama_unit} di {property.nama_properti}.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Ringkasan Unit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
              <Hash className="h-4 w-4" />
              <span>Nama Unit: {unit.nama_unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--sea-ink-soft)]">
                Harga per bulan
              </span>
              <span className="font-semibold text-[var(--lagoon-deep)]">
                Rp{Number(unit.harga_bulanan).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[var(--sea-ink-soft)]">
              <User className="h-4 w-4" />
              <span>Kapasitas maksimal: {unit.kapasitas} orang</span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tanggal & Durasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tanggal-mulai">Tanggal Mulai</Label>
                <Input
                  id="tanggal-mulai"
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => {
                    setTanggalMulai(e.target.value)
                    if (tanggalSelesai && e.target.value >= tanggalSelesai) {
                      setTanggalSelesai('')
                    }
                  }}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
                <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                  Durasi minimal 1 bulan (30 hari).
                </p>
              </div>

              <div>
                <Label htmlFor="tanggal-selesai">Tanggal Selesai</Label>
                <Input
                  id="tanggal-selesai"
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  min={minEndDate}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Penghuni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jumlah-penghuni">Jumlah Penghuni</Label>
                <Input
                  id="jumlah-penghuni"
                  type="number"
                  min={1}
                  max={unit.kapasitas}
                  value={jumlahPenghuni}
                  onChange={(e) => setJumlahPenghuni(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                  Kapasitas unit: {unit.kapasitas} orang.
                </p>
              </div>

              <div>
                <Label htmlFor="catatan">Catatan (opsional)</Label>
                <Textarea
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Misal: butuh listrik, ingin lantai 2, dll."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={
              createMutation.isPending ||
              !tanggalMulai ||
              !tanggalSelesai ||
              !jumlahPenghuni
            }
          >
            {createMutation.isPending ? 'Mengajukan...' : 'Ajukan Pemesanan'}
          </Button>
        </form>
      </div>
    </main>
  )
}

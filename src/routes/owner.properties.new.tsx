import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'

import '#/polyfill'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Label } from '#/components/ui/label'

import {
  simpanInfoDasarProperti,
  simpanUnitProperti,
  simpanFasilitasDanFoto,
  publikasikanProperti,
} from '#/server/property'

import type {
  SavedWizardStep1Result,
  SavedWizardStep2Result,
  SavedWizardStep3Result,
} from '#/types/property'
import type {
  Step1InfoDasarInput,
  Step2UnitInput,
  Step3FasilitasFotoInput,
} from '#/lib/validators/property'

type Step1Input = Step1InfoDasarInput
type Step2Input = Step2UnitInput
type Step3Input = Step3FasilitasFotoInput

export const Route = createFileRoute('/owner/properties/new')({
  component: WizardPropertiBaru,
})

function WizardPropertiBaru() {
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  const step1Mutation = useMutation({
    mutationFn: async (input: Step1Input): Promise<SavedWizardStep1Result> => {
      return await simpanInfoDasarProperti({ data: input })
    },
    onSuccess: (result) => {
      setPropertyId(result.property_id)
      setStep(2)
    },
  })

  const step2Mutation = useMutation({
    mutationFn: async (input: Step2Input): Promise<SavedWizardStep2Result> => {
      if (!propertyId) throw new Error('ID properti diperlukan')
      return await simpanUnitProperti({
        data: { property_id: propertyId, data: input },
      })
    },
    onSuccess: () => {
      setStep(3)
    },
  })

  const step3Mutation = useMutation({
    mutationFn: async (input: Step3Input): Promise<SavedWizardStep3Result> => {
      if (!propertyId) throw new Error('ID properti diperlukan')
      return await simpanFasilitasDanFoto({
        data: { property_id: propertyId, data: input },
      })
    },
    onSuccess: () => {
      setStep(4)
    },
  })

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!propertyId) throw new Error('ID properti diperlukan')
      return await publikasikanProperti({ data: { property_id: propertyId } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void navigate({ to: '/owner/properties' })
    },
  })

  if (isPending) {
    return (
      <main className="page-wrap py-8">
        <p className="text-sm text-[var(--sea-ink-soft)]">Memuat sesi...</p>
      </main>
    )
  }

  if (!session?.user) {
    return (
      <main className="page-wrap py-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Akses Dibatasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Kamu perlu masuk sebagai pemilik properti untuk menambahkan
              properti.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
    return (
      <main className="page-wrap py-8">
        <Card>
          <CardHeader>
            <CardTitle>Akses Dibatasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Hanya pemilik properti yang dapat menambahkan properti baru.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="page-wrap py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="island-kicker mb-2">Dashboard Owner</p>
          <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
            Tambah Properti Baru
          </h1>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            Langkah {step} dari 4
          </p>
        </div>

        <div className="mb-6 flex items-center gap-2">
          {Array.from({ length: 4 }, (_, i) => {
            const idx = i + 1
            const active = idx === step
            return (
              <div
                key={idx}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                  active
                    ? 'bg-[var(--sea-blue)] text-white'
                    : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                {idx}
              </div>
            )
          })}
        </div>

        {step === 1 && (
          <Step1Form
            onSubmit={async (data) => {
              await step1Mutation.mutateAsync(data)
            }}
            isLoading={step1Mutation.isPending}
            error={step1Mutation.error?.message}
          />
        )}

        {step === 2 && propertyId && (
          <Step2Form
            propertyId={propertyId}
            onSave={async (data) => {
              await step2Mutation.mutateAsync(data)
            }}
            isLoading={step2Mutation.isPending}
            error={step2Mutation.error?.message}
          />
        )}

        {step === 3 && propertyId && (
          <Step3Form
            propertyId={propertyId}
            onSave={async (data) => {
              await step3Mutation.mutateAsync(data)
            }}
            isLoading={step3Mutation.isPending}
            error={step3Mutation.error?.message}
          />
        )}

        {step === 4 && propertyId && (
          <Step4Publish
            propertyId={propertyId}
            onPublish={async () => {
              await publishMutation.mutateAsync()
            }}
            isLoading={publishMutation.isPending}
            error={publishMutation.error?.message}
          />
        )}
      </div>
    </main>
  )
}

interface Step1FormProps {
  onSubmit: (data: Step1Input) => Promise<void>
  isLoading: boolean
  error?: string
}

function Step1Form({ onSubmit, isLoading, error }: Step1FormProps) {
  const [namaProperti, setNamaProperti] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [alamatLengkap, setAlamatLengkap] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [tipeProperti, setTipeProperti] = useState<'KOST' | 'KONTRAKAN'>('KOST')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      nama_properti: namaProperti,
      deskripsi: deskripsi || undefined,
      alamat_lengkap: alamatLengkap,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      tipe_properti: tipeProperti,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Dasar Properti</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nama-properti">Nama Properti</Label>
            <Input
              id="nama-properti"
              value={namaProperti}
              onChange={(e) => setNamaProperti(e.target.value)}
              placeholder="Misal: Kost Putri Cantik"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsikan properti ini..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="alamat">Alamat Lengkap</Label>
            <Input
              id="alamat"
              value={alamatLengkap}
              onChange={(e) => setAlamatLengkap(e.target.value)}
              placeholder="Jl. Contoh No. 123, Kota Jakarta"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="-6.200000"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="106.816111"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tipe-properti">Tipe Properti</Label>
            <Select
              value={tipeProperti}
              onValueChange={(v) => setTipeProperti(v as 'KOST' | 'KONTRAKAN')}
              disabled={isLoading}
            >
              <SelectTrigger id="tipe-properti">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KOST">Kost</SelectItem>
                <SelectItem value="KONTRAKAN">Kontrakan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Lanjutkan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface Step2FormProps {
  propertyId: string
  onSave: (data: Step2Input) => Promise<void>
  isLoading: boolean
  error?: string
}

interface UnitFormState {
  nama_unit: string
  luas_meter: string
  harga_bulanan: string
  kapasitas: number
  status_ketersediaan: 'TERSEDIA' | 'TERISI' | 'DIPESAN'
}

function Step2Form({ onSave, isLoading, error }: Step2FormProps) {
  const [units, setUnits] = useState<UnitFormState[]>([
    {
      nama_unit: '',
      luas_meter: '',
      harga_bulanan: '',
      kapasitas: 1,
      status_ketersediaan: 'TERSEDIA',
    },
  ])

  const addUnit = () => {
    setUnits([
      ...units,
      {
        nama_unit: '',
        luas_meter: '',
        harga_bulanan: '',
        kapasitas: 1,
        status_ketersediaan: 'TERSEDIA',
      },
    ])
  }

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index))
  }

  const updateUnit = (index: number, field: string, value: unknown) => {
    const newUnits = [...units]
    newUnits[index] = { ...newUnits[index], [field]: value }
    setUnits(newUnits)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const convertedUnits = units.map((u) => ({
      nama_unit: u.nama_unit,
      luas_meter: parseFloat(u.luas_meter) || 0,
      harga_bulanan: parseFloat(u.harga_bulanan) || 0,
      kapasitas: u.kapasitas,
      status_ketersediaan: u.status_ketersediaan,
    }))
    await onSave({ units: convertedUnits })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Properti</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {units.map((unit, i) => (
            <div key={i} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Unit {i + 1}</h3>
                {units.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUnit(i)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label>Nama Unit</Label>
                <Input
                  value={unit.nama_unit}
                  onChange={(e) => updateUnit(i, 'nama_unit', e.target.value)}
                  placeholder="Misal: Kamar A, Kamar B"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Luas (m²)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={unit.luas_meter}
                    onChange={(e) =>
                      updateUnit(i, 'luas_meter', e.target.value)
                    }
                    placeholder="12.5"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label>Harga/Bulan (Rp)</Label>
                  <Input
                    type="number"
                    value={unit.harga_bulanan}
                    onChange={(e) =>
                      updateUnit(i, 'harga_bulanan', e.target.value)
                    }
                    placeholder="500000"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label>Kapasitas</Label>
                <Input
                  type="number"
                  min={1}
                  value={unit.kapasitas}
                  onChange={(e) =>
                    updateUnit(i, 'kapasitas', parseInt(e.target.value, 10))
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Status Ketersediaan</Label>
                <Select
                  value={unit.status_ketersediaan}
                  onValueChange={(v) => updateUnit(i, 'status_ketersediaan', v)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TERSEDIA">Tersedia</SelectItem>
                    <SelectItem value="TERISI">Terisi</SelectItem>
                    <SelectItem value="DIPESAN">Dipesan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={addUnit}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              Tambah Unit
            </Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Lanjutkan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface Step3FormProps {
  propertyId: string
  onSave: (data: Step3Input) => Promise<void>
  isLoading: boolean
  error?: string
}

function Step3Form({ onSave, isLoading, error }: Step3FormProps) {
  const [fasilitas, setFasilitas] = useState([{ nama_fasilitas: '', ikon: '' }])
  const [fotoProperti, setFotoProperti] = useState([
    { url_foto: '', urutan: 0, apakah_utama: true },
  ])

  const addFasilitas = () => {
    setFasilitas([...fasilitas, { nama_fasilitas: '', ikon: '' }])
  }

  const removeFasilitas = (index: number) => {
    setFasilitas(fasilitas.filter((_, i) => i !== index))
  }

  const updateFasilitas = (index: number, field: string, value: string) => {
    const newFasilitas = [...fasilitas]
    newFasilitas[index] = { ...newFasilitas[index], [field]: value }
    setFasilitas(newFasilitas)
  }

  const addFoto = () => {
    setFotoProperti([
      ...fotoProperti,
      { url_foto: '', urutan: fotoProperti.length, apakah_utama: false },
    ])
  }

  const removeFoto = (index: number) => {
    const newFotos = fotoProperti.filter((_, i) => i !== index)
    setFotoProperti(newFotos.map((f, i) => ({ ...f, urutan: i })))
  }

  const updateFoto = (index: number, value: string) => {
    const newFotos = [...fotoProperti]
    newFotos[index] = { ...newFotos[index], url_foto: value }
    setFotoProperti(newFotos)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const filteredFasilitas = fasilitas.filter((f) => f.nama_fasilitas.trim())
    const filteredFotos = fotoProperti.filter((f) => f.url_foto.trim())

    await onSave({
      fasilitas: filteredFasilitas.length > 0 ? filteredFasilitas : undefined,
      foto_properti: filteredFotos,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fasilitas & Foto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Fasilitas Properti</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFasilitas}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Tambah Fasilitas
              </Button>
            </div>

            {fasilitas.map((f, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={f.nama_fasilitas}
                  onChange={(e) =>
                    updateFasilitas(i, 'nama_fasilitas', e.target.value)
                  }
                  placeholder="Misal: WiFi, AC, Parkir"
                  disabled={isLoading}
                />
                <Input
                  value={f.ikon}
                  onChange={(e) => updateFasilitas(i, 'ikon', e.target.value)}
                  placeholder="Ikon (opsional)"
                  disabled={isLoading}
                />
                {fasilitas.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFasilitas(i)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Foto Properti</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFoto}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Tambah Foto
              </Button>
            </div>

            {fotoProperti.map((foto, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>URL Foto {i + 1}</Label>
                  <Input
                    value={foto.url_foto}
                    onChange={(e) => updateFoto(i, e.target.value)}
                    placeholder="https://..."
                    disabled={isLoading}
                  />
                </div>
                {fotoProperti.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFoto(i)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Lanjutkan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface Step4PublishProps {
  propertyId: string
  onPublish: () => Promise<void>
  isLoading: boolean
  error?: string
}

function Step4Publish({ onPublish, isLoading, error }: Step4PublishProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onPublish()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publikasi Properti</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Pastikan semua langkah di atas sudah diisi dengan benar. Setelah
            memublikasikan, properti akan tersedia untuk ditampilkan kepada
            penyewa.
          </p>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                'Memublikasikan...'
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Publikasikan Properti
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

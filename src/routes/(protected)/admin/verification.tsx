import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  FileText,
  Search,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  Wrench,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type InspectionStatus = 'PENDING' | 'DONE' | 'CANCELLED'
type MaintenanceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

interface KycRequest {
  id: string
  name: string
  email: string
  ktpNumber: string
  phone: string
  submittedAt: string
  status: KycStatus
  avatar: string
}

interface Inspection {
  id: string
  property: string
  unit: string
  inspector: string
  scheduledAt: string
  status: InspectionStatus
}

interface MaintenanceReport {
  id: string
  property: string
  unit: string
  reportedBy: string
  description: string
  reportedAt: string
  status: MaintenanceStatus
}

const MOCK_VERIFICATIONS: KycRequest[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    ktpNumber: '3201234567890123',
    phone: '0812-3456-7890',
    submittedAt: '2024-09-01',
    status: 'PENDING',
    avatar: 'BS',
  },
  {
    id: '2',
    name: 'Rina Kurnia',
    email: 'rina.kurnia@example.com',
    ktpNumber: '3201234567890456',
    phone: '0813-2222-3344',
    submittedAt: '2024-08-28',
    status: 'REJECTED',
    avatar: 'RK',
  },
  {
    id: '3',
    name: 'Agus Salim',
    email: 'agus.salim@example.com',
    ktpNumber: '3201234567890789',
    phone: '0857-8899-0011',
    submittedAt: '2024-08-25',
    status: 'APPROVED',
    avatar: 'AS',
  },
]

const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: '1',
    property: 'Kos Laguna Hijau',
    unit: 'Kamar A1',
    inspector: 'Sarah Wijaya',
    scheduledAt: '2024-09-06 10:00',
    status: 'PENDING',
  },
  {
    id: '2',
    property: 'Kos Marina Indah',
    unit: 'Kamar B2',
    inspector: 'Dedi Mulyana',
    scheduledAt: '2024-09-05 14:30',
    status: 'DONE',
  },
  {
    id: '3',
    property: 'Kos Bunga Cempaka',
    unit: 'Kamar C3',
    inspector: 'Agus Salim',
    scheduledAt: '2024-09-03 09:00',
    status: 'CANCELLED',
  },
]

const MOCK_MAINTENANCE: MaintenanceReport[] = [
  {
    id: '1',
    property: 'Kos Laguna Hijau',
    unit: 'Kamar A1',
    reportedBy: 'Budi Santoso',
    description: 'AC tidak dingin dan mengeluarkan bunyi berisik.',
    reportedAt: '2024-09-04',
    status: 'OPEN',
  },
  {
    id: '2',
    property: 'Kos Marina Indah',
    unit: 'Kamar B2',
    reportedBy: 'Dedi Mulyana',
    description: 'Kran kamar mandi bocor sejak pagi.',
    reportedAt: '2024-09-03',
    status: 'IN_PROGRESS',
  },
  {
    id: '3',
    property: 'Kos Bunga Cempaka',
    unit: 'Kamar C3',
    reportedBy: 'Agus Salim',
    description: 'Lampu teras kamar mati, sudah diganti.',
    reportedAt: '2024-09-01',
    status: 'RESOLVED',
  },
]

const KYC_COLORS: Record<KycStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const KYC_LABELS: Record<KycStatus, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
}

const KYC_ICONS = {
  PENDING: AlertCircle,
  APPROVED: Check,
  REJECTED: X,
}

const INSPECTION_COLORS: Record<InspectionStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  DONE: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const INSPECTION_LABELS: Record<InspectionStatus, string> = {
  PENDING: 'Menunggu',
  DONE: 'Selesai',
  CANCELLED: 'Dibatalkan',
}

const MAINTENANCE_COLORS: Record<MaintenanceStatus, string> = {
  OPEN: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-green-100 text-green-800',
}

const MAINTENANCE_LABELS: Record<MaintenanceStatus, string> = {
  OPEN: 'Terbuka',
  IN_PROGRESS: 'Sedang Ditangani',
  RESOLVED: 'Selesai',
}

export const Route = createFileRoute('/(protected)/admin/verification')({
  component: AdminVerification,
})

function AdminVerification() {
  const [search, setSearch] = useState('')
  const [verifications, setVerifications] =
    useState<KycRequest[]>(MOCK_VERIFICATIONS)
  const [selected, setSelected] = useState<KycRequest | null>(null)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const updateStatus = (id: string, status: KycStatus) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v)),
    )
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
  }

  const filteredVerifications = verifications.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredInspections = MOCK_INSPECTIONS.filter(
    (i) =>
      i.property.toLowerCase().includes(search.toLowerCase()) ||
      i.inspector.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredMaintenance = MOCK_MAINTENANCE.filter(
    (m) =>
      m.property.toLowerCase().includes(search.toLowerCase()) ||
      m.reportedBy.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Tabs defaultValue="verifications" className="space-y-4">
      <TabsList>
        <TabsTrigger value="verifications">Verifikasi KYC</TabsTrigger>
        <TabsTrigger value="inspections">Inspeksi Properti</TabsTrigger>
        <TabsTrigger value="maintenance">Laporan Perawatan</TabsTrigger>
        <TabsTrigger value="audit">Log Audit</TabsTrigger>
      </TabsList>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
            Verifikasi &amp; Audit
          </h2>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Tinjau verifikasi KYC, inspeksi properti, laporan perawatan, dan
            jejak audit platform.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--sea-ink-soft)]" />
          <Input
            type="search"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 sm:w-64"
          />
        </div>
      </div>

      <TabsContent value="verifications" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase text-[var(--sea-ink-soft)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Pengguna</th>
                    <th className="px-4 py-3 font-medium">No. KTP</th>
                    <th className="px-4 py-3 font-medium">Tanggal Kirim</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVerifications.map((req) => {
                    const Icon = KYC_ICONS[req.status]
                    return (
                      <tr key={req.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium">
                              {req.avatar}
                            </div>
                            <div>
                              <div className="font-medium text-[var(--sea-ink)]">
                                {req.name}
                              </div>
                              <div className="text-xs text-[var(--sea-ink-soft)]">
                                {req.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                          {req.ktpNumber}
                        </td>
                        <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                          {formatDate(req.submittedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={KYC_COLORS[req.status]}
                          >
                            <Icon className="mr-1 h-3 w-3" />
                            {KYC_LABELS[req.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {req.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-green-700"
                                  onClick={() =>
                                    updateStatus(req.id, 'APPROVED')
                                  }
                                >
                                  <Check className="mr-1 h-3 w-3" />
                                  Setujui
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-red-700"
                                  onClick={() =>
                                    updateStatus(req.id, 'REJECTED')
                                  }
                                >
                                  <X className="mr-1 h-3 w-3" />
                                  Tolak
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setSelected(req)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Detail
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="inspections" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase text-[var(--sea-ink-soft)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Properti / Unit</th>
                    <th className="px-4 py-3 font-medium">Inspektur</th>
                    <th className="px-4 py-3 font-medium">Jadwal</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInspections.map((ins) => (
                    <tr key={ins.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-[var(--sea-ink-soft)]" />
                          <div>
                            <div className="font-medium text-[var(--sea-ink)]">
                              {ins.property}
                            </div>
                            <div className="text-xs text-[var(--sea-ink-soft)]">
                              {ins.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                        {ins.inspector}
                      </td>
                      <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                        {ins.scheduledAt}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={INSPECTION_COLORS[ins.status]}
                        >
                          {INSPECTION_LABELS[ins.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="maintenance" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase text-[var(--sea-ink-soft)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Properti / Unit</th>
                    <th className="px-4 py-3 font-medium">Dilaporkan Oleh</th>
                    <th className="px-4 py-3 font-medium">Deskripsi</th>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMaintenance.map((rep) => (
                    <tr key={rep.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-3.5 w-3.5 text-[var(--sea-ink-soft)]" />
                          <div>
                            <div className="font-medium text-[var(--sea-ink)]">
                              {rep.property}
                            </div>
                            <div className="text-xs text-[var(--sea-ink-soft)]">
                              {rep.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                        {rep.reportedBy}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-[var(--sea-ink-soft)]">
                        {rep.description}
                      </td>
                      <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                        {formatDate(rep.reportedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={MAINTENANCE_COLORS[rep.status]}
                        >
                          {MAINTENANCE_LABELS[rep.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audit" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase text-[var(--sea-ink-soft)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Waktu</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                    <th className="px-4 py-3 font-medium">Dilakukan Oleh</th>
                    <th className="px-4 py-3 font-medium">Target</th>
                    <th className="px-4 py-3 font-medium">Alamat IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    {
                      id: '1',
                      action: 'Mengubah konfigurasi platform',
                      actor: 'Admin Konkosyuk',
                      target: 'Biaya platform 10%',
                      timestamp: '2024-09-05 14:32',
                      ip: '192.168.1.10',
                    },
                    {
                      id: '2',
                      action: 'Menolak booking',
                      actor: 'Dedi Mulyana',
                      target: 'Booking #BK-2045',
                      timestamp: '2024-09-05 09:15',
                      ip: '192.168.1.12',
                    },
                    {
                      id: '3',
                      action: 'Menyetujui verifikasi KYC',
                      actor: 'Sarah Wijaya',
                      target: 'Budi Santoso',
                      timestamp: '2024-09-04 18:45',
                      ip: '192.168.1.15',
                    },
                    {
                      id: '4',
                      action: 'Membuat pengguna baru',
                      actor: 'Admin Konkosyuk',
                      target: 'Dedi Mulyana',
                      timestamp: '2024-09-03 11:20',
                      ip: '192.168.1.10',
                    },
                  ].map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--sea-ink)]">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                        {log.actor}
                      </td>
                      <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                        {log.target}
                      </td>
                      <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                        {log.ip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
            <FileText className="h-5 w-5 text-[var(--sea-ink-soft)]" />
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Log audit akan direkam secara otomatis setelah endpoint API
              Verifikasi &amp; Audit tersedia.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Verifikasi KYC</DialogTitle>
                <DialogDescription>
                  Informasi lengkap pengajuan verifikasi pengguna.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium">
                    {selected.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--sea-ink)]">
                      {selected.name}
                    </div>
                    <div className="text-xs text-[var(--sea-ink-soft)]">
                      {selected.email}
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-[var(--sea-ink-soft)]">
                      No. KTP
                    </dt>
                    <dd className="font-medium text-[var(--sea-ink)]">
                      {selected.ktpNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--sea-ink-soft)]">
                      No. Telepon
                    </dt>
                    <dd className="font-medium text-[var(--sea-ink)]">
                      {selected.phone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--sea-ink-soft)]">
                      Tanggal Kirim
                    </dt>
                    <dd className="font-medium text-[var(--sea-ink)]">
                      {formatDate(selected.submittedAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--sea-ink-soft)]">
                      Status
                    </dt>
                    <dd>
                      <Badge
                        variant="secondary"
                        className={KYC_COLORS[selected.status]}
                      >
                        {KYC_LABELS[selected.status]}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
              <DialogFooter showCloseButton>
                {selected.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus(selected.id, 'APPROVED')}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-700"
                      onClick={() => updateStatus(selected.id, 'REJECTED')}
                    >
                      <X className="h-3.5 w-3.5" />
                      Tolak
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}

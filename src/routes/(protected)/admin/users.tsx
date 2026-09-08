import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, Check } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Switch } from '#/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

type Role = 'PENYEWA' | 'PEMILIK' | 'ADMIN' | 'STAFF'
type UserStatus = 'ACTIVE' | 'INACTIVE'
type KycStatus = 'VERIFIED' | 'PENDING' | 'REJECTED'

interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  kycStatus: KycStatus
  joinedAt: string
}

const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Admin Konkosyuk',
    email: 'admin@konkosyuk.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    joinedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sarah Wijaya',
    email: 'sarah.wijaya@example.com',
    role: 'PEMILIK',
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    joinedAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    role: 'PEMILIK',
    status: 'ACTIVE',
    kycStatus: 'PENDING',
    joinedAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Rina Kurnia',
    email: 'rina.kurnia@example.com',
    role: 'PENYEWA',
    status: 'INACTIVE',
    kycStatus: 'REJECTED',
    joinedAt: '2024-01-05',
  },
  {
    id: '5',
    name: 'Dedi Mulyana',
    email: 'dedi.mulyana@example.com',
    role: 'STAFF',
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    joinedAt: '2024-04-01',
  },
]

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
  PEMILIK: 'Pemilik',
  PENYEWA: 'Penyewa',
}

const ROLE_OPTIONS: Role[] = ['ADMIN', 'STAFF', 'PEMILIK', 'PENYEWA']

const KYC_LABELS: Record<KycStatus, string> = {
  VERIFIED: 'Terverifikasi',
  PENDING: 'Menunggu',
  REJECTED: 'Ditolak',
}

const KYC_COLORS: Record<KycStatus, string> = {
  VERIFIED: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  STAFF: 'bg-blue-100 text-blue-800',
  PEMILIK: 'bg-emerald-100 text-emerald-800',
  PENYEWA: 'bg-sky-100 text-sky-800',
}

export const Route = createFileRoute('/(protected)/admin/users')({
  component: AdminUsers,
})

function AdminUsers() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)

  const updateUser = (id: string, patch: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...patch } : user)),
    )
  }

  const filtered = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  )

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
            Kelola Pengguna
          </h2>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Total {filtered.length} pengguna ditemukan
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--sea-ink-soft)]" />
          <Input
            type="search"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 sm:w-64"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-[var(--sea-ink-soft)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Pengguna</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status Akun</th>
                  <th className="px-4 py-3 font-medium">Verifikasi KYC</th>
                  <th className="px-4 py-3 font-medium">Bergabung</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-[var(--sea-ink)]">
                            {user.name}
                          </div>
                          <div className="text-xs text-[var(--sea-ink-soft)]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={ROLE_COLORS[user.role]}
                        >
                          {ROLE_LABELS[user.role]}
                        </Badge>
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            updateUser(user.id, { role: value as Role })
                          }
                        >
                          <SelectTrigger className="h-7 w-32 text-xs">
                            <SelectValue placeholder="Ubah role" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.status === 'ACTIVE'}
                          onCheckedChange={(checked) =>
                            updateUser(user.id, {
                              status: checked ? 'ACTIVE' : 'INACTIVE',
                            })
                          }
                          aria-label="Ubah status akun"
                        />
                        <span
                          className={
                            user.status === 'ACTIVE'
                              ? 'text-sm text-green-700'
                              : 'text-sm text-neutral-500'
                          }
                        >
                          {user.status === 'ACTIVE' ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={KYC_COLORS[user.kycStatus]}
                      >
                        {KYC_LABELS[user.kycStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
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

      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Ganti role dan status akun langsung dari daftar di atas. Perubahan
            akan tersimpan dan tampil seketika.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

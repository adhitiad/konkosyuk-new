/**
 * Seed data pengguna uji coba untuk Konkosyuk.
 *
 * Membuat 3 akun pengguna dummy dengan peran berbeda:
 *   - admin   (ADMIN)   — akses penuh, KYC terverifikasi
 *   - pemilik (PEMILIK) — pemilik properti, KYC terverifikasi
 *   - penyewa (PENYEWA) — penyewa properti, KYC belum diverifikasi
 *
 * Password plaintext tidak pernah disimpan; hanya hash scrypt
 * (format `salt:hash`) yang ditulis ke kolom `password` pada tabel `accounts`
 * dengan `provider_id = 'credential'` dan `issuer = 'local:credential'`,
 * sesuai kontrak Better Auth.
 *
 * Skrip bersifat idempotent: akun dengan email `*@konkosyuk.test`
 * dihapus terlebih dahulu sebelum dibuat ulang.
 *
 * Jalankan: bun --bun run db:seed
 */
import { PrismaPg } from '@prisma/adapter-pg'

import { hashPassword } from 'better-auth/crypto'

import { getDatabaseUrl } from '../src/database-url.js'
import {
  PrismaClient,
  Role,
  KycStatus,
} from '../src/generated/prisma/client.js'

interface SeedUser {
  email: string
  name: string
  role: Role
  kycStatus: KycStatus
  password: string
}

const SEED_DOMAIN = 'konkosyuk.test'

const seedUsers: SeedUser[] = [
  {
    email: `admin@${SEED_DOMAIN}`,
    name: 'Admin Konkosyuk',
    role: Role.ADMIN,
    kycStatus: KycStatus.TERVERIFIKASI,
    password: 'admin123',
  },
  {
    email: `pemilik@${SEED_DOMAIN}`,
    name: 'Pemilik Konkosyuk',
    role: Role.PEMILIK,
    kycStatus: KycStatus.TERVERIFIKASI,
    password: 'pemilik123',
  },
  {
    email: `penyewa@${SEED_DOMAIN}`,
    name: 'Penyewa Konkosyuk',
    role: Role.PENYEWA,
    kycStatus: KycStatus.BELUM_VERIFIKASI,
    password: 'penyewa123',
  },
]

function createPrismaClient(): PrismaClient {
  const databaseUrl = getDatabaseUrl()

  if (databaseUrl.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: databaseUrl })
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })
}

const prisma = createPrismaClient()

async function seed(): Promise<void> {
  console.info('🌱 Mulai seeding database Konkosyuk...')

  console.info(`   Menghapus data seed lama dari domain @${SEED_DOMAIN}...`)

  await prisma.$transaction(async (tx) => {
    await tx.accounts.deleteMany({
      where: {
        users: {
          email: { endsWith: `@${SEED_DOMAIN}` },
        },
      },
    })

    await tx.users.deleteMany({
      where: { email: { endsWith: `@${SEED_DOMAIN}` } },
    })

    for (const user of seedUsers) {
      const hashedPassword = await hashPassword(user.password)

      const createdUser = await tx.users.create({
        data: {
          email: user.email,
          name: user.name,
          email_verified: true,
          role: user.role,
          kyc_status: user.kycStatus,
          is_active: true,
        },
      })

      await tx.accounts.create({
        data: {
          user_id: createdUser.id,
          account_id: createdUser.id,
          provider_id: 'credential',
          issuer: 'local:credential',
          password: hashedPassword,
        },
      })

      console.info(
        `   ✅ ${user.email} — peran: ${user.role}, KYC: ${user.kycStatus}`,
      )
    }
  })

  console.info('✅ Seeding selesai.')
}

seed()
  .catch((error) => {
    console.error('❌ Gagal melakukan seeding:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

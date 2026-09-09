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
 * Jalankan: bun --bun run seed:users
 */
import { PrismaPg } from '@prisma/adapter-pg'

import { hashPassword } from 'better-auth/crypto'

import { getDatabaseUrl } from '../src/database-url.js'
import {
  PrismaClient,
  Role,
  KycStatus,
  PropertyType,
  GenderType,
  RentalPeriod,
  PropertyStatus,
  RoomStatus,
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

const SEED_PROPERTIES = [
  {
    name: 'Kos Mawar Depok',
    description: 'Kos putri dengan fasilitas lengkap dekat kampus UI.',
    address: 'Jl. Margonda Raya No. 123, Depok',
    province: 'Jawa Barat',
    city: 'Depok',
    district: 'Beji',
    type: PropertyType.kost,
    gender_type: GenderType.putri,
    rental_period: RentalPeriod.bulanan,
    base_price: 1_650_000,
    is_active: true,
    rooms: [
      {
        name: 'Kamar 1A',
        status: RoomStatus.AVAILABLE,
        price: 1_650_000,
        facilities: ['AC', 'Kamar mandi dalam', 'WiFi'],
      },
      {
        name: 'Kamar 1B',
        status: RoomStatus.RESERVED,
        price: 1_700_000,
        facilities: ['AC', 'Kamar mandi dalam', 'WiFi', 'Lemari'],
      },
      {
        name: 'Kamar 2A',
        status: RoomStatus.AVAILABLE,
        price: 1_500_000,
        facilities: ['Kipas angin', 'Kamar mandi dalam', 'WiFi'],
      },
      {
        name: 'Kamar 2B',
        status: RoomStatus.MAINTENANCE,
        price: 1_550_000,
        facilities: ['AC', 'Kamar mandi dalam'],
      },
    ],
  },
  {
    name: 'Kos Melati Bandung',
    description: 'Kos putra strategis di sekitar ITB.',
    address: 'Jl. Dago Pojok No. 45, Bandung',
    province: 'Jawa Barat',
    city: 'Bandung',
    district: 'Coblong',
    type: PropertyType.kost,
    gender_type: GenderType.putra,
    rental_period: RentalPeriod.bulanan,
    base_price: 1_800_000,
    is_active: true,
    rooms: [
      {
        name: 'Room A1',
        status: RoomStatus.AVAILABLE,
        price: 1_800_000,
        facilities: ['AC', 'WiFi', 'Kamar mandi dalam'],
      },
      {
        name: 'Room A2',
        status: RoomStatus.AVAILABLE,
        price: 1_750_000,
        facilities: ['Kipas angin', 'WiFi', 'Kamar mandi luar'],
      },
      {
        name: 'Room B1',
        status: RoomStatus.RESERVED,
        price: 2_000_000,
        facilities: ['AC', 'WiFi', 'Kamar mandi dalam', 'Lemari'],
      },
      {
        name: 'Room B2',
        status: RoomStatus.MAINTENANCE,
        price: 1_900_000,
        facilities: ['AC', 'WiFi'],
      },
      {
        name: 'Room C1',
        status: RoomStatus.AVAILABLE,
        price: 2_100_000,
        facilities: ['AC', 'WiFi', 'Kamar mandi dalam', 'Lemari', 'TV'],
      },
    ],
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
    await tx.rooms.deleteMany({})
    await tx.properties.deleteMany({})

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

    const owner = await tx.users.findFirst({
      where: { email: { endsWith: `@${SEED_DOMAIN}` }, role: Role.PEMILIK },
    })

    if (!owner) {
      throw new Error('Pemilik tidak ditemukan untuk seeding properti')
    }

    console.info('   🌿 Menambahkan properti dan kamar...')

    for (const propertyData of SEED_PROPERTIES) {
      const property = await tx.properties.create({
        data: {
          owner_id: owner.id,
          name: propertyData.name,
          description: propertyData.description,
          address: propertyData.address,
          province: propertyData.province,
          city: propertyData.city,
          district: propertyData.district,
          type: propertyData.type,
          gender_type: propertyData.gender_type,
          rental_period: propertyData.rental_period,
          base_price: propertyData.base_price,
          status: PropertyStatus.aktif,
          is_active: propertyData.is_active,
          amenities: [],
          images: [],
          metadata: {},
        },
      })

      for (const roomData of propertyData.rooms) {
        await tx.rooms.create({
          data: {
            property_id: property.id,
            name: roomData.name,
            status: roomData.status,
            price: roomData.price,
            facilities: roomData.facilities,
          },
        })
      }

      console.info(
        `   ✅ ${property.name} — ${propertyData.rooms.length} kamar`,
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

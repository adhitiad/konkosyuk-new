/**
 * Seed platform config defaults.
 *
 * Membuat atau memperbarui baris PlatformConfig dengan nilai default:
 *   - persentaseDP: 30 (DP 30% dari total harga)
 *   - biayaRefundPenyewa: 3.88% (biaya admin refund untuk penyewa)
 *   - biayaRefundPemilik: 0.1%  (biaya admin refund untuk pemilik)
 *
 * Skrip bersifat idempotent: semua baris dihapus lalu dibuat ulang.
 *
 * Jalankan: bun --bun run seed:platform-config
 */
import 'dotenv/config'

import { prisma } from '#/db'

const DEFAULT_PLATFORM_CONFIG = {
  persentaseDP: 30,
  biayaRefundPenyewa: 3.88,
  biayaRefundPemilik: 0.1,
}

async function seed(): Promise<void> {
  console.info('🌱 Seeding platform config...')

  await prisma.platformConfig.deleteMany({})

  const config = await prisma.platformConfig.create({
    data: {
      persentaseDP: DEFAULT_PLATFORM_CONFIG.persentaseDP,
      biayaRefundPenyewa: DEFAULT_PLATFORM_CONFIG.biayaRefundPenyewa,
      biayaRefundPemilik: DEFAULT_PLATFORM_CONFIG.biayaRefundPemilik,
    },
  })

  console.info(
    `✅ Platform config created — DP: ${config.persentaseDP}%, refund penyewa: ${config.biayaRefundPenyewa}%, refund pemilik: ${config.biayaRefundPemilik}%`,
  )
}

seed()
  .catch((error) => {
    console.error('❌ Gagal melakukan seeding:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

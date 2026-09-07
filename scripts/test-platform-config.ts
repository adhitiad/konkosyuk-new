import 'dotenv/config'

import { prisma } from '#/db'

import {
  getPlatformConfig,
  calculateDpAmount,
  calculateRefundFee,
  updatePlatformConfig,
} from '#/lib/services/platform-config.js'

async function run(): Promise<void> {
  console.info('🧪 Testing platform config service...')

  const config = await getPlatformConfig()
  console.info('  getPlatformConfig →', {
    persentaseDP: config.persentaseDP,
    biayaRefundPenyewa: config.biayaRefundPenyewa,
    biayaRefundPemilik: config.biayaRefundPemilik,
  })

  const dpAmount = await calculateDpAmount(1_000_000)
  console.info('  calculateDpAmount(1_000_000) →', dpAmount)

  const refundFeeTenant = await calculateRefundFee(500_000, false)
  console.info(
    '  calculateRefundFee(500_000, isOwner=false) →',
    refundFeeTenant,
  )

  const refundFeeOwner = await calculateRefundFee(500_000, true)
  console.info('  calculateRefundFee(500_000, isOwner=true) →', refundFeeOwner)

  console.info('  updatePlatformConfig test...')
  const updated = await updatePlatformConfig({ persentaseDP: 50 })
  console.info('  updatePlatformConfig →', {
    persentaseDP: updated.persentaseDP,
  })

  await updatePlatformConfig({ persentaseDP: 30 })

  console.info('✅ Platform config test passed')
}

run()
  .catch((error) => {
    console.error('❌ Platform config test failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

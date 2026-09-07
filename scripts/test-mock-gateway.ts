import 'dotenv/config'

import { prisma } from '#/db'

import {
  createPayment,
  verifyPayment,
  getPaymentStatus,
} from '#/lib/payments/mock-gateway.js'

async function run(): Promise<void> {
  console.info('🧪 Testing mock payment gateway...')

  const created = await createPayment({
    tipeTransaksi: 'DP',
    jumlah: 500_000,
    bookingId: null,
  })
  console.info('  createPayment →', created)

  const verified = await verifyPayment(created.transactionId)
  console.info('  verifyPayment →', { status: verified.status })

  const status = await getPaymentStatus(created.transactionId)
  console.info('  getPaymentStatus →', { status: status.status })

  console.info('✅ Mock gateway test passed')
}

run()
  .catch((error) => {
    console.error('❌ Mock gateway test failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

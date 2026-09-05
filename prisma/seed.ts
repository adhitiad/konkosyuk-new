import { PrismaPg } from '@prisma/adapter-pg'

import { getDatabaseUrl } from '../src/database-url.js'
import { PrismaClient } from '../src/generated/prisma/client.js'

// Sama seperti src/db.ts: dukung URL Accelerate maupun PostgreSQL langsung.
function createPrismaClient() {
  const databaseUrl = getDatabaseUrl()

  if (databaseUrl.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: databaseUrl })
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })
}

const prisma = createPrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  console.log('✅ No seed data to create')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

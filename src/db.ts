import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './generated/prisma/client.js'

import { getDatabaseUrl } from './database-url.js'

/**
 * Dua mode koneksi didukung:
 * - `prisma+postgres://...` → lewat Prisma Accelerate (accelerateUrl).
 * - `postgresql://...`      → koneksi langsung via driver adapter `@prisma/adapter-pg`.
 */
function createPrismaClient() {
  const databaseUrl = getDatabaseUrl()

  if (databaseUrl.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: databaseUrl })
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

declare global {
  var __prisma: ExtendedPrismaClient | undefined
}

export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

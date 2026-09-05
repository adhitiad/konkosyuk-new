import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // CLI Prisma (db push / migrate / studio) memakai DIRECT_URL bila tersedia,
    // karena operasi migrate tidak disarankan lewat transaction-mode pooler (PgBouncer).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})

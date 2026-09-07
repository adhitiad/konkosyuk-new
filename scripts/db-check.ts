/**
 * Diagnostics koneksi database Konkosyuk.
 *
 * Menjalankan pengecekan berurutan:
 *   1. Konfigurasi DATABASE_URL / DIRECT_URL
 *   2. Konektivitas TCP ke Accelerate dan pooler Supabase
 *   3. Konektivitas HTTPS ke endpoint Accelerate
 *   4. Query Prisma nyata ke tabel Better Auth (users, accounts, sessions, verifications)
 *
 * Jalankan: bun --bun run db:check
 */
import net from 'node:net'

import { PrismaPg } from '@prisma/adapter-pg'

import { getDatabaseUrl } from '../src/database-url.js'
import { PrismaClient } from '../src/generated/prisma/client.js'

const TCP_TIMEOUT_MS = 8_000
const HTTPS_TIMEOUT_MS = 15_000

type TcpResult = 'ok' | 'timeout' | `error:${string}`

function maskUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`
  } catch {
    return '(URL tidak valid)'
  }
}

function testTcp(host: string, port: number): Promise<TcpResult> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port })
    const finish = (result: TcpResult) => {
      socket.destroy()
      resolve(result)
    }
    socket.setTimeout(TCP_TIMEOUT_MS)
    socket.on('connect', () => finish('ok'))
    socket.on('timeout', () => finish('timeout'))
    socket.on('error', (error: NodeJS.ErrnoException) =>
      finish(`error:${error.code ?? error.message}`),
    )
  })
}

function describeTcp(result: TcpResult): string {
  if (result === 'ok') return '✅ terjangkau'
  if (result === 'timeout') {
    return '❌ TIMEOUT — tidak ada jawaban (kemungkinan diblokir VPN/proxy/firewall, atau layanan mati/pause)'
  }
  if (result.startsWith('error:')) return `❌ GAGAL — ${result.slice(6)}`
  return '❌ GAGAL'
}

async function testHttps(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(HTTPS_TIMEOUT_MS),
    })
    return `✅ HTTP ${response.status} (endpoint hidup; 400/404 normal untuk request tanpa protokol Accelerate)`
  } catch (error) {
    const code = (error as { code?: string }).code
    const name = error instanceof Error ? error.name : String(error)
    return `❌ GAGAL — ${code ?? name}`
  }
}

// Sama seperti src/db.ts: dukung URL Accelerate maupun PostgreSQL langsung.
function createClient(databaseUrl: string): PrismaClient {
  if (databaseUrl.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: databaseUrl })
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })
}

async function testPrisma(databaseUrl: string): Promise<void> {
  const prisma = createClient(databaseUrl)
  try {
    const [users, accounts, sessions, verifications] = await Promise.all([
      prisma.users.count(),
      prisma.accounts.count(),
      prisma.sessions.count(),
      prisma.verifications.count(),
    ])
    console.log(
      `   ✅ Query berhasil — users: ${users}, accounts: ${accounts}, sessions: ${sessions}, verifications: ${verifications}`,
    )
  } catch (error) {
    const code = (error as { code?: string }).code
    const message =
      (error as { message?: string }).message?.split('\n')[0] ?? String(error)
    console.log(`   ❌ Query gagal — code: ${code ?? '-'}`)
    console.log(`      ${message}`)
    if (code === 'P2021') {
      console.log(
        '      → Tabel belum ada di database. Jalankan: bun --bun run db:push',
      )
    }
    if (code === 'P1001' || code === 'ETIMEDOUT') {
      console.log('      → Database tidak terjangkau dari mesin ini.')
    }
    if (code === 'P1000' || code === 'P1010' || code === '28P01') {
      console.log(
        '      → Autentikasi gagal — periksa user/password pada URL database.',
      )
    }
    if (code === 'P6005') {
      console.log('      → API key Accelerate tidak valid / sudah dicabut.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

async function main(): Promise<void> {
  const databaseUrl = getDatabaseUrl()
  const directUrl = process.env.DIRECT_URL
  const isAccelerate = databaseUrl.startsWith('prisma+postgres://')

  console.log('== 1. Konfigurasi ==')
  console.log(
    `DATABASE_URL : ${maskUrl(databaseUrl)} (${isAccelerate ? 'Prisma Accelerate' : 'PostgreSQL langsung'})`,
  )
  if (directUrl) {
    console.log(`DIRECT_URL   : ${maskUrl(directUrl)}`)
  }

  console.log('\n== 2. Konektivitas TCP ==')
  console.log(
    `accelerate.prisma-data.net:443 → ${describeTcp(await testTcp('accelerate.prisma-data.net', 443))}`,
  )
  for (const [label, url] of Object.entries({
    DATABASE_URL: databaseUrl,
    DIRECT_URL: directUrl,
  })) {
    if (!url || !url.startsWith('postgresql://')) continue
    try {
      const parsed = new URL(url)
      const host = parsed.hostname
      const port = Number(parsed.port || 5432)
      console.log(
        `${label} ${host}:${port} → ${describeTcp(await testTcp(host, port))}`,
      )
    } catch {
      console.log(`${label} → URL tidak dapat diparse`)
    }
  }

  console.log('\n== 3. HTTPS endpoint Accelerate ==')
  console.log(
    `https://accelerate.prisma-data.net → ${await testHttps('https://accelerate.prisma-data.net/')}`,
  )

  console.log('\n== 4. Query Prisma via DATABASE_URL ==')
  await testPrisma(databaseUrl)
  if (
    directUrl &&
    directUrl !== databaseUrl &&
    directUrl.startsWith('postgresql://')
  ) {
    console.log('\n== 5. Query Prisma via DIRECT_URL ==')
    await testPrisma(directUrl)
  }

  console.log('\nRingkasan tindakan:')
  console.log(
    '- TCP Supabase gagal/timeout → cek internet/VPN, atau restore project Supabase dari dashboard bila di-pause.',
  )
  console.log(
    '- TCP ok tapi query P2021 → jalankan `bun --bun run db:push` untuk membuat/menyelaraskan tabel.',
  )
  console.log('- Semua ok → restart dev server dan coba sign-in lagi.')
}

main().catch((error) => {
  console.error('Diagnostics gagal dijalankan:', error)
  process.exit(1)
})

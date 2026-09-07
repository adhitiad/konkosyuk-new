import { prisma } from '#/db'

import type { PlatformConfig } from '#/generated/prisma/client.js'

const DEFAULT_PLATFORM_CONFIG = {
  persentaseDP: 30,
  biayaRefundPenyewa: 3.88,
  biayaRefundPemilik: 0.1,
}

type PlatformConfigInput = {
  persentaseDP?: number
  biayaRefundPenyewa?: number
  biayaRefundPemilik?: number
}

function toConfigOutput(config: PlatformConfig): PlatformConfigOutput {
  return {
    id: config.id,
    persentaseDP: config.persentaseDP,
    biayaRefundPenyewa: Number(config.biayaRefundPenyewa),
    biayaRefundPemilik: Number(config.biayaRefundPemilik),
    updatedAt: config.updatedAt,
  }
}

export interface PlatformConfigOutput {
  id: string
  persentaseDP: number
  biayaRefundPenyewa: number
  biayaRefundPemilik: number
  updatedAt: Date
}

export async function getPlatformConfig(): Promise<PlatformConfigOutput> {
  const config = await prisma.platformConfig.findFirst({
    orderBy: { updatedAt: 'desc' },
  })

  if (!config) {
    return {
      id: '',
      ...DEFAULT_PLATFORM_CONFIG,
      updatedAt: new Date(),
    }
  }

  return toConfigOutput(config)
}

export async function updatePlatformConfig(
  data: PlatformConfigInput,
): Promise<PlatformConfigOutput> {
  const existing = await prisma.platformConfig.findFirst({
    orderBy: { updatedAt: 'desc' },
  })

  const payload: {
    persentaseDP?: number
    biayaRefundPenyewa?: string
    biayaRefundPemilik?: string
  } = {}

  if (data.persentaseDP !== undefined) payload.persentaseDP = data.persentaseDP
  if (data.biayaRefundPenyewa !== undefined)
    payload.biayaRefundPenyewa = data.biayaRefundPenyewa.toString()
  if (data.biayaRefundPemilik !== undefined)
    payload.biayaRefundPemilik = data.biayaRefundPemilik.toString()

  if (existing) {
    const updated = await prisma.platformConfig.update({
      where: { id: existing.id },
      data: payload,
    })
    return toConfigOutput(updated)
  }

  const created = await prisma.platformConfig.create({
    data: {
      persentaseDP: data.persentaseDP ?? DEFAULT_PLATFORM_CONFIG.persentaseDP,
      biayaRefundPenyewa:
        data.biayaRefundPenyewa ?? DEFAULT_PLATFORM_CONFIG.biayaRefundPenyewa,
      biayaRefundPemilik:
        data.biayaRefundPemilik ?? DEFAULT_PLATFORM_CONFIG.biayaRefundPemilik,
    },
  })
  return toConfigOutput(created)
}

export async function calculateDpAmount(totalHarga: number): Promise<number> {
  const config = await getPlatformConfig()
  return (totalHarga * config.persentaseDP) / 100
}

export async function calculateRefundFee(
  jumlahRefund: number,
  isOwner: boolean,
): Promise<number> {
  const config = await getPlatformConfig()
  const rate = isOwner ? config.biayaRefundPemilik : config.biayaRefundPenyewa
  return (jumlahRefund * rate) / 100
}

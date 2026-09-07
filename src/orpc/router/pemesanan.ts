import { ORPCError } from '@orpc/server'
import { z } from 'zod'
import { os } from '#/orpc/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'

import type { PemesananWithRelations } from '#/types/pemesanan'

import {
  AjukanPemesananInput,
  BatalPemesananInput,
  SetujuiPemesananInput,
  StatusPemesananSchema,
  TolakPemesananInput,
} from '#/lib/validators/pemesanan'

const withSession = os.use(async ({ context, next }) => {
  const headers = context.headers
  const session = await auth.api.getSession({ headers })
  if (!session?.user) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'Authentication required',
    })
  }
  return next({
    context: {
      user: session.user,
    },
  })
})

const requireOwner = withSession.use(async ({ context, next }) => {
  if (context.user.role !== 'PEMILIK' && context.user.role !== 'ADMIN') {
    throw new ORPCError('FORBIDDEN', {
      message: 'Owner or admin role required',
    })
  }
  return next()
})

const pemesananInclude = {
  unit_properti: {
    select: { id: true, nama_unit: true, harga_bulanan: true },
  },
  property: {
    select: {
      id: true,
      nama_properti: true,
      pemilik_id: true,
    },
  },
  tenant: {
    select: { id: true, name: true, phone: true, email: true },
  },
} as const

type PemesananRow = {
  id: string
  property_id: string
  unit_properti_id: string
  tenant_id: string
  jumlah_penghuni: number
  tanggal_mulai: Date
  tanggal_selesai: Date | null
  total_harga: { toString: () => string }
  status: string
  catatan: string | null
  created_at: Date
  updated_at: Date
  unit_properti: { nama_unit: string }
  property: { nama_properti: string }
  tenant: { name: string }
}

function toPemesananWithRelations(p: PemesananRow): PemesananWithRelations {
  return {
    id: p.id,
    property_id: p.property_id,
    unit_properti_id: p.unit_properti_id,
    tenant_id: p.tenant_id,
    nama_unit: p.unit_properti.nama_unit,
    nama_properti: p.property.nama_properti,
    nama_tenant: p.tenant.name,
    jumlah_penghuni: p.jumlah_penghuni,
    tanggal_mulai: p.tanggal_mulai,
    tanggal_selesai: p.tanggal_selesai ?? null,
    total_harga: p.total_harga.toString(),
    status: StatusPemesananSchema.parse(p.status),
    catatan: p.catatan,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

function overlaps(
  newStart: Date,
  newEnd: Date | null,
  existingStart: Date,
  existingEnd: Date | null,
): boolean {
  return (
    (existingEnd === null || newStart < existingEnd) &&
    (newEnd === null || existingStart < newEnd)
  )
}

export const listPemesananSaya = withSession.handler(async ({ context }) => {
  const pemesanans = await prisma.pemesanan.findMany({
    where: { tenant_id: context.user.id },
    include: pemesananInclude,
    orderBy: { created_at: 'desc' },
  })
  return pemesanans.map(toPemesananWithRelations)
})

export const listPemesananProperti = withSession
  .input(
    z.object({
      status: StatusPemesananSchema.optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const pemesanans = await prisma.pemesanan.findMany({
      where: {
        property: {
          pemilik_id: context.user.id,
        },
        ...(input.status ? { status: input.status } : {}),
      },
      include: pemesananInclude,
      orderBy: { created_at: 'desc' },
    })
    return pemesanans.map(toPemesananWithRelations)
  })

export const ajukanPemesanan = withSession
  .input(AjukanPemesananInput)
  .handler(async ({ input, context }) => {
    const unit = await prisma.unitProperti.findUnique({
      where: { id: input.unit_properti_id },
      select: {
        id: true,
        property_id: true,
        harga_bulanan: true,
        status_ketersediaan: true,
      },
    })

    if (!unit) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Unit properti tidak ditemukan',
      })
    }

    if (unit.status_ketersediaan !== 'TERSEDIA') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Unit tidak tersedia',
      })
    }

    const start = new Date(input.tanggal_mulai)
    const end = input.tanggal_selesai ? new Date(input.tanggal_selesai) : null

    const existing = await prisma.pemesanan.findMany({
      where: {
        unit_properti_id: input.unit_properti_id,
        status: { in: ['MENUNGGU_PERSETUJUAN', 'DITERIMA'] },
        select: {
          id: true,
          tanggal_mulai: true,
          tanggal_selesai: true,
        },
      },
    })

    for (const e of existing) {
      if (overlaps(start, end, e.tanggal_mulai, e.tanggal_selesai)) {
        throw new ORPCError('CONFLICT', {
          message: 'Unit sudah dipesan pada periode ini',
        })
      }
    }

    const monthly = Number(unit.harga_bulanan)
    const total = computeTotalPrice(monthly, start, end)

    const pemesanan = await prisma.pemesanan.create({
      data: {
        unit_properti_id: unit.id,
        property_id: unit.property_id,
        tenant_id: context.user.id,
        jumlah_penghuni: input.jumlah_penghuni,
        tanggal_mulai: start,
        tanggal_selesai: end,
        total_harga: total,
        status: 'MENUNGGU_PERSETUJUAN',
        catatan: input.catatan,
      },
      include: pemesananInclude,
    })

    return toPemesananWithRelations(pemesanan)
  })

function computeTotalPrice(
  monthly: number,
  start: Date,
  end: Date | null,
): string {
  if (!end) {
    return monthly.toFixed(2)
  }
  const msPerDay = 24 * 60 * 60 * 1000
  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / msPerDay),
  )
  return ((monthly / 30) * days).toFixed(2)
}

export const setujuiPemesanan = requireOwner
  .input(SetujuiPemesananInput)
  .handler(async ({ input, context }) => {
    const existing = await prisma.pemesanan.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        status: true,
        property: { select: { pemilik_id: true } },
      },
    })

    if (!existing) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Pemesanan tidak ditemukan',
      })
    }

    if (existing.property.pemilik_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Hanya pemilik properti yang dapat menyetujui pemesanan ini',
      })
    }

    const updated = await prisma.pemesanan.update({
      where: { id: input.id },
      data: { status: 'DITERIMA' },
      include: pemesananInclude,
    })

    return toPemesananWithRelations(updated)
  })

export const tolakPemesanan = requireOwner
  .input(TolakPemesananInput)
  .handler(async ({ input, context }) => {
    const existing = await prisma.pemesanan.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        status: true,
        property: { select: { pemilik_id: true } },
      },
    })

    if (!existing) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Pemesanan tidak ditemukan',
      })
    }

    if (existing.property.pemilik_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Hanya pemilik properti yang dapat menolak pemesanan ini',
      })
    }

    const updated = await prisma.pemesanan.update({
      where: { id: input.id },
      data: { status: 'DITOLAK' },
      include: pemesananInclude,
    })

    return toPemesananWithRelations(updated)
  })

export const batalPemesanan = withSession
  .input(BatalPemesananInput)
  .handler(async ({ input, context }) => {
    const existing = await prisma.pemesanan.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        tenant_id: true,
        status: true,
      },
    })

    if (!existing) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Pemesanan tidak ditemukan',
      })
    }

    if (existing.tenant_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Anda tidak dapat membatalkan pemesanan ini',
      })
    }

    if (existing.status !== 'MENUNGGU_PERSETUJUAN') {
      throw new ORPCError('BAD_REQUEST', {
        message:
          'Hanya pemesanan yang masih menunggu persetujuan yang dapat dibatalkan',
      })
    }

    const updated = await prisma.pemesanan.update({
      where: { id: input.id },
      data: { status: 'DIBATALKAN' },
      include: pemesananInclude,
    })

    return toPemesananWithRelations(updated)
  })

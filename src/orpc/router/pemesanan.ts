import { ORPCError } from '@orpc/server'
import { z } from 'zod'
import { os } from '#/orpc/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { createNotification } from '#/lib/services/notifications'

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
  room: {
    select: {
      id: true,
      name: true,
      price: true,
      properties: {
        select: {
          id: true,
          name: true,
          owner_id: true,
        },
      },
    },
  },
  tenant: {
    select: { id: true, name: true, phone: true, email: true },
  },
} as const

type PemesananRow = {
  id: string
  room_id: string
  tenant_id: string
  jumlah_penghuni: number
  tanggal_mulai: Date
  tanggal_selesai: Date | null
  total_harga: { toString: () => string }
  status: string
  catatan: string | null
  created_at: Date
  updated_at: Date
  room: {
    name: string
    properties: { name: string }
  }
  tenant: { name: string }
}

function toPemesananWithRelations(p: PemesananRow): PemesananWithRelations {
  return {
    id: p.id,
    room_id: p.room_id,
    tenant_id: p.tenant_id,
    nama_unit: p.room.name,
    nama_properti: p.room.properties.name,
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
        room: {
          properties: {
            owner_id: context.user.id,
          },
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
    const room = await prisma.rooms.findUnique({
      where: { id: input.room_id },
      select: {
        id: true,
        property_id: true,
        price: true,
        status: true,
        properties: {
          select: {
            owner_id: true,
            name: true,
          },
        },
      },
    })

    if (!room) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Kamar tidak ditemukan',
      })
    }

    if (room.status !== 'AVAILABLE') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Kamar tidak tersedia',
      })
    }

    const start = new Date(input.tanggal_mulai)
    const end = input.tanggal_selesai ? new Date(input.tanggal_selesai) : null

    const existing = await prisma.pemesanan.findMany({
      where: {
        room_id: input.room_id,
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
          message: 'Kamar sudah dipesan pada periode ini',
        })
      }
    }

    const monthly = Number(room.price)
    const total = computeTotalPrice(monthly, start, end)

    const pemesanan = await prisma.pemesanan.create({
      data: {
        room_id: room.id,
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

    await createNotification({
      userId: room.properties.owner_id,
      type: 'booking',
      title: 'Pemesanan Baru',
      message: `Ada pemesanan baru untuk ${room.properties.name} dari tenant.`,
      referenceId: pemesanan.id,
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
        room: {
          select: {
            properties: {
              select: {
                owner_id: true,
              },
            },
          },
        },
      },
    })

    if (!existing) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Pemesanan tidak ditemukan',
      })
    }

    if (existing.room.properties.owner_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Hanya pemilik properti yang dapat menyetujui pemesanan ini',
      })
    }

    const updated = await prisma.pemesanan.update({
      where: { id: input.id },
      data: { status: 'DITERIMA' },
      include: pemesananInclude,
    })

    await createNotification({
      userId: updated.tenant.id,
      type: 'BOOKING_APPROVED',
      title: 'Pemesanan Disetujui',
      message: `Pemesanan untuk ${updated.room.properties.name} - ${updated.room.name} telah disetujui oleh pemilik.`,
      referenceId: updated.id,
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
        room: {
          select: {
            properties: {
              select: {
                owner_id: true,
              },
            },
          },
        },
      },
    })

    if (!existing) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Pemesanan tidak ditemukan',
      })
    }

    if (existing.room.properties.owner_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Hanya pemilik properti yang dapat menolak pemesanan ini',
      })
    }

    const updated = await prisma.pemesanan.update({
      where: { id: input.id },
      data: { status: 'DITOLAK' },
      include: pemesananInclude,
    })

    await createNotification({
      userId: updated.tenant.id,
      type: 'BOOKING_REJECTED',
      title: 'Pemesanan Ditolak',
      message: `Pemesanan untuk ${updated.room.properties.name} - ${updated.room.name} telah ditolak oleh pemilik.`,
      referenceId: updated.id,
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

    await createNotification({
      userId: updated.room.properties.owner_id,
      type: 'booking',
      title: 'Pemesanan Dibatalkan',
      message: `Pemesanan untuk ${updated.room.properties.name} - ${updated.room.name} telah dibatalkan oleh tenant.`,
      referenceId: updated.id,
    })

    return toPemesananWithRelations(updated)
  })

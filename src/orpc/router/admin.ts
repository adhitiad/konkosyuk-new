import { ORPCError } from '@orpc/server'
import { os } from '#/orpc/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { logAudit } from '#/lib/services/audit'

import {
  updateKonfigurasiPlatformSchema,
  getAllBookingsSchema,
  getAllUsersSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  getKycVerificationsSchema,
  getInspectionsSchema,
  getMaintenanceReportsSchema,
  getAuditLogsSchema,
} from '#/orpc/schema/admin'

const withSession = os.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers })
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

const requireAdmin = withSession.use(async ({ context, next }) => {
  if (context.user.role !== 'ADMIN' && context.user.role !== 'STAFF') {
    throw new ORPCError('FORBIDDEN', {
      message: 'Admin or staff role required',
    })
  }
  return next()
})

export const getStatistikPlatform = requireAdmin.handler(async () => {
  const [
    totalProperties,
    totalUnits,
    totalBookings,
    activeBookings,
    totalUsers,
    totalRevenueResult,
    pendingBookings,
  ] = await Promise.all([
    prisma.properties.count(),
    prisma.units.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status_booking: 'AKTIF' } }),
    prisma.users.count(),
    prisma.booking.aggregate({
      where: {
        status_booking: { in: ['AKTIF', 'SELESAI', 'MENUNGGU_PELUNASAN'] },
        tanggalBayarDP: { not: null },
      },
      _sum: { total_harga: true },
    }),
    prisma.booking.count({
      where: { status_booking: 'MENUNGGU_PERSETUJUAN' },
    }),
  ])

  return {
    totalProperties,
    totalUnits,
    totalBookings,
    activeBookings,
    totalUsers,
    totalRevenue: String(totalRevenueResult._sum.total_harga ?? 0),
    pendingBookings,
  }
})

export const getKonfigurasiPlatform = requireAdmin.handler(async () => {
  const config = await prisma.platform_settings.findFirst({
    where: { key: 'default' },
  })

  if (!config) {
    return {
      platform_fee_percent: 1.8,
      featured_listing_price: 50000,
    }
  }

  return {
    platform_fee_percent: Number(config.platform_fee_percent),
    featured_listing_price: Number(config.featured_listing_price),
  }
})

export const updateKonfigurasiPlatform = requireAdmin
  .input(updateKonfigurasiPlatformSchema)
  .handler(async ({ input, context }) => {
    const config = await prisma.platform_settings.upsert({
      where: { key: 'default' },
      update: {
        ...(input.platform_fee_percent !== undefined && {
          platform_fee_percent: input.platform_fee_percent,
        }),
        ...(input.featured_listing_price !== undefined && {
          featured_listing_price: input.featured_listing_price,
        }),
      },
      create: {
        key: 'default',
        platform_fee_percent: input.platform_fee_percent ?? 1.8,
        featured_listing_price: input.featured_listing_price ?? 50000,
      },
    })

    await logAudit({
      adminId: context.user.id,
      action: 'update_platform_config',
      targetType: 'platform_config',
      targetId: config.key,
      details: {
        platform_fee_percent: input.platform_fee_percent,
        featured_listing_price: input.featured_listing_price,
      },
    })

    return {
      platform_fee_percent: Number(config.platform_fee_percent),
      featured_listing_price: Number(config.featured_listing_price),
    }
  })

const bookingSelect = {
  id: true,
  unit_id: true,
  penyewa_id: true,
  tanggal_mulai: true,
  tanggal_selesai: true,
  total_harga: true,
  status_booking: true,
  jumlahDP: true,
  jumlahPelunasan: true,
  tanggalBayarDP: true,
  tanggalPelunasan: true,
  tanggalDitolak: true,
  alasanPenolakan: true,
  statusRefundDP: true,
  transaksiDP_id: true,
  transaksiPelunasan_id: true,
  transaksiRefund_id: true,
  units: {
    select: {
      id: true,
      name: true,
      price: true,
      properties: {
        select: {
          id: true,
          name: true,
          owner_id: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  },
  users: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  created_at: true,
  updated_at: true,
} as const

function decimalStr(value: unknown): string {
  if (value === null || value === undefined) return '0'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return String(value)
}

function serializeBooking(raw: Record<string, unknown>) {
  return {
    id: raw.id as string,
    unit_id: raw.unit_id as string,
    penyewa_id: raw.penyewa_id as string,
    tanggal_mulai: raw.tanggal_mulai as Date,
    tanggal_selesai: raw.tanggal_selesai as Date,
    total_harga: decimalStr(raw.total_harga),
    status_booking: raw.status_booking as string,
    jumlahDP: decimalStr(raw.jumlahDP),
    jumlahPelunasan: decimalStr(raw.jumlahPelunasan),
    tanggalBayarDP: raw.tanggalBayarDP as Date | null,
    tanggalPelunasan: raw.tanggalPelunasan as Date | null,
    tanggalDitolak: raw.tanggalDitolak as Date | null,
    alasanPenolakan: raw.alasanPenolakan as string | null,
    statusRefundDP: raw.statusRefundDP as string | null,
    unit: {
      id: (raw.units as Record<string, unknown>).id as string,
      name: (raw.units as Record<string, unknown>).name as string,
      price: decimalStr((raw.units as Record<string, unknown>).price),
      property: {
        id: (
          (raw.units as Record<string, unknown>).properties as Record<
            string,
            unknown
          >
        ).id as string,
        name: (
          (raw.units as Record<string, unknown>).properties as Record<
            string,
            unknown
          >
        ).name as string,
        owner: (
          (raw.units as Record<string, unknown>).properties as Record<
            string,
            unknown
          >
        ).users as Record<string, unknown>,
      },
    },
    penyewa: {
      id: (raw.users as Record<string, unknown>).id as string,
      name: (raw.users as Record<string, unknown>).name as string,
      email: (raw.users as Record<string, unknown>).email as string,
      role: (raw.users as Record<string, unknown>).role as string,
    },
    created_at: raw.created_at as Date,
    updated_at: raw.updated_at as Date,
  }
}

export const getAllBookings = requireAdmin
  .input(getAllBookingsSchema)
  .handler(async ({ input }) => {
    const where: Record<string, unknown> = {}

    if (input.status) {
      where.status_booking = input.status
    }

    if (input.search) {
      where.OR = [
        { units: { properties: { name: { contains: input.search } } } },
        { units: { name: { contains: input.search } } },
        { users: { name: { contains: input.search } } },
        { users: { email: { contains: input.search } } },
      ]
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: bookingSelect,
        orderBy: { created_at: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.booking.count({ where }),
    ])

    return {
      bookings: bookings.map(serializeBooking),
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
    }
  })

export const getAuditLogs = requireAdmin
  .input(getAuditLogsSchema)
  .handler(async ({ input }) => {
    const where: Record<string, unknown> = {}

    if (input.action) {
      where.action = { contains: input.action }
    }

    if (input.search) {
      where.OR = [
        { action: { contains: input.search } },
        { target_type: { contains: input.search } },
        { users: { name: { contains: input.search } } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.audit_logs.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.audit_logs.count({ where }),
    ])

    return {
      items,
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
    }
  })

export const getAllUsers = requireAdmin
  .input(getAllUsersSchema)
  .handler(async ({ input }) => {
    const where: Record<string, unknown> = {}

    if (input.search) {
      where.OR = [
        { name: { contains: input.search } },
        { email: { contains: input.search } },
      ]
    }

    if (input.role) {
      where.role = input.role
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          kyc_status: true,
          phone: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.users.count({ where }),
    ])

    return {
      users,
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
    }
  })

export const updateUserRole = requireAdmin
  .input(updateUserRoleSchema)
  .handler(async ({ input, context }) => {
    const user = await prisma.users.update({
      where: { id: input.user_id },
      data: { role: input.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    await logAudit({
      adminId: context.user.id,
      action: 'update_user_role',
      targetType: 'user',
      targetId: input.user_id,
      details: { role: input.role },
    })

    return user
  })

export const updateUserStatus = requireAdmin
  .input(updateUserStatusSchema)
  .handler(async ({ input, context }) => {
    const user = await prisma.users.update({
      where: { id: input.user_id },
      data: { is_active: input.is_active },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
      },
    })

    await logAudit({
      adminId: context.user.id,
      action: 'update_user_status',
      targetType: 'user',
      targetId: input.user_id,
      details: { is_active: input.is_active },
    })

    return user
  })

export const getKycVerifications = requireAdmin
  .input(getKycVerificationsSchema)
  .handler(async ({ input }) => {
    const where: Record<string, unknown> = {}

    if (input.status) {
      where.status_kyc = input.status
    }

    if (input.search) {
      where.OR = [
        { users: { name: { contains: input.search } } },
        { users: { email: { contains: input.search } } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.kycRequest.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.kycRequest.count({ where }),
    ])

    return {
      items,
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
    }
  })

export const getInspections = requireAdmin
  .input(getInspectionsSchema)
  .handler(async ({ input }) => {
    const where: Record<string, unknown> = {}

    if (input.status) {
      where.status = input.status
    }

    if (input.search) {
      where.OR = [
        { properties: { name: { contains: input.search } } },
        { units: { name: { contains: input.search } } },
        {
          users_inspections_performed_byTousers: {
            name: { contains: input.search },
          },
        },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.inspections.findMany({
        where,
        include: {
          properties: {
            select: { id: true, name: true },
          },
          units: {
            select: { id: true, name: true },
          },
          users_inspections_performed_byTousers: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.inspections.count({ where }),
    ])

    return {
      items,
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
    }
  })

export const getMaintenanceReports = requireAdmin
  .input(getMaintenanceReportsSchema)
  .handler(async ({ input }) => {
    const where: Record<string, unknown> = {}

    if (input.status) {
      where.status = input.status
    }

    if (input.search) {
      where.OR = [
        { properties: { name: { contains: input.search } } },
        { units: { name: { contains: input.search } } },
        { users: { name: { contains: input.search } } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.maintenance_reports.findMany({
        where,
        include: {
          properties: {
            select: { id: true, name: true },
          },
          units: {
            select: { id: true, name: true },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.maintenance_reports.count({ where }),
    ])

    return {
      items,
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
    }
  })

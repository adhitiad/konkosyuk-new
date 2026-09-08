import { ORPCError } from '@orpc/server'
import { os } from '#/orpc/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import {
  getUpcomingExpirationsSchema,
  getMonthlyRevenueSchema,
} from '#/orpc/schema/owner'
import { addDays, startOfMonth, endOfMonth, format } from 'date-fns'

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

const requireOwnerOrAdmin = withSession.use(async ({ context, next }) => {
  if (
    context.user.role !== 'PEMILIK' &&
    context.user.role !== 'ADMIN' &&
    context.user.role !== 'STAFF'
  ) {
    throw new ORPCError('FORBIDDEN', {
      message: 'Owner, admin, or staff role required',
    })
  }
  return next()
})

export const getUpcomingExpirations = requireOwnerOrAdmin
  .input(getUpcomingExpirationsSchema)
  .handler(async ({ input, context }) => {
    const days = input.days ?? 7
    const now = new Date()
    const deadline = addDays(now, days)

    const ownerWhere =
      context.user.role === 'PEMILIK'
        ? { units: { properties: { owner_id: context.user.id } } }
        : {}

    const bookings = await prisma.booking.findMany({
      where: {
        ...ownerWhere,
        status_booking: 'AKTIF',
        tanggal_selesai: {
          gte: now,
          lte: deadline,
        },
      },
      select: {
        id: true,
        tanggal_selesai: true,
        total_harga: true,
        status_booking: true,
        units: {
          select: {
            id: true,
            name: true,
            properties: {
              select: {
                id: true,
                name: true,
                alamat_lengkap: true,
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { tanggal_selesai: 'asc' },
    })

    return {
      count: bookings.length,
      deadline: deadline.toISOString(),
      bookings: bookings.map((b) => ({
        id: b.id,
        endDate: b.tanggal_selesai,
        daysLeft: Math.max(
          0,
          Math.ceil(
            (b.tanggal_selesai.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        ),
        totalHarga: b.total_harga,
        statusBooking: b.status_booking,
        unit: {
          id: b.units.id,
          name: b.units.name,
          property: b.units.properties,
        },
        tenant: {
          id: b.users.id,
          name: b.users.name,
          email: b.users.email,
        },
      })),
    }
  })

export const getMonthlyRevenue = requireOwnerOrAdmin
  .input(getMonthlyRevenueSchema)
  .handler(async ({ input, context }) => {
    const monthStart = startOfMonth(new Date(input.year, input.month - 1))
    const monthEnd = endOfMonth(new Date(input.year, input.month - 1))

    const ownerBookingWhere =
      context.user.role === 'PEMILIK'
        ? {
            units: {
              properties: {
                owner_id: context.user.id,
              },
            },
          }
        : {}

    const payments = await prisma.paymentTransaction.findMany({
      where: {
        status: 'BERHASIL',
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
        OR: [
          { bookingDP: ownerBookingWhere },
          { bookingPelunasan: ownerBookingWhere },
          { bookingRefund: ownerBookingWhere },
        ],
      },
      select: {
        id: true,
        jumlah: true,
        createdAt: true,
        bookingDP: {
          select: {
            units: {
              select: {
                properties: {
                  select: {
                    id: true,
                    nama_properti: true,
                  },
                },
              },
            },
          },
        },
        bookingPelunasan: {
          select: {
            units: {
              select: {
                properties: {
                  select: {
                    id: true,
                    nama_properti: true,
                  },
                },
              },
            },
          },
        },
        bookingRefund: {
          select: {
            units: {
              select: {
                properties: {
                  select: {
                    id: true,
                    nama_properti: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const grouped = new Map<
      string,
      {
        propertyId: string
        propertyName: string
        totalRevenue: number
        transactionCount: number
      }
    >()

    for (const payment of payments) {
      const relatedBooking =
        payment.bookingDP ?? payment.bookingPelunasan ?? payment.bookingRefund

      if (!relatedBooking) continue

      const property = relatedBooking.units.properties
      const key = property.id
      const current = grouped.get(key)
      const amount = Number(payment.jumlah)

      if (current) {
        current.totalRevenue += amount
        current.transactionCount += 1
      } else {
        grouped.set(key, {
          propertyId: property.id,
          propertyName: property.nama_properti,
          totalRevenue: amount,
          transactionCount: 1,
        })
      }
    }

    const result = Array.from(grouped.values()).sort((a, b) =>
      a.propertyName.localeCompare(b.propertyName),
    )

    return {
      year: input.year,
      month: input.month,
      monthLabel: format(monthStart, 'MMMM yyyy'),
      totalRevenue: result.reduce((sum, item) => sum + item.totalRevenue, 0),
      totalTransactions: result.reduce(
        (sum, item) => sum + item.transactionCount,
        0,
      ),
      properties: result.map((item) => ({
        propertyId: item.propertyId,
        propertyName: item.propertyName,
        totalRevenue: item.totalRevenue,
        transactionCount: item.transactionCount,
      })),
    }
  })

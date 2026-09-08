import { ORPCError } from '@orpc/server'
import { os } from '#/orpc/server'
import { z } from 'zod'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'

import type { BookingStatus, Prisma } from '#/generated/prisma/client'
import type { PropertyWithRelations } from '#/types/property'

import {
  CheckPropertyAvailabilityInput,
  CheckUnitAvailabilityInput,
  CreatePropertyInput,
  CreateUnitInput,
  GenderTypeSchema,
  PropertyTypeSchema,
  RentalPeriodSchema,
  UpdatePropertyInput,
  UpdateUnitInput,
  NearbyFilterSchema,
} from '#/orpc/schema/properties'

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
  if (context.user.role !== 'owner' && context.user.role !== 'admin') {
    throw new ORPCError('FORBIDDEN', {
      message: 'Owner or admin role required',
    })
  }
  return next()
})

export const listProperties = os
  .input(
    z.object({
      include_units: z.boolean().optional(),
      include_bookings: z.boolean().optional(),
      owner_id: z.string().uuid().optional(),
      type: PropertyTypeSchema.optional(),
      gender_type: GenderTypeSchema.optional(),
      rental_period: RentalPeriodSchema.optional(),
      city: z.string().optional(),
      search: z.string().optional(),
      nearby: NearbyFilterSchema.optional(),
    }),
  )
  .handler(async ({ input }) => {
    const where: Prisma.propertiesWhereInput = {
      is_active: true,
      ...(input.owner_id ? { owner_id: input.owner_id } : {}),
      ...(input.type ? { type: input.type } : {}),
      ...(input.gender_type ? { gender_type: input.gender_type } : {}),
      ...(input.rental_period ? { rental_period: input.rental_period } : {}),
      ...(input.city
        ? { city: { contains: input.city, mode: 'insensitive' } }
        : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { description: { contains: input.search, mode: 'insensitive' } },
              { address: { contains: input.search, mode: 'insensitive' } },
              { city: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }
    if (input.nearby) {
      const { lat, lng, radius_km } = input.nearby
      const latDelta = radius_km / 111
      const lngDelta = radius_km / (111 * Math.cos((lat * Math.PI) / 180))
      where.latitude = { gte: lat - latDelta, lte: lat + latDelta }
      where.longitude = { gte: lng - lngDelta, lte: lng + lngDelta }
    }
    const properties = await prisma.properties.findMany({
      where,
      include: input.include_units
        ? {
            units: true,
            bookings: input.include_bookings
              ? { include: { users: true } }
              : false,
          }
        : input.include_bookings
          ? { bookings: { include: { users: true } } }
          : undefined,
      orderBy: { created_at: 'desc' },
    })
    return properties.map((p) => {
      const lat = p.latitude ? Number(p.latitude) : null
      const lng = p.longitude ? Number(p.longitude) : null
      let distanceKm: number | null = null
      if (input.nearby && lat != null && lng != null) {
        const { lat: refLat, lng: refLng } = input.nearby
        const R = 6371
        const dLat = ((lat - refLat) * Math.PI) / 180
        const dLon = ((lng - refLng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((refLat * Math.PI) / 180) *
            Math.cos((lat * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        distanceKm = R * c
      }
      return {
        ...p,
        latitude: lat,
        longitude: lng,
        distance_km: distanceKm,
      }
    })
  })

export const listFeaturedProperties = os
  .input(z.object({ limit: z.number().int().min(1).max(24).default(12) }))
  .handler(async ({ input }) => {
    const properties = await prisma.properties.findMany({
      where: { is_active: true, is_featured: true },
      include: { units: true, property_ratings: true, users: true },
      orderBy: [
        { featured_until: { sort: 'desc', nulls: 'last' } },
        { created_at: 'desc' },
      ],
      take: input.limit,
    })
    return properties.map((p) => {
      const minUnit = p.units.length
        ? Math.min(...p.units.map((u) => Number(u.price)))
        : p.base_price
          ? Number(p.base_price)
          : null
      const lat = p.latitude ? Number(p.latitude) : null
      const lng = p.longitude ? Number(p.longitude) : null
      return {
        ...p,
        latitude: lat,
        longitude: lng,
        min_price: minUnit,
        unit_count: p.units.length,
        average_rating: p.property_ratings
          ? Number(p.property_ratings.average_rating)
          : 0,
        total_reviews: p.property_ratings
          ? p.property_ratings.total_reviews
          : 0,
        owner_name: p.users.name,
      }
    })
  })

export const searchRooms = os
  .input(
    z.object({
      city: z.string().optional(),
      type: PropertyTypeSchema.optional(),
      price_min: z.number().nonnegative().optional(),
      price_max: z.number().nonnegative().optional(),
      facilities: z.array(z.string()).optional(),
      search: z.string().optional(),
      limit: z.number().int().min(1).max(100).default(50),
    }),
  )
  .handler(async ({ input }) => {
    const where: Prisma.propertiesWhereInput = {
      is_active: true,
      ...(input.type ? { type: input.type } : {}),
      ...(input.city
        ? { city: { contains: input.city, mode: 'insensitive' } }
        : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { address: { contains: input.search, mode: 'insensitive' } },
              { city: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const properties = await prisma.properties.findMany({
      where,
      include: {
        rooms: {
          where: {
            ...(input.price_min !== undefined || input.price_max !== undefined
              ? {
                  price: {
                    ...(input.price_min !== undefined
                      ? { gte: input.price_min }
                      : {}),
                    ...(input.price_max !== undefined
                      ? { lte: input.price_max }
                      : {}),
                  },
                }
              : {}),
          },
        },
      },
      take: input.limit,
    })

    const rows = properties.flatMap((property) => {
      const rooms = property.rooms.filter((room) => {
        if (!input.facilities || input.facilities.length === 0) {
          return true
        }
        const roomFacilities: string[] = Array.isArray(room.facilities)
          ? (room.facilities as unknown as string[])
          : []
        return input.facilities.every((facility) =>
          roomFacilities.includes(facility),
        )
      })

      const images: string[] = Array.isArray(property.images)
        ? property.images.map(String)
        : []

      return rooms.map((room) => ({
        id: room.id,
        name: room.name,
        price: Number(room.price),
        status: room.status,
        facilities: Array.isArray(room.facilities)
          ? (room.facilities as unknown as string[])
          : [],
        property_id: property.id,
        property_name: property.name,
        property_city: property.city,
        property_type: property.type,
        property_address: property.address,
        property_images: images,
        property_base_price: property.base_price
          ? Number(property.base_price)
          : null,
      }))
    })

    return {
      rows,
      total: rows.length,
    }
  })

export const getProperty = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const property = await prisma.properties.findUnique({
      where: { id: input.id },
      include: {
        units: {
          include: {
            current_booking: true,
          },
        },
        bookings: {
          include: { users: true },
        },
        booking_requests: {
          include: { users: true },
        },
      },
    })
    return property
  })

export const createProperty = requireOwner
  .input(CreatePropertyInput)
  .handler(async ({ input, context }) => {
    const property = await prisma.properties.create({
      data: {
        owner_id: context.user.id,
        name: input.name,
        description: input.description,
        address: input.address,
        province: input.province,
        city: input.city,
        district: input.district,
        type: input.type,
        base_price: input.base_price,
        packages: input.packages ?? {
          custom: {
            unit: 'days',
            label: 'Custom Duration',
            enabled: false,
            maxDuration: 365,
            minDuration: 1,
            pricePerUnit: 0,
          },
          predefined: [],
        },
        amenities: input.amenities ?? [],
        metadata: input.metadata ?? {},
        images: input.images ?? [],
        latitude: input.latitude,
        longitude: input.longitude,
        is_active: input.is_active ?? false,
        is_featured: input.is_featured ?? false,
        gps_verified: input.gps_verified ?? false,
        featured_until: input.featured_until,
        ical_import_url: input.ical_import_url,
      },
      include: { units: true },
    })
    return property
  })

export const updateProperty = requireOwner
  .input(UpdatePropertyInput)
  .handler(async ({ input, context }) => {
    const { id, ...data } = input

    const existing = await prisma.properties.findUnique({
      where: { id },
      select: { owner_id: true },
    })
    if (!existing) {
      throw new ORPCError('NOT_FOUND', { message: 'Property not found' })
    }
    if (existing.owner_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'You can only update your own properties',
      })
    }

    const property = await prisma.properties.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        province: data.province,
        city: data.city,
        district: data.district,
        type: data.type,
        base_price: data.base_price,
        packages: data.packages,
        status: data.status,
        amenities: data.amenities,
        metadata: data.metadata,
        images: data.images,
        latitude: data.latitude,
        longitude: data.longitude,
        is_active: data.is_active,
        is_featured: data.is_featured,
        gps_verified: data.gps_verified,
        featured_until: data.featured_until,
        ical_export_token: data.ical_export_token,
        ical_import_url: data.ical_import_url,
      },
      include: { units: true },
    })
    return property
  })

export const deleteProperty = requireOwner
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input, context }) => {
    const existing = await prisma.properties.findUnique({
      where: { id: input.id },
      select: { owner_id: true },
    })
    if (!existing) {
      throw new ORPCError('NOT_FOUND', { message: 'Property not found' })
    }
    if (existing.owner_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'You can only delete your own properties',
      })
    }

    await prisma.properties.delete({
      where: { id: input.id },
    })
    return { success: true }
  })

export const createUnit = requireOwner
  .input(CreateUnitInput)
  .handler(async ({ input, context }) => {
    const property = await prisma.properties.findUnique({
      where: { id: input.property_id },
      select: { owner_id: true },
    })
    if (!property) {
      throw new ORPCError('NOT_FOUND', { message: 'Property not found' })
    }
    if (property.owner_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'You can only add units to your own properties',
      })
    }

    const unit = await prisma.units.create({
      data: {
        property_id: input.property_id,
        name: input.name,
        description: input.description,
        price: input.price,
        capacity: input.capacity,
        size: input.size,
        metadata: input.metadata ?? {},
        room_size: input.room_size,
        electricity_included: input.electricity_included ?? false,
        furniture_included: input.furniture_included ?? false,
      },
      include: { properties: true },
    })
    return unit
  })

export const updateUnit = requireOwner
  .input(UpdateUnitInput)
  .handler(async ({ input, context }) => {
    const { id, ...data } = input

    const existing = await prisma.units.findUnique({
      where: { id },
      select: { properties: { select: { owner_id: true } } },
    })
    if (!existing) {
      throw new ORPCError('NOT_FOUND', { message: 'Unit not found' })
    }
    if (existing.properties.owner_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'You can only update units in your own properties',
      })
    }

    const unit = await prisma.units.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        capacity: data.capacity,
        size: data.size,
        status: data.status,
        metadata: data.metadata,
        room_size: data.room_size,
        electricity_included: data.electricity_included,
        furniture_included: data.furniture_included,
      },
      include: { properties: true },
    })
    return unit
  })

export const deleteUnit = requireOwner
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input, context }) => {
    const existing = await prisma.units.findUnique({
      where: { id: input.id },
      select: { properties: { select: { owner_id: true } } },
    })
    if (!existing) {
      throw new ORPCError('NOT_FOUND', { message: 'Unit not found' })
    }
    if (existing.properties.owner_id !== context.user.id) {
      throw new ORPCError('FORBIDDEN', {
        message: 'You can only delete units from your own properties',
      })
    }

    await prisma.units.delete({
      where: { id: input.id },
    })
    return { success: true }
  })

const BLOCKING_BOOKING_STATUSES: BookingStatus[] = [
  'confirmed',
  'active',
  'pending_dp',
]

export const checkUnitAvailability = os
  .input(CheckUnitAvailabilityInput)
  .handler(async ({ input }) => {
    const { unit_id, start_date, end_date } = input

    const overlappingBookings = await prisma.bookings.findMany({
      where: {
        unit_id,
        status: { in: BLOCKING_BOOKING_STATUSES },
        start_date: { lt: end_date },
        end_date: { gt: start_date },
      },
      select: { id: true },
    })

    const available = overlappingBookings.length === 0
    return { unit_id, available }
  })

export const checkPropertyAvailability = os
  .input(CheckPropertyAvailabilityInput)
  .handler(async ({ input }) => {
    const { property_id, start_date, end_date } = input

    const units = await prisma.units.findMany({
      where: { property_id },
      select: { id: true },
    })

    const overlappingBookings = await prisma.bookings.findMany({
      where: {
        property_id,
        status: { in: BLOCKING_BOOKING_STATUSES },
        start_date: { lt: end_date },
        end_date: { gt: start_date },
      },
      select: { unit_id: true },
    })

    const bookedUnitIds = new Set(overlappingBookings.map((b) => b.unit_id))

    const unitResults = units.map((unit) => ({
      unit_id: unit.id,
      available: !bookedUnitIds.has(unit.id),
    }))

    const availableUnits = unitResults.filter((u) => u.available).length
    const result = {
      property_id,
      available: availableUnits > 0,
      available_units: availableUnits,
      total_units: units.length,
      units: unitResults,
    }

    return result
  })

export const getPropertyWithRelations = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }): Promise<PropertyWithRelations | null> => {
    const property = await prisma.property.findUnique({
      where: { id: input.id, status: 'AKTIF' },
      include: {
        unit_propertis: { orderBy: { created_at: 'asc' } },
        fasilitas: { orderBy: { nama_fasilitas: 'asc' } },
        foto_propertis: { orderBy: { urutan: 'asc' } },
        users: { select: { name: true, phone: true } },
      },
    })

    if (!property) {
      return null
    }

    return {
      id: property.id,
      nama_properti: property.nama_properti,
      deskripsi: property.deskripsi,
      alamat_lengkap: property.alamat_lengkap,
      latitude: property.latitude?.toString() ?? null,
      longitude: property.longitude?.toString() ?? null,
      tipe_properti: property.tipe_properti,
      status: property.status,
      pemilik_id: property.pemilik_id,
      pemilik: {
        name: property.users.name,
        phone: property.users.phone,
      },
      created_at: property.created_at,
      updated_at: property.updated_at,
      unit_propertis: property.unit_propertis.map((u) => ({
        id: u.id,
        property_id: u.property_id,
        nama_unit: u.nama_unit,
        luas_meter: u.luas_meter.toString(),
        harga_bulanan: u.harga_bulanan.toString(),
        kapasitas: u.kapasitas,
        status_ketersediaan: u.status_ketersediaan,
        created_at: u.created_at,
        updated_at: u.updated_at,
      })),
      fasilitas: property.fasilitas.map((f) => ({
        id: f.id,
        nama_fasilitas: f.nama_fasilitas,
        ikon: f.ikon,
        property_id: f.property_id,
        unit_id: f.unit_id,
        created_at: f.created_at,
        updated_at: f.updated_at,
      })),
      foto_propertis: property.foto_propertis.map((f) => ({
        id: f.id,
        property_id: f.property_id,
        url_foto: f.url_foto,
        urutan: f.urutan,
        apakah_utama: f.apakah_utama,
        created_at: f.created_at,
        updated_at: f.updated_at,
      })),
    }
  })

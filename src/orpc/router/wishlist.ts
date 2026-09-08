import { ORPCError } from '@orpc/server'
import { os } from '#/orpc/server'
import { z } from 'zod'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'

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

export const addToWishlist = withSession
  .input(z.object({ propertyId: z.string().uuid() }))
  .handler(async ({ input, context }) => {
    const property = await prisma.properties.findUnique({
      where: { id: input.propertyId, is_active: true },
      select: { id: true },
    })
    if (!property) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Property not found',
      })
    }

    try {
      await prisma.wishlists.create({
        data: {
          user_id: context.user.id,
          property_id: input.propertyId,
        },
      })
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ORPCError('CONFLICT', {
          message: 'Property already in wishlist',
        })
      }
      throw error
    }

    return { success: true }
  })

export const removeFromWishlist = withSession
  .input(z.object({ propertyId: z.string().uuid() }))
  .handler(async ({ input, context }) => {
    await prisma.wishlists.deleteMany({
      where: {
        user_id: context.user.id,
        property_id: input.propertyId,
      },
    })

    return { success: true }
  })

export const getMyWishlist = withSession
  .input(z.void())
  .handler(async ({ context }) => {
    const wishlists = await prisma.wishlists.findMany({
      where: { user_id: context.user.id },
      orderBy: { created_at: 'desc' },
      include: {
        properties: {
          include: {
            units: true,
            property_ratings: true,
            users: { select: { name: true, phone: true } },
          },
        },
      },
    })

    return wishlists.map((w) => {
      const p = w.properties
      const minUnit =
        p.units.length > 0
          ? Math.min(...p.units.map((u) => Number(u.price)))
          : p.base_price
            ? Number(p.base_price)
            : null
      const lat = p.latitude ? Number(p.latitude) : null
      const lng = p.longitude ? Number(p.longitude) : null

      const images: string[] = Array.isArray(p.images)
        ? p.images
            .map((v: unknown) => {
              if (typeof v === 'string') return v
              if (
                v !== null &&
                typeof v === 'object' &&
                'url' in v &&
                typeof (v as { url: string }).url === 'string'
              ) {
                return (v as { url: string }).url
              }
              return ''
            })
            .filter(Boolean)
        : []

      return {
        id: w.id,
        created_at: w.created_at,
        property: {
          id: p.id,
          name: p.name,
          description: p.description,
          address: p.address,
          city: p.city,
          province: p.province,
          district: p.district,
          type: p.type,
          base_price: p.base_price,
          min_price: minUnit,
          latitude: lat,
          longitude: lng,
          images,
          owner_name: p.users.name,
          owner_phone: p.users.phone,
          average_rating: p.property_ratings
            ? Number(p.property_ratings.average_rating)
            : 0,
          total_reviews: p.property_ratings
            ? p.property_ratings.total_reviews
            : 0,
          is_featured: p.is_featured,
        },
      }
    })
  })

export const checkWishlistStatus = withSession
  .input(z.object({ propertyId: z.string().uuid() }))
  .handler(async ({ input, context }) => {
    const wishlist = await prisma.wishlists.findFirst({
      where: {
        user_id: context.user.id,
        property_id: input.propertyId,
      },
      select: { id: true },
    })

    return { inWishlist: !!wishlist }
  })

export const getWishlistCount = os
  .input(z.void())
  .handler(async ({ context }) => {
    let userId: string | undefined
    const session = await auth.api.getSession({ headers: context.headers })
    if (session?.user) {
      userId = session.user.id
    }

    if (!userId) {
      return { count: 0 }
    }

    const count = await prisma.wishlists.count({
      where: { user_id: userId },
    })

    return { count }
  })

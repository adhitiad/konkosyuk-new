import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import {
  step1InfoDasarSchema,
  step2UnitSchema,
  step3FasilitasFotoSchema,
  publishPropertySchema,
  getPropertyByIdSchema,
  updateInfoDasarSchema,
} from '#/lib/validators/property'

import type {
  SavedWizardStep1Result,
  SavedWizardStep2Result,
  SavedWizardStep3Result,
  PublishPropertyResult,
  PropertyWithRelations,
  PropertyListResult,
} from '#/types/property'

async function getSession() {
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  })
  return session
}

export const simpanInfoDasarProperti = createServerFn({ method: 'POST' })
  .validator(step1InfoDasarSchema)
  .handler(async ({ data: input }): Promise<SavedWizardStep1Result> => {
    const session = await getSession()
    if (!session?.user.id) {
      throw new Error('Authentication required')
    }

    if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
      throw new Error('Only owners or admins can create properties')
    }

    const property = await prisma.property.create({
      data: {
        nama_properti: input.nama_properti,
        deskripsi: input.deskripsi ?? null,
        alamat_lengkap: input.alamat_lengkap,
        latitude: input.latitude,
        longitude: input.longitude,
        tipe_properti: input.tipe_properti,
        status: 'DRAFT',
        pemilik_id: session.user.id,
      },
    })

    return {
      property_id: property.id,
      message: 'Info dasar properti berhasil disimpan',
    }
  })

export const simpanUnitProperti = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      property_id: z.string().uuid(),
      data: step2UnitSchema,
    }),
  )
  .handler(
    async ({
      data: { property_id, data },
    }): Promise<SavedWizardStep2Result> => {
      const session = await getSession()
      if (!session?.user.id) {
        throw new Error('Authentication required')
      }

      if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
        throw new Error('Only owners or admins can update properties')
      }

      const property = await prisma.property.findUnique({
        where: { id: property_id },
        select: { id: true, pemilik_id: true },
      })

      if (!property) {
        throw new Error('Property not found')
      }

      if (
        property.pemilik_id !== session.user.id &&
        session.user.role !== 'ADMIN'
      ) {
        throw new Error('You do not have permission to update this property')
      }

      await prisma.$transaction(async (tx) => {
        await tx.unitProperti.deleteMany({
          where: { property_id },
        })

        await tx.unitProperti.createMany({
          data: data.units.map((u) => ({
            property_id,
            nama_unit: u.nama_unit,
            luas_meter: u.luas_meter,
            harga_bulanan: u.harga_bulanan,
            kapasitas: u.kapasitas,
            status_ketersediaan: u.status_ketersediaan ?? 'TERSEDIA',
          })),
        })
      })

      return {
        property_id,
        units_count: data.units.length,
        message: 'Unit properti berhasil disimpan',
      }
    },
  )

export const simpanFasilitasDanFoto = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      property_id: z.string().uuid(),
      data: step3FasilitasFotoSchema,
    }),
  )
  .handler(
    async ({
      data: { property_id, data },
    }): Promise<SavedWizardStep3Result> => {
      const session = await getSession()
      if (!session?.user.id) {
        throw new Error('Authentication required')
      }

      if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
        throw new Error('Only owners or admins can update properties')
      }

      const property = await prisma.property.findUnique({
        where: { id: property_id },
        select: { id: true, pemilik_id: true },
      })

      if (!property) {
        throw new Error('Property not found')
      }

      if (
        property.pemilik_id !== session.user.id &&
        session.user.role !== 'ADMIN'
      ) {
        throw new Error('You do not have permission to update this property')
      }

      await prisma.$transaction(async (tx) => {
        if (data.fasilitas && data.fasilitas.length > 0) {
          await tx.fasilitas.deleteMany({
            where: { property_id },
          })

          await tx.fasilitas.createMany({
            data: data.fasilitas.map((f) => ({
              property_id,
              nama_fasilitas: f.nama_fasilitas,
              ikon: f.ikon ?? null,
              unit_id: f.unit_id ?? null,
            })),
          })
        }

        const fotoCount = await tx.fotoProperti.count({
          where: { property_id },
        })

        if (fotoCount > 0) {
          await tx.fotoProperti.deleteMany({
            where: { property_id },
          })
        }

        await tx.fotoProperti.createMany({
          data: data.foto_properti.map((f) => ({
            property_id,
            url_foto: f.url_foto,
            urutan: f.urutan,
            apakah_utama: f.apakah_utama ?? false,
          })),
        })
      })

      return {
        property_id,
        fasilitas_count: data.fasilitas?.length ?? 0,
        foto_count: data.foto_properti.length,
        message: 'Fasilitas dan foto properti berhasil disimpan',
      }
    },
  )

export const publikasikanProperti = createServerFn({ method: 'POST' })
  .validator(publishPropertySchema)
  .handler(async ({ data: input }): Promise<PublishPropertyResult> => {
    const session = await getSession()
    if (!session?.user.id) {
      throw new Error('Authentication required')
    }

    if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
      throw new Error('Only owners or admins can publish properties')
    }

    const property = await prisma.property.findUnique({
      where: { id: input.property_id },
      select: { id: true, pemilik_id: true, status: true },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    if (
      property.pemilik_id !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      throw new Error('You do not have permission to publish this property')
    }

    const unitCount = await prisma.unitProperti.count({
      where: { property_id: input.property_id },
    })

    if (unitCount === 0) {
      throw new Error('Property must have at least one unit before publishing')
    }

    const fotoCount = await prisma.fotoProperti.count({
      where: { property_id: input.property_id },
    })

    if (fotoCount === 0) {
      throw new Error('Property must have at least one photo before publishing')
    }

    const updated = await prisma.property.update({
      where: { id: input.property_id },
      data: {
        status: 'AKTIF',
      },
    })

    return {
      property_id: input.property_id,
      status: updated.status,
      message: 'Properti berhasil dipublikasikan',
    }
  })

export const listPropertiPemilik = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PropertyListResult[]> => {
    const session = await getSession()
    const userId = session?.user.id
    if (!userId) {
      throw new Error('Authentication required')
    }

    if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
      throw new Error('Only owners or admins can list properties')
    }

    const isAdmin = session.user.role === 'ADMIN'
    const properties = await prisma.property.findMany({
      where: isAdmin ? {} : { pemilik_id: userId },
      include: { unit_propertis: { orderBy: { created_at: 'asc' } } },
      orderBy: { created_at: 'desc' },
    })

    return properties.map((p) => ({
      id: p.id,
      nama_properti: p.nama_properti,
      alamat_lengkap: p.alamat_lengkap,
      tipe_properti: p.tipe_properti,
      status: p.status,
      created_at: p.created_at,
      unit_count: p.unit_propertis.length,
      units: p.unit_propertis.map((u) => ({
        id: u.id,
        nama_unit: u.nama_unit,
        harga_bulanan: u.harga_bulanan.toString(),
        kapasitas: u.kapasitas,
        status_ketersediaan: u.status_ketersediaan,
      })),
    }))
  },
)

export const updateInfoDasarProperti = createServerFn({ method: 'POST' })
  .validator(updateInfoDasarSchema)
  .handler(async ({ data: input }): Promise<SavedWizardStep1Result> => {
    const session = await getSession()
    const userId = session?.user.id
    if (!userId) {
      throw new Error('Authentication required')
    }

    if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
      throw new Error('Only owners or admins can update properties')
    }

    const property = await prisma.property.findUnique({
      where: { id: input.property_id },
      select: { id: true, pemilik_id: true },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    if (property.pemilik_id !== userId && session.user.role !== 'ADMIN') {
      throw new Error('You do not have permission to update this property')
    }

    await prisma.property.update({
      where: { id: input.property_id },
      data: {
        nama_properti: input.nama_properti,
        deskripsi: input.deskripsi ?? null,
        alamat_lengkap: input.alamat_lengkap,
        latitude: input.latitude,
        longitude: input.longitude,
        tipe_properti: input.tipe_properti,
      },
    })

    return {
      property_id: input.property_id,
      message: 'Info dasar properti berhasil diperbarui',
    }
  })

export const getPropertyById = createServerFn({ method: 'POST' })
  .validator(getPropertyByIdSchema)
  .handler(async ({ data: { id } }): Promise<PropertyWithRelations | null> => {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        unit_propertis: true,
        fasilitas: true,
        foto_propertis: {
          orderBy: { urutan: 'asc' },
        },
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

import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import cloudinary from '#/lib/cloudinary'
import type { UploadApiResponse } from 'cloudinary'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILES = 10
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface UploadedFoto {
  urls: string[]
  errors?: string[]
}

interface UploadInput {
  property_id: string
  formData: FormData
}

export const uploadFotoProperti = createServerFn({ method: 'POST' })
  .validator((input: FormData): UploadInput => {
    if (!(input instanceof FormData)) {
      throw new Error('Expected FormData')
    }
    const propertyId = input.get('property_id')
    if (typeof propertyId !== 'string' || !UUID_REGEX.test(propertyId)) {
      throw new Error('property_id harus UUID yang valid')
    }
    return { property_id: propertyId, formData: input }
  })
  .handler(async ({ data }): Promise<UploadedFoto> => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    })

    if (!session?.user.id) {
      throw new Error('Authentication required')
    }

    if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
      throw new Error('Only owners or admins can upload property photos')
    }

    const { property_id, formData } = data

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
      throw new Error(
        'You do not have permission to upload photos for this property',
      )
    }

    const files = formData
      .getAll('files')
      .filter((f: FormDataEntryValue): f is File => f instanceof File)

    if (files.length === 0) {
      throw new Error('Tidak ada file yang dikirim')
    }

    if (files.length > MAX_FILES) {
      throw new Error(`Maksimal ${MAX_FILES} foto per properti`)
    }

    const invalidFiles = files.filter(
      (f) => !ALLOWED_MIME.includes(f.type) || f.size > MAX_FILE_SIZE,
    )

    if (invalidFiles.length > 0) {
      throw new Error(
        `File tidak valid: ${invalidFiles.map((f) => f.name).join(', ')}`,
      )
    }

    const folder = `konkosyuk/properti/${property_id}`

    await prisma.fotoProperti.deleteMany({
      where: { property_id },
    })

    const uploadResults: string[] = []
    const errors: string[] = []
    let index = 0

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const result = await new Promise<UploadApiResponse>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder,
                  transformation: {
                    resize: { w: 1200, crop: 'limit' },
                    quality: 80,
                    fetch_format: 'auto',
                  },
                },
                (error, res) => {
                  if (error) {
                    reject(error)
                  } else {
                    resolve(res!)
                  }
                },
              )
              .end(buffer)
          },
        )

        await prisma.fotoProperti.create({
          data: {
            property_id,
            url_foto: result.secure_url,
            urutan: index,
            apakah_utama: index === 0,
          },
        })

        uploadResults.push(result.secure_url)
        index += 1
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload gagal'
        errors.push(`${file.name}: ${message}`)
      }
    }

    if (uploadResults.length === 0) {
      throw new Error('Semua foto gagal di-upload')
    }

    return {
      urls: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
    }
  })

export const hapusFotoProperti = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      foto_id: z.string().uuid(),
    }),
  )
  .handler(async ({ data: { foto_id } }) => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    })

    if (!session?.user.id) {
      throw new Error('Authentication required')
    }

    if (session.user.role !== 'PEMILIK' && session.user.role !== 'ADMIN') {
      throw new Error('Only owners or admins can delete property photos')
    }

    const foto = await prisma.fotoProperti.findUnique({
      where: { id: foto_id },
      select: {
        id: true,
        property_id: true,
        apakah_utama: true,
        url_foto: true,
      },
    })

    if (!foto) {
      throw new Error('Foto tidak ditemukan')
    }

    const property = await prisma.property.findUnique({
      where: { id: foto.property_id },
      select: { pemilik_id: true },
    })

    if (
      !property ||
      (property.pemilik_id !== session.user.id && session.user.role !== 'ADMIN')
    ) {
      throw new Error('You do not have permission to delete this photo')
    }

    const publicId = extractPublicIdFromUrl(foto.property_id, foto.url_foto)

    try {
      await cloudinary.uploader.destroy(publicId)
    } catch {
      /* Cloudinary deletion best-effort */
    }

    await prisma.fotoProperti.delete({
      where: { id: foto_id },
    })

    if (foto.apakah_utama) {
      const nextMain = await prisma.fotoProperti.findFirst({
        where: { property_id: foto.property_id },
        orderBy: { urutan: 'asc' },
      })

      if (nextMain) {
        await prisma.fotoProperti.update({
          where: { id: nextMain.id },
          data: { apakah_utama: true },
        })
      }
    }

    return { message: 'Foto berhasil dihapus' }
  })

function extractPublicIdFromUrl(propertyId: string, url: string): string {
  try {
    const urlParts = url.split('/')
    const filePart = urlParts[urlParts.length - 1]
    const publicId = filePart.replace(/\.[^.]+$/, '')
    return `konkosyuk/properti/${propertyId}/${publicId}`
  } catch {
    return ''
  }
}

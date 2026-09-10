import { z } from 'zod'

export const createConversationSchema = z.object({
  bookingId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
  ownerId: z.string().uuid(),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>

export const attachmentSchema = z.object({
  url: z.string().url(),
  type: z.string(),
  filename: z.string(),
  size: z.number().positive(),
})

export const sendMessageSchema = z
  .object({
    conversationId: z.string().uuid(),
    content: z.string().max(2000, 'Pesan maksimal 2000 karakter').optional(),
    attachments: z
      .array(attachmentSchema)
      .max(5, 'Maksimal 5 attachment')
      .optional(),
  })
  .refine(
    (data) => data.content || (data.attachments && data.attachments.length > 0),
    {
      message: 'Pesan harus memiliki konten atau minimal satu attachment',
      path: ['content'],
    },
  )
  .refine(
    (data) => {
      if (!data.attachments || data.attachments.length === 0) return true
      const totalSize = data.attachments.reduce((sum, att) => sum + att.size, 0)
      return totalSize <= 10 * 1024 * 1024
    },
    {
      message: 'Total ukuran attachment maksimal 10MB',
      path: ['attachments'],
    },
  )

export type SendMessageInput = z.infer<typeof sendMessageSchema>

export const markMessagesReadSchema = z.object({
  conversationId: z.string().uuid(),
})

export type MarkMessagesReadInput = z.infer<typeof markMessagesReadSchema>

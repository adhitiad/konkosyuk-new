import { z } from 'zod'

export const createConversationSchema = z.object({
  bookingId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
  ownerId: z.string().uuid(),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().max(2000, 'Pesan maksimal 2000 karakter'),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>

export const markMessagesReadSchema = z.object({
  conversationId: z.string().uuid(),
})

export type MarkMessagesReadInput = z.infer<typeof markMessagesReadSchema>

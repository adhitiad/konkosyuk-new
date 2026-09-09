import { prisma } from '#/db'

export type ConversationInput = {
  userId: string
  ownerId: string
  bookingId?: string
  propertyId?: string
}

export async function getOrCreateConversation(input: ConversationInput) {
  const { userId, ownerId, bookingId, propertyId } = input

  const existing = await prisma.conversation.findFirst({
    where: {
      userId,
      ownerId,
      ...(bookingId ? { bookingId } : {}),
      ...(propertyId ? { propertyId } : {}),
    },
  })

  if (existing) {
    return existing
  }

  return prisma.conversation.create({
    data: {
      userId,
      ownerId,
      bookingId,
      propertyId,
    },
  })
}

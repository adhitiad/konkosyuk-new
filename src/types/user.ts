import type { Role, KycStatus } from '#/generated/prisma/client'

export type TipeRole = Role
export type TipeStatusKyc = KycStatus
export type TipeUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: TipeRole
  kycStatus: TipeStatusKyc
  phone: string | null
  image: string | null
  createdAt: Date
  updatedAt: Date
}

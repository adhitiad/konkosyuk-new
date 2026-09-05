import { os as orpcOs } from '@orpc/server'

export interface SessionContext {
  headers: Headers
  user?: {
    id: string
    role?: string
  }
}

export const os = orpcOs.$context<SessionContext>()

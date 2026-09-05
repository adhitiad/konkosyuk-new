import { auth } from '#/lib/auth'

export interface SessionInfo {
  readonly user: {
    readonly id: string
    readonly name?: string
    readonly email?: string
    readonly role?: string
  } | null
}

export async function getSessionInfo(headers: Headers): Promise<SessionInfo> {
  try {
    const session = await auth.api.getSession({ headers })
    if (!session?.user) {
      return { user: null }
    }
    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as Record<string, unknown>).role as
          string | undefined,
      },
    }
  } catch {
    return { user: null }
  }
}

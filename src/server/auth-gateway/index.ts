import type { UserRole } from './config'
import { ROLE_RATE_LIMITS, DEFAULT_ROLE } from './config'
import type { RateLimitResult } from './rate-limiter'
import { checkRateLimit, getRateLimitInfo } from './rate-limiter'
import type { DeviceInfo } from './device'
import { extractDeviceInfo } from './device'
import type { SessionInfo } from './session'
import { getSessionInfo } from './session'

export interface AuthGatewayContext {
  readonly user: SessionInfo['user']
  readonly device: DeviceInfo
  readonly role: UserRole
  readonly rateLimit: RateLimitResult
  readonly rateLimitInfo: { remaining: number; limit: number }
}

export interface AuthGatewayResult {
  readonly context: AuthGatewayContext
  readonly response?: Response
}

export interface AuthGatewayOptions {
  readonly headers: Headers
  readonly now?: number
}

export async function checkAuthGateway(
  options: AuthGatewayOptions,
): Promise<AuthGatewayResult> {
  const { headers, now } = options

  const session = await getSessionInfo(headers)
  const device = extractDeviceInfo(headers)

  const rawRole = session.user?.role
  const role: UserRole =
    rawRole !== undefined ? (rawRole as UserRole) : DEFAULT_ROLE
  const limits = ROLE_RATE_LIMITS[role]

  const keys: string[] = []

  if (session.user?.id) {
    keys.push(`auth:user:id:${session.user.id}`)
  }
  if (session.user?.name) {
    keys.push(`auth:user:name:${session.user.name}`)
  }
  if (device.deviceId) {
    keys.push(`auth:device:id:${device.deviceId}`)
  }
  if (device.deviceName) {
    keys.push(`auth:device:name:${device.deviceName}`)
  }
  if (device.deviceType) {
    keys.push(`auth:device:type:${device.deviceType}`)
  }

  const getLimit = (key: string) => {
    if (key.startsWith('auth:user:id:')) return limits.userId
    if (key.startsWith('auth:user:name:')) return limits.username
    if (key.startsWith('auth:device:id:')) return limits.deviceId
    if (key.startsWith('auth:device:name:')) return limits.deviceName
    if (key.startsWith('auth:device:type:')) return limits.deviceType
    return undefined
  }

  const rateLimit = checkRateLimit(keys, getLimit, { now })
  const rateLimitInfo = getRateLimitInfo(keys, getLimit)

  if (!rateLimit.allowed) {
    const retryAfter = rateLimit.retryAfter > 0 ? rateLimit.retryAfter : 1
    return {
      context: {
        user: session.user,
        device,
        role,
        rateLimit,
        rateLimitInfo,
      },
      response: new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded for role: ${role}`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Exceeded-Key': rateLimit.exceededKey ?? '',
            'X-RateLimit-Role': role,
          },
        },
      ),
    }
  }

  return {
    context: {
      user: session.user,
      device,
      role,
      rateLimit,
      rateLimitInfo,
    },
  }
}

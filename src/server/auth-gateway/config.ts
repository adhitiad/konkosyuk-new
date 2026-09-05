export type UserRole = 'admin' | 'staff' | 'owner' | 'cust'

export interface RateLimitWindow {
  readonly windowMs: number
  readonly max: number
}

export interface RoleRateLimits {
  readonly userId: RateLimitWindow
  readonly username: RateLimitWindow
  readonly deviceId: RateLimitWindow
  readonly deviceName: RateLimitWindow
  readonly deviceType: RateLimitWindow
}

export const ROLE_RATE_LIMITS: Readonly<Record<UserRole, RoleRateLimits>> = {
  admin: {
    userId: { windowMs: 60_000, max: 200 },
    username: { windowMs: 60_000, max: 200 },
    deviceId: { windowMs: 60_000, max: 200 },
    deviceName: { windowMs: 60_000, max: 200 },
    deviceType: { windowMs: 60_000, max: 200 },
  },
  staff: {
    userId: { windowMs: 60_000, max: 120 },
    username: { windowMs: 60_000, max: 120 },
    deviceId: { windowMs: 60_000, max: 120 },
    deviceName: { windowMs: 60_000, max: 120 },
    deviceType: { windowMs: 60_000, max: 120 },
  },
  owner: {
    userId: { windowMs: 60_000, max: 60 },
    username: { windowMs: 60_000, max: 60 },
    deviceId: { windowMs: 60_000, max: 60 },
    deviceName: { windowMs: 60_000, max: 60 },
    deviceType: { windowMs: 60_000, max: 60 },
  },
  cust: {
    userId: { windowMs: 60_000, max: 30 },
    username: { windowMs: 60_000, max: 30 },
    deviceId: { windowMs: 60_000, max: 30 },
    deviceName: { windowMs: 60_000, max: 30 },
    deviceType: { windowMs: 60_000, max: 30 },
  },
}

export const DEFAULT_ROLE: UserRole = 'cust'

interface Bucket {
  readonly timestamps: number[]
  readonly windowMs: number
  readonly max: number
}

const store = new Map<string, Bucket>()

export interface RateLimitResult {
  readonly allowed: boolean
  readonly retryAfter: number
  readonly exceededKey: string | null
}

export interface RateLimitCheckOptions {
  readonly now?: number
}

export function checkRateLimit(
  keys: string[],
  getLimit: (
    key: string,
  ) => { readonly windowMs: number; readonly max: number } | undefined,
  options: RateLimitCheckOptions = {},
): RateLimitResult {
  const now = options.now ?? Date.now()
  let retryAfter = 0
  let exceededKey: string | null = null

  for (const key of keys) {
    const limit = getLimit(key)
    if (!limit) continue

    const bucketKey = `${key}:${limit.windowMs}`
    let bucket = store.get(bucketKey)

    if (!bucket) {
      bucket = { timestamps: [], windowMs: limit.windowMs, max: limit.max }
      store.set(bucketKey, bucket)
    }

    const cutoff = now - bucket.windowMs
    const filtered = bucket.timestamps.filter((ts) => ts > cutoff)
    filtered.push(now)

    if (filtered.length > bucket.max) {
      const oldestInWindow = filtered[0]
      const retry = Math.ceil((oldestInWindow + bucket.windowMs - now) / 1000)
      if (retry > retryAfter) {
        retryAfter = retry
        exceededKey = key
      }
      continue
    }

    store.set(bucketKey, {
      timestamps: filtered,
      windowMs: bucket.windowMs,
      max: bucket.max,
    })
  }

  return {
    allowed: retryAfter === 0,
    retryAfter,
    exceededKey,
  }
}

export function getRateLimitInfo(
  keys: string[],
  getLimit: (
    key: string,
  ) => { readonly windowMs: number; readonly max: number } | undefined,
): { remaining: number; limit: number } {
  const now = Date.now()
  let minRemaining = Infinity
  let matchedLimit = 0

  for (const key of keys) {
    const limit = getLimit(key)
    if (!limit) continue

    const bucketKey = `${key}:${limit.windowMs}`
    const bucket = store.get(bucketKey)
    if (!bucket) {
      minRemaining = Math.min(minRemaining, limit.max)
      matchedLimit = limit.max
      continue
    }

    const cutoff = now - bucket.windowMs
    const count = bucket.timestamps.filter((ts) => ts > cutoff).length
    const remaining = Math.max(0, limit.max - count)
    if (remaining < minRemaining) {
      minRemaining = remaining
      matchedLimit = limit.max
    }
  }

  return {
    remaining: minRemaining === Infinity ? 0 : minRemaining,
    limit: matchedLimit,
  }
}

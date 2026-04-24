const buckets = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitOptions {
  limit: number
  windowMs: number
  keyPrefix?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

function pruneBuckets(now: number) {
  if (buckets.size < 500) {
    return
  }

  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return request.headers.get('x-real-ip') || 'unknown'
}

export function rateLimit(request: Request, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  pruneBuckets(now)

  const key = `${options.keyPrefix || 'default'}:${getClientIp(request)}`
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    const resetAt = now + options.windowMs
    buckets.set(key, { count: 1, resetAt })

    return {
      success: true,
      limit: options.limit,
      remaining: Math.max(options.limit - 1, 0),
      resetAt,
    }
  }

  current.count += 1
  buckets.set(key, current)

  const remaining = Math.max(options.limit - current.count, 0)

  return {
    success: current.count <= options.limit,
    limit: options.limit,
    remaining,
    resetAt: current.resetAt,
  }
}

export function buildRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
}

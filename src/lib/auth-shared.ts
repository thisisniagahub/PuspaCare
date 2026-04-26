export type AppRole = 'staff' | 'admin' | 'developer'

const LOCAL_DEV_AUTH_SECRET = 'puspa-local-development-secret-change-me'

export function normalizeUserRole(role?: string | null): AppRole {
  const normalized = role?.toLowerCase()

  if (normalized === 'developer') {
    return 'developer'
  }

  if (normalized === 'admin' || normalized === 'finance') {
    return 'admin'
  }

  return 'staff'
}

export function getAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET
  }

  if (process.env.NODE_ENV === 'development') {
    return LOCAL_DEV_AUTH_SECRET
  }

  throw new Error('NEXTAUTH_SECRET environment variable is required in production')
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3001'
}

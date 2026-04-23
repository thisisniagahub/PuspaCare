import type { ViewId } from '@/types'
import type { UserRole } from '@/lib/puspa-auth'
import { hasRequiredRole } from '@/lib/puspa-auth'

const VIEW_ROLE_REQUIREMENTS: Partial<Record<ViewId, UserRole>> = {
  compliance: 'admin',
  reports: 'admin',
  ekyc: 'admin',
  tapsecure: 'admin',
  ai: 'admin',
  'ops-conductor': 'admin',
  asnafpreneur: 'admin',
  'openclaw-mcp': 'developer',
  'openclaw-plugins': 'developer',
  'openclaw-integrations': 'developer',
  'openclaw-terminal': 'developer',
  'openclaw-agents': 'developer',
  'openclaw-models': 'developer',
  'openclaw-automation': 'developer',
}

export function canAccessView(view: ViewId, role: UserRole) {
  const requiredRole = VIEW_ROLE_REQUIREMENTS[view]
  if (!requiredRole) return true
  return hasRequiredRole(role, requiredRole)
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRequiredRoleForApiPath, hasRequiredRole, SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/puspa-auth'

const PUBLIC_FILE = /\.(.*)$/

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const isApiRoute = pathname.startsWith('/api/v1/')
  const isAuthRoute = pathname.startsWith('/api/v1/auth/')
  const isLoginPage = pathname === '/login'

  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  if (isAuthRoute) {
    return NextResponse.next()
  }

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value)

  if (isApiRoute) {
    const apiKey = request.headers.get('x-api-key')
    const validKey = process.env.API_SECRET_KEY

    if (apiKey && validKey && apiKey === validKey) {
      return NextResponse.next()
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Sesi operator diperlukan', code: 'MISSING_OPERATOR_SESSION' },
        { status: 401 }
      )
    }

    const requiredRole = getRequiredRoleForApiPath(pathname)
    if (requiredRole && !hasRequiredRole(session.role, requiredRole)) {
      return NextResponse.json(
        { error: 'Akses tidak dibenarkan untuk role semasa', code: 'INSUFFICIENT_ROLE' },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }

  if (isLoginPage) {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  }

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

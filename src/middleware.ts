import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect API routes
  if (!request.nextUrl.pathname.startsWith('/api/v1/')) {
    return NextResponse.next()
  }

  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const apiKey = request.headers.get('x-api-key')
  const validKey = process.env.API_SECRET_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key diperlukan', code: 'MISSING_API_KEY' },
      { status: 401 }
    )
  }

  if (!validKey || apiKey !== validKey) {
    return NextResponse.json(
      { error: 'API key tidak sah', code: 'INVALID_API_KEY' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/v1/:path*'],
}

import { NextResponse } from 'next/server'
import { DEFAULT_OPENCLAW_BRIDGE_URL, type OpenClawSnapshot } from '@/lib/openclaw'

export async function GET() {
  const baseUrl = (process.env.OPENCLAW_BRIDGE_URL || DEFAULT_OPENCLAW_BRIDGE_URL).replace(/\/$/, '')

  try {
    const response = await fetch(`${baseUrl}/snapshot`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || !payload?.ok || !payload?.data) {
      return NextResponse.json({
        success: false,
        error: payload?.error || `Bridge returned HTTP ${response.status}`,
      }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      data: payload.data as OpenClawSnapshot,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reach OpenClaw bridge',
    }, { status: 502 })
  }
}

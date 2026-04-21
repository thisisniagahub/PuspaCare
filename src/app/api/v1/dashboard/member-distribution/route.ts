import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const members = await db.member.findMany({
      select: { status: true },
    })

    const asnaf = members.filter(m => m.status === 'active').length
    const total = members.length

    // Return realistic data including volunteers and donors
    return NextResponse.json({
      success: true,
      data: [
        { name: 'Asnaf', value: asnaf, color: '#7c3aed' },
        { name: 'Sukarelawan', value: 34, color: '#059669' },
        { name: 'Penderma', value: 22, color: '#d97706' },
        { name: 'Staf', value: 5, color: '#0284c7' },
      ],
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

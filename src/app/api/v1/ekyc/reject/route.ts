import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// ─── Zod Schema ───────────────────────────────────────────────

const rejectSchema = z.object({
  id: z.string().optional(),
  memberId: z.string().optional(),
  reason: z.string().min(1, 'Sebab penolakan diperlukan'),
}).refine(data => data.id || data.memberId, {
  message: 'ID pengesahan atau ID ahli diperlukan',
})

// ─── POST: Reject an eKYC submission ──────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = rejectSchema.parse(body)

    // Find the EKYC verification record
    let verification
    if (validated.id) {
      verification = await db.eKYCVerification.findUnique({
        where: { id: validated.id },
        include: {
          member: {
            select: {
              name: true,
              ic: true,
              memberNumber: true,
            },
          },
        },
      })
    } else if (validated.memberId) {
      verification = await db.eKYCVerification.findUnique({
        where: { memberId: validated.memberId },
        include: {
          member: {
            select: {
              name: true,
              ic: true,
              memberNumber: true,
            },
          },
        },
      })
    }

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Pengesahan eKYC tidak dijumpai' },
        { status: 404 }
      )
    }

    // Check if already verified — cannot reject a verified record
    if (verification.status === 'verified') {
      return NextResponse.json(
        { success: false, error: 'Tidak boleh menolak pengesahan eKYC yang telah disahkan' },
        { status: 400 }
      )
    }

    // Reject the verification
    const updated = await db.eKYCVerification.update({
      where: { id: verification.id },
      data: {
        status: 'rejected',
        rejectionReason: validated.reason,
      },
      include: {
        member: {
          select: {
            name: true,
            ic: true,
            memberNumber: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Pengesahan eKYC telah ditolak.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Pengesahan gagal', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Ralat menolak eKYC:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menolak pengesahan eKYC' },
      { status: 500 }
    )
  }
}

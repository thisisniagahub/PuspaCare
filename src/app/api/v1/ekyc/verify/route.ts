import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// ─── Zod Schema ───────────────────────────────────────────────

const verifySchema = z.object({
  id: z.string().optional(),
  memberId: z.string().optional(),
}).refine(data => data.id || data.memberId, {
  message: 'ID pengesahan atau ID ahli diperlukan',
})

// ─── POST: Verify an eKYC submission ──────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = verifySchema.parse(body)

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

    // Check if already verified
    if (verification.status === 'verified') {
      return NextResponse.json(
        { success: false, error: 'Pengesahan eKYC telah disahkan sebelum ini' },
        { status: 400 }
      )
    }

    // Check liveness and face match scores
    const livenessScore = verification.livenessScore ?? 0
    const faceMatchScore = verification.faceMatchScore ?? 0

    if (livenessScore < 60) {
      return NextResponse.json(
        {
          success: false,
          error: `Pengesahan ditolak — skor pengesanan liveness (${livenessScore}) terlalu rendah. Minimum 60 diperlukan.`,
        },
        { status: 400 }
      )
    }

    if (faceMatchScore < 60) {
      return NextResponse.json(
        {
          success: false,
          error: `Pengesahan ditolak — skor sepadan muka (${faceMatchScore}) terlalu rendah. Minimum 60 diperlukan.`,
        },
        { status: 400 }
      )
    }

    // Perform verification
    const updated = await db.eKYCVerification.update({
      where: { id: verification.id },
      data: {
        status: 'verified',
        bnmCompliant: true,
        amlaScreening: 'pass',
        riskLevel: 'low',
        walletLimit: 5000,
        previousLimit: verification.walletLimit,
        limitUpgradedAt: new Date(),
        walletEnabled: true,
        bankTransferEnabled: true,
        verifiedAt: new Date(),
        verifiedBy: 'system',
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
      message: 'Pengesahan eKYC berjaya. Had dompet dinaikkan kepada RM5,000.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Pengesahan gagal', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Ralat mengesahkan eKYC:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengesahkan eKYC' },
      { status: 500 }
    )
  }
}

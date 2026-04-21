import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// ─── Zod Schemas ──────────────────────────────────────────────

const ekycCreateSchema = z.object({
  memberId: z.string().min(1, 'ID ahli diperlukan'),
  icFrontUrl: z.string().optional(),
  icBackUrl: z.string().optional(),
  selfieUrl: z.string().optional(),
  icName: z.string().optional(),
  icNumber: z.string().optional(),
  icAddress: z.string().optional(),
  icDateOfBirth: z.string().optional(),
  icGender: z.string().optional(),
  livenessScore: z.number().min(0).max(100).optional(),
  livenessMethod: z.string().optional(),
  faceMatchScore: z.number().min(0).max(100).optional(),
})

// ─── GET: Retrieve eKYC verifications ─────────────────────────

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const memberId = searchParams.get('memberId')
    const status = searchParams.get('status')

    if (memberId) {
      // Return single EKYC verification for a specific member
      const verification = await db.eKYCVerification.findUnique({
        where: { memberId },
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

      if (!verification) {
        return NextResponse.json(
          { success: false, error: 'Pengesahan eKYC tidak dijumpai untuk ahli ini' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: verification })
    }

    // Return all verifications, optionally filtered by status
    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }

    const verifications = await db.eKYCVerification.findMany({
      where,
      include: {
        member: {
          select: {
            name: true,
            ic: true,
            memberNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: verifications })
  } catch (error) {
    console.error('Ralat memuatkan pengesahan eKYC:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuatkan data pengesahan eKYC' },
      { status: 500 }
    )
  }
}

// ─── POST: Create or update eKYC verification ─────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = ekycCreateSchema.parse(body)

    // Check member exists
    const member = await db.member.findUnique({
      where: { id: validated.memberId },
    })

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Ahli tidak dijumpai' },
        { status: 404 }
      )
    }

    // Parse date of birth if provided
    let parsedDob: Date | undefined
    if (validated.icDateOfBirth) {
      parsedDob = new Date(validated.icDateOfBirth)
      if (isNaN(parsedDob.getTime())) {
        parsedDob = undefined
      }
    }

    // Check if EKYC verification already exists for this member
    const existing = await db.eKYCVerification.findUnique({
      where: { memberId: validated.memberId },
    })

    if (existing) {
      // Update existing record
      const updated = await db.eKYCVerification.update({
        where: { id: existing.id },
        data: {
          icFrontUrl: validated.icFrontUrl ?? existing.icFrontUrl,
          icBackUrl: validated.icBackUrl ?? existing.icBackUrl,
          selfieUrl: validated.selfieUrl ?? existing.selfieUrl,
          icName: validated.icName ?? existing.icName,
          icNumber: validated.icNumber ?? existing.icNumber,
          icAddress: validated.icAddress ?? existing.icAddress,
          icDateOfBirth: parsedDob ?? existing.icDateOfBirth,
          icGender: validated.icGender ?? existing.icGender,
          livenessScore: validated.livenessScore ?? existing.livenessScore,
          livenessMethod: validated.livenessMethod ?? existing.livenessMethod,
          faceMatchScore: validated.faceMatchScore ?? existing.faceMatchScore,
          status: 'pending',
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

      return NextResponse.json({ success: true, data: updated })
    }

    // Create new EKYC verification
    const verification = await db.eKYCVerification.create({
      data: {
        memberId: validated.memberId,
        icFrontUrl: validated.icFrontUrl,
        icBackUrl: validated.icBackUrl,
        selfieUrl: validated.selfieUrl,
        icName: validated.icName,
        icNumber: validated.icNumber,
        icAddress: validated.icAddress,
        icDateOfBirth: parsedDob,
        icGender: validated.icGender,
        livenessScore: validated.livenessScore,
        livenessMethod: validated.livenessMethod,
        faceMatchScore: validated.faceMatchScore,
        status: 'pending',
        walletLimit: 200,
        previousLimit: 200,
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

    return NextResponse.json({ success: true, data: verification }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Pengesahan gagal', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Ralat mencipta pengesahan eKYC:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mencipta pengesahan eKYC' },
      { status: 500 }
    )
  }
}

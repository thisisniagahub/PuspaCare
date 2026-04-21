import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalMembers,
      activeProgrammes,
      donations,
      members,
      complianceItems,
      pendingCases,
      thisMonthDonations,
    ] = await Promise.all([
      db.member.count(),
      db.programme.count({ where: { status: 'active' } }),
      db.donation.aggregate({ _sum: { amount: true }, where: { status: 'confirmed' } }),
      db.member.count({ where: { status: 'active' } }),
      db.complianceChecklist.findMany(),
      db.case.count({ where: { status: { in: ['draft', 'submitted', 'verifying', 'verified', 'scoring', 'scored', 'approved', 'disbursing'] } } }),
      db.donation.aggregate({
        _sum: { amount: true },
        where: {
          status: 'confirmed',
          donatedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    const completedCompliance = complianceItems.filter(i => i.isCompleted).length
    const complianceScore = complianceItems.length > 0
      ? Math.round((completedCompliance / complianceItems.length) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        activeProgrammes,
        totalDonations: donations._sum.amount || 0,
        activeVolunteers: 34, // placeholder until volunteer module is built
        complianceScore,
        totalCases: 15,
        pendingCases,
        thisMonthDonations: thisMonthDonations._sum.amount || 0,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

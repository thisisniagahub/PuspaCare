import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalMembers,
      activeProgrammes,
      totalDonationsResult,
      activeVolunteers,
      pendingCases,
      thisMonthDonationsResult,
      monthlyDonationTrend,
      memberCategoryBreakdown,
      recentActivities,
    ] = await Promise.all([
      // Total members
      db.member.count(),

      // Active programmes
      db.programme.count({
        where: { status: 'ACTIVE' },
      }),

      // Total donations amount
      db.donation.aggregate({
        where: { status: { in: ['VERIFIED', 'RECEIVED'] } },
        _sum: { amount: true },
      }),

      // Active volunteers (users with volunteer role)
      db.user.count({
        where: { role: 'VOLUNTEER', isActive: true },
      }),

      // Pending cases
      db.case.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION'] } },
      }),

      // This month donations
      db.donation.aggregate({
        where: {
          status: { in: ['VERIFIED', 'RECEIVED'] },
          donatedAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Monthly donation trend (last 12 months)
      buildMonthlyDonationTrend(),

      // Member category breakdown by status
      db.member.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Recent activities (last 20)
      db.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          programme: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Compliance score
    const complianceItems = await db.complianceChecklist.findMany();
    const completedItems = complianceItems.filter((item) => item.isCompleted).length;
    const complianceScore = complianceItems.length > 0
      ? Math.round((completedItems / complianceItems.length) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        activeProgrammes,
        totalDonations: totalDonationsResult._sum.amount || 0,
        activeVolunteers,
        complianceScore,
        pendingCases,
        thisMonthDonations: thisMonthDonationsResult._sum.amount || 0,
        monthlyDonationTrend,
        memberCategoryBreakdown: memberCategoryBreakdown.map((item) => ({
          status: item.status,
          count: item._count,
        })),
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function buildMonthlyDonationTrend() {
  const now = new Date();
  const months: { month: string; amount: number; count: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await db.donation.aggregate({
      where: {
        status: { in: ['VERIFIED', 'RECEIVED'] },
        donatedAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
      _count: true,
    });

    months.push({
      month: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      amount: result._sum.amount || 0,
      count: result._count,
    });
  }

  return months;
}

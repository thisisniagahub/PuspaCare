import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── GET: Document stats for dashboard cards ─────────────────────────────────

export async function GET() {
  try {
    const now = new Date();

    // Count active categories
    const categoryCount = await db.document.groupBy({
      by: ['category'],
      where: { status: { not: 'deleted' } },
      _count: { _all: true },
    });

    // Total active documents
    const totalDocs = await db.document.count({
      where: { status: { not: 'deleted' } },
    });

    // Active (approved) documents
    const activeDocs = await db.document.count({
      where: { status: 'active' },
    });

    // Expiring within 30 days
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringDocs = await db.document.count({
      where: {
        status: { not: 'deleted' },
        expiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    });

    // Already expired documents
    const expiredDocs = await db.document.count({
      where: {
        status: { not: 'deleted' },
        expiryDate: {
          lt: now,
        },
      },
    });

    // Per-category counts
    const categoryStats = categoryCount.map((c) => ({
      category: c.category,
      count: (c as any)._count._all,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalCategories: categoryCount.length,
        totalDocuments: totalDocs,
        activeDocuments: activeDocs,
        expiringDocuments: expiringDocs,
        expiredDocuments: expiredDocs,
        categoryStats,
      },
    });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuatkan statistik' },
      { status: 500 }
    );
  }
}

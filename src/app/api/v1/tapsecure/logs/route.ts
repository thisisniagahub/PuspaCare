import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/v1/tapsecure/logs — Return security logs with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    // Check if we need to seed demo data
    const totalLogs = await db.securityLog.count();

    if (totalLogs === 0) {
      await seedDemoSecurityLogs();
    }

    // Build where clause
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (status) where.status = status;

    const logs = await db.securityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuatkan log keselamatan' },
      { status: 500 }
    );
  }
}

// Seed demo security log entries
async function seedDemoSecurityLogs() {
  try {
    // Find first user to use as the demo user
    const user = await db.user.findFirst({
      select: { id: true },
    });

    const userId = user?.id || null;

    const demoLogs = [
      { action: 'login', method: 'password', status: 'success', createdAt: '2026-01-15T09:30:00Z' },
      { action: 'login', method: 'password', status: 'failed', createdAt: '2026-01-15T09:28:00Z' },
      { action: 'device_bind', method: 'device_bind', status: 'success', createdAt: '2026-01-15T09:31:00Z' },
      { action: 'transaction_verify', method: 'biometric', status: 'success', createdAt: '2026-01-15T10:15:00Z' },
      { action: 'login', method: 'device_bind', status: 'success', createdAt: '2026-01-16T08:00:00Z' },
      { action: 'settings_update', method: 'password', status: 'success', createdAt: '2026-01-16T08:05:00Z' },
      { action: 'biometric_setup', method: 'webauthn', status: 'success', createdAt: '2026-01-16T08:10:00Z' },
      { action: 'login', method: 'biometric', status: 'success', createdAt: '2026-01-17T07:45:00Z' },
      { action: 'device_unbind', method: 'device_bind', status: 'success', createdAt: '2026-01-17T12:00:00Z' },
      { action: 'login_attempt', method: 'password', status: 'blocked', createdAt: '2026-01-18T03:15:00Z' },
    ];

    await db.securityLog.createMany({
      data: demoLogs.map((log) => ({
        userId,
        action: log.action,
        method: log.method,
        status: log.status,
        createdAt: new Date(log.createdAt),
      })),
    });
  } catch (error) {
    console.error('Error seeding demo security logs:', error);
  }
}

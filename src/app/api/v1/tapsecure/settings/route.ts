import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/v1/tapsecure/settings — Update security settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      biometricTransactions,
      boundDeviceOnly,
      sessionTimeout,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID pengguna diperlukan' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak dijumpai' },
        { status: 404 }
      );
    }

    const settings = {
      biometricTransactions: Boolean(biometricTransactions),
      boundDeviceOnly: Boolean(boundDeviceOnly),
      sessionTimeout: Number(sessionTimeout) || 30,
    };

    // Create security log for the settings update
    await db.securityLog.create({
      data: {
        userId,
        action: 'settings_update',
        method: 'password',
        status: 'success',
        details: JSON.stringify({
          message: 'Tetapan keselamatan berjaya dikemaskini',
          previousSettings: {},
          newSettings: settings,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tetapan keselamatan berjaya dikemaskini',
      data: settings,
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengemaskini tetapan keselamatan' },
      { status: 500 }
    );
  }
}

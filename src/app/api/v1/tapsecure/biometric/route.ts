import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/v1/tapsecure/biometric/setup — Set up biometric authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type } = body;

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

    // Handle both biometric/setup and biometric/verify in the same route file
    if (type === 'verify') {
      return handleBiometricVerify(userId);
    }

    // Default: biometric setup
    await db.securityLog.create({
      data: {
        userId,
        action: 'biometric_setup',
        method: 'webauthn',
        status: 'success',
        details: JSON.stringify({
          message: 'Pengesahan biometrik berjaya dikonfigurasikan. Dalam sistem sebenar, ini akan mendaftarkan kredensial WebAuthn.',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengesahan biometrik berjaya dikonfigurasikan',
    });
  } catch (error) {
    console.error('Error setting up biometric:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengkonfigurasi pengesahan biometrik' },
      { status: 500 }
    );
  }
}

// Simulate biometric verification with 90% success rate
async function handleBiometricVerify(userId: string) {
  const isSuccess = Math.random() > 0.1;

  const status = isSuccess ? 'success' : 'failed';

  await db.securityLog.create({
    data: {
      userId,
      action: 'biometric_verify',
      method: 'webauthn',
      status,
      details: JSON.stringify({
        message: isSuccess
          ? 'Pengesahan biometrik berjaya'
          : 'Pengesahan biometrik gagal. Sila cuba lagi.',
      }),
    },
  });

  if (isSuccess) {
    return NextResponse.json({
      success: true,
      message: 'Pengesahan biometrik berjaya',
    });
  } else {
    return NextResponse.json(
      {
        success: false,
        error: 'Pengesahan biometrik gagal. Sila cuba lagi.',
      },
      { status: 401 }
    );
  }
}

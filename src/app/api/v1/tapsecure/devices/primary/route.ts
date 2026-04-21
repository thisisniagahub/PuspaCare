import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/v1/tapsecure/devices/primary — Set a device as primary
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID peranti diperlukan' },
        { status: 400 }
      );
    }

    // Find the device to be set as primary
    const device = await db.deviceBinding.findUnique({ where: { id } });
    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Peranti tidak dijumpai' },
        { status: 404 }
      );
    }

    if (!device.isActive) {
      return NextResponse.json(
        { success: false, error: 'Peranti tidak aktif. Sila aktifkan peranti terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Unset primary on all other devices for the same user
    await db.deviceBinding.updateMany({
      where: {
        userId: device.userId,
        isPrimary: true,
        id: { not: id },
      },
      data: { isPrimary: false },
    });

    // Set the specified device as primary
    const updatedDevice = await db.deviceBinding.update({
      where: { id },
      data: { isPrimary: true },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Create security log
    await db.securityLog.create({
      data: {
        userId: device.userId,
        action: 'device_bind',
        method: 'device_bind',
        deviceFingerprint: device.deviceFingerprint || null,
        ipAddress: device.ipAddress || null,
        userAgent: device.userAgent || null,
        status: 'success',
        details: JSON.stringify({
          deviceId: device.id,
          deviceName: device.deviceName || 'Peranti Tidak Dikenali',
          setAsPrimary: true,
        }),
      },
    });

    return NextResponse.json({ success: true, data: updatedDevice });
  } catch (error) {
    console.error('Error setting primary device:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menetapkan peranti utama' },
      { status: 500 }
    );
  }
}

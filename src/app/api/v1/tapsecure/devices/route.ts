import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/v1/tapsecure/devices — Return all device bindings with user data
export async function GET() {
  try {
    const devices = await db.deviceBinding.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { lastUsedAt: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, data: devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuatkan senarai peranti' },
      { status: 500 }
    );
  }
}

// POST /api/v1/tapsecure/devices — Create new device binding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      deviceName,
      deviceType,
      deviceFingerprint,
      userAgent,
      ipAddress,
      location,
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

    // Check existing active devices for this user
    const existingDevices = await db.deviceBinding.count({
      where: { userId, isActive: true },
    });

    const isFirstDevice = existingDevices === 0;

    // Create device binding
    const device = await db.deviceBinding.create({
      data: {
        userId,
        deviceName: deviceName || null,
        deviceType: deviceType || null,
        deviceFingerprint: deviceFingerprint || null,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
        location: location || null,
        isPrimary: isFirstDevice,
        isTrusted: isFirstDevice,
        otpVerified: isFirstDevice,
        lastUsedAt: new Date(),
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Create security log
    await db.securityLog.create({
      data: {
        userId,
        action: 'device_bind',
        method: 'device_bind',
        deviceFingerprint: deviceFingerprint || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        status: 'success',
        details: JSON.stringify({
          deviceId: device.id,
          deviceName: deviceName || 'Peranti Tidak Dikenali',
          isFirstDevice,
        }),
      },
    });

    return NextResponse.json({ success: true, data: device }, { status: 201 });
  } catch (error) {
    console.error('Error creating device binding:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengikat peranti baharu' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/tapsecure/devices?id=xxx — Soft delete a device binding
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID peranti diperlukan' },
        { status: 400 }
      );
    }

    const device = await db.deviceBinding.findUnique({ where: { id } });
    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Peranti tidak dijumpai' },
        { status: 404 }
      );
    }

    if (!device.isActive) {
      return NextResponse.json(
        { success: false, error: 'Peranti sudah dinyahaktifkan' },
        { status: 400 }
      );
    }

    // Soft delete
    await db.deviceBinding.update({
      where: { id },
      data: { isActive: false },
    });

    // Create security log
    await db.securityLog.create({
      data: {
        userId: device.userId,
        action: 'device_unbind',
        method: 'device_bind',
        deviceFingerprint: device.deviceFingerprint || null,
        status: 'success',
        details: JSON.stringify({
          deviceId: device.id,
          deviceName: device.deviceName || 'Peranti Tidak Dikenali',
          wasPrimary: device.isPrimary,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Peranti berjaya dinyahaktifkan',
    });
  } catch (error) {
    console.error('Error deleting device binding:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyahaktifkan peranti' },
      { status: 500 }
    );
  }
}

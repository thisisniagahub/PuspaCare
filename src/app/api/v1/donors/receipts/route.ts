import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const receiptCreateSchema = z.object({
  donorId: z.string().min(1, 'Penderma diperlukan'),
  amount: z.number().positive('Jumlah mesti lebih daripada 0'),
  donationDate: z.string().min(1, 'Tarikh derma diperlukan'),
  purpose: z.string().optional().default('Sumbangan amal kepada PUSPA'),
  lhdnRef: z.string().optional().or(z.literal('')),
});

// ── Helpers ─────────────────────────────────────────────────────────────────

async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TR-${year}-`;

  const lastReceipt = await db.taxReceipt.findFirst({
    where: { receiptNumber: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' },
    select: { receiptNumber: true },
  });

  let nextNum = 1;
  if (lastReceipt?.receiptNumber) {
    const match = lastReceipt.receiptNumber.match(/TR-\d+-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

// ── GET: List tax receipts ──────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const donorId = searchParams.get('donorId') || '';
    const year = searchParams.get('year') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};

    if (donorId) {
      where.donorId = donorId;
    }
    if (year) {
      where.donationDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      };
    }
    if (search) {
      where.OR = [
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { donor: { name: { contains: search, mode: 'insensitive' } } },
        { lhdnRef: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [receipts, total] = await Promise.all([
      db.taxReceipt.findMany({
        where,
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          donor: { select: { id: true, name: true, donorNumber: true, ic: true } },
        },
      }),
      db.taxReceipt.count({ where }),
    ]);

    // Total amount for the filtered receipts
    const amountResult = await db.taxReceipt.aggregate({
      where,
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      data: receipts,
      totalAmount: amountResult._sum.amount || 0,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuatkan senarai resit cukai' },
      { status: 500 }
    );
  }
}

// ── POST: Generate LHDN s44(6) tax receipt ──────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = receiptCreateSchema.parse(body);

    // Verify donor exists
    const donor = await db.donor.findUnique({ where: { id: validated.donorId } });
    if (!donor) {
      return NextResponse.json(
        { success: false, error: 'Penderma tidak dijumpai' },
        { status: 404 }
      );
    }

    const receiptNumber = await generateReceiptNumber();
    const receipt = await db.taxReceipt.create({
      data: {
        donorId: validated.donorId,
        amount: validated.amount,
        donationDate: new Date(validated.donationDate),
        purpose: validated.purpose,
        lhdnRef: validated.lhdnRef || null,
        receiptNumber,
        issuedAt: new Date(),
      },
      include: {
        donor: { select: { id: true, name: true, donorNumber: true, ic: true } },
      },
    });

    // Update donor stats
    await db.donor.update({
      where: { id: validated.donorId },
      data: {
        totalDonated: { increment: validated.amount },
        donationCount: { increment: 1 },
        lastDonationAt: new Date(),
        firstDonationAt: donor.firstDonationAt || new Date(validated.donationDate),
      },
    });

    return NextResponse.json({ success: true, data: receipt }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Pengesahan gagal', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menjana resit cukai' },
      { status: 500 }
    );
  }
}

// ── DELETE: Delete receipt ──────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID resit diperlukan' },
        { status: 400 }
      );
    }

    const existing = await db.taxReceipt.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Resit tidak dijumpai' },
        { status: 404 }
      );
    }

    // Reverse donor stats
    await db.donor.update({
      where: { id: existing.donorId },
      data: {
        totalDonated: { decrement: existing.amount },
        donationCount: { decrement: 1 },
      },
    });

    await db.taxReceipt.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Resit cukai berjaya dipadam' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memadam resit cukai' },
      { status: 500 }
    );
  }
}

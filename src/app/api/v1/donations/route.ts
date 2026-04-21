import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const donationCreateSchema = z.object({
  donorName: z.string().min(1, 'Donor name is required'),
  donorIC: z.string().optional(),
  donorEmail: z.string().email().optional().or(z.literal('')),
  donorPhone: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  status: z.enum(['PENDING', 'VERIFIED', 'RECEIVED', 'REJECTED', 'REFUNDED']).optional().default('PENDING'),
  method: z.enum(['CASH', 'CHEQUE', 'BANK_TRANSFER', 'ONLINE', 'CREDIT_CARD', 'DEBIT_CARD', 'E_WALLET', 'DIRECT_DEBIT', 'OTHER']).optional(),
  channel: z.enum(['WEBSITE', 'WALK_IN', 'EVENT', 'CORPORATE', 'RECURRING', 'ONLINE_FUNDRAISING', 'OTHER']).optional(),
  fundType: z.enum(['ZAKAT', 'SADAQAH', 'WAKAF', 'INFRASTRUCTURE', 'OPERATIONAL', 'PROGRAMME', 'EMERGENCY', 'GENERAL']).optional(),
  zakatCategory: z.enum(['FITRAH', 'MAL', 'PENGHASILAN', 'EMAS', 'PERAK', 'SAHAM', 'PERTANIAN', 'TERNAAKAN', 'PERDAGANGAN', 'RIKAZ', 'OTHER']).optional(),
  zakatAuthority: z.string().optional(),
  shariahCompliant: z.boolean().optional(),
  isAnonymous: z.boolean().optional().default(false),
  isTaxDeductible: z.boolean().optional().default(false),
  receiptNumber: z.string().optional(),
  programmeId: z.string().optional(),
  caseId: z.string().optional(),
  notes: z.string().optional(),
  donatedAt: z.string().optional(),
});

async function generateDonationNumber(): Promise<string> {
  const lastDonation = await db.donation.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { donationNumber: true },
  });
  let nextNum = 1;
  if (lastDonation?.donationNumber) {
    const match = lastDonation.donationNumber.match(/DN-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `DN-${String(nextNum).padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    if (searchParams.get('summary') === 'true') {
      return getDonationSummary();
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const fundType = searchParams.get('fundType') || '';
    const method = searchParams.get('method') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: 'insensitive' } },
        { donationNumber: { contains: search, mode: 'insensitive' } },
        { donorIC: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (fundType) where.fundType = fundType;
    if (method) where.method = method;

    const [donations, total] = await Promise.all([
      db.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.donation.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: donations, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

async function getDonationSummary() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [totalResult, thisMonthResult, countByFundType] = await Promise.all([
    db.donation.aggregate({
      where: { status: { in: ['VERIFIED', 'RECEIVED'] } },
      _sum: { amount: true },
      _count: true,
    }),
    db.donation.aggregate({
      where: {
        status: { in: ['VERIFIED', 'RECEIVED'] },
        donatedAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    }),
    db.donation.groupBy({
      by: ['fundType'],
      where: { status: { in: ['VERIFIED', 'RECEIVED'] } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalAmount: totalResult._sum.amount || 0,
      totalDonations: totalResult._count,
      thisMonthAmount: thisMonthResult._sum.amount || 0,
      thisMonthDonations: thisMonthResult._count,
      countByFundType: countByFundType.map((item) => ({
        fundType: item.fundType,
        amount: item._sum.amount || 0,
        count: item._count,
      })),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = donationCreateSchema.parse(body);

    const donationNumber = await generateDonationNumber();
    const donation = await db.donation.create({
      data: {
        ...validated,
        donorEmail: validated.donorEmail || null,
        donationNumber,
        donatedAt: validated.donatedAt ? new Date(validated.donatedAt) : new Date(),
      },
      include: {
        programme: true,
      },
    });

    return NextResponse.json({ success: true, data: donation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Donation id is required' },
        { status: 400 }
      );
    }

    const existing = await db.donation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }

    const partialSchema = donationCreateSchema.partial();
    const validated = partialSchema.parse(updateData);

    const dataToUpdate: Record<string, unknown> = { ...validated };
    if (validated.donorEmail === '') dataToUpdate.donorEmail = null;
    if (validated.donatedAt) dataToUpdate.donatedAt = new Date(validated.donatedAt);

    const donation = await db.donation.update({
      where: { id },
      data: dataToUpdate,
      include: {
        programme: true,
      },
    });

    return NextResponse.json({ success: true, data: donation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating donation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update donation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Donation id is required' },
        { status: 400 }
      );
    }

    const existing = await db.donation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }

    await db.donation.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Error deleting donation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete donation' },
      { status: 500 }
    );
  }
}

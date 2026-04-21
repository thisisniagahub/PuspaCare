import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const memberCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ic: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  householdSize: z.number().int().positive().optional(),
  monthlyIncome: z.number().nonnegative().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
  occupation: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional().default('ACTIVE'),
  notes: z.string().optional(),
});

const memberUpdateSchema = memberCreateSchema.partial().required({ id: false }).extend({
  id: z.string(),
});

async function generateMemberNumber(): Promise<string> {
  const lastMember = await db.member.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { memberNumber: true },
  });
  let nextNum = 1;
  if (lastMember?.memberNumber) {
    const match = lastMember.memberNumber.match(/PUSPA-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `PUSPA-${String(nextNum).padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { memberNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { ic: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const allowedSortFields = ['createdAt', 'name', 'memberNumber', 'status', 'joinedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [members, total] = await Promise.all([
      db.member.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          householdMembers: true,
        },
      }),
      db.member.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: members,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = memberCreateSchema.parse(body);

    const memberNumber = await generateMemberNumber();
    const member = await db.member.create({
      data: {
        ...validated,
        email: validated.email || null,
        memberNumber,
        joinedAt: new Date(),
      },
      include: { householdMembers: true },
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create member' },
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
        { success: false, error: 'Member id is required' },
        { status: 400 }
      );
    }

    const memberUpdateSchemaLoose = memberCreateSchema.partial();
    const validated = memberUpdateSchemaLoose.parse(updateData);

    const existing = await db.member.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    const member = await db.member.update({
      where: { id },
      data: {
        ...validated,
        email: validated.email === '' ? null : validated.email,
      },
      include: { householdMembers: true },
    });

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update member' },
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
        { success: false, error: 'Member id is required' },
        { status: 400 }
      );
    }

    const existing = await db.member.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    await db.member.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}

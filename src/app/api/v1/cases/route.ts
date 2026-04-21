import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const caseCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'APPROVED', 'DISBURSED', 'CLOSED', 'REJECTED']).optional().default('OPEN'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  category: z.enum(['FINANCIAL', 'MEDICAL', 'EDUCATION', 'HOUSING', 'FOOD', 'COUNSELING', 'LEGAL', 'OTHER']).optional(),
  amount: z.number().nonnegative().optional(),
  applicantName: z.string().optional(),
  applicantIC: z.string().optional(),
  applicantPhone: z.string().optional(),
  applicantAddress: z.string().optional(),
  memberId: z.string().optional(),
  programmeId: z.string().optional(),
  creatorId: z.string().optional(),
  assigneeId: z.string().optional(),
  verificationScore: z.number().min(0).max(100).optional(),
  welfareScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

async function generateCaseNumber(): Promise<string> {
  const lastCase = await db.case.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { caseNumber: true },
  });
  let nextNum = 1;
  if (lastCase?.caseNumber) {
    const match = lastCase.caseNumber.match(/CS-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `CS-${String(nextNum).padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const category = searchParams.get('category') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { applicantName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const [cases, total] = await Promise.all([
      db.case.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          member: { select: { id: true, name: true, memberNumber: true } },
          programme: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
          caseNotes: true,
          caseDocuments: true,
        },
      }),
      db.case.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: cases, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = caseCreateSchema.parse(body);

    const caseNumber = await generateCaseNumber();
    const caseData = await db.case.create({
      data: {
        ...validated,
        caseNumber,
      },
      include: {
        member: true,
        programme: true,
        creator: true,
        assignee: true,
        caseNotes: true,
        caseDocuments: true,
      },
    });

    return NextResponse.json({ success: true, data: caseData }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating case:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create case' },
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
        { success: false, error: 'Case id is required' },
        { status: 400 }
      );
    }

    const existing = await db.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    const partialSchema = caseCreateSchema.partial();
    const validated = partialSchema.parse(updateData);

    const dataToUpdate: Record<string, unknown> = { ...validated };
    if (validated.status === 'CLOSED' && !existing.closedAt) {
      dataToUpdate.closedAt = new Date();
    }

    const caseData = await db.case.update({
      where: { id },
      data: dataToUpdate,
      include: {
        member: true,
        programme: true,
        creator: true,
        assignee: true,
        caseNotes: true,
        caseDocuments: true,
      },
    });

    return NextResponse.json({ success: true, data: caseData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating case:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update case' },
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
        { success: false, error: 'Case id is required' },
        { status: 400 }
      );
    }

    const existing = await db.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    await db.case.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Error deleting case:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete case' },
      { status: 500 }
    );
  }
}

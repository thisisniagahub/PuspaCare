import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const programmeCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['EDUCATION', 'HEALTH', 'SOCIAL_WELFARE', 'EMERGENCY_RELIEF', 'COMMUNITY_DEVELOPMENT', 'ENVIRONMENT', 'ECONOMIC_EMPOWERMENT', 'DAWAH', 'OTHER']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED']).optional().default('DRAFT'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  targetBeneficiaries: z.number().int().positive().optional(),
  actualBeneficiaries: z.number().int().nonnegative().optional(),
  budget: z.number().nonnegative().optional(),
  totalSpent: z.number().nonnegative().optional().default(0),
  partners: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;

    const programmes = await db.programme.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        cases: { select: { id: true } },
        activities: { select: { id: true, title: true } },
        impactMetrics: { select: { id: true, metricName: true, selfReportedValue: true } },
        _count: {
          select: {
            cases: true,
            activities: true,
            impactMetrics: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: programmes });
  } catch (error) {
    console.error('Error fetching programmes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch programmes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = programmeCreateSchema.parse(body);

    const programme = await db.programme.create({
      data: {
        ...validated,
        category: validated.category || 'OTHER',
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
      } as any,
      include: {
        _count: {
          select: { cases: true, activities: true, impactMetrics: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: programme }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating programme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create programme' },
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
        { success: false, error: 'Programme id is required' },
        { status: 400 }
      );
    }

    const existing = await db.programme.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Programme not found' },
        { status: 404 }
      );
    }

    const partialSchema = programmeCreateSchema.partial();
    const validated = partialSchema.parse(updateData);

    const dataToUpdate: Record<string, unknown> = { ...validated };
    if (validated.startDate) dataToUpdate.startDate = new Date(validated.startDate);
    if (validated.endDate) dataToUpdate.endDate = new Date(validated.endDate);

    const programme = await db.programme.update({
      where: { id },
      data: dataToUpdate,
      include: {
        _count: {
          select: { cases: true, activities: true, impactMetrics: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: programme });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating programme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update programme' },
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
        { success: false, error: 'Programme id is required' },
        { status: 400 }
      );
    }

    const existing = await db.programme.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Programme not found' },
        { status: 404 }
      );
    }

    await db.programme.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Programme deleted successfully' });
  } catch (error) {
    console.error('Error deleting programme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete programme' },
      { status: 500 }
    );
  }
}

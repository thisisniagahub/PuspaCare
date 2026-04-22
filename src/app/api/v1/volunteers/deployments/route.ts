import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const deploymentCreateSchema = z.object({
  volunteerId: z.string().min(1, 'ID sukarelawan diperlukan'),
  programmeId: z.string().optional(),
  activityId: z.string().optional(),
  role: z.enum(['coordinator', 'participant', 'lead']).optional().default('participant'),
  status: z.enum(['assigned', 'confirmed', 'completed', 'cancelled']).optional().default('assigned'),
  startDate: z.string().min(1, 'Tarikh mula diperlukan'),
  endDate: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

// ─── GET — List deployments ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const volunteerId = searchParams.get('volunteerId') || '';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

    const where: Record<string, unknown> = {};
    if (volunteerId) {
      where.volunteerId = volunteerId;
    }
    if (status) {
      where.status = status;
    }

    const [deployments, total] = await Promise.all([
      db.volunteerDeployment.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          volunteer: { select: { id: true, name: true, volunteerNumber: true } },
          programme: { select: { id: true, name: true } },
        },
      }),
      db.volunteerDeployment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: deployments,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deployments' },
      { status: 500 }
    );
  }
}

// ─── POST — Create deployment ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = deploymentCreateSchema.parse(body);

    // Verify volunteer exists
    const volunteer = await db.volunteer.findUnique({
      where: { id: validated.volunteerId },
    });
    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: 'Sukarelawan tidak dijumpai' },
        { status: 404 }
      );
    }

    // Verify programme if provided
    if (validated.programmeId) {
      const programme = await db.programme.findUnique({
        where: { id: validated.programmeId },
      });
      if (!programme) {
        return NextResponse.json(
          { success: false, error: 'Program tidak dijumpai' },
          { status: 404 }
        );
      }
    }

    const deployment = await db.volunteerDeployment.create({
      data: {
        volunteerId: validated.volunteerId,
        programmeId: validated.programmeId || null,
        activityId: validated.activityId || null,
        role: validated.role,
        status: validated.status,
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        location: validated.location || null,
        notes: validated.notes || null,
      },
      include: {
        volunteer: { select: { id: true, name: true, volunteerNumber: true } },
        programme: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: deployment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deployment' },
      { status: 500 }
    );
  }
}

// ─── PUT — Update deployment ────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID penempatan diperlukan' },
        { status: 400 }
      );
    }

    const deploymentUpdateSchema = deploymentCreateSchema.partial();
    const validated = deploymentUpdateSchema.parse(updateData);

    const existing = await db.volunteerDeployment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Penempatan tidak dijumpai' },
        { status: 404 }
      );
    }

    const deployment = await db.volunteerDeployment.update({
      where: { id },
      data: {
        ...validated,
        programmeId: validated.programmeId || null,
        activityId: validated.activityId || null,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
      },
      include: {
        volunteer: { select: { id: true, name: true, volunteerNumber: true } },
        programme: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: deployment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update deployment' },
      { status: 500 }
    );
  }
}

// ─── DELETE — Delete deployment ─────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID penempatan diperlukan' },
        { status: 400 }
      );
    }

    const existing = await db.volunteerDeployment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Penempatan tidak dijumpai' },
        { status: 404 }
      );
    }

    await db.volunteerDeployment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Penempatan berjaya dipadam' });
  } catch (error) {
    console.error('Error deleting deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete deployment' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const boardMemberCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  role: z.enum(['CHAIRMAN', 'VICE_CHAIRMAN', 'SECRETARY', 'TREASURER', 'COMMITTEE_MEMBER', 'ADVISOR', 'TRUSTEE', 'OTHER']).optional(),
  appointmentDate: z.string().optional(),
  endDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  photo: z.string().optional(),
  bio: z.string().optional(),
  isCurrent: z.boolean().optional().default(true),
});

export async function GET(_request: NextRequest) {
  try {
    const boardMembers = await db.boardMember.findMany({
      orderBy: [{ isCurrent: 'desc' }, { appointmentDate: 'desc' }],
    });

    return NextResponse.json({ success: true, data: boardMembers });
  } catch (error) {
    console.error('Error fetching board members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch board members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = boardMemberCreateSchema.parse(body);

    const boardMember = await db.boardMember.create({
      data: {
        ...validated,
        email: validated.email || null,
        appointmentDate: validated.appointmentDate ? new Date(validated.appointmentDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: boardMember }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating board member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create board member' },
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
        { success: false, error: 'Board member id is required' },
        { status: 400 }
      );
    }

    const existing = await db.boardMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Board member not found' },
        { status: 404 }
      );
    }

    const partialSchema = boardMemberCreateSchema.partial();
    const validated = partialSchema.parse(updateData);

    const dataToUpdate: Record<string, unknown> = { ...validated };
    if (validated.email === '') dataToUpdate.email = null;
    if (validated.appointmentDate) dataToUpdate.appointmentDate = new Date(validated.appointmentDate);
    if (validated.endDate) dataToUpdate.endDate = new Date(validated.endDate);

    const boardMember = await db.boardMember.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: boardMember });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating board member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update board member' },
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
        { success: false, error: 'Board member id is required' },
        { status: 400 }
      );
    }

    const existing = await db.boardMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Board member not found' },
        { status: 404 }
      );
    }

    await db.boardMember.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Board member deleted successfully' });
  } catch (error) {
    console.error('Error deleting board member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete board member' },
      { status: 500 }
    );
  }
}

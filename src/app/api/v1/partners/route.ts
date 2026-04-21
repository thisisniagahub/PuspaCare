import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const partnerCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['GOVERNMENT', 'CORPORATE', 'NGO', 'ACADEMIC', 'RELIGIOUS', 'HEALTHCARE', 'MEDIA', 'COMMUNITY', 'INTERNATIONAL', 'OTHER']).optional(),
  relationship: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT', 'FORMER']).optional().default('PROSPECT'),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  verifiedStatus: z.enum(['VERIFIED', 'UNVERIFIED', 'PENDING']).optional().default('UNVERIFIED'),
  verificationUrl: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || '';
    const verifiedStatus = searchParams.get('verifiedStatus') || '';

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (verifiedStatus) where.verifiedStatus = verifiedStatus;

    const partners = await db.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: partners });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = partnerCreateSchema.parse(body);

    const partner = await db.partner.create({
      data: {
        ...validated,
        contactEmail: validated.contactEmail || null,
      },
    });

    return NextResponse.json({ success: true, data: partner }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
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
        { success: false, error: 'Partner id is required' },
        { status: 400 }
      );
    }

    const existing = await db.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    const partialSchema = partnerCreateSchema.partial();
    const validated = partialSchema.parse(updateData);

    const dataToUpdate: Record<string, unknown> = { ...validated };
    if (validated.contactEmail === '') dataToUpdate.contactEmail = null;

    const partner = await db.partner.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: partner });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
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
        { success: false, error: 'Partner id is required' },
        { status: 400 }
      );
    }

    const existing = await db.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    await db.partner.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}

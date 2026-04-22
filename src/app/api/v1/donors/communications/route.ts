import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const communicationCreateSchema = z.object({
  donorId: z.string().min(1, 'Penderma diperlukan'),
  type: z.enum(['email', 'phone', 'whatsapp', 'letter']),
  subject: z.string().min(1, 'Subjek diperlukan'),
  content: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'sent', 'failed']).optional().default('sent'),
});

// ── GET: List communications ────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const donorId = searchParams.get('donorId') || '';
    const type = searchParams.get('type') || '';

    const where: Record<string, unknown> = {};

    if (donorId) {
      where.donorId = donorId;
    }
    if (type) {
      where.type = type;
    }

    const [communications, total] = await Promise.all([
      db.donorCommunication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          donor: { select: { id: true, name: true, donorNumber: true } },
        },
      }),
      db.donorCommunication.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: communications,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuatkan senarai komunikasi' },
      { status: 500 }
    );
  }
}

// ── POST: Create communication record ───────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = communicationCreateSchema.parse(body);

    // Verify donor exists
    const donor = await db.donor.findUnique({ where: { id: validated.donorId } });
    if (!donor) {
      return NextResponse.json(
        { success: false, error: 'Penderma tidak dijumpai' },
        { status: 404 }
      );
    }

    const communication = await db.donorCommunication.create({
      data: {
        donorId: validated.donorId,
        type: validated.type,
        subject: validated.subject,
        content: validated.content || null,
        status: validated.status,
        sentAt: validated.status === 'sent' ? new Date() : null,
      },
      include: {
        donor: { select: { id: true, name: true, donorNumber: true } },
      },
    });

    return NextResponse.json({ success: true, data: communication }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Pengesahan gagal', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating communication:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal merekod komunikasi' },
      { status: 500 }
    );
  }
}

// ── DELETE: Delete communication ────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID komunikasi diperlukan' },
        { status: 400 }
      );
    }

    const existing = await db.donorCommunication.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Komunikasi tidak dijumpai' },
        { status: 404 }
      );
    }

    await db.donorCommunication.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Komunikasi berjaya dipadam' });
  } catch (error) {
    console.error('Error deleting communication:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memadam komunikasi' },
      { status: 500 }
    );
  }
}

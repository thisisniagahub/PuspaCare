import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError, requireRole } from '@/lib/auth';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1, 'Mesej diperlukan').max(2000, 'Mesej terlalu panjang'),
  context: z.string().optional(),
});

const SYSTEM_PROMPT = `Kamu adalah pembantu AI untuk PUSPA, sebuah Pertubuhan Kebajikan Sokongan Prihatin Asnaf yang berdaftar di Malaysia. Kamu membantu pengurusan NGO dalam bahasa Melayu.

Maklumat PUSPA:
- Lokasi: Hulu Klang, Gombak, Ampang (Selangor)
- Ahli berdaftar: 342 orang (287 aktif)
- Program utama: AsnafCare (bantuan makanan), Pusat Sunnah Preschool, Kelas Tilawah Dewasa, Mentoring Belia, Klinik Kesihatan Komuniti
- Kategori ahli: Ahli Biasa, Sukarelawan, Penderma Tetap, Ahli Sejahtera (BMT)
- Anggaran operasi bulanan: RM 45,000 - 55,000
- Pendapatan utama: Donasi individu (50%), Derma korporat (31%), Geran kerajaan (14%)

Jawab soalan dengan:
1. Bahasa Melayu yang sopan dan profesional
2. Maklumat yang tepat berdasarkan konteks PUSPA
3. Format yang mudah dibaca (senarai, jadual ringkas jika perlu)
4. Cadangan tindakan yang praktikal apabila sesuai

Jika tidak pasti, katakan dengan jujur dan cadangkan rujukan kepada pentadbir PUSPA.`;

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ['developer']);
    const body = await request.json();
    const { message, context } = chatSchema.parse(body);

    // Build messages for the AI
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add context if provided
    if (context) {
      messages.push({
        role: 'system',
        content: `Konteks tambahan dari pengguna: ${context}`,
      });
    }

    messages.push({ role: 'user', content: message });

    // Use z-ai-web-dev-sdk
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();
    const result = await zai.chat.completions.create({
      messages: messages as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
      thinking: { type: 'disabled' },
    });

    const responseText = result?.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat menjana respons pada masa ini. Sila cuba lagi.';

    // Estimate token usage
    const inputTokens = message.length + (context?.length || 0);
    const outputTokens = responseText.length;
    const totalTokens = inputTokens + outputTokens;

    return NextResponse.json({
      success: true,
      data: {
        response: responseText,
        tokens: {
          input: Math.ceil(inputTokens / 4),
          output: Math.ceil(outputTokens / 4),
          total: Math.ceil(totalTokens / 4),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Pengesahan gagal', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses mesej AI' },
      { status: 500 }
    );
  }
}

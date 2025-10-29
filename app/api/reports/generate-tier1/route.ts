// app/api/reports/generate-tier1/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { z } from 'zod';
import { db } from '@/lib/db';
import { buildTier1Report } from '@/lib/reports/generateTier1';
import { TEMPLATE_VERSION } from '@/lib/reports/generateTier1';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PayloadSchema = z.object({
  userId: z.string().min(1).optional(),
  assessmentId: z.string().min(1).optional(),
  responses: z.union([
    z.array(z.number()).nonempty().optional(),
    z.record(z.object({ value: z.number(), timestamp: z.string().optional() })).optional(),
  ]).optional(),
  participantData: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Optional role gate:
    // if (!['ADMIN','COACH'].includes(session.user.role)) return new NextResponse('Forbidden', { status: 403 });

    const payload = await req.json().catch(() => ({}));
    const parsed = PayloadSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const { userId, assessmentId, responses, participantData } = parsed.data;

    const { html, nameSafe } = await buildTier1Report({
      userId, assessmentId, responses, participantData, db,
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Public_Summary_${nameSafe}.html"`,
        'Cache-Control': 'no-store',
        'X-Template-Version': TEMPLATE_VERSION,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

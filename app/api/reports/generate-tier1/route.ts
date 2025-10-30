// app/api/reports/generate-tier1/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { z } from 'zod';
import { db } from '@/lib/db';
import { buildTier1Report, TEMPLATE_VERSION } from '@/lib/reports/generateTier1';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Require at least one source of data: assessmentId OR responses
const PayloadSchema = z.object({
  userId: z.string().min(1).optional(),
  assessmentId: z.string().min(1).optional(),
  responses: z
    .union([
      z.array(z.number()).nonempty(),
      z.record(z.string(), z.object({ value: z.number(), timestamp: z.string().optional() })),
      z.record(z.string(), z.number()), // allow simple { "1.1.1": 4, ... }
    ])
    .optional(),
  participantData: z.any().optional(),
}).refine(
  (o) => !!o.assessmentId || !!o.responses,
  { message: 'Provide assessmentId or responses' }
);

export async function POST(req: NextRequest) {
  try {
    // 1) Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional RBAC (uncomment if only staff may generate):
    // if (!['ADMIN', 'COACH'].includes(session.user.role ?? '')) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // 2) Parse
    const json = await req.json().catch(() => ({}));
    const parsed = PayloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }
    const { userId, assessmentId, responses, participantData } = parsed.data;

    // 3) Build report (this function should do: fetch -> score -> resolve narratives -> render)
    const { html, nameSafe, artifact } = await buildTier1Report({
      db,
      userId: userId ?? session.user.id, // default to current user if not provided
      assessmentId,
      responses,
      participantData,
      audience: 'counselling',           // <- tell the renderer which narrative pack to use
    });

    // 4) (Optional) Persist an artifact record if you want a trail
    // If buildTier1Report didn't already persist:
    // if (!artifact && assessmentId && (session.user.id || userId)) {
    //   await db.reportArtifact.upsert({
    //     where: { assessmentId },
    //     create: {
    //       assessmentId,
    //       userId: userId ?? session.user.id!,
    //       type: 'TIER1',
    //       format: 'html',
    //       storageUrl: '', // if you later upload to S3/Blob, put URL here
    //       templateVersion: TEMPLATE_VERSION,
    //       generatedBy: session.user.id!,
    //     },
    //     update: { templateVersion: TEMPLATE_VERSION },
    //   });
    // }

    // 5) Return as downloadable HTML
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Tier1_${nameSafe}.html"`,
        'Cache-Control': 'no-store',
        'X-Template-Version': TEMPLATE_VERSION,
      },
    });
  } catch (e: any) {
    console.error('[generate-tier1] error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}


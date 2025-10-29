// app/api/assessments/[id]/complete-report/route.ts
import { buildTier1Report, TEMPLATE_VERSION } from '@/lib/reports/generateTier1';
import { put } from '@vercel/blob'; // or S3
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const assessmentId = params.id;
  const body = await req.json().catch(() => ({}));

  const { html, nameSafe } = await buildTier1Report({
    assessmentId,
    responses: body?.responses,         // optional
    participantData: body?.participantData,
    db,
  });

  // store snapshot
  const key = `tier1/${assessmentId}.html`;
  const { url } = await put(key, new Blob([html], { type: 'text/html' }), { access: 'public' });

  await db.reportArtifact.upsert({
    where: { assessmentId },
    create: { assessmentId, userId: body?.userId ?? '', type: 'TIER1', format: 'html', storageUrl: url, templateVersion: TEMPLATE_VERSION, generatedBy: 'system' },
    update: { storageUrl: url, templateVersion: TEMPLATE_VERSION, generatedAt: new Date() },
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="Public_Summary_${nameSafe}.html"`,
      'Cache-Control': 'no-store',
      'X-Template-Version': TEMPLATE_VERSION,
    },
  });
}

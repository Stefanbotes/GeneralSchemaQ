// app/api/reports/generate-tier1/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring'; // <-- if yours is under app/lib, change to '@/app/lib/shared-schema-scoring'
import { counsellingNarratives, defaultNarrative } from '@/lib/narratives/counselling';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Render full HTML shell */
function renderHtml({
  person,
  completedAt,
  rowsHtml,
}: {
  person: { firstName?: string | null; lastName?: string | null };
  completedAt: Date;
  rowsHtml: string;
}) {
  const fullName = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() || 'Participant';
  const dt = completedAt.toISOString().split('T')[0];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Public Summary — ${fullName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"; background:#fff; color:#111; margin:0; padding:24px; }
    .card { max-width: 1000px; margin: 0 auto; border:1px solid #e5e7eb; border-radius:16px; padding:24px; box-shadow: 0 10px 20px rgba(0,0,0,0.04); }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .muted { color:#6b7280; margin:0 0 16px; }
    table { width:100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align:left; padding:8px; border-bottom:2px solid #e5e7eb; font-weight:600; }
    td { vertical-align: top; }
    .footer { margin-top:24px; font-size:12px; color:#6b7280; }
    .badge-emerging { color:#b45309; background:#fef3c7; border:1px solid #fcd34d; border-radius:6px; padding:2px 6px; margin-left:8px; font-size:12px; }
    .dim { color:#374151; font-size:13px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>LASBI — Public Summary</h1>
    <p class="muted">${fullName} · Completed on ${dt}</p>
    <table>
      <thead>
        <tr>
          <th style="width:70px;">Code</th>
          <th style="width:280px;">Schema</th>
          <th style="text-align:center;width:90px;">Index</th>
          <th>Counselling Narrative</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div class="footer">Top three schemas shown. Index is a 0–100 linear transform of the 1–6 mean.</div>
  </div>
</body>
</html>`;
}

/** One table row using the counselling narrative pack */
function narrativeRow(s: {
  variableId: string;          // "d.s"
  schemaLabel: string;         // display label
  clinicalSchemaId: string;    // e.g. "emotional_inhibition"
  index0to100: number;         // 0..100 (unrounded)
}) {
  const clinicalId = s.clinicalSchemaId;
  const n = counsellingNarratives[clinicalId] ?? defaultNarrative(clinicalId);
  const displayIndex = Math.round(s.index0to100);
  const cautionBadge = displayIndex < 60 ? `<span class="badge-emerging">emerging</span>` : '';

  return `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;"><strong>${s.variableId}</strong></td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${s.schemaLabel}${cautionBadge}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${displayIndex}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">
        <div style="font-weight:600;margin-bottom:4px;">${n.displayName}</div>
        <div style="margin-bottom:6px;">${n.summary}</div>
        <div class="dim"><em>Strengths:</em> ${n.strengths.join(', ')}</div>
        <div class="dim"><em>Growth:</em> ${n.growth.join('; ')}</div>
      </td>
    </tr>
  `;
}

export async function POST(req: NextRequest) {
  try {
    // ---- Auth ----
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, assessmentId } = await req.json().catch(() => ({} as any));
    if (!userId || !assessmentId) {
      return NextResponse.json({ error: 'Missing userId or assessmentId' }, { status: 400 });
    }

    // Admins or owner only
    if (session.user.role !== 'ADMIN' && session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ---- Load user + assessment ----
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        assessments: { where: { id: assessmentId }, take: 1 },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const assessment = user.assessments?.[0];
    if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    if (assessment.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Assessment must be completed' }, { status: 400 });
    }

    // ---- Parse + normalize responses (from { "d.s.q": { value, timestamp } }) ----
    const raw = assessment.responses;
    let parsed: any;
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
    } catch {
      return NextResponse.json({ error: 'Responses JSON malformed' }, { status: 400 });
    }

    // Flatten to { "d.s.q": number }
    const flat: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k === 'string' && /^[1-5]\.[1-5]\.[1-6]$/.test(k)) {
        const n = typeof v === 'object' && v && 'value' in (v as any)
          ? Number((v as any).value)
          : Number(v);
        if (Number.isFinite(n)) flat[k] = n;
      }
    }

    if (!Object.keys(flat).length) {
      console.error('[tier1] No numeric answers found in canonical keys. Sample keys:', Object.keys(parsed).slice(0, 10));
      return NextResponse.json({ error: 'No responses to score (empty or wrong shape).'}, { status: 400 });
    }

    // ---- Score using golden pipeline ----
    const { rankedScores } = await scoreAssessmentResponses(flat);
    if (!rankedScores.length) {
      return NextResponse.json({ error: 'Scoring returned no results (keys unmapped).'}, { status: 400 });
    }

    // ---- Top-3 with “emerging” badge for < 60 ----
    const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);
    const top3 = [primary, secondary, tertiary].filter(Boolean) as typeof rankedScores;

    // ---- Build rows & render ----
    const rowsHtml = top3.map(s => narrativeRow(s)).join('');
    const html = renderHtml({
      person: { firstName: user.firstName, lastName: user.lastName },
      completedAt: new Date(assessment.completedAt || assessment.createdAt),
      rowsHtml,
    });

    const safeName =
      `${user.firstName ?? ''}_${user.lastName ?? ''}`.trim().replace(/\s+/g, '_') || user.email;
    const filename = `Public_Summary_${safeName}.html`.replace(/[^A-Za-z0-9_\-.]/g, '');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('[generate-tier1] error:', err);
    return NextResponse.json(
      { error: 'Failed to generate Tier 1 report', details: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}


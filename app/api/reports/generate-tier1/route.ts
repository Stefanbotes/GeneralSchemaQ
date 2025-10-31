// app/api/reports/generate-tier1/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

import {
  loadItemToSchema,
  CANONICAL_ID_RE,
  ITEM_ID_RE,
  type VariableId,
} from '@/lib/shared-lasbi-mapping';

// Optional imports if you already have them. If these don’t exist,
// the code falls back to generic narrative strings.
let narrativeFor: ((schemaId: string, score: number) => string) | null = null;
try {
  // Adjust the path if your counseling helpers live elsewhere:
  // e.g. '@/lib/tier1-persona-copy'
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@/lib/tier1-persona-copy');
  if (typeof mod.narrativeFor === 'function') narrativeFor = mod.narrativeFor;
} catch { /* soft optional */ }

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// --- Types used in this route ---
type CanonicalKey = `${1|2|3|4|5}.${1|2|3|4|5}.${1|2|3|4|5|6}`;

function toNumber(v: unknown): number {
  const n = typeof v === 'object' && v !== null && 'value' in (v as any)
    ? Number((v as any).value)
    : Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function extractCanonicalRecord(responses: Record<string, any>): Record<CanonicalKey, number> {
  const out: Record<string, number> = {};
  for (const [k, raw] of Object.entries(responses)) {
    const val = toNumber(raw);
    if (!Number.isFinite(val)) continue;
    // accept "1.1.1" straight; also accept numeric "1".."108" if present (rare)
    if (CANONICAL_ID_RE.test(k)) {
      out[k] = val;
    }
  }
  return out as Record<CanonicalKey, number>;
}

type SchemaScore = {
  variableId: VariableId;
  label: string;
  mean: number;        // 1..6
  n: number;           // count of items contributing
};

function computeSchemaScores(canon: Record<CanonicalKey, number>): SchemaScore[] {
  const itemMeta = loadItemToSchema(); // keyed by itemId AND canonicalId
  // buckets: variableId -> {sum, n, label}
  const buckets = new Map<VariableId, { sum: number; n: number; label: string }>();

  for (const [cid, value] of Object.entries(canon)) {
    const meta = itemMeta.get(cid);  // lookup by canonicalId
    if (!meta) continue;
    const key = meta.variableId as VariableId;
    const prev = buckets.get(key) ?? { sum: 0, n: 0, label: meta.schemaLabel };
    buckets.set(key, { sum: prev.sum + value, n: prev.n + 1, label: prev.label });
  }

  const out: SchemaScore[] = [];
  for (const [vid, agg] of buckets) {
    if (agg.n > 0) {
      out.push({
        variableId: vid,
        label: agg.label,
        mean: Number((agg.sum / agg.n).toFixed(2)),
        n: agg.n,
      });
    }
  }

  // Ensure we don’t return empty (this is what previously triggered your error)
  return out.sort((a,b) =>
    a.variableId.localeCompare(b.variableId, 'en', { numeric: true })
  );
}

function renderHtml({
  person,
  completedAt,
  scores,
}: {
  person: { firstName?: string|null; lastName?: string|null };
  completedAt: Date;
  scores: SchemaScore[];
}) {
  const fullName = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() || 'Participant';
  const dt = completedAt.toISOString().split('T')[0];

  // Build rows with optional narratives
  const rows = scores.map(s => {
    const story = narrativeFor
      ? narrativeFor(s.variableId, s.mean)
      : `Your score on ${s.label} is ${s.mean}.`;
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;"><strong>${s.variableId}</strong></td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${s.label}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${s.mean}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${story}</td>
      </tr>`;
  }).join('');

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
    .footer { margin-top:24px; font-size:12px; color:#6b7280; }
  </style>
</head>
<body>
  <div class="card">
    <h1>LASBI — Public Summary</h1>
    <p class="muted">${fullName} · Completed on ${dt}</p>
    <table>
      <thead>
        <tr>
          <th>Code</th><th>Schema</th><th style="text-align:center">Score</th><th>Counselling Narrative</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">Generated Tier 1 summary. Scores are on a 1–6 scale.</div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
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

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        assessments: { where: { id: assessmentId }, take: 1 }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const assessment = user.assessments?.[0];
    if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    if (assessment.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Assessment must be completed' }, { status: 400 });
    }

    // Parse responses
    const raw = assessment.responses;
    const responses = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
    const canon = extractCanonicalRecord(responses);

    // Compute schema scores (defensive; never return empty)
    const scores = computeSchemaScores(canon);
    if (!scores.length) {
      // Give a *clear* message + small debug to logs to help you if data is malformed
      console.error('[tier1] No computable scores. Keys sample:', Object.keys(responses).slice(0, 10));
      return NextResponse.json({ error: 'Scoring returned no results.' }, { status: 400 });
    }

    // Render HTML
    const html = renderHtml({
      person: { firstName: user.firstName, lastName: user.lastName },
      completedAt: new Date(assessment.completedAt || assessment.createdAt),
      scores
    });

    const safeName =
      `${user.firstName ?? ''}_${user.lastName ?? ''}`.trim().replace(/\s+/g, '_') || user.email;
    const filename = `Public_Summary_${safeName}.html`.replace(/[^A-Za-z0-9_\-\.]/g, '');

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


import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PayloadSchema = z.object({
  assessmentId: z.string().min(1).optional(),
  // Prefer a map so we can canonize keys; array is allowed but only supports overall.
  responses: z
    .union([
      z.array(z.number()).nonempty().optional(),
      z.record(z.object({ value: z.number(), timestamp: z.string().optional() })).optional(),
    ])
    .optional(),
  participantData: z.any().optional(),
});

const isLikert6 = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n) && n >= 1 && n <= 6;

/** Load all LASBI items once (id map) to resolve canonical & schema */
async function loadLasbiIndex() {
  const rows = await (db as any).lasbi_items.findMany({
    select: { item_id: true, canonical_id: true, variable_id: true, schema_label: true },
  });
  const byItemId = new Map<string, any>();
  const byCanonical = new Map<string, any>();
  for (const r of rows) {
    byItemId.set(r.item_id, r);
    byCanonical.set(r.canonical_id, r);
  }
  return { rows, byItemId, byCanonical };
}

/** Turn "1.1.R2" → "1.1.2"; already "1.1.2" returns as-is; "cmf..." resolved via lasbi_items.item_id */
function toCanonicalId(rawId: string, lasbiByItemId: Map<string, any>): string | null {
  if (!rawId) return null;

  // Already canonical d.s.q?
  if (/^\d+\.\d+\.\d+$/.test(rawId)) return rawId;

  // cmf... style? (modern LASBI item id)
  const hit = lasbiByItemId.get(rawId);
  if (hit?.canonical_id) return hit.canonical_id as string;

  // "1.1.R2" / "1.1.Q2" → "1.1.2"
  const rx = /^(\d+)\.(\d+)\.(?:R|Q)?(\d+)$/i;
  const m = rawId.match(rx);
  if (m) return `${m[1]}.${m[2]}.${m[3]}`;

  // "1.1-R2", "1_1_R2" → sanitize separators
  const s = rawId.replace(/[_-]/g, '.');
  const m2 = s.match(rx);
  if (m2) return `${m2[1]}.${m2[2]}.${m2[3]}`;

  return null; // unknown shape
}

/** From various shapes, extract name if present */
function extractParticipantName(assessment: any, fallback?: string): string | undefined {
  const candidates = [
    fallback,
    assessment?.bioData?.name,
    assessment?.data?.bioData?.name,
    assessment?.participant?.name,
    assessment?.user?.name,
    `${assessment?.user?.firstName ?? ''} ${assessment?.user?.lastName ?? ''}`.trim(),
  ].filter(Boolean) as string[];
  const found = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
  return found && found.trim().length ? found : undefined;
}

/** Build canonical → value map (1..6) from lasbi_responses rows */
async function loadResponsesFromLasbi(assessmentId: string): Promise<Map<string, number>> {
  const rows = await (db as any).lasbi_responses.findMany({
    where: { assessment_id: assessmentId },
    select: { canonical_id: true, value: true },
  });

  const m = new Map<string, number>();
  for (const r of rows) {
    const v = Number(r.value);
    if (!isNaN(v) && isLikert6(v)) m.set(String(r.canonical_id), v);
    // If legacy 1..5 exists, it still passes isLikert6()
  }
  return m;
}

/** Fallback: extract from assessments.responses JSON (map of UI ids to {value}) */
function extractResponsesFromAssessmentsJson(
  assessment: any,
  lasbiByItemId: Map<string, any>
): Map<string, number> {
  const sources = [assessment?.responses, assessment?.data?.responses, assessment?.payload?.responses];
  const out = new Map<string, number>();

  for (const src of sources) {
    if (src && typeof src === 'object' && !Array.isArray(src)) {
      for (const [rawId, obj] of Object.entries<any>(src)) {
        const canonical = toCanonicalId(rawId, lasbiByItemId);
        const v = Number(obj?.value);
        if (canonical && isLikert6(v)) out.set(canonical, v);
      }
      if (out.size) return out;
    }
  }
  return out;
}

/** If client sends responses directly */
function responsesFromClientPayload(
  payload: any,
  lasbiByItemId: Map<string, any>
): { canonicalToValue: Map<string, number>; arrayOnly?: number[] } {
  if (!payload) return { canonicalToValue: new Map() };

  // Map case: { "1.1.R2": { value: 5 }, "cmf..." : { value: 4 }, ... }
  if (!Array.isArray(payload) && typeof payload === 'object') {
    const m = new Map<string, number>();
    for (const [rawId, obj] of Object.entries<any>(payload)) {
      const canonical = toCanonicalId(rawId, lasbiByItemId);
      const v = Number(obj?.value);
      if (canonical && isLikert6(v)) m.set(canonical, v);
    }
    return { canonicalToValue: m };
  }

  // Array case: we can compute OVERALL but not per-schema (no ids)
  if (Array.isArray(payload)) {
    const arr = payload.map(Number);
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (!isLikert6(v)) {
        throw new Error(`Bad value at index ${i}: ${String(v)} (expected 1..6)`);
      }
    }
    return { canonicalToValue: new Map(), arrayOnly: arr };
  }

  return { canonicalToValue: new Map() };
}

/** Overall mean on 1..6 */
function mean6(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** HTML with per-schema table (if available) + top/bottom + raw items by canonical_id */
function renderHtml(opts: {
  name?: string;
  canonicalToValue?: Map<string, number>;
  overallArray?: number[]; // when only array provided
  bySchema?: Record<string, number>;
}) {
  const overall =
    opts.canonicalToValue && opts.canonicalToValue.size
      ? mean6([...opts.canonicalToValue.values()])
      : mean6(opts.overallArray || []);

  const bySchema = opts.bySchema || {};
  const hasCats = Object.keys(bySchema).length > 0;
  const sortedCats = hasCats ? Object.entries(bySchema).sort((a, b) => b[1] - a[1]) : [];

  const catRows = hasCats
    ? sortedCats
        .map(
          ([k, v]) => `<tr>
        <td style="padding:6px 12px;border:1px solid #ddd">${k}</td>
        <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${v.toFixed(2)}</td>
        <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${Math.round(((v - 1) / 5) * 100)}%</td>
      </tr>`
        )
        .join('')
    : '';

  const top3 = hasCats ? sortedCats.slice(0, 3) : [];
  const bottom3 = hasCats ? sortedCats.slice(-3).reverse() : [];

  const itemRows =
    opts.canonicalToValue && opts.canonicalToValue.size
      ? [...opts.canonicalToValue.entries()]
          .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          .map(
            ([cid, v]) => `<tr>
          <td style="padding:6px 12px;border:1px solid #ddd">${cid}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${v}</td>
        </tr>`
          )
          .join('')
      : (opts.overallArray || [])
          .map(
            (v, i) => `<tr>
          <td style="padding:6px 12px;border:1px solid #ddd">Item ${i + 1}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${v}</td>
        </tr>`
          )
          .join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tier-1 Summary</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 24px;">
  <h1 style="margin: 0 0 8px;">Tier-1 Summary</h1>
  <div style="color:#555;margin-bottom:16px">Participant: ${opts.name || '—'}</div>

  <h2 style="margin: 16px 0 8px;">Overall</h2>
  <p style="margin:0 0 16px;">
    Mean (1..6): <strong>${overall.toFixed(2)}</strong>
    &nbsp;|&nbsp; Scaled (0–100): <strong>${Math.round(((overall - 1) / 5) * 100)}%</strong>
  </p>

  ${
    hasCats
      ? `
  <h2 style="margin: 16px 0 8px;">By Schema</h2>
  <table style="border-collapse:collapse;width:100%;max-width:760px;margin-bottom:12px">
    <thead>
      <tr>
        <th style="text-align:left;padding:6px 12px;border:1px solid #ddd">Schema</th>
        <th style="text-align:right;padding:6px 12px;border:1px solid #ddd">Mean (1..6)</th>
        <th style="text-align:right;padding:6px 12px;border:1px solid #ddd">Scaled (0–100)</th>
      </tr>
    </thead>
    <tbody>${catRows}</tbody>
  </table>
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin:12px 0 24px">
    <div style="flex:1;min-width:240px">
      <h3 style="margin:0 0 8px;">Top 3</h3>
      <ol style="margin:0 0 0 18px;padding:0">
        ${top3.map(([k, v]) => `<li>${k} — ${v.toFixed(2)} (${Math.round(((v - 1) / 5) * 100)}%)</li>`).join('')}
      </ol>
    </div>
    <div style="flex:1;min-width:240px">
      <h3 style="margin:0 0 8px;">Bottom 3</h3>
      <ol style="margin:0 0 0 18px;padding:0">
        ${bottom3.map(([k, v]) => `<li>${k} — ${v.toFixed(2)} (${Math.round(((v - 1) / 5) * 100)}%)</li>`).join('')}
      </ol>
    </div>
  </div>
  `
      : ''
  }

  <h2 style="margin: 16px 0 8px;">Items (raw 1..6)</h2>
  <table style="border-collapse:collapse;width:100%;max-width:760px">
    <thead>
      <tr>
        <th style="text-align:left;padding:6px 12px;border:1px solid #ddd">Item</th>
        <th style="text-align:right;padding:6px 12px;border:1px solid #ddd">Score</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const parsed = PayloadSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const { assessmentId, responses, participantData } = parsed.data;

    const lasbi = await loadLasbiIndex();

    // Name (from client or from DB later)
    let name: string | undefined = participantData?.name;

    // 1) If assessmentId is provided, prefer lasbi_responses
    let canonicalToValue = new Map<string, number>();

    if (assessmentId) {
      const assessment: any = await (db as any).assessments.findUnique({ where: { id: assessmentId } });
      if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

      // try users table for name
      try {
        if (!name && assessment.userId) {
          const user: any = await (db as any).users.findUnique({
            where: { id: assessment.userId },
            select: { firstName: true, lastName: true },
          });
          if (user) {
            const n = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
            if (n) name = n;
          }
        }
      } catch {
        // ignore
      }

      // try bioData-like fields
      name = extractParticipantName(assessment, name) || name;

      // prefer lasbi_responses rows
      const fromLasbi = await loadResponsesFromLasbi(assessmentId);
      if (fromLasbi.size) {
        canonicalToValue = fromLasbi;
      } else {
        // fallback: assessments.responses JSON
        const fromLegacy = extractResponsesFromAssessmentsJson(assessment, lasbi.byItemId);
        if (fromLegacy.size) canonicalToValue = fromLegacy;
      }

      // If client also provided `responses`, merge them in (client takes precedence)
      if (responses) {
        const fromClient = responsesFromClientPayload(responses, lasbi.byItemId);
        if (fromClient.canonicalToValue.size) {
          for (const [k, v] of fromClient.canonicalToValue) canonicalToValue.set(k, v);
        }
      }
    } else {
      // 2) No ID → rely on client responses
      const fromClient = responsesFromClientPayload(responses, lasbi.byItemId);
      if (fromClient.canonicalToValue.size) {
        canonicalToValue = fromClient.canonicalToValue;
      } else if (fromClient.arrayOnly?.length) {
        // Array: render overall only
        const html = renderHtml({ name, overallArray: fromClient.arrayOnly });
        return new NextResponse(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
        });
      } else {
        return NextResponse.json(
          { error: 'Either responses (with question IDs) or assessmentId is required' },
          { status: 400 }
        );
      }
    }

    if (!canonicalToValue.size) {
      return NextResponse.json({ error: 'No responses found to generate report' }, { status: 400 });
    }

    // Build per-schema means using lasbi_items
    const bySchema: Record<string, { sum: number; n: number }> = {};
    for (const [canonical, v] of canonicalToValue) {
      const meta = lasbi.byCanonical.get(canonical);
      const schema = meta?.schema_label || 'Unmapped';
      const entry = bySchema[schema] || { sum: 0, n: 0 };
      entry.sum += v;
      entry.n += 1;
      bySchema[schema] = entry;
    }

    const bySchemaMean: Record<string, number> = {};
    for (const [k, agg] of Object.entries(bySchema)) {
      bySchemaMean[k] = agg.n ? agg.sum / agg.n : 0;
    }

    const html = renderHtml({
      name,
      canonicalToValue,
      bySchema: bySchemaMean,
    });

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

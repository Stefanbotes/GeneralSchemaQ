// lib/reports/generateTier1.ts
import type { PrismaClient } from '@prisma/client';

// Optional Tier-1 copy blocks (safe-optional: code runs even if not present)
let schemaToPublic: Record<string, string> | undefined;
let schemaToHealthy: Record<string, string | string[]> | undefined;
let schemaToDomain: Record<string, string> | undefined;
let personaCopy:
  | { forTop?: (schemas: string[]) => string | null }
  | undefined;
let narrativeFor: ((schemas: string[]) => string | null) | undefined;

try {
  // These paths must match your project
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@/lib/tier1-persona-copy');
  schemaToPublic = mod.schemaToPublic;
  schemaToHealthy = mod.schemaToHealthy;
  schemaToDomain = mod.schemaToDomain;
  personaCopy = mod.personaCopy;
  narrativeFor = mod.narrativeFor;
} catch {
  // keep optional
}

export const TEMPLATE_VERSION = 'tier1-v1.0.0';

// ------------------------ helpers ------------------------

type LasbiIndex = {
  rows: Array<{
    item_id: string;
    canonical_id: string;
    variable_id: string;
    schema_label: string;
  }>;
  byItemId: Map<string, any>;
  byCanonical: Map<string, any>;
};

declare global {
  // eslint-disable-next-line no-var
  var __tier1_lasbiIndex: LasbiIndex | undefined;
}

const isLikert6 = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n) && n >= 1 && n <= 6;

function toCanonicalId(rawId: string, lasbiByItemId: Map<string, any>): string | null {
  if (!rawId) return null;
  if (/^\d+\.\d+\.\d+$/.test(rawId)) return rawId;

  const hit = lasbiByItemId.get(rawId);
  if (hit?.canonical_id) return String(hit.canonical_id);

  const rx = /^(\d+)\.(\d+)\.(?:R|Q)?(\d+)$/i;
  const m = rawId.match(rx);
  if (m) return `${m[1]}.${m[2]}.${m[3]}`;

  const s = rawId.replace(/[_-]/g, '.');
  const m2 = s.match(rx);
  if (m2) return `${m2[1]}.${m2[2]}.${m2[3]}`;
  return null;
}

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

async function loadLasbiIndex(db: PrismaClient): Promise<LasbiIndex> {
  if (globalThis.__tier1_lasbiIndex) return globalThis.__tier1_lasbiIndex;
  const rows = await db.lasbiItem.findMany({
    select: { item_id: true, canonical_id: true, variable_id: true, schema_label: true },
  });
  const byItemId = new Map<string, any>();
  const byCanonical = new Map<string, any>();
  for (const r of rows) {
    byItemId.set(r.item_id, r);
    byCanonical.set(r.canonical_id, r);
  }
  globalThis.__tier1_lasbiIndex = { rows, byItemId, byCanonical };
  return globalThis.__tier1_lasbiIndex;
}

async function loadResponsesFromLasbi(db: PrismaClient, assessmentId: string): Promise<Map<string, number>> {
  const rows = await db.lasbiResponse.findMany({
    where: { assessment_id: assessmentId },
    select: { canonical_id: true, value: true },
  });
  const m = new Map<string, number>();
  for (const r of rows) {
    const v = Number(r.value);
    if (!Number.isNaN(v) && isLikert6(v)) m.set(String(r.canonical_id), v);
  }
  return m;
}

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

function responsesFromClientPayload(
  payload: any,
  lasbiByItemId: Map<string, any>
): { canonicalToValue: Map<string, number>; arrayOnly?: number[] } {
  if (!payload) return { canonicalToValue: new Map() };

  if (!Array.isArray(payload) && typeof payload === 'object') {
    const m = new Map<string, number>();
    for (const [rawId, obj] of Object.entries<any>(payload)) {
      const canonical = toCanonicalId(rawId, lasbiByItemId);
      const v = Number(obj?.value);
      if (canonical && isLikert6(v)) m.set(canonical, v);
    }
    return { canonicalToValue: m };
  }

  if (Array.isArray(payload)) {
    const arr = payload.map(Number);
    arr.forEach((v, i) => {
      if (!isLikert6(v)) throw new Error(`Bad value at index ${i}: ${String(v)} (expected 1..6)`);
    });
    return { canonicalToValue: new Map(), arrayOnly: arr };
  }

  return { canonicalToValue: new Map() };
}

function mean6(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pickTop3(bySchemaMean: Record<string, number>) {
  return Object.entries(bySchemaMean)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([schema, score]) => ({ schema, score }));
}

function renderHtml(opts: {
  participantName?: string;
  assessmentId?: string;
  completedAt?: Date | string | null;
  canonicalToValue?: Map<string, number>;
  overallArray?: number[];
  bySchema?: Record<string, number>;
  top3?: { schema: string; score: number }[];
  personaText?: string | null;
  narrativeText?: string | null;
}) {
  const overall =
    opts.canonicalToValue && opts.canonicalToValue.size
      ? mean6([...opts.canonicalToValue.values()])
      : mean6(opts.overallArray || []);

  const bySchema = opts.bySchema || {};
  const hasCats = Object.keys(bySchema).length > 0;
  const sortedCats = hasCats ? Object.entries(bySchema).sort((a, b) => b[1] - a[1]) : [];
  const top3 = opts.top3 || [];

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

  const topBlocks = top3
    .map(({ schema, score }, idx) => {
      const publicSummary = schemaToPublic?.[schema];
      const healthy = schemaToHealthy?.[schema];
      const domain = schemaToDomain?.[schema];
      const growth =
        Array.isArray(healthy)
          ? `<ul style="margin:6px 0 0 18px">${healthy.map((g) => `<li>${g}</li>`).join('')}</ul>`
          : healthy
          ? `<p style="margin:6px 0">${healthy}</p>`
          : '';
      return `
      <div class="schema" style="padding:12px 14px;border:1px solid #eee;border-radius:10px">
        <h3 style="margin:0 0 6px;">#${idx + 1} ${schema} 
          <span style="display:inline-block;margin-left:8px;padding:2px 8px;border:1px solid #e5e7eb;border-radius:999px;font-size:12px;">${score.toFixed(2)} / 6</span>
        </h3>
        ${domain ? `<div style="font-size:12px;color:#555;margin-bottom:6px;">Domain: ${domain}</div>` : ''}
        ${publicSummary ? `<p style="margin:6px 0 8px">${publicSummary}</p>` : ''}
        ${growth ? `<div><strong>Healthy growth:</strong>${growth}</div>` : ''}
      </div>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Tier 1 Summary</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; }
    h1 { margin: 0 0 8px; }
    .meta { color:#555;margin-bottom:16px;font-size:13px; }
    .card { border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin:12px 0; }
  </style>
</head>
<body>
  <h1>Tier 1 Summary</h1>
  <div class="meta">
    Participant: <strong>${opts.participantName || '—'}</strong><br/>
    ${opts.assessmentId ? `Assessment ID: ${opts.assessmentId}` : ''} ${opts.completedAt ? `• Completed: ${new Date(opts.completedAt).toLocaleString()}` : ''}
  </div>

  ${opts.personaText ? `<div class="card"><h2 style="margin:0 0 8px;">Overall Persona</h2><p>${opts.personaText}</p></div>` : ''}

  ${opts.narrativeText ? `<div class="card"><h2 style="margin:0 0 8px;">Short Narrative</h2><p>${opts.narrativeText}</p></div>` : ''}

  ${
    topBlocks
      ? `<div class="card"><h2 style="margin:0 0 8px;">Top Patterns</h2><div style="display:grid;gap:12px">${topBlocks}</div>
         <p style="font-size:12px;color:#555;margin-top:8px">This is a public-facing, strengths-oriented summary.</p></div>`
      : ''
  }

  <div class="card">
    <h2 style="margin:0 0 8px;">Overall</h2>
    <p style="margin:0 0 12px;">
      Mean (1..6): <strong>${overall.toFixed(2)}</strong>
      &nbsp;|&nbsp; Scaled (0–100): <strong>${Math.round(((overall - 1) / 5) * 100)}%</strong>
    </p>

    ${
      hasCats
        ? `
    <h3 style="margin:8px 0">By Schema</h3>
    <table style="border-collapse:collapse;width:100%;max-width:760px;margin-bottom:12px">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 12px;border:1px solid #ddd">Schema</th>
          <th style="text-align:right;padding:6px 12px;border:1px solid #ddd">Mean (1..6)</th>
          <th style="text-align:right;padding:6px 12px;border:1px solid #ddd">Scaled (0–100)</th>
        </tr>
      </thead>
      <tbody>${catRows}</tbody>
    </table>`
        : ''
    }
  </div>

  <div class="card">
    <h2 style="margin:0 0 8px;">Items (raw 1..6)</h2>
    <table style="border-collapse:collapse;width:100%;max-width:760px">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 12px;border:1px solid #ddd">Item</th>
          <th style="text-align:right;padding:6px 12px;border:1px solid #ddd">Score</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

// ---------------------- main builder ----------------------

export async function buildTier1Report(opts: {
  userId?: string;
  assessmentId?: string;
  responses?: any;
  participantData?: any; // for name fallback
  db: PrismaClient;
}): Promise<{ html: string; nameSafe: string; completedAt?: string | Date | null }> {
  const { db, userId, assessmentId, responses, participantData } = opts;

  const lasbi = await loadLasbiIndex(db);

  let name: string | undefined = participantData?.name;
  let completedAt: Date | string | null | undefined;
  let canonicalToValue = new Map<string, number>();

  if (assessmentId) {
    const assessment: any = await db.assessment.findUnique({ where: { id: assessmentId } });
    if (!assessment) {
      // Return a minimal HTML so callers can still download something
      const minimal = renderHtml({ participantName: name, assessmentId });
      const nameSafe = (name || 'participant').replace(/[^\w\d_-]+/g, '_');
      return { html: minimal, nameSafe, completedAt: null };
    }

    completedAt = assessment?.completedAt;

    // sanity: optional userId match
    if (userId && assessment.userId && assessment.userId !== userId) {
      const minimal = renderHtml({
        participantName: name,
        assessmentId,
        completedAt,
        narrativeText: 'Assessment does not belong to supplied userId.',
      });
      const nameSafe = (name || 'participant').replace(/[^\w\d_-]+/g, '_');
      return { html: minimal, nameSafe, completedAt };
    }

    // try user name
    try {
      if (assessment.userId) {
        const usr: any = await db.user.findUnique({
          where: { id: assessment.userId },
          select: { firstName: true, lastName: true, email: true },
        });
        if (usr) {
          const n = `${usr.firstName ?? ''} ${usr.lastName ?? ''}`.trim();
          if (n) name = n;
          if (!name && usr.email) name = usr.email;
        }
      }
    } catch {
      // ignore
    }

    name = extractParticipantName(assessment, name) || name;

    const fromLasbi = await loadResponsesFromLasbi(db, assessmentId);
    if (fromLasbi.size) {
      canonicalToValue = fromLasbi;
    } else {
      const fromLegacy = extractResponsesFromAssessmentsJson(assessment, lasbi.byItemId);
      if (fromLegacy.size) canonicalToValue = fromLegacy;
    }

    if (responses) {
      const fromClient = responsesFromClientPayload(responses, lasbi.byItemId);
      if (fromClient.canonicalToValue.size) {
        for (const [k, v] of fromClient.canonicalToValue) canonicalToValue.set(k, v);
      }
    }
  } else {
    const fromClient = responsesFromClientPayload(responses, lasbi.byItemId);
    if (fromClient.canonicalToValue.size) {
      canonicalToValue = fromClient.canonicalToValue;
    } else if (fromClient.arrayOnly?.length) {
      const html = renderHtml({ participantName: name, overallArray: fromClient.arrayOnly });
      const nameSafe = (name || 'participant').replace(/[^\w\d_-]+/g, '_');
      return { html, nameSafe, completedAt: null };
    } else {
      const html = renderHtml({
        participantName: name,
        narrativeText: 'Either responses (with question IDs) or assessmentId is required.',
      });
      const nameSafe = (name || 'participant').replace(/[^\w\d_-]+/g, '_');
      return { html, nameSafe, completedAt: null };
    }
  }

  if (!canonicalToValue.size) {
    const html = renderHtml({
      participantName: name,
      assessmentId,
      completedAt,
      narrativeText: 'No responses found to generate report.',
    });
    const nameSafe = (name || 'participant').replace(/[^\w\d_-]+/g, '_');
    return { html, nameSafe, completedAt };
  }

  // aggregate by schema
  const bySchemaAgg: Record<string, { sum: number; n: number }> = {};
  for (const [canonical, v] of canonicalToValue) {
    const meta = lasbi.byCanonical.get(canonical);
    const schema = meta?.schema_label || 'Unmapped';
    const entry = bySchemaAgg[schema] || { sum: 0, n: 0 };
    entry.sum += v;
    entry.n += 1;
    bySchemaAgg[schema] = entry;
  }
  const bySchemaMean: Record<string, number> = {};
  for (const [k, agg] of Object.entries(bySchemaAgg)) {
    bySchemaMean[k] = agg.n ? agg.sum / agg.n : 0;
  }

  // public layer copy
  const top3 = pickTop3(bySchemaMean);
  const personaText = personaCopy?.forTop?.(top3.map((t) => t.schema)) ?? null;
  const narrativeText = narrativeFor?.(top3.map((t) => t.schema)) ?? null;

  const html = renderHtml({
    participantName: name,
    assessmentId,
    completedAt,
    canonicalToValue,
    bySchema: bySchemaMean,
    top3,
    personaText,
    narrativeText,
  });

  const nameSafe = (name || 'participant').replace(/[^\w\d_-]+/g, '_');
  return { html, nameSafe, completedAt };
}

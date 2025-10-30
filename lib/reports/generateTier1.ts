// Minimal Tier 1 report builder (no narrative packs; prints a clean summary)
import type { PrismaClient } from '@prisma/client';
import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';

export const TEMPLATE_VERSION = 'tier1-min-1.0.0';

type BuildArgs = {
  db: PrismaClient;
  userId?: string | null;
  assessmentId?: string | null;
  // Accepts either array or map; matches your API schema
  responses?: number[] | Record<string, number | { value: number }>;
  participantData?: any;
  audience?: 'counselling' | 'leadership';
};

function nameSafeFromUser(user?: { firstName?: string | null; lastName?: string | null; email?: string }) {
  const base =
    [user?.firstName, user?.lastName].filter(Boolean).join('_') ||
    (user?.email?.split('@')[0] ?? 'participant');
  return base.replace(/[^a-z0-9-_]+/gi, '_');
}

function normalizeResponses(
  raw?: number[] | Record<string, number | { value: number }>,
  canonical108?: string[]
): Record<string, number> | null {
  if (!raw) return null;

  // Case A: array of 108 numbers → map into canonical order if provided
  if (Array.isArray(raw)) {
    if (!canonical108 || raw.length !== canonical108.length) {
      // best effort: map 1..N to "position" fallback handled by scorer
      const out: Record<string, number> = {};
      raw.forEach((v, i) => (out[String(i + 1)] = v));
      return out;
    }
    const out: Record<string, number> = {};
    raw.forEach((v, i) => (out[canonical108[i]] = v));
    return out;
  }

  // Case B: record with numbers or {value}
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'number') out[k] = v;
    else if (v && typeof v === 'object' && typeof (v as any).value === 'number') out[k] = (v as any).value;
  }
  return out;
}

export async function buildTier1Report({
  db,
  userId,
  assessmentId,
  responses,
  participantData,
}: BuildArgs): Promise<{ html: string; nameSafe: string; completedAt?: Date | string | null }> {
  // 1) Load from DB if assessmentId provided
  let user:
    | { firstName?: string | null; lastName?: string | null; email?: string }
    | null = null;
  let completedAt: Date | null = null;
  let rawResponses: any = responses ?? null;

  if (assessmentId) {
    const a = await db.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        responses: true,
        completedAt: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!a) throw new Error('Assessment not found');
    user = a.user;
    completedAt = a.completedAt ?? null;
    if (!rawResponses && a.responses) rawResponses = a.responses;
  }

  // If no user via assessment, try to fetch from userId (optional)
  if (!user && userId) {
    const u = await db.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });
    if (u) user = u;
  }

  // 2) Normalize responses (let scorer accept 1..108 fallback)
  const normalized = normalizeResponses(rawResponses as any);

  if (!normalized || Object.keys(normalized).length === 0) {
    throw new Error('No responses provided or found for scoring');
  }

  // 3) Score (uses your golden scorer)
  const { rankedScores, display } = await scoreAssessmentResponses(normalized);
  const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);

  // 4) Minimal HTML rendering (printable)
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Participant';
  const nameSafe = nameSafeFromUser(user || { email: 'participant' });
  const dateStr = completedAt
    ? new Date(completedAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  const topRows = [primary, secondary, tertiary]
    .filter(Boolean)
    .map((s, i) => {
      const rank = ['Primary', 'Secondary', 'Tertiary'][i];
      return `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;">${rank}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${s!.schemaLabel}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${(s!.index0to100).toFixed(1)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${s!['caution'] ? '⚠︎ below 60' : ''}</td>
        </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tier 1 Summary — ${fullName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#111827; }
    .wrap { max-width: 860px; margin: 24px auto; padding: 24px; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    h2 { font-size: 18px; margin: 24px 0 8px; }
    .muted { color:#6b7280; }
    .card { border:1px solid #e5e7eb; border-radius: 8px; padding:16px; margin-top:12px; }
    table { border-collapse: collapse; width: 100%; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Tier 1 Summary</h1>
    <div class="muted">Template ${TEMPLATE_VERSION} • Generated ${dateStr}</div>

    <div class="card">
      <h2>Participant</h2>
      <div>${fullName}</div>
      ${participantData?.id ? `<div class="muted">Ref: ${participantData.id}</div>` : ''}
      ${completedAt ? `<div class="muted">Completed: ${dateStr}</div>` : ''}
    </div>

    <div class="card">
      <h2>Top Patterns (Index 0–100)</h2>
      <table>
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Rank</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Schema</th>
            <th style="text-align:right;padding:8px;border:1px solid #e5e7eb;">Index</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Note</th>
          </tr>
        </thead>
        <tbody>${topRows || `<tr><td colspan="4" style="padding:12px;border:1px solid #e5e7eb;">No top patterns available</td></tr>`}</tbody>
      </table>
      <p class="muted" style="margin-top:8px;">“⚠︎ below 60” marks results under a typical visibility threshold.</p>
    </div>

    <div class="card">
      <h2>Notes</h2>
      <p>This is a minimal report intended to confirm scoring & download flow. You can later plug in counselling narratives to enrich this section.</p>
    </div>
  </div>
</body>
</html>`;

  return { html, nameSafe, completedAt };
}

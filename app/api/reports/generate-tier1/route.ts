// app/api/reports/generate-tier1/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db'; // PrismaClient with model `assessments`

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PayloadSchema = z.object({
  assessmentId: z.string().min(1).optional(),
  responses: z
    .union([
      z.array(z.number()).nonempty().optional(),
      z
        .record(
          z.object({
            value: z.number(),
            timestamp: z.string().optional(),
          })
        )
        .optional(),
    ])
    .optional(),
  participantData: z.any().optional(),
});

const isValidLikert6 = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n) && n >= 1 && n <= 6;

/** Decide deterministic order for a responses map */
function decideOrder(
  responsesMap: Record<string, { value: number; timestamp?: string }>,
  maybeStoredOrder?: unknown
): string[] {
  if (Array.isArray(maybeStoredOrder) && maybeStoredOrder.length) {
    const keys = Object.keys(responsesMap || {});
    const a = new Set(keys);
    const b = new Set(maybeStoredOrder as string[]);
    if (a.size === b.size && [...a].every(k => b.has(k))) {
      return (maybeStoredOrder as string[]).slice();
    }
  }
  // fallback: stable sorted keys
  return Object.keys(responsesMap || {}).sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
}

/** Normalize to 1..6 numeric array (ordered) */
function normalizeResponsesToArray6(opts: {
  arr?: number[] | undefined;
  map?: Record<string, { value: number; timestamp?: string }> | undefined;
  order?: string[] | undefined;
}): number[] {
  const { arr, map, order } = opts;

  if (arr && Array.isArray(arr)) {
    return arr.map((v, i) => {
      if (!isValidLikert6(v)) throw new Error(`Bad value at index ${i}: ${String(v)} (expected 1..6)`);
      return v;
    });
  }

  if (map && typeof map === 'object') {
    const decided = order && order.length ? order : decideOrder(map, undefined);
    return decided.map((qid, i) => {
      const v = map[qid]?.value;
      if (!isValidLikert6(v)) {
        throw new Error(`Bad value for question "${qid}" at ordered index ${i}: ${String(v)} (expected 1..6)`);
      }
      return v;
    });
  }

  throw new Error('Either numeric responses array or responses map is required.');
}

function overallMean6(responses6: number[]): number {
  const sum = responses6.reduce((a, b) => a + b, 0);
  return responses6.length ? sum / responses6.length : 0;
}

function toPercentFromLikert6(n: number): number {
  return Math.round(((n - 1) / 5) * 100);
}

/** Tiny HTML report (swap in your template when ready) */
function renderHtmlReport(opts: { participantName?: string; responses6: number[]; overall6: number }) {
  const items = opts.responses6
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
  <meta charset="utf-8"/>
  <title>Tier-1 Summary</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
</head>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 24px;">
  <h1 style="margin: 0 0 8px;">Tier-1 Summary</h1>
  <div style="color:#555;margin-bottom:16px">Participant: ${opts.participantName || '—'}</div>

  <h2 style="margin: 16px 0 8px;">Overall</h2>
  <p style="margin:0 0 16px;">
    Mean (1..6): <strong>${opts.overall6.toFixed(2)}</strong> &nbsp;|&nbsp;
    Scaled (0–100): <strong>${toPercentFromLikert6(opts.overall6)}%</strong>
  </p>

  <h2 style="margin: 16px 0 8px;">Items (raw 1..6)</h2>
  <table style="border-collapse:collapse;width:100%;max-width:760px">
    <thead>
      <tr>
        <th style="text-align:left;padding:6px 12px;border:1px solid #ddd">Item</th>
        <th style="text-align:right;padding:6px 12px;border:1px solid #ddd">Score</th>
      </tr>
    </thead>
    <tbody>${items}</tbody>
  </table>
</body>
</html>`;
}

/** Safe helpers to read unknown DB shapes */
function extractResponsesMapFromAssessment(assessment: any):
  | Record<string, { value: number; timestamp?: string }>
  | undefined {
  // Common shapes your app might use:
  // - assessment.responses (map)
  // - assessment.data?.responses
  // - assessment.payload?.responses
  // Adjust if you know the exact path.
  const candidates = [
    assessment?.responses,
    assessment?.data?.responses,
    assessment?.payload?.responses,
  ];
  for (const c of candidates) {
    if (c && typeof c === 'object' && !Array.isArray(c)) return c as any;
  }
  return undefined;
}

function extractQuestionsOrderFromAssessment(assessment: any): string[] | undefined {
  // If you store order:
  // - assessment.questionsOrder
  // - assessment.data?.questionsOrder
  // - assessment.meta?.questionsOrder
  const candidates = [
    assessment?.questionsOrder,
    assessment?.data?.questionsOrder,
    assessment?.meta?.questionsOrder,
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.every((x: any) => typeof x === 'string')) return c as string[];
  }
  return undefined;
}

function extractParticipantName(assessment: any, fallback?: string): string | undefined {
  const candidates = [
    fallback,
    assessment?.bioData?.name,
    assessment?.data?.bioData?.name,
    assessment?.participant?.name,
    assessment?.user?.name,
  ];
  return candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
}

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = PayloadSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const { assessmentId, responses, participantData } = parsed.data;

    let responsesArray6: number[] | undefined;
    let participantName: string | undefined = participantData?.name;

    if (assessmentId) {
      // ✅ No `select` so this compiles regardless of your exact columns
      const assessment: any = await db.assessments.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      participantName = extractParticipantName(assessment, participantName);

      // Try to locate the saved responses map
      const savedMap = extractResponsesMapFromAssessment(assessment);

      // Decide display/report order (stored order if available, otherwise stable key sort)
      const storedOrder = extractQuestionsOrderFromAssessment(assessment);
      const decidedOrder = savedMap ? decideOrder(savedMap, storedOrder) : undefined;

      // Normalize from:
      // - provided numeric array (if client sent it anyway)
      // - provided map (if client sent map)
      // - saved map (from DB)
      responsesArray6 = normalizeResponsesToArray6({
        arr: Array.isArray(responses) ? (responses as number[]) : undefined,
        map:
          !Array.isArray(responses) && responses
            ? (responses as Record<string, { value: number; timestamp?: string }>)
            : savedMap,
        order: decidedOrder,
      });
    } else {
      // No id → must rely on provided `responses`
      if (!responses) {
        return NextResponse.json(
          { error: 'Either responses or assessmentId is required for Tier 1 report generation' },
          { status: 400 }
        );
      }

      if (Array.isArray(responses)) {
        responsesArray6 = normalizeResponsesToArray6({ arr: responses as number[] });
      } else {
        const map = responses as Record<string, { value: number; timestamp?: string }>;
        const decidedOrder = decideOrder(map, undefined);
        responsesArray6 = normalizeResponsesToArray6({ map, order: decidedOrder });
      }
    }

    if (!responsesArray6 || responsesArray6.length === 0) {
      return NextResponse.json({ error: 'No responses found to generate report' }, { status: 400 });
    }

    const overall = overallMean6(responsesArray6);

    const html = renderHtmlReport({
      participantName,
      responses6: responsesArray6,
      overall6: overall,
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

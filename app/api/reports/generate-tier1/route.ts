// app/api/reports/generate-tier1/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db'; // must expose PrismaClient with model `assessments`

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PayloadSchema = z.object({
  assessmentId: z.string().min(1).optional(),
  // Accept either array<number> or object map of { value, timestamp }
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

/** Core validation: 6-point Likert (1..6) */
const isValidLikert6 = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n) && n >= 1 && n <= 6;

/**
 * Decide a deterministic order for questions:
 * - prefer explicit `questionsOrder` if it matches the set of keys
 * - else fall back to sorted keys of the responses map
 */
function decideOrder(
  responsesMap: Record<string, { value: number; timestamp?: string }>,
  questionsOrder?: string[] | null
): string[] {
  const keys = Object.keys(responsesMap || {});
  if (Array.isArray(questionsOrder) && questionsOrder.length) {
    const setA = new Set(keys);
    const setB = new Set(questionsOrder);
    // Use provided order only if same key set
    if (setA.size === setB.size && [...setA].every(k => setB.has(k))) {
      return questionsOrder.slice();
    }
  }
  // Fallback: sort keys for stability
  return keys.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * Normalizes input into a clean 1..6 numeric array in the correct order.
 * - If `arr` is already numeric, validates each entry 1..6
 * - If `map` is provided, we order via `questionsOrderDecided`, extract `.value`, and validate 1..6
 */
function normalizeResponsesToArray6(opts: {
  arr?: number[] | undefined;
  map?: Record<string, { value: number; timestamp?: string }> | undefined;
  questionsOrderDecided?: string[];
}): number[] {
  const { arr, map, questionsOrderDecided } = opts;

  if (arr && Array.isArray(arr)) {
    const out = arr.map((v, i) => {
      if (!isValidLikert6(v)) {
        throw new Error(`Bad value at index ${i}: ${String(v)} (expected 1..6)`);
      }
      return v;
    });
    return out;
  }

  if (map && typeof map === 'object') {
    const order = questionsOrderDecided ?? decideOrder(map, undefined);
    const out: number[] = order.map((qid, i) => {
      const entry = map[qid];
      const v = entry?.value;
      if (!isValidLikert6(v)) {
        throw new Error(
          `Bad value for question "${qid}" at ordered index ${i}: ${String(v)} (expected 1..6)`
        );
      }
      return v;
    });
    return out;
  }

  throw new Error('Either numeric responses array or responses map is required.');
}

/** Overall mean on a 6-point scale */
function overallMean6(responses6: number[]): number {
  const sum = responses6.reduce((a, b) => a + b, 0);
  return responses6.length ? sum / responses6.length : 0;
}

/** Optional scaled percentage if you like (1..6 → 0..100) */
function toPercentFromLikert6(n: number): number {
  return Math.round(((n - 1) / 5) * 100); // (n-1)/5 * 100
}

/** Minimal HTML – replace with your real template when ready */
function renderHtmlReport(opts: {
  participantName?: string;
  responses6: number[];
  overall6: number;
}) {
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
  <meta charset="utf-8" />
  <title>Tier-1 Summary</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 24px;">
  <h1 style="margin: 0 0 8px;">Tier-1 Summary</h1>
  <div style="color:#555;margin-bottom:16px">Participant: ${opts.participantName || '—'}</div>

  <h2 style="margin: 16px 0 8px;">Overall</h2>
  <p style="margin:0 0 16px;">
    Mean (1..6): <strong>${opts.overall6.toFixed(2)}</strong> &nbsp;&nbsp;|&nbsp;&nbsp;
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
    let questionsOrderDecided: string[] | undefined;

    if (assessmentId) {
      // ✅ Use plural model name: `assessments`
      const assessment = await db.assessments.findUnique({
        where: { id: assessmentId },
        select: {
          id: true,
          bioData: true,           // { name, email, team, ... } if you store it
          responses: true,         // map: { [questionId]: { value, timestamp } }
          questionsOrder: true,    // optional: string[]
        },
      });

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      participantName = participantName || (assessment.bioData as any)?.name;

      const responsesMap = (assessment.responses || {}) as Record<
        string,
        { value: number; timestamp?: string }
      >;

      questionsOrderDecided = decideOrder(responsesMap, assessment.questionsOrder as string[] | null);

      responsesArray6 = normalizeResponsesToArray6({
        arr: Array.isArray(responses) ? (responses as number[]) : undefined,
        map: !Array.isArray(responses) && responses ? (responses as Record<string, { value: number }>) : responsesMap,
        questionsOrderDecided,
      });
    } else {
      // No id → must rely on provided responses
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
        questionsOrderDecided = decideOrder(map, undefined);
        responsesArray6 = normalizeResponsesToArray6({
          map,
          questionsOrderDecided,
        });
      }
    }

    if (!responsesArray6 || responsesArray6.length === 0) {
      return NextResponse.json({ error: 'No responses found to generate report' }, { status: 400 });
    }

    // Simple Tier-1: overall mean (1..6)
    const overall = overallMean6(responsesArray6);

    // Render HTML
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

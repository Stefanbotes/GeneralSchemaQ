import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db'; // 🔧 adjust to your DB access

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
  participantData: z.any().optional(), // kept for compatibility when called client-side
});

/** Core validation: 6-point Likert (1..6) */
const isValidLikert6 = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n) && n >= 1 && n <= 6;

/**
 * Normalizes input into a clean 1..6 numeric array in the correct order.
 * - If `arr` is already numeric, validates each entry 1..6
 * - If `map` is provided, we order by `questionsOrder`, extract `.value`, and validate 1..6
 */
function normalizeResponsesToArray6(opts: {
  arr?: number[] | undefined;
  map?: Record<string, { value: number; timestamp?: string }> | undefined;
  questionsOrder: string[]; // the order to render/report in
}): number[] {
  const { arr, map, questionsOrder } = opts;

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
    const out: number[] = questionsOrder.map((qid, i) => {
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

/** Example scoring that supports 1..6. Replace with your real scoring logic. */
function scoreBySchema(responses6: number[], schemaKeys: string[]): Record<string, number> {
  // Example: average per schema bucket. You likely have a map question -> schema.
  // This example assumes schemaKeys.length === responses6.length and is 1:1; adapt as needed.
  const buckets = new Map<string, { sum: number; count: number }>();
  responses6.forEach((v, i) => {
    const key = schemaKeys[i] ?? 'unknown';
    const cur = buckets.get(key) ?? { sum: 0, count: 0 };
    cur.sum += v;
    cur.count += 1;
    buckets.set(key, cur);
  });

  const out: Record<string, number> = {};
  for (const [k, { sum, count }] of buckets.entries()) {
    out[k] = count ? sum / count : 0;
  }
  return out;
}

/** Example mapping to 0..100 if your HTML expects a percentage scale */
function toPercentFromLikert6(n: number): number {
  // map 1..6 to 0..100 linearly: (n-1)/5 * 100
  return Math.round(((n - 1) / 5) * 100);
}

/** Minimal HTML – replace with your real template */
function renderHtmlReport(opts: {
  participantName?: string;
  categoryScores: Record<string, number>;
}) {
  const rows = Object.entries(opts.categoryScores)
    .map(
      ([k, v]) => `<tr>
      <td style="padding:6px 12px;border:1px solid #ddd">${k}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${v.toFixed(2)}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${toPercentFromLikert6(v)}%</td>
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
  <table style="border-collapse:collapse;width:100%;max-width:760px">
    <thead>
      <tr>
        <th style="text-align:left;padding:6px 12px;border:1px solid #ddd">Category</th>
        <th style="text-align:right;padding:6px 12px;border:1px solid #ddd">Mean (1..6)</th>
        <th style="text-align:right;padding:6px 12px;border:1px solid #ddd">Scaled (0..100)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
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

    // 1) Pull responses + question order (and schema keys) from DB if assessmentId is provided
    let responsesArray6: number[] | undefined;
    let participantName: string | undefined = participantData?.name;
    let schemaKeys: string[] = []; // parallel array to responses for category mapping
    let questionsOrder: string[] = []; // parallel array of question IDs (order)

    if (assessmentId) {
      // 🔧 Replace with your schema:
      // - fetch the saved assessment (includes stored responses and the order in which questions were asked)
      // - also fetch question metadata to know which schema/category each question belongs to
      const assessment = await db.assessment.findUnique({
        where: { id: assessmentId },
        select: {
          id: true,
          bioData: true, // name,email,team,...
          responses: true, // e.g. { [questionId]: { value, timestamp } }
          // If you store the order used at the time of the assessment, grab it here:
          questionsOrder: true, // e.g. string[]
        },
      });

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      participantName = participantName || assessment.bioData?.name;

      // You need an order to deterministically map the responses map -> array.
      // If you don't store it on the assessment, you can derive it from your questions table.
      questionsOrder = Array.isArray(assessment.questionsOrder)
        ? assessment.questionsOrder
        : await deriveDefaultOrderFromDB(); // 🔧 implement this to return string[] of question IDs in a consistent order

      // You also need a schema key per question (same length/order as questionsOrder)
      schemaKeys = await loadSchemaKeysInOrder(questionsOrder); // 🔧 implement this; returns string[] of schema keys per questionId

      responsesArray6 = normalizeResponsesToArray6({
        arr: Array.isArray(responses) ? (responses as number[]) : undefined,
        map: !Array.isArray(responses) && responses ? (responses as Record<string, { value: number }>) : (assessment.responses as any),
        questionsOrder,
      });
    } else {
      // 2) No assessmentId → must have `responses`
      // We still need an order and schema keys. For client-side fallback, derive a default order from DB.
      questionsOrder = await deriveDefaultOrderFromDB(); // 🔧 implement
      schemaKeys = await loadSchemaKeysInOrder(questionsOrder); // 🔧 implement

      responsesArray6 = normalizeResponsesToArray6({
        arr: Array.isArray(responses) ? (responses as number[]) : undefined,
        map: !Array.isArray(responses) && responses ? (responses as Record<string, { value: number }>) : undefined,
        questionsOrder,
      });
    }

    if (!responsesArray6 || responsesArray6.length === 0) {
      return NextResponse.json({ error: 'No responses found to generate report' }, { status: 400 });
    }

    // 3) Score on a 6-point basis
    const categoryScores = scoreBySchema(responsesArray6, schemaKeys);

    // 4) Render HTML
    const html = renderHtmlReport({
      participantName,
      categoryScores,
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

/** 🔧 Implement these for your data model */

// If you don't persist the exact question order on the assessment row,
// decide on a stable default (e.g., by original import order).
async function deriveDefaultOrderFromDB(): Promise<string[]> {
  // Example:
  // const qs = await db.question.findMany({ orderBy: { order: 'asc' }, select: { id: true } });
  // return qs.map(q => q.id);
  return []; // TODO: implement
}

async function loadSchemaKeysInOrder(questionIds: string[]): Promise<string[]> {
  // Example:
  // const qs = await db.question.findMany({ where: { id: { in: questionIds } }, select: { id: true, schema: true } });
  // const byId = new Map(qs.map(q => [q.id, q.schema || 'unknown']));
  // return questionIds.map(id => byId.get(id) ?? 'unknown');
  return questionIds.map(() => 'unknown'); // TODO: implement
}

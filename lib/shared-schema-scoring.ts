// app/lib/shared-schema-scoring.ts
// Golden-aligned schema scoring (18 schemas × 6 items = 108)
// Identity comes from mapping (itemId cmf… or canonicalId "d.s.q")
// Never infer meaning from order/position

import {
  loadItemToSchema,          // Map<string, { variableId, clinicalSchemaId, schemaLabel, questionNumber, reverse?, weight? }>
  loadCanonicalItemOrder,    // string[] of "d.s.q" (for QA/ordering only)
  isItemId,                  // (s: string) => boolean  // true for modern cmf… ids
  mappingVersion             // string (e.g., "lasbi-v1.3.0")
} from "./shared-lasbi-mapping";

// -------------------------------
// Types
// -------------------------------
export type ResponseInput = {
  itemId?: string;       // modern LASBI id (cmf…)
  canonicalId?: string;  // "d.s.q" (e.g., "2.4.3")
  value: number;         // 1..6
};

export type SchemaScore = {
  variableId: string;         // "d.s"
  clinicalSchemaId: string;   // e.g., "failure"
  schemaLabel: string;        // presentation label
  n: number;                  // usually 6 when complete
  mean: number;               // unrounded 1..6 (after reverse/weights)
  index0to100: number;        // unrounded linear 0..100
};

export type ScoreOptions = {
  payloadMappingVersion?: string; // version carried by the payload (recommended in prod)
  applyWeights?: boolean;         // default false (weight=1)
  round?: boolean;                // default false (leave unrounded)
  requireCompleteness?: boolean;  // default true (108 total, 6 per schema)
};

// -------------------------------
// Helpers
// -------------------------------

// Canonical id pattern: domain 1..5, sub 1..5, question 1..6
const CANONICAL_RE = /^[1-5]\.[1-5]\.[1-6]$/;

// Convert 1..6 mean to 0..100 index: 1→0, 6→100
const toIdx = (mean1to6: number) => ((mean1to6 - 1) / 5) * 100;

const round2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

function pickKey(r: ResponseInput): string | null {
  if (r.itemId && isItemId(r.itemId)) return r.itemId;
  if (r.canonicalId && CANONICAL_RE.test(r.canonicalId)) return r.canonicalId;
  return null;
}

// -------------------------------
/** Main scoring API: aggregates responses into per-schema scores. */
export function scoreSchemas(
  responses: ResponseInput[],
  opts: ScoreOptions = {}
): SchemaScore[] {
  if (!Array.isArray(responses) || responses.length === 0) {
    throw new Error("scoreSchemas: responses must be a non-empty array");
  }

  const {
    payloadMappingVersion,
    applyWeights = false,
    round = false,
    requireCompleteness = true
  } = opts;

  // 1) Version gate (hard fail unless explicitly bypassed)
  if (payloadMappingVersion && payloadMappingVersion !== mappingVersion) {
    throw new Error(
      `Mapping version mismatch: got '${payloadMappingVersion}', expected '${mappingVersion}'`
    );
  }

  // 2) Build lookup keyed by both itemId and canonicalId
  const map = loadItemToSchema(); // Map<string, Meta>

  // 3) Normalize inputs -> mapped rows with reverse/weights applied
  const rows = responses.map((r, i) => {
    const key = pickKey(r);
    if (!key) {
      throw new Error(
        `Unmappable response at index ${i + 1}: needs itemId (cmf…) or canonicalId (d.s.q)`
      );
    }
    const meta = map.get(key);
    if (!meta) {
      throw new Error(`Unknown item key '${key}' (not in mapping '${mappingVersion}')`);
    }

    const raw = Number(r.value);
    if (!Number.isFinite(raw) || raw < 1 || raw > 6) {
      throw new Error(`Bad value at index ${i + 1}: ${r.value} (expected 1..6)`);
    }

    // Reverse on a 1..6 scale
    const value = meta.reverse ? (7 - raw) : raw;
    const weight = applyWeights ? (meta.weight ?? 1) : 1;

    return {
      variableId: meta.variableId,                 // "d.s"
      clinicalSchemaId: meta.clinicalSchemaId,     // stable clinical id
      schemaLabel: meta.schemaLabel,               // display label
      questionNumber: meta.questionNumber,         // 1..6
      value,
      weight
    };
  });

  // 4) Completeness checks (strongly recommended)
  if (requireCompleteness) {
    if (rows.length !== 108) {
      throw new Error(`Expected 108 responses, got ${rows.length}`);
    }
  }

  // 5) Aggregate per schema
  const bySchema = new Map<
    string,
    { sum: number; wsum: number; n: number; label: string; cid: string }
  >();

  for (const r of rows) {
    const bucket =
      bySchema.get(r.variableId) ??
      { sum: 0, wsum: 0, n: 0, label: r.schemaLabel, cid: r.clinicalSchemaId };
    bucket.sum += r.value * r.weight;
    bucket.wsum += r.weight;
    bucket.n += 1;
    bySchema.set(r.variableId, bucket);
  }

  if (requireCompleteness) {
    for (const [vid, b] of bySchema) {
      if (b.n !== 6) {
        throw new Error(`Schema ${vid} has ${b.n} items (expected 6)`);
      }
    }
  }

  // 6) Build results
  const out: SchemaScore[] = Array.from(bySchema.entries()).map(([variableId, b]) => {
    const mean = b.sum / (b.wsum || 1);
    const idx = toIdx(mean);
    return {
      variableId,
      clinicalSchemaId: b.cid,
      schemaLabel: b.label,
      n: b.n,
      mean: round ? round2(mean) : mean,
      index0to100: round ? round2(idx) : idx
    };
  });

  // 7) Stable ordering by canonical variable sequence (for UX/QA only)
  const canonicalOrder = toCanonicalVariableOrder(loadCanonicalItemOrder());
  out.sort(
    (a, b) =>
      canonicalOrder.indexOf(a.variableId) - canonicalOrder.indexOf(b.variableId)
  );

  return out;
}

// -------------------------------
// QA helpers (optional exports)
// -------------------------------
export function assertGoldenCompleteness(scores: SchemaScore[]) {
  if (scores.length !== 18) {
    throw new Error(`Expected 18 schema scores, got ${scores.length}`);
  }
  for (const s of scores) {
    if (s.n !== 6) {
      throw new Error(`Schema ${s.variableId} has n=${s.n}, expected 6`);
    }
  }
}

export function toCanonicalVariableOrder(ids: string[]): string[] {
  // ids are "d.s.q" → collapse to unique "d.s" in canonical order
  const seen = new Set<string>();
  const order: string[] = [];
  for (const id of ids) {
    const parts = id.split(".");
    if (parts.length !== 3) continue;
    const vid = `${parts[0]}.${parts[1]}`;
    if (!seen.has(vid)) {
      seen.add(vid);
      order.push(vid);
    }
  }
  return order;
}

// -------------------------------
// Legacy Compatibility API
// -------------------------------

const TIE_BREAKER_ORDER = [
  "Negativity/Pessimism","Emotional Inhibition","Unrelenting Standards/Hypercriticalness",
  "Abandonment/Instability","Mistrust/Abuse","Emotional Deprivation","Defectiveness/Shame","Social Isolation/Alienation",
  "Insufficient Self-Control/Discipline","Entitlement/Grandiosity",
  "Dependence/Incompetence","Vulnerability to Harm/Illness","Enmeshment/Undeveloped Self","Failure",
  "Subjugation","Self-Sacrifice","Approval-Seeking/Recognition-Seeking","Punitiveness"
];

function byTieBreaker(a: string, b: string): number {
  const ia = TIE_BREAKER_ORDER.indexOf(a);
  const ib = TIE_BREAKER_ORDER.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

export type DisplayScore = SchemaScore & {
  displayIndex: number;
  caution?: boolean;
};

/**
 * Legacy: scoreAssessmentResponses
 * Adapts old API (Record<string,number|string>) to new scoreSchemas API
 * Accepts keys as:
 *  - cmf… (modern itemId)
 *  - d.s.q (canonical; q=1..6)
 *  - position "1".."108" (fallback via canonical order)
 */
export async function scoreAssessmentResponses(
  responses: Record<string, string | number>
): Promise<{
  rankedScores: SchemaScore[];
  display: DisplayScore[];
}> {
  // Convert to new API format
  const responseInputs: ResponseInput[] = [];

  const canon = loadCanonicalItemOrder(); // length 108 (d.s.q)
  
  for (const [key, val] of Object.entries(responses)) {
    const numVal = typeof val === 'string' ? parseInt(val, 10) : val;

    if (!Number.isFinite(numVal)) continue;

    if (isItemId(key)) {
      responseInputs.push({ itemId: key, value: numVal });
    } else if (/^[1-5]\.[1-5]\.[1-6]$/.test(key)) {
      responseInputs.push({ canonicalId: key, value: numVal });
    } else {
      // Legacy position-based (1..108)
      const idx = parseInt(key, 10) - 1;
      if (idx >= 0 && idx < canon.length) {
        responseInputs.push({ canonicalId: canon[idx], value: numVal });
      }
    }
  }

  // Score using new API
  const scores = scoreSchemas(responseInputs, {
    requireCompleteness: false, // legacy was more lenient
    round: false
  });

  // Sort descending by index
  const ranked = [...scores].sort((a, b) => b.index0to100 - a.index0to100);

  // Prepare display with stable tie-breaker
  const display: DisplayScore[] = ranked.map(s => ({
    ...s,
    displayIndex: Math.round(s.index0to100)
  }));

  display.sort((a, b) => {
    if (a.displayIndex !== b.displayIndex) return b.displayIndex - a.displayIndex;
    return byTieBreaker(a.schemaLabel, b.schemaLabel);
  });

  return { rankedScores: ranked, display };
}

/**
 * Legacy: pickTop3
 * Returns top 3 schemas, marking ones below threshold as "caution"
 */
export function pickTop3(
  ranked: SchemaScore[],
  threshold: number = 60
): {
  primary?: SchemaScore & { caution?: boolean };
  secondary?: SchemaScore & { caution?: boolean };
  tertiary?: SchemaScore & { caution?: boolean };
} {
  const mark = (s: SchemaScore) => ({
    ...s,
    caution: Math.round(s.index0to100) < threshold
  });

  return {
    primary: ranked[0] ? mark(ranked[0]) : undefined,
    secondary: ranked[1] ? mark(ranked[1]) : undefined,
    tertiary: ranked[2] ? mark(ranked[2]) : undefined
  };
}


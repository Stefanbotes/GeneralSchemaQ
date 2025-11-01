// GeneralSchemaQ/lib/json-export.ts
// Studio-compatible JSON payload with CUID item ID mapping
// Exports (used by route):
//   - generateAssessmentExportV2  (overloaded: legacy 4-arg OR new 1-arg)
//   - validateSurgicalExport

/* -------------------------------- Types -------------------------------- */

export type StudioItem = { id: string; value: number };

export interface StudioExportInput {
  respondentId: string;
  respondentInitials?: string | null;
  assessmentId: string;
  completedAtISO: string; // e.g., new Date().toISOString()
  instrumentName: string; // e.g., "LASBI"
  instrumentForm: string; // e.g., "short"
  scaleMin: number;       // e.g., 1
  scaleMax: number;       // e.g., 6
  items: StudioItem[];    // numeric ids in, e.g. [{ id: "1.1.1", value: 4 }]
  sourceApp: string;         // e.g., "Leadership Assessment Portal"
  sourceAppVersion: string;  // e.g., "3.2.1"
  exportedAtISO?: string;    // defaults to now (UTC ISO string)
  checksumSha256?: string;   // optional — computed if omitted
  schemaVersion?: string;    // default "1.0.0"
  analysisVersion?: string;  // default "2025.11"
}

/* ----------------------- Numeric ID to CUID Mapping --------------------- */
/**
 * Replace the placeholder below with your full 108-entry mapping (unchanged).
 * IMPORTANT: Do not leave "..." placeholders; they count as missing entries.
 */
const NUMERIC_TO_CUID_MAP: Record<string, string> = Object.freeze({
  // === PASTE YOUR FULL 108-ENTRY MAP HERE ===
  "1.1.1": "cmff2ushm0000sbb3xz75fwkz",
  // ...
  "5.4.6": "cmh38aen001ixsbb3t2e4n6r6",
});

/* -------------------- Mapping integrity (lazy validation) ---------------- */

// set STUDIO_STRICT_MAP="true" to throw on errors at request-time; default warn-only
const STRICT = String(process.env.STUDIO_STRICT_MAP ?? "").toLowerCase() === "true";
let __mappingChecked = false;

function* numericIdIterator(): Generator<string> {
  const ranges = [
    [1, 1, 5],
    [2, 1, 4],
    [3, 1, 2],
    [4, 1, 3],
    [5, 1, 4],
  ] as const;
  for (const [sec, start, end] of ranges) {
    for (let sub = start; sub <= end; sub++) {
      for (let i = 1; i <= 6; i++) yield `${sec}.${sub}.${i}`;
    }
  }
}

function checkMappingOnce() {
  if (__mappingChecked) return;
  __mappingChecked = true;

  const problems: string[] = [];

  // Missing keys
  const missing: string[] = [];
  for (const id of numericIdIterator()) {
    if (!(id in NUMERIC_TO_CUID_MAP)) missing.push(id);
  }
  if (missing.length) {
    problems.push(
      `Missing ${missing.length} ids: ${missing.slice(0, 20).join(", ")}${missing.length > 20 ? " …" : ""}`
    );
  }

  // Duplicate CUID values
  const seen = new Map<string, string>(); // cuid -> numeric id
  for (const [num, cuid] of Object.entries(NUMERIC_TO_CUID_MAP)) {
    const prev = seen.get(cuid);
    if (prev) problems.push(`Duplicate CUID "${cuid}" for numeric ids "${prev}" and "${num}"`);
    seen.set(cuid, num);
  }

  // Count check
  const total = Object.keys(NUMERIC_TO_CUID_MAP).length;
  if (total !== 108) problems.push(`Expected 108 entries, found ${total}`);

  if (problems.length) {
    const msg = `CUID mapping validation:\n- ${problems.join("\n- ")}`;
    if (STRICT) {
      // Throw at request-time (never at import-time)
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
}

/* --------------------------- Helper: validation ------------------------- */

function assertValidItems(items: StudioItem[], min: number, max: number) {
  for (const it of items) {
    if (!/^\d\.\d\.\d$/.test(it.id)) {
      throw new Error(`Invalid item id "${it.id}" (expected X.Y.Z like "1.2.3").`);
    }
    if (!Number.isInteger(it.value) || it.value < min || it.value > max) {
      throw new Error(
        `Value out of range for ${it.id}: ${it.value} (expected integer ${min}…${max}).`
      );
    }
  }
}

function assertISO(iso: string, fieldName: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(iso)) {
    throw new Error(
      `Invalid ${fieldName} "${iso}" (expected ISO 8601 UTC, e.g. 2025-01-02T03:04:05Z).`
    );
  }
}

/* --------------------------- Helper: checksum --------------------------- */

async function sha256Hex(input: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle !== "undefined") {
    const enc = new TextEncoder();
    const buf = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(input));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(input).digest("hex");
}

/* -------------------- Helper: Map numeric IDs to CUIDs ------------------ */

function mapItemsToCUID(items: StudioItem[]): StudioItem[] {
  checkMappingOnce(); // validate mapping on first use (warn or throw per env)
  return items.map((item) => {
    const cuid = NUMERIC_TO_CUID_MAP[item.id];
    if (!cuid) {
      const msg = `No CUID mapping found for item "${item.id}". Valid numeric IDs are 1.1.1..5.4.6 (108 items).`;
      if (STRICT) throw new Error(msg);
      console.warn(msg);
      // In non-strict mode, still fail fast to avoid sending bad payloads to Studio:
      throw new Error(msg);
    }
    return { id: cuid, value: item.value };
  });
}

/* ------------------------------ Core builder ---------------------------- */

export async function buildStudioPayload(input: StudioExportInput) {
  const {
    respondentId,
    respondentInitials = null,
    assessmentId,
    completedAtISO,
    instrumentName,
    instrumentForm,
    scaleMin,
    scaleMax,
    items,
    sourceApp,
    sourceAppVersion,
    exportedAtISO = new Date().toISOString(),
    checksumSha256,
    schemaVersion = "1.0.0",
    analysisVersion = "2025.11",
  } = input;

  assertISO(completedAtISO, "completedAtISO");
  assertISO(exportedAtISO, "exportedAtISO");
  if (scaleMin >= scaleMax) {
    throw new Error(`Invalid scale: min (${scaleMin}) must be < max (${scaleMax}).`);
  }
  assertValidItems(items, scaleMin, scaleMax);

  const mappedItems = mapItemsToCUID(items);

  // Ensure no duplicate mapped CUIDs in this payload
  {
    const ids = new Set<string>();
    for (const it of mappedItems) {
      if (ids.has(it.id)) {
        throw new Error(`Duplicate mapped CUID in payload: ${it.id}. Check input items for duplicates.`);
      }
      ids.add(it.id);
    }
  }

  const payloadWithoutChecksum = {
    schemaVersion,
    analysisVersion,
    respondent: {
      id: respondentId,
      initials: respondentInitials,
      dobYear: null,
    },
    assessment: {
      assessmentId,
      completedAt: completedAtISO,
      instrument: {
        name: instrumentName,
        form: instrumentForm,
        scale: { min: scaleMin, max: scaleMax },
        items: mappedItems,
      },
    },
    provenance: {
      sourceApp,
      sourceAppVersion,
      exportedAt: exportedAtISO,
    },
  };

  let finalChecksum = checksumSha256;
  if (!finalChecksum) {
    const canonical = JSON.stringify(payloadWithoutChecksum);
    finalChecksum = await sha256Hex(canonical);
  }

  return {
    ...payloadWithoutChecksum,
    provenance: {
      ...payloadWithoutChecksum.provenance,
      checksumSha256: finalChecksum,
    },
  };
}

/* --------------------- Compatibility exports for route.ts --------------- */

export async function generateAssessmentExportV2(input: StudioExportInput): Promise<any>;
export async function generateAssessmentExportV2(
  responses: any[] | Record<string, any>,
  participantData?: any,
  assessmentId?: string | number,
  userId?: string | number
): Promise<any>;

export async function generateAssessmentExportV2(...args: any[]): Promise<any> {
  // New style: single object already in StudioExportInput shape
  if (args.length === 1) {
    const input = args[0] as StudioExportInput;
    return buildStudioPayload(input);
  }

  // Legacy style: (responses, participantData, assessmentId, userId)
  const [responsesRaw, participantData, assessmentId, userId] = args;

  const items = normalizeResponsesToItems(responsesRaw);

  const completedAtISO =
    participantData?.completedAtISO ??
    participantData?.assessmentCompletedAt ??
    participantData?.completedAt ??
    new Date().toISOString();

  const input: StudioExportInput = {
    respondentId: String(
      participantData?.id ?? participantData?.respondentId ?? userId ?? "unknown"
    ),
    respondentInitials: participantData?.initials ?? participantData?.respondentInitials ?? null,
    assessmentId: String(assessmentId ?? participantData?.assessmentId ?? "unknown"),
    completedAtISO,
    instrumentName: participantData?.instrumentName ?? "LASBI",
    instrumentForm: participantData?.instrumentForm ?? "short",
    scaleMin: Number(participantData?.scaleMin ?? 1),
    scaleMax: Number(participantData?.scaleMax ?? 6),
    items,
    sourceApp: participantData?.sourceApp ?? "GeneralSchemaQ",
    sourceAppVersion: participantData?.sourceAppVersion ?? "2.0.0",
    exportedAtISO: new Date().toISOString(),
    schemaVersion: participantData?.schemaVersion ?? "1.0.0",
    analysisVersion: participantData?.analysisVersion ?? "2025.11",
  };

  return buildStudioPayload(input);
}

/* ----------------------- Response normalization helper ------------------ */

function normalizeResponsesToItems(responses: unknown): StudioItem[] {
  // Case A: array already
  if (Array.isArray(responses)) {
    return responses.map((r: any) => ({
      id: String(r?.id ?? r?.itemId ?? r?.code ?? r?.questionId),
      value: Number(r?.value ?? r?.score ?? r?.answer ?? r?.response ?? r?.val ?? 0),
    }));
  }

  // Case B: object with items array
  if (responses && typeof responses === "object" && Array.isArray((responses as any).items)) {
    const arr = (responses as any).items as any[];
    return arr.map((r: any) => ({
      id: String(r?.id ?? r?.itemId ?? r?.code ?? r?.questionId),
      value: Number(r?.value ?? r?.score ?? r?.answer ?? r?.response ?? r?.val ?? 0),
    }));
  }

  // Case C: plain record of key -> primitive or object
  if (responses && typeof responses === "object") {
    const out: StudioItem[] = [];
    for (const [key, raw] of Object.entries(responses as Record<string, any>)) {
      const value = Number(
        (raw != null && typeof raw === "object")
          ? (raw.value ?? raw.score ?? raw.answer ?? raw.response ?? raw.val ?? 0)
          : raw
      );
      out.push({ id: String(key), value });
    }
    return out;
  }

  return [];
}

/* ---------------------------- Validation helper ------------------------- */

export function validateSurgicalExport(payload: unknown): {
  ok: boolean;
  errors: string[];
  error: string | null;
  details: string[];
} {
  const errors: string[] = [];
  const p = payload as any;

  if (!p || typeof p !== "object") {
    return {
      ok: false,
      errors: ["Payload is not an object"],
      error: "Payload is not an object",
      details: ["Payload is not an object"],
    };
  }

  for (const key of ["schemaVersion", "analysisVersion", "respondent", "assessment", "provenance"]) {
    if (!(key in p)) errors.push(`Missing top-level key: ${key}`);
  }

  const items = p?.assessment?.instrument?.items as Array<{ id: string; value: number }>;
  if (!Array.isArray(items)) {
    errors.push("assessment.instrument.items must be an array");
  } else {
    const validCUIDs = new Set<string>(Object.values(NUMERIC_TO_CUID_MAP));
    const seen = new Set<string>();
    items.forEach((it, idx) => {
      if (!it || typeof it !== "object") {
        errors.push(`items[${idx}] is not an object`);
        return;
      }
      if (typeof it.id !== "string" || !validCUIDs.has(it.id)) {
        errors.push(`items[${idx}].id (${String(it.id)}) is not a recognized LASBI CUID`);
      } else if (seen.has(it.id)) {
        errors.push(`items[${idx}].id (${it.id}) duplicate in payload`);
      } else {
        seen.add(it.id);
      }
      if (!Number.isInteger(it.value)) {
        errors.push(`items[${idx}].value must be an integer`);
      }
    });
  }

  const iso = (s: any) =>
    typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s);
  if (!iso(p?.assessment?.completedAt)) errors.push("assessment.completedAt must be ISO 8601 UTC");
  if (!iso(p?.provenance?.exportedAt)) errors.push("provenance.exportedAt must be ISO 8601 UTC");

  const ok = errors.length === 0;
  return {
    ok,
    errors,
    error: ok ? null : (errors[0] ?? "Validation failed"),
    details: errors,
  };
}

/* -------------------------- Utility: Mapping Info ----------------------- */

export function getCUIDMapping() {
  return NUMERIC_TO_CUID_MAP;
}
export function hasCUIDMapping(numericId: string): boolean {
  return numericId in NUMERIC_TO_CUID_MAP;
}
export function getCUIDForNumericId(numericId: string): string | null {
  return NUMERIC_TO_CUID_MAP[numericId] || null;
}


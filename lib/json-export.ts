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
  // 1.1 Abandonment/Instability
 "1.1.1": "cmff2ushm0000sbb3xz75fwkz",
 "1.1.2": "cmff2ushp0001sbb3pndmp2so",
 "1.1.3": "cmff2ushq0002sbb32tnxfwlh",
 "1.1.4": "cmh38aen0001xsbb3k9m2n4p5",
 "1.1.5": "cmh38aen0002xsbb3t7w8q1r6",
 "1.1.6": "cmh38aen0003xsbb3u3j5h9s7",
 
 // 1.2 Defectiveness/Shame
 "1.2.1": "cmff2ushr0003sbb3flyzk52v",
 "1.2.2": "cmff2usht0004sbb3ffbtcrz1",
 "1.2.3": "cmff2ushu0005sbb3sg7x6xou",
 "1.2.4": "cmh38aen0004xsbb3v2k6m8t9",
 "1.2.5": "cmh38aen0005xsbb3w5n7p9u1",
 "1.2.6": "cmh38aen0006xsbb3x8q1r2v3",
 
 // 1.3 Emotional Deprivation
 "1.3.1": "cmff2ushv0006sbb3o6qo5u3p",
 "1.3.2": "cmff2ushx0007sbb343uaq7c3",
 "1.3.3": "cmff2ushy0008sbb3o690p5jb",
 "1.3.4": "cmh38aen0007xsbb3y1t3s5w4",
 "1.3.5": "cmh38aen0008xsbb3z4w6t8x5",
 "1.3.6": "cmh38aen0009xsbb3a7z9u1y6",
 
 // 1.4 Mistrust/Abuse
 "1.4.1": "cmff2ushz0009sbb3kpmyd2vv",
 "1.4.2": "cmff2usi1000asbb3g2b2rrbg",
 "1.4.3": "cmff2usi2000bsbb38ksh1592",
 "1.4.4": "cmh38aen000axsbb3b0c2v4z7",
 "1.4.5": "cmh38aen000bxsbb3c3f5w7a8",
 "1.4.6": "cmh38aen000cxsbb3d6i8x0b9",
 
 // 1.5 Social Isolation
 "1.5.1": "cmff2usi3000csbb3kvmjjlqx",
 "1.5.2": "cmff2usi4000dsbb3cd5wlepc",
 "1.5.3": "cmff2usi5000esbb3ylvjxwkg",
 "1.5.4": "cmh38aen000dxsbb3e9l1y3c1",
 "1.5.5": "cmh38aen000exsbb3f2o4z6d2",
 "1.5.6": "cmh38aen000fxsbb3g5r7a9e3",
 
 // Section 2: Impaired Autonomy & Performance (2.1 - 2.4)
 
 // 2.1 Dependence/Incompetence
 "2.1.1": "cmff2usi7000fsbb3ywkt6zp7",
 "2.1.2": "cmff2usi8000gsbb3a09v5bws",
 "2.1.3": "cmff2usi9000hsbb3azlj0bkv",
 "2.1.4": "cmh38aen000gxsbb3h8u0b2f4",
 "2.1.5": "cmh38aen000hxsbb3i1x3c5g5",
 "2.1.6": "cmh38aen000ixsbb3j4a6d8h6",
 
 // 2.2 Vulnerability to Harm
 "2.2.1": "cmff2usib000isbb3c7s52ubh",
 "2.2.2": "cmff2usic000jsbb3rs3bs16v",
 "2.2.3": "cmff2usid000ksbb3i2jyy5oj",
 "2.2.4": "cmh38aen000jxsbb3k7d9e1i7",
 "2.2.5": "cmh38aen000kxsbb3l0g2f4j8",
 "2.2.6": "cmh38aen000lxsbb3m3j5g7k9",
 
 // 2.3 Enmeshment/Undeveloped Self
 "2.3.1": "cmff2usie000lsbb3euvd2b7y",
 "2.3.2": "cmff2usif000msbb3v6yu4bd0",
 "2.3.3": "cmff2usih000nsbb3c5rnpxfd",
 "2.3.4": "cmh38aen000mxsbb3n6m8h0l1",
 "2.3.5": "cmh38aen000nxsbb3o9p1i3m2",
 "2.3.6": "cmh38aen000oxsbb3p2s4j6n3",
 
 // 2.4 Failure
 "2.4.1": "cmff2usii000osbb3lmntidwh",
 "2.4.2": "cmff2usij000psbb3ny55yrs2",
 "2.4.3": "cmff2usik000qsbb3iuypzlgo",
 "2.4.4": "cmh38aen000pxsbb3q5v7k9o4",
 "2.4.5": "cmh38aen000qxsbb3r8y0l2p5",
 "2.4.6": "cmh38aen000rxsbb3s1b3m5q6",
 
 // Section 3: Impaired Limits (3.1 - 3.2)
 
 // 3.1 Entitlement/Grandiosity
 "3.1.1": "cmff2usil000rsbb3dr1qqw4h",
 "3.1.2": "cmff2usin000ssbb3ahr8x8p1",
 "3.1.3": "cmff2usio000tsbb3tbvbwh4s",
 "3.1.4": "cmh38aen000sxsbb3t4e6n8r7",
 "3.1.5": "cmh38aen000txsbb3u7h9o1s8",
 "3.1.6": "cmh38aen000uxsbb3v0k2p4t9",
 
 // 3.2 Insufficient Self-Control
 "3.2.1": "cmff2usip000usbb39ky60h0y",
 "3.2.2": "cmff2usiq000vsbb3c8yb73sj",
 "3.2.3": "cmff2usir000wsbb3qg5zscpd",
 "3.2.4": "cmh38aen000vxsbb3w3n5q7u1",
 "3.2.5": "cmh38aen000wxsbb3x6q8r0v2",
 "3.2.6": "cmh38aen000xxsbb3y9t1s3w3",
 
 // Section 4: Other-Directedness (4.1 - 4.3)
 
 // 4.1 Subjugation
 "4.1.1": "cmff2usit000xsbb3swkgowx8",
 "4.1.2": "cmff2usiu000ysbb3v302gutd",
 "4.1.3": "cmff2usiv000zsbb3a6l4t6i2",
 "4.1.4": "cmh38aen000yxsbb3z2w4t6x4",
 "4.1.5": "cmh38aen000zxsbb3a5z7u9y5",
 "4.1.6": "cmh38aen0010xsbb3b8c0v2z6",
 
 // 4.2 Self-Sacrifice
 "4.2.1": "cmff2usix0010sbb3tmc3fibw",
 "4.2.2": "cmff2usiy0011sbb3i0rwfy7i",
 "4.2.3": "cmff2usiz0012sbb36w0dxezg",
 "4.2.4": "cmh38aen0011xsbb3c1f3w5a7",
 "4.2.5": "cmh38aen0012xsbb3d4i6x8b8",
 "4.2.6": "cmh38aen0013xsbb3e7l9y1c9",
 
 // 4.3 Approval-Seeking
 "4.3.1": "cmff2usj00013sbb3f2qfypqi",
 "4.3.2": "cmff2usj20014sbb3x0nvy9n4",
 "4.3.3": "cmff2usj30015sbb3132vwvuq",
 "4.3.4": "cmh38aen0014xsbb3f0o2z4d1",
 "4.3.5": "cmh38aen0015xsbb3g3r5a7e2",
 "4.3.6": "cmh38aen0016xsbb3h6u8b0f3",
 
 // Section 5: Overvigilance & Inhibition (5.1 - 5.4)
 
 // 5.1 Negativity/Pessimism
 "5.1.1": "cmff2usj40016sbb39ekru832",
 "5.1.2": "cmff2usj50017sbb3dwf4gj9i",
 "5.1.3": "cmff2usj60018sbb34db4vsk6",
 "5.1.4": "cmh38aen0017xsbb3i9x1c3g4",
 "5.1.5": "cmh38aen0018xsbb3j2a4d6h5",
 "5.1.6": "cmh38aen0019xsbb3k5d7e9i6",
 
 // 5.2 Emotional Inhibition
 "5.2.1": "cmff2usj80019sbb3hoe1jieo",
 "5.2.2": "cmff2usj9001asbb3vccgx7en",
 "5.2.3": "cmff2usja001bsbb3j97bp80c",
 "5.2.4": "cmh38aen001axsbb3l8g0f2j7",
 "5.2.5": "cmh38aen001bxsbb3m1j3g5k8",
 "5.2.6": "cmh38aen001cxsbb3n4m6h8l9",
 
 // 5.3 Unrelenting Standards
 "5.3.1": "cmff2usjb001csbb31c8pl4lv",
 "5.3.2": "cmff2usjd001dsbb3se57nmbu",
 "5.3.3": "cmff2usje001esbb3xtcdk120",
 "5.3.4": "cmh38aen001dxsbb3o7p9i1m1",
 "5.3.5": "cmh38aen001exsbb3p0s2j4n2",
 "5.3.6": "cmh38aen001fxsbb3q3v5k7o3",
 
 // 5.4 Punitiveness
 "5.4.1": "cmff2usjf001fsbb3ncx82jxt",
 "5.4.2": "cmff2usjg001gsbb3uiepg7e7",
 "5.4.3": "cmff2usji001hsbb3gcrd9655",
 "5.4.4": "cmh38aen001gxsbb3r6y8l0p4",
 "5.4.5": "cmh38aen001hxsbb3s9b1m3q5",
 "5.4.6": "cmh38aen001ixsbb3t2e4n6r6",
;
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


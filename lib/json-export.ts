// GeneralSchemaQ/lib/json-export.ts
// Builds a "Studio"-compatible JSON payload with CUID item ID mapping
// Exports compatibility functions used by the API route:
//   - generateAssessmentExportV2
//   - validateSurgicalExport

/* -------------------------------- Types -------------------------------- */

export type StudioItem = { id: string; value: number };

export interface StudioExportInput {
  // Respondent & assessment context
  respondentId: string;
  respondentInitials?: string | null;
  assessmentId: string;
  completedAtISO: string; // e.g., new Date().toISOString()

  // Instrument
  instrumentName: string; // e.g., "LASBI"
  instrumentForm: string; // e.g., "short"
  scaleMin: number;       // e.g., 1
  scaleMax: number;       // e.g., 6
  items: StudioItem[];    // numeric ids in, e.g. [{ id: "1.1.1", value: 4 }]

  // Provenance
  sourceApp: string;         // e.g., "Leadership Assessment Portal"
  sourceAppVersion: string;  // e.g., "3.2.1"
  exportedAtISO?: string;    // defaults to now (UTC ISO string)
  checksumSha256?: string;   // optional — computed if omitted

  // Versions (defaults provided)
  schemaVersion?: string;    // default "1.0.0"
  analysisVersion?: string;  // default "2025.11"
}

/* ----------------------- Numeric ID to CUID Mapping --------------------- */
/**
 * Keep your full 108-entry mapping here, unchanged.
 * Example (truncated):
 *
 * const NUMERIC_TO_CUID_MAP: Record<string, string> = {
 *   "1.1.1": "cmff2ushm0000sbb3xz75fwkz",
 *   ...
 *   "5.4.6": "cmh38aen001ixsbb3t2e4n6r6",
 * };
 */
const NUMERIC_TO_CUID_MAP: Record<string, string> = Object.freeze({
  // === PASTE YOUR EXISTING 108-ENTRY MAP HERE (unchanged) ===
  "1.1.1": "cmff2ushm0000sbb3xz75fwkz",
  // ... all the way through ...
  "5.4.6": "cmh38aen001ixsbb3t2e4n6r6",
});

/* ----------------------- Mapping completeness checks -------------------- */

function* numericIdIterator(): Generator<string> {
  // 1.1–1.5, 2.1–2.4, 3.1–3.2, 4.1–4.3, 5.1–5.4 ; each x.y.1–6
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

(function validateMappingExhaustive() {
  // 1) All 108 numeric keys exist
  const missing: string[] = [];
  for (const id of numericIdIterator()) {
    if (!(id in NUMERIC_TO_CUID_MAP)) missing.push(id);
  }
  if (missing.length) {
    throw new Error(
      `CUID mapping incomplete. Missing ${missing.length} ids: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? " …" : ""}`
    );
  }

  // 2) No duplicate CUID values
  const seen = new Map<string, string>(); // cuid -> numeric id
  for (const [num, cuid] of Object.entries(NUMERIC_TO_CUID_MAP)) {
    const prev = seen.get(cuid);
    if (prev) {
      throw new Error(`Duplicate CUID "${cuid}" for numeric ids "${prev}" and "${num}".`);
    }
    seen.set(cuid, num);
  }

  // 3) Exactly 108 entries
  const total = Object.keys(NUMERIC_TO_CUID_MAP).length;
  if (total !== 108) {
    throw new Error(`Mapping should contain 108 entries, found ${total}.`);
  }
})();

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
  // Studio expects Zulu (UTC) ISO strings
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(iso)) {
    throw new Error(
      `Invalid ${fieldName} "${iso}" (expected ISO 8601 UTC, e.g. 2025-01-02T03:04:05Z).`
    );
  }
}

/* --------------------------- Helper: checksum --------------------------- */

// ESM-safe SHA-256 that works in Node and browser runtimes.
async function sha256Hex(input: string): Promise<string> {
  // Prefer Web Crypto if available (Edge/modern Node)
  if (typeof globalThis.crypto?.subtle !== "undefined") {
    const enc = new TextEncoder();
    const buf = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(input));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Node fallback (ESM-safe)
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(input).digest("hex");
}

/* -------------------- Helper: Map numeric IDs to CUIDs ------------------ */

function mapItemsToCUID(items: StudioItem[]): StudioItem[] {
  return items.map((item) => {
    const cuid = NUMERIC_TO_CUID_MAP[item.id];
    if (!cuid) {
      throw new Error(
        `No CUID mapping found for item "${item.id}". Valid numeric IDs are 1.1.1 through 5.4.6 (108 items total).`
      );
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

  // Basic guards
  assertISO(completedAtISO, "completedAtISO");
  assertISO(exportedAtISO, "exportedAtISO");
  if (scaleMin >= scaleMax) {
    throw new Error(`Invalid scale: min (${scaleMin}) must be < max (${scaleMax}).`);
  }
  assertValidItems(items, scaleMin, scaleMax);

  // Map numeric IDs -> CUIDs
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

  // Assemble payload without checksum first (deterministic hashing)
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
      // checksumSha256 to be added below
    },
  };

  let finalChecksum = checksumSha256;
  if (!finalChecksum) {
    const canonical = JSON.stringify(payloadWithoutChecksum);
    finalChecksum = await sha256Hex(canonical);
  }

  // Final payload with checksum
  const payload = {
    ...payloadWithoutChecksum,
    provenance: {
      ...payloadWithoutChecksum.provenance,
      checksumSha256: finalChecksum,
    },
  };

  return payload;
}

/* -------------------------- Public export helper ------------------------ */

// Pretty JSON string ready for Studio upload/transport
export async function exportStudioJson(input: StudioExportInput): Promise<string> {
  const payload = await buildStudioPayload(input);
  return JSON.stringify(payload, null, 2);
}

/* --------------------- Compatibility exports for route.ts --------------- */

// Your route imports these names:
export async function generateAssessmentExportV2(input: StudioExportInput) {
  // Return the object; the route can JSON.stringify/send it.
  return buildStudioPayload(input);
}

export function validateSurgicalExport(payload: unknown): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const p = payload as any;

  if (!p || typeof p !== "object") return { ok: false, errors: ["Payload is not an object"] };

  for (const key of ["schemaVersion", "analysisVersion", "respondent", "assessment", "provenance"]) {
    if (!(key in p)) errors.push(`Missing top-level key: ${key}`);
  }

  // items array
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

  // ISO checks (best effort)
  const iso = (s: any) =>
    typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s);
  if (!iso(p?.assessment?.completedAt)) errors.push("assessment.completedAt must be ISO 8601 UTC");
  if (!iso(p?.provenance?.exportedAt)) errors.push("provenance.exportedAt must be ISO 8601 UTC");

  return { ok: errors.length === 0, errors };
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

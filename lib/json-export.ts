// GeneralSchemaQ/lib/json-export.ts
// Builds a "Studio"-compatible JSON payload and returns it as a string.
// If you already have a caller that expects an object, you can switch
// `exportStudioJson` to return the object instead of a string.

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
  items: StudioItem[];    // [{ id: "1.1.1", value: 4 }, ...]

  // Provenance
  sourceApp: string;         // e.g., "Leadership Assessment Portal"
  sourceAppVersion: string;  // e.g., "3.2.1"
  exportedAtISO?: string;    // defaults to now (UTC ISO string)
  checksumSha256?: string;   // optional — computed if omitted

  // Versions (defaults provided)
  schemaVersion?: string;    // default "1.0.0"
  analysisVersion?: string;  // default "2025.11"
}

/* --------------------------- Helper: validation ------------------------- */

function assertValidItems(
  items: StudioItem[],
  min: number,
  max: number
) {
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
  // very light check; Studio expects Zulu (UTC) ISO strings
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(iso)) {
    throw new Error(`Invalid ${fieldName} "${iso}" (expected ISO 8601 UTC, e.g. 2025-01-02T03:04:05Z).`);
  }
}

/* --------------------------- Helper: checksum --------------------------- */

// Computes SHA-256 in both browser (Web Crypto) and Node environments.
async function sha256Hex(input: string): Promise<string> {
  // Browser / Edge Runtime
  if (typeof globalThis.crypto?.subtle !== "undefined") {
    const enc = new TextEncoder();
    const buf = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(input));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Node
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require("crypto");
  return createHash("sha256").update(input).digest("hex");
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

  // Assemble payload without checksum first (so we can checksum deterministically)
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
        items,
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
    // Compute checksum over the canonical JSON without the checksum field.
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

// Returns a pretty JSON string ready to upload/send to Studio.
export async function exportStudioJson(input: StudioExportInput): Promise<string> {
  const payload = await buildStudioPayload(input);
  return JSON.stringify(payload, null, 2);
}


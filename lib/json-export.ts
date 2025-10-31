// lib/studio-export.ts
// -----------------------------------------------------------------------------
// Studio JSON Export — Golden Standard
// - Supports 18×6 = 108 items only
// - v1.0.0 (raw instrument): LASBI-Long, no derived data
// - v1.3.0 "surgical": itemId + canonicalId + value + index (108 items)
// - No references to deprecated 54-item flows
// -----------------------------------------------------------------------------

import crypto from "crypto";
import {
  buildExporter,
  getCurrentMappingVersion,
  type ExportPayload as LasbiExportPayload,
} from "./lasbi-exporter";
import { ITEM_ID_RE } from "./shared-lasbi-mapping";


// --------------------------- Types (v1.0.0 raw) ------------------------------

export interface AssessmentExport {
  schemaVersion: string;          // "1.0.0"
  analysisVersion: string;        // "YYYY.MM"
  respondent: {
    id: string;                   // pseudonymous id
    initials: string | null;      // optional
    dobYear: number | null;       // optional
  };
  assessment: {
    assessmentId: string;         // pseudonymous id
    completedAt: string;          // ISO Z, no millis
    instrument: {
      name: "LASBI";
      form: "short" | "long";     // we emit "long"
      scale: { min: number; max: number }; // 1..6
      items: Array<{ id: string; value: number }>; // 108 canonical (d.s.q)
    };
  };
  provenance: {
    sourceApp: string;
    sourceAppVersion: string;
    exportedAt: string;           // ISO Z, no millis
    checksumSha256: string;       // stable JSON checksum
  };
}

export interface ValidationError {
  error: "ValidationFailed";
  details: string[];
}

// ------------------------------ Constants ------------------------------------

const SCALE_MIN = 1;
const SCALE_MAX = 6;
const ASSESSMENT_SCALE = { min: SCALE_MIN, max: SCALE_MAX };

// Sequential (1..108) → Canonical "d.s.q" (18×6)
// Kept only to support older in-memory response shapes that used numeric keys.
const SEQUENTIAL_TO_CANONICAL_MAP: Record<string, string> = {
  // Domain 1 (5×6)
  "1":"1.1.1","2":"1.1.2","3":"1.1.3","4":"1.1.4","5":"1.1.5","6":"1.1.6",
  "7":"1.2.1","8":"1.2.2","9":"1.2.3","10":"1.2.4","11":"1.2.5","12":"1.2.6",
  "13":"1.3.1","14":"1.3.2","15":"1.3.3","16":"1.3.4","17":"1.3.5","18":"1.3.6",
  "19":"1.4.1","20":"1.4.2","21":"1.4.3","22":"1.4.4","23":"1.4.5","24":"1.4.6",
  "25":"1.5.1","26":"1.5.2","27":"1.5.3","28":"1.5.4","29":"1.5.5","30":"1.5.6",
  // Domain 2 (4×6)
  "31":"2.1.1","32":"2.1.2","33":"2.1.3","34":"2.1.4","35":"2.1.5","36":"2.1.6",
  "37":"2.2.1","38":"2.2.2","39":"2.2.3","40":"2.2.4","41":"2.2.5","42":"2.2.6",
  "43":"2.3.1","44":"2.3.2","45":"2.3.3","46":"2.3.4","47":"2.3.5","48":"2.3.6",
  "49":"2.4.1","50":"2.4.2","51":"2.4.3","52":"2.4.4","53":"2.4.5","54":"2.4.6",
  // Domain 3 (2×6)
  "55":"3.1.1","56":"3.1.2","57":"3.1.3","58":"3.1.4","59":"3.1.5","60":"3.1.6",
  "61":"3.2.1","62":"3.2.2","63":"3.2.3","64":"3.2.4","65":"3.2.5","66":"3.2.6",
  // Domain 4 (3×6)
  "67":"4.1.1","68":"4.1.2","69":"4.1.3","70":"4.1.4","71":"4.1.5","72":"4.1.6",
  "73":"4.2.1","74":"4.2.2","75":"4.2.3","76":"4.2.4","77":"4.2.5","78":"4.2.6",
  "79":"4.3.1","80":"4.3.2","81":"4.3.3","82":"4.3.4","83":"4.3.5","84":"4.3.6",
  // Domain 5 (4×6)
  "85":"5.1.1","86":"5.1.2","87":"5.1.3","88":"5.1.4","89":"5.1.5","90":"5.1.6",
  "91":"5.2.1","92":"5.2.2","93":"5.2.3","94":"5.2.4","95":"5.2.5","96":"5.2.6",
  "97":"5.3.1","98":"5.3.2","99":"5.3.3","100":"5.3.4","101":"5.3.5","102":"5.3.6",
  "103":"5.4.1","104":"5.4.2","105":"5.4.3","106":"5.4.4","107":"5.4.5","108":"5.4.6",
};

// ------------------------------ Utilities ------------------------------------

function convertToCanonicalId(questionId: string): string {
  if (/^\d+\.\d+\.\d+$/.test(questionId)) return questionId;
  return SEQUENTIAL_TO_CANONICAL_MAP[questionId] || questionId;
}

function normalizeValue(v: any): number {
  const n =
    typeof v === "object" && v !== null && "value" in v
      ? Number((v as any).value)
      : Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function toCanonicalItems(rec: Record<string, any>): Array<{ id: string; value: number }> {
  const items = Object.entries(rec).map(([qid, raw]) => ({
    id: convertToCanonicalId(qid),
    value: normalizeValue(raw),
  }));
  // Deterministic sort: 1.1.1 … 5.4.6
  items.sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: "base" })
  );
  return items;
}

/** Enforce exactly 108 items and 1..6 values */
function assertComplete108(items: Array<{ id: string; value: number }>) {
  const ids = new Set(items.map((i) => i.id));
  const missing: string[] = [];
  for (let i = 1; i <= 108; i++) {
    const cid = SEQUENTIAL_TO_CANONICAL_MAP[String(i)];
    if (!ids.has(cid)) missing.push(cid);
  }
  const invalid = items
    .filter((i) => !Number.isFinite(i.value) || i.value < SCALE_MIN || i.value > SCALE_MAX)
    .map((i) => i.id);

  if (missing.length || invalid.length) {
    throw new Error(
      `Instrument not complete: missing=${missing.length}; invalid=${invalid.length}`
    );
  }
}

// Stable stringify for checksum
function stableStringify(obj: any): string {
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  if (obj && typeof obj === "object") {
    return `{${Object.keys(obj)
      .sort()
      .map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k]))
      .join(",")}}`;
  }
  return JSON.stringify(obj);
}

export function computeChecksumSha256(payload: unknown): string {
  const canon = stableStringify(payload);
  return crypto.createHash("sha256").update(canon, "utf8").digest("hex");
}

function generatePseudonymousId(input: string, prefix = ""): string {
  const hash = crypto.createHash("md5").update(input).digest("hex");
  return `${prefix}${hash.substring(0, 8)}`;
}

function sanitizeFilename(input: string): string {
  return input.replace(/[^A-Za-z0-9_\-\.]/g, "");
}

export function generateExportFilename(
  userId: string,
  assessmentId: string,
  completedAt: string
): string {
  const clientId = generatePseudonymousId(userId, "client-");
  const assessId = generatePseudonymousId(assessmentId, "assessment-");
  const timestamp = completedAt.replace(/:/g, "-").replace(/\..+Z$/, "Z");
  const raw = `${clientId}_${assessId}_${timestamp}_v1.0.0.json`;
  const safe = sanitizeFilename(raw);
  return safe.length > 120 ? safe.substring(0, 116) + ".json" : safe;
}

// ---------------------------- v1.0.0 (raw) -----------------------------------

type Instrument = {
  name: string;                           // "LASBI-Long" (normalized → name:"LASBI", form:"long")
  form?: "short" | "long";
  scale: { min: number; max: number };
  items: Array<{ id: string; value: number }>;
};

export function normaliseInstrument(i: Instrument): Instrument {
  const m = /^LASBI-(Short|Long)$/i.exec(i.name);
  if (m) return { ...i, name: "LASBI", form: m[1].toLowerCase() as "short" | "long" };
  return i;
}

export function validateAssessmentExport(exportData: AssessmentExport): ValidationError | null {
  const errors: string[] = [];

  if (exportData.schemaVersion !== "1.0.0")
    errors.push(`schemaVersion must be "1.0.0", received "${exportData.schemaVersion}"`);

  if (!exportData.analysisVersion?.match(/^\d{4}\.\d{2}$/))
    errors.push(`analysisVersion must match YYYY.MM`);

  if (!exportData.respondent?.id) errors.push("respondent.id is required");
  if (!("initials" in exportData.respondent)) errors.push("respondent.initials is required");
  if (!("dobYear" in exportData.respondent)) errors.push("respondent.dobYear is required");

  const allowedResp = ["id", "initials", "dobYear"];
  for (const k of Object.keys(exportData.respondent))
    if (!allowedResp.includes(k)) errors.push(`respondent.${k} is not allowed`);

  if (!exportData.assessment?.assessmentId) errors.push("assessment.assessmentId is required");
  if (!exportData.assessment?.completedAt) errors.push("assessment.completedAt is required");

  const inst = exportData.assessment?.instrument as AssessmentExport["assessment"]["instrument"];
  if (!inst) errors.push("assessment.instrument is required");
  else {
    if (inst.name !== "LASBI") errors.push(`instrument.name must be "LASBI"`);
    if (!inst.form || !["short", "long"].includes(inst.form)) errors.push(`instrument.form must be "short" or "long"`);
    if (!inst.scale) errors.push("instrument.scale is required");
    else {
      if (inst.scale.min !== SCALE_MIN) errors.push(`scale.min must be ${SCALE_MIN}`);
      if (inst.scale.max !== SCALE_MAX) errors.push(`scale.max must be ${SCALE_MAX}`);
    }
    if (!inst.items?.length) errors.push("instrument.items must contain items");
    inst.items?.forEach((it, idx) => {
      if (!it.id) errors.push(`items[${idx}].id is required`);
      if (typeof it.value !== "number") errors.push(`items[${idx}].value must be number`);
      if (it.value < SCALE_MIN || it.value > SCALE_MAX) errors.push(`items[${idx}].value out of range`);
      const allowed = ["id", "value"];
      for (const k of Object.keys(it)) if (!allowed.includes(k)) errors.push(`items[${idx}].${k} not allowed`);
    });
  }

  // timestamps (no millis)
  if (exportData.assessment?.completedAt?.includes(".")) errors.push("completedAt must not include milliseconds");
  if (exportData.provenance?.exportedAt?.includes(".")) errors.push("exportedAt must not include milliseconds");

  // time order
  if (exportData.assessment?.completedAt && exportData.provenance?.exportedAt) {
    if (new Date(exportData.assessment.completedAt) > new Date(exportData.provenance.exportedAt)) {
      errors.push("completedAt must be <= exportedAt");
    }
  }

  // provenance
  if (!exportData.provenance?.sourceApp) errors.push("provenance.sourceApp is required");
  if (!exportData.provenance?.sourceAppVersion) errors.push("provenance.sourceAppVersion is required");
  if (!exportData.provenance?.exportedAt) errors.push("provenance.exportedAt is required");
  if (!exportData.provenance?.checksumSha256) errors.push("provenance.checksumSha256 is required");
  if (exportData.provenance?.checksumSha256 && !/^[a-f0-9]{64}$/.test(exportData.provenance.checksumSha256))
    errors.push("checksumSha256 must be 64 hex chars");

  // PII guard
  const exportStr = JSON.stringify(exportData);
  if (exportStr.includes("@") && exportStr.includes(".")) errors.push("Export may contain email addresses (PII)");

  return errors.length ? { error: "ValidationFailed", details: errors.slice(0, 10) } : null;
}

export function generateAssessmentExport(
  responses: Record<string, any>,
  participantData: any,
  assessmentId: string,
  userId: string
): AssessmentExport {
  // Normalize → canonical items, enforce 108 + range
  const items = toCanonicalItems(responses);
  assertComplete108(items);

  const respondentId = generatePseudonymousId(userId);
  const assessId = generatePseudonymousId(assessmentId);

  const now = new Date();
  const analysisVersion = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;

  const completedAt = (participantData?.assessmentDate
    ? new Date(participantData.assessmentDate)
    : new Date()
  )
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");

  const exportedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  const instrument: Instrument = {
    name: "LASBI-Long",                 // normalized → name:"LASBI", form:"long"
    scale: ASSESSMENT_SCALE,
    items,
  };
  const normalizedInstrument = normaliseInstrument(instrument);

  const exportObj: Omit<AssessmentExport, "provenance"> & {
    provenance: Omit<AssessmentExport["provenance"], "checksumSha256">;
  } = {
    schemaVersion: "1.0.0",
    analysisVersion,
    respondent: {
      id: respondentId,
      initials: participantData?.name
        ? String(participantData.name)
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .substring(0, 3)
        : null,
      dobYear: null,
    },
    assessment: {
      assessmentId: assessId,
      completedAt,
      instrument: {
        name: "LASBI" as const,
        form: normalizedInstrument.form || "long",
        scale: normalizedInstrument.scale,
        items: normalizedInstrument.items, // 108 canonical, sorted
      },
    },
    provenance: {
      sourceApp: "Inner Persona Assessment Portal",
      sourceAppVersion: "3.2.1",
      exportedAt,
    },
  };

  const checksum = computeChecksumSha256(exportObj);
  const finalExport: AssessmentExport = {
    ...exportObj,
    provenance: { ...exportObj.provenance, checksumSha256: checksum },
  };

  return finalExport;
}

// -------------------- canonical → UIAnswer for v1.3.0 ------------------------

type UIAnswerCanon = { index: number; canonicalId: string; value: number };

/** Build a stable 1..108 list from a canonical record {"1.1.1": 3, ...} */
function answersFromCanonicalRecord(rec: Record<string, any>): UIAnswerCanon[] {
  const CANON = /^\d+\.\d+\.\d+$/;
  const toNum = (v: any) =>
    Number.isFinite(Number(v?.value)) ? Number(v.value) : Number(v);

  const ids = Object.keys(rec)
    .filter((k) => CANON.test(k))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );

  return ids.map((id, i) => ({
    index: i + 1, // 1..108
    canonicalId: id,
    value: toNum(rec[id]),
  }));
}

// -------------------------- v1.3.0 (surgical) --------------------------------

export async function generateAssessmentExportV2(
  responses: Record<string, any>, // expects canonical 1.1.1 keys (or {value})
  participantData: any,
  assessmentId: string,
  userId: string
): Promise<LasbiExportPayload> {
  // Build 1..108 canonical answer list
  const uiAnswers = answersFromCanonicalRecord(responses);

  if (uiAnswers.length !== 108) {
    throw new Error(`Expected 108 LASBI answers, got ${uiAnswers.length}`);
  }

  const mappingVersion = getCurrentMappingVersion();

  // Core payload (itemId + canonicalId + value + index)
  const payload = await buildExporter({
    // cast to the exporter’s UIAnswer type
    answers: uiAnswers as unknown as Parameters<typeof buildExporter>[0]["answers"],
    mappingVersion,
    schemaVersion: "1.0.0",
  });

  // Identification & provenance metadata (not part of the “responses”)
  payload.metadata = {
    ...payload.metadata,
    respondent: {
      id: String(userId).slice(-8), // pseudonymous short id
      initials: (participantData?.name ?? "")
        .split(" ")
        .map((n: string) => n?.[0])
        .filter(Boolean)
        .join("")
        .slice(0, 3)
        .toUpperCase(),
    },
    assessment: {
      id: assessmentId,
      completedAt: participantData?.assessmentDate ?? new Date().toISOString(),
    },
    provenance: {
      sourceApp: "Inner Persona Assessment Portal",
      sourceAppVersion: "3.2.1",
    },
  };

  return payload;
}


export function validateSurgicalExport(payload: LasbiExportPayload): ValidationError | null {
  const errors: string[] = [];

  if (!payload.instrument) errors.push("instrument is required");
  else {
    if (payload.instrument.name !== "LASBI") errors.push(`instrument.name must be "LASBI"`);
    if (!payload.instrument.schemaVersion) errors.push("instrument.schemaVersion is required");
  }

  if (!payload.mappingVersion) errors.push("mappingVersion is required");
  else if (!/^lasbi-v\d+\.\d+\.\d+$/.test(payload.mappingVersion))
    errors.push(`mappingVersion must look like "lasbi-v1.3.0"`);

  if (!Array.isArray(payload.responses)) errors.push("responses must be an array");
  else {
    if (payload.responses.length !== 108)
      errors.push(`responses must contain exactly 108 items, received ${payload.responses.length}`);

    payload.responses.forEach((r, idx) => {
      if (!r.itemId) errors.push(`responses[${idx}].itemId is required`);
      else if (!ITEM_ID_RE.test(r.itemId))     
         errors.push(`responses[${idx}].itemId must match "cmf..."`);

      if (!r.canonicalId) errors.push(`responses[${idx}].canonicalId is required`);
      else if (!/^\d+\.\d+\.\d+$/.test(r.canonicalId))
        errors.push(`responses[${idx}].canonicalId must be "d.s.q"`);

      if (typeof r.value !== "number") errors.push(`responses[${idx}].value must be number`);
      else if (r.value < SCALE_MIN || r.value > SCALE_MAX)
        errors.push(`responses[${idx}].value must be between ${SCALE_MIN} and ${SCALE_MAX}`);

      if (typeof r.index !== "number") errors.push(`responses[${idx}].index must be number`);
    });

    const ids = new Set(payload.responses.map((r) => r.itemId));
    if (ids.size !== payload.responses.length) errors.push("Duplicate itemIds found");

    const cids = new Set(payload.responses.map((r) => r.canonicalId));
    if (cids.size !== payload.responses.length) errors.push("Duplicate canonicalIds found");
  }

  return errors.length ? { error: "ValidationFailed", details: errors.slice(0, 10) } : null;
}


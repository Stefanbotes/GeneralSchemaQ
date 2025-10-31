// lib/shared-lasbi-mapping.ts
// Golden-aligned LASBI mapping utilities for scoring & reporting.
//
// Exposes:
//  - mappingVersion               : string
//  - CANONICAL_ID_RE              : RegExp
//  - ITEM_ID_RE                   : RegExp (shared regex for modern cmf ids)
//  - isItemId(s)                  : boolean
//  - loadItemToSchema()           : Map<string, Meta>  // keys: itemId AND canonicalId
//  - loadCanonicalItemOrder()     : string[] of "d.s.q" in canonical order
//  - getItemMeta(key)             : Meta | undefined
//  - loadMappingArray()           : flat array view (legacy)
//
// Notes:
//  - Identity is always via itemId (cmf…) OR canonicalId ("d.s.q").
//  - Never infer meaning from UI order/position.
//  - 18 schemas × 6 items = 108 total items.

export const mappingVersion = "lasbi-v1.3.0";

// --------------------------------------------------------------------
// Types
// --------------------------------------------------------------------
export type VariableId =
  | "1.1" | "1.2" | "1.3" | "1.4" | "1.5"
  | "2.1" | "2.2" | "2.3" | "2.4"
  | "3.1" | "3.2"
  | "4.1" | "4.2" | "4.3"
  | "5.1" | "5.2" | "5.3" | "5.4";

export type CanonicalId = `${1|2|3|4|5}.${1|2|3|4|5}.${1|2|3|4|5|6}`;

export type Meta = {
  variableId: VariableId;
  clinicalSchemaId: string;
  schemaLabel: string;
  questionNumber: 1|2|3|4|5|6;
  reverse?: boolean;
  weight?: number;
};

// --------------------------------------------------------------------
// Regex definitions
// --------------------------------------------------------------------
// Canonical id like "2.4.3"
export const CANONICAL_ID_RE = /^[1-5]\.[1-5]\.[1-6]$/;
// Actual LASBI itemIds in your dataset are "cmf" + 18–22 lowercase alnum chars.
// Relax to >=18 so both old and new IDs pass.
export const ITEM_ID_RE = /^cmf[a-z0-9]{18,}$/i;

// --------------------------------------------------------------------
// Canonical schema registry
// --------------------------------------------------------------------
const SCHEMAS: Record<VariableId, { clinicalSchemaId: string; schemaLabel: string }> = {
  "1.1": { clinicalSchemaId: "abandonment_instability",                schemaLabel: "Abandonment/Instability" },
  "1.2": { clinicalSchemaId: "defectiveness_shame",                    schemaLabel: "Defectiveness/Shame" },
  "1.3": { clinicalSchemaId: "emotional_deprivation",                  schemaLabel: "Emotional Deprivation" },
  "1.4": { clinicalSchemaId: "mistrust_abuse",                         schemaLabel: "Mistrust/Abuse" },
  "1.5": { clinicalSchemaId: "social_isolation_alienation",            schemaLabel: "Social Isolation/Alienation" },

  "2.1": { clinicalSchemaId: "dependence_incompetence",                schemaLabel: "Dependence/Incompetence" },
  "2.2": { clinicalSchemaId: "vulnerability_to_harm_illness",          schemaLabel: "Vulnerability to Harm/Illness" },
  "2.3": { clinicalSchemaId: "enmeshment_undeveloped_self",            schemaLabel: "Enmeshment/Undeveloped Self" },
  "2.4": { clinicalSchemaId: "failure",                                schemaLabel: "Failure" },

  "3.1": { clinicalSchemaId: "entitlement_grandiosity",                schemaLabel: "Entitlement/Grandiosity" },
  "3.2": { clinicalSchemaId: "insufficient_self_control_discipline",   schemaLabel: "Insufficient Self-Control/Discipline" },

  "4.1": { clinicalSchemaId: "subjugation",                            schemaLabel: "Subjugation" },
  "4.2": { clinicalSchemaId: "self_sacrifice",                         schemaLabel: "Self-Sacrifice" },
  "4.3": { clinicalSchemaId: "approval_seeking_recognition_seeking",   schemaLabel: "Approval-Seeking/Recognition-Seeking" },

  "5.1": { clinicalSchemaId: "negativity_pessimism",                   schemaLabel: "Negativity/Pessimism" },
  "5.2": { clinicalSchemaId: "emotional_inhibition",                   schemaLabel: "Emotional Inhibition" },
  "5.3": { clinicalSchemaId: "unrelenting_standards_hypercriticalness",schemaLabel: "Unrelenting Standards/Hypercriticalness" },
  "5.4": { clinicalSchemaId: "punitiveness",                           schemaLabel: "Punitiveness" }
};

// --------------------------------------------------------------------
// LASBI Item Mappings (108 rows)
// (This section left identical to your current one.)
// --------------------------------------------------------------------
type MappingRow = { itemId: string; variableId: VariableId; questionNumber: 1|2|3|4|5|6 };



// --------------------------------------------------------------------
// Memoized builders
// --------------------------------------------------------------------
let _mapCache: Map<string, Meta> | null = null;
let _canonCache: CanonicalId[] | null = null;

// --------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------
export function isItemId(s: string): boolean {
  return typeof s === "string" && ITEM_ID_RE.test(s);
}

export function loadItemToSchema(): Map<string, Meta> {
  if (_mapCache) return _mapCache;

  const map = new Map<string, Meta>();
  for (const row of LASBI_ITEM_MAPPINGS) {
    const schema = SCHEMAS[row.variableId];
    if (!schema) throw new Error(`[LASBI] Unknown variableId '${row.variableId}'`);

    const canonicalId = `${row.variableId}.${row.questionNumber}` as CanonicalId;
    const meta: Meta = {
      variableId: row.variableId,
      clinicalSchemaId: schema.clinicalSchemaId,
      schemaLabel: schema.schemaLabel,
      questionNumber: row.questionNumber
    };

    if (map.has(row.itemId)) throw new Error(`[LASBI] Duplicate itemId '${row.itemId}'`);
    map.set(row.itemId, meta);
    if (map.has(canonicalId)) throw new Error(`[LASBI] Duplicate canonicalId '${canonicalId}'`);
    map.set(canonicalId, meta);
  }
  _mapCache = map;
  return map;
}

export function loadCanonicalItemOrder(): CanonicalId[] {
  if (_canonCache) return _canonCache;
  _canonCache = LASBI_ITEM_MAPPINGS
    .slice()
    .sort(
      (a, b) =>
        a.variableId.localeCompare(b.variableId, "en", { numeric: true }) ||
        a.questionNumber - b.questionNumber
    )
    .map(r => `${r.variableId}.${r.questionNumber}` as CanonicalId);
  return _canonCache;
}

export function getItemMeta(key: { itemId?: string; canonicalId?: string }): Meta | undefined {
  const map = loadItemToSchema();
  if (key.itemId && isItemId(key.itemId)) return map.get(key.itemId);
  if (key.canonicalId && CANONICAL_ID_RE.test(key.canonicalId)) return map.get(key.canonicalId);
  return undefined;
}

export interface LasbiItemMapping {
  itemId: string;
  variableId: string;
  questionNumber: number;
  schemaLabel: string;
}

export function loadMappingArray(): LasbiItemMapping[] {
  return LASBI_ITEM_MAPPINGS.map(r => {
    const schema = SCHEMAS[r.variableId];
    return {
      itemId: r.itemId,
      variableId: r.variableId,
      questionNumber: r.questionNumber,
      schemaLabel: schema.schemaLabel
    };
  });
}

// --------------------------------------------------------------------
// Validation on module load
// --------------------------------------------------------------------
(function validate() {
  const seenPerSchema = new Map<VariableId, number>();
  const seenItem = new Set<string>();

  for (const r of LASBI_ITEM_MAPPINGS) {
    if (!/^[1-5]\.[1-5]$/.test(r.variableId)) throw new Error(`[LASBI] Bad variableId '${r.variableId}'`);
    if (![1,2,3,4,5,6].includes(r.questionNumber)) throw new Error(`[LASBI] Bad questionNumber for ${r.variableId}`);
    if (!ITEM_ID_RE.test(r.itemId)) throw new Error(`[LASBI] Bad itemId '${r.itemId}'`);
    if (seenItem.has(r.itemId)) throw new Error(`[LASBI] Duplicate itemId '${r.itemId}'`);
    seenItem.add(r.itemId);
    seenPerSchema.set(r.variableId, (seenPerSchema.get(r.variableId) ?? 0) + 1);
  }

  if (seenPerSchema.size !== 18) throw new Error(`[LASBI] Expected 18 schemas, found ${seenPerSchema.size}`);
  for (const [vid, n] of seenPerSchema) {
    if (n !== 6) throw new Error(`[LASBI] Schema ${vid} has ${n} items (expected 6)`);
  }

  const canonical = new Set(loadCanonicalItemOrder());
  if (canonical.size !== 108) throw new Error(`[LASBI] Expected 108 canonical ids, got ${canonical.size}`);
})();


// app/lib/shared-lasbi-mapping.ts
// Golden-aligned LASBI mapping utilities for scoring & reporting.
//
// Exposes:
//  - mappingVersion               : string
//  - CANONICAL_ID_RE              : RegExp
//  - isItemId(s)                  : boolean  (modern "cmf..." ids)
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

// -------------------------------
// Types
// -------------------------------
export type VariableId =
  | "1.1" | "1.2" | "1.3" | "1.4" | "1.5"
  | "2.1" | "2.2" | "2.3" | "2.4"
  | "3.1" | "3.2"
  | "4.1" | "4.2" | "4.3"
  | "5.1" | "5.2" | "5.3" | "5.4";

export type CanonicalId = `${1|2|3|4|5}.${1|2|3|4|5}.${1|2|3|4|5|6}`;

export type Meta = {
  variableId: VariableId;       // "d.s"
  clinicalSchemaId: string;     // stable id (e.g., "abandonment_instability")
  schemaLabel: string;          // display label (e.g., "Abandonment/Instability")
  questionNumber: 1|2|3|4|5|6;  // 1..6 within the schema
  reverse?: boolean;            // default false
  weight?: number;              // default 1
};

// Public regex for canonical id (d=1..5, s=1..5, q=1..6)
export const CANONICAL_ID_RE = /^[1-5]\.[1-5]\.[1-6]$/;

// -------------------------------
// Canonical schema registry (ids + labels)
// -------------------------------
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

// -------------------------------
// Modern LASBI item mapping (itemId -> variableId + questionNumber)
// (108 rows; canonical domain order)
// -------------------------------
type MappingRow = { itemId: string; variableId: VariableId; questionNumber: 1|2|3|4|5|6 };

const LASBI_ITEM_MAPPINGS: MappingRow[] = [
  // 1.1 Abandonment/Instability
  { itemId: "cmff2ushm0000sbb3xz75fwkz", variableId: "1.1", questionNumber: 1 },
  { itemId: "cmff2ushp0001sbb3pndmp2so", variableId: "1.1", questionNumber: 2 },
  { itemId: "cmff2ushq0002sbb32tnxfwlh", variableId: "1.1", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0ep39e945d6",    variableId: "1.1", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0ejeaeed532",    variableId: "1.1", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0e8aab44720",    variableId: "1.1", questionNumber: 6 },

  // 1.2 Defectiveness/Shame
  { itemId: "cmff2ushr0003sbb3flyzk52v", variableId: "1.2", questionNumber: 1 },
  { itemId: "cmff2usht0004sbb3ffbtcrz1", variableId: "1.2", questionNumber: 2 },
  { itemId: "cmff2ushu0005sbb3sg7x6xou", variableId: "1.2", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0fl81522c20",    variableId: "1.2", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0el3f1d6d21",    variableId: "1.2", questionNumber: 5 },
  { itemId: "cmfmgz6qmme02z4ba72f1f",    variableId: "1.2", questionNumber: 6 },

  // 1.3 Emotional Deprivation
  { itemId: "cmff2ushv0006sbb3o6qo5u3p", variableId: "1.3", questionNumber: 1 },
  { itemId: "cmff2ushx0007sbb343uaq7c3", variableId: "1.3", questionNumber: 2 },
  { itemId: "cmff2ushy0008sbb3o690p5jb", variableId: "1.3", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0f439c7a27e",    variableId: "1.3", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0j5dde70d6e",    variableId: "1.3", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0oj412f4fc9",    variableId: "1.3", questionNumber: 6 },

  // 1.4 Mistrust/Abuse
  { itemId: "cmff2ushz0009sbb3kpmyd2vv", variableId: "1.4", questionNumber: 1 },
  { itemId: "cmff2usi1000asbb3g2b2rrbg", variableId: "1.4", questionNumber: 2 },
  { itemId: "cmff2usi2000bsbb38ksh1592", variableId: "1.4", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0hb7795c52d",    variableId: "1.4", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0fabeac7972",    variableId: "1.4", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0ay18c4a5da",    variableId: "1.4", questionNumber: 6 },

  // 1.5 Social Isolation/Alienation
  { itemId: "cmff2usi3000csbb3kvmjjlqx", variableId: "1.5", questionNumber: 1 },
  { itemId: "cmff2usi4000dsbb3cd5wlepc", variableId: "1.5", questionNumber: 2 },
  { itemId: "cmff2usi5000esbb3ylvjxwkg", variableId: "1.5", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0b7390ce9bb",    variableId: "1.5", questionNumber: 4 },
  { itemId: "cmfmgz6qmme02h1cff17dd",    variableId: "1.5", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0fhcdea8623",    variableId: "1.5", questionNumber: 6 },

  // 2.1 Dependence/Incompetence
  { itemId: "cmff2usi7000fsbb3ywkt6zp7", variableId: "2.1", questionNumber: 1 },
  { itemId: "cmff2usi8000gsbb3a09v5bws", variableId: "2.1", questionNumber: 2 },
  { itemId: "cmff2usi9000hsbb3azlj0bkv", variableId: "2.1", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0li91dc2f4a",    variableId: "2.1", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0au47ad4aa2",    variableId: "2.1", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0hma6fd833e",    variableId: "2.1", questionNumber: 6 },

  // 2.2 Vulnerability to Harm/Illness
  { itemId: "cmff2usib000isbb3c7s52ubh", variableId: "2.2", questionNumber: 1 },
  { itemId: "cmff2usic000jsbb3rs3bs16v", variableId: "2.2", questionNumber: 2 },
  { itemId: "cmff2usid000ksbb3i2jyy5oj", variableId: "2.2", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0bn3c5086cb",    variableId: "2.2", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0imbb3c19c9",    variableId: "2.2", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0hta9c697ca",    variableId: "2.2", questionNumber: 6 },

  // 2.3 Enmeshment/Undeveloped Self
  { itemId: "cmff2usie000lsbb3euvd2b7y", variableId: "2.3", questionNumber: 1 },
  { itemId: "cmff2usif000msbb3v6yu4bd0", variableId: "2.3", questionNumber: 2 },
  { itemId: "cmff2usih000nsbb3c5rnpxfd", variableId: "2.3", questionNumber: 3 },
  { itemId: "cmfmgz6qmme05p1b8ba725",    variableId: "2.3", questionNumber: 4 },
  { itemId: "cmfmgz6qmme01f58dc4580",    variableId: "2.3", questionNumber: 5 },
  { itemId: "cmfmgz6qmme04cf03a8d82",    variableId: "2.3", questionNumber: 6 },

  // 2.4 Failure
  { itemId: "cmff2usii000osbb3lmntidwh", variableId: "2.4", questionNumber: 1 },
  { itemId: "cmff2usij000psbb3ny55yrs2", variableId: "2.4", questionNumber: 2 },
  { itemId: "cmff2usik000qsbb3iuypzlgo", variableId: "2.4", questionNumber: 3 },
  { itemId: "cmfmgz6qmme05vb92009b3",    variableId: "2.4", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0ho586ed1ca",    variableId: "2.4", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0mk975a872d",    variableId: "2.4", questionNumber: 6 },

  // 3.1 Entitlement/Grandiosity
  { itemId: "cmff2usil000rsbb3dr1qqw4h", variableId: "3.1", questionNumber: 1 },
  { itemId: "cmff2usin000ssbb3ahr8x8p1", variableId: "3.1", questionNumber: 2 },
  { itemId: "cmff2usio000tsbb3tbvbwh4s", variableId: "3.1", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0a094b50b31",    variableId: "3.1", questionNumber: 4 },
  { itemId: "cmfmgz6qmme07gfc923f0e",    variableId: "3.1", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0db9df53f98",    variableId: "3.1", questionNumber: 6 },

  // 3.2 Insufficient Self-Control/Discipline
  { itemId: "cmff2usip000usbb39ky60h0y", variableId: "3.2", questionNumber: 1 },
  { itemId: "cmff2usiq000vsbb3c8yb73sj", variableId: "3.2", questionNumber: 2 },
  { itemId: "cmff2usir000wsbb3qg5zscpd", variableId: "3.2", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0q8905df4a5",    variableId: "3.2", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0rld0369a8a",    variableId: "3.2", questionNumber: 5 },
  { itemId: "cmfmgz6qmme05x833cd829",    variableId: "3.2", questionNumber: 6 },

  // 4.1 Subjugation
  { itemId: "cmff2usit000xsbb3swkgowx8", variableId: "4.1", questionNumber: 1 },
  { itemId: "cmff2usiu000ysbb3v302gutd", variableId: "4.1", questionNumber: 2 },
  { itemId: "cmff2usiv000zsbb3a6l4t6i2", variableId: "4.1", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0e21db80923",    variableId: "4.1", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0pw09b24829",    variableId: "4.1", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0dja7fdbb04",    variableId: "4.1", questionNumber: 6 },

  // 4.2 Self-Sacrifice
  { itemId: "cmff2usix0010sbb3tmc3fibw", variableId: "4.2", questionNumber: 1 },
  { itemId: "cmff2usiy0011sbb3i0rwfy7i", variableId: "4.2", questionNumber: 2 },
  { itemId: "cmff2usiz0012sbb36w0dxezg", variableId: "4.2", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0iwde6e4be6",    variableId: "4.2", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0o76d1a05f5",    variableId: "4.2", questionNumber: 5 },
  { itemId: "cmfmgz6qmme07a7fa785f5",    variableId: "4.2", questionNumber: 6 },

  // 4.3 Approval-Seeking/Recognition-Seeking
  { itemId: "cmff2usj00013sbb3f2qfypqi", variableId: "4.3", questionNumber: 1 },
  { itemId: "cmff2usj20014sbb3x0nvy9n4", variableId: "4.3", questionNumber: 2 },
  { itemId: "cmff2usj30015sbb3132vwvuq", variableId: "4.3", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0fa837e929e",    variableId: "4.3", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0m0a9143544",    variableId: "4.3", questionNumber: 5 },
  { itemId: "cmfmgz6qmme075160e8d41",    variableId: "4.3", questionNumber: 6 },

  // 5.1 Negativity/Pessimism
  { itemId: "cmff2usj40016sbb39ekru832", variableId: "5.1", questionNumber: 1 },
  { itemId: "cmff2usj50017sbb3dwf4gj9i", variableId: "5.1", questionNumber: 2 },
  { itemId: "cmff2usj60018sbb34db4vsk6", variableId: "5.1", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0r83d7eed27",    variableId: "5.1", questionNumber: 4 },
  { itemId: "cmfmgz6qmme0p08260c988",    variableId: "5.1", questionNumber: 5 },
  { itemId: "cmfmgz6qmme03t0ae1950c",    variableId: "5.1", questionNumber: 6 },

  // 5.2 Emotional Inhibition
  { itemId: "cmff2usj80019sbb3hoe1jieo", variableId: "5.2", questionNumber: 1 },
  { itemId: "cmff2usj9001asbb3vccgx7en", variableId: "5.2", questionNumber: 2 },
  { itemId: "cmff2usja001bsbb3j97bp80c", variableId: "5.2", questionNumber: 3 },
  { itemId: "cmfmgz6qmme09jb6971d6c",    variableId: "5.2", questionNumber: 4 },
  { itemId: "cmfmgz6qmme02hda78d750",    variableId: "5.2", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0e201bfc94a",    variableId: "5.2", questionNumber: 6 },

  // 5.3 Unrelenting Standards/Hypercriticalness
  { itemId: "cmff2usjb001csbb31c8pl4lv", variableId: "5.3", questionNumber: 1 },
  { itemId: "cmff2usjd001dsbb3se57nmbu", variableId: "5.3", questionNumber: 2 },
  { itemId: "cmff2usje001esbb3xtcdk120", variableId: "5.3", questionNumber: 3 },
  { itemId: "cmfmgz6qmme05155b8b911",    variableId: "5.3", questionNumber: 4 },
  { itemId: "cmfmgz6qmme02i1bebec63",    variableId: "5.3", questionNumber: 5 },
  { itemId: "cmfmgz6qmme02n59e2ddc9",    variableId: "5.3", questionNumber: 6 },

  // 5.4 Punitiveness
  { itemId: "cmff2usjf001fsbb3ncx82jxt", variableId: "5.4", questionNumber: 1 },
  { itemId: "cmff2usjg001gsbb3uiepg7e7", variableId: "5.4", questionNumber: 2 },
  { itemId: "cmff2usji001hsbb3gcrd9655", variableId: "5.4", questionNumber: 3 },
  { itemId: "cmfmgz6qmme0116f7978e6",    variableId: "5.4", questionNumber: 4 },
  { itemId: "cmfmgz6qmme01te4dc9c9d",    variableId: "5.4", questionNumber: 5 },
  { itemId: "cmfmgz6qmme0c3288a51c7",    variableId: "5.4", questionNumber: 6 }
];

// -------------------------------
// Memoized builders (avoid recompute)
// -------------------------------
let _mapCache: Map<string, Meta> | null = null;
let _canonCache: CanonicalId[] | null = null;

// -------------------------------
// Public API
// -------------------------------
export function isItemId(s: string): boolean {
  // Accepts cmf + lower-alnum (length >= 20). All current ids match this.
  return typeof s === "string" && /^cmf[a-z0-9]{20,}$/.test(s);
}

// Map<string, Meta> keyed by both itemId and canonicalId
export function loadItemToSchema(): Map<string, Meta> {
  if (_mapCache) return _mapCache;

  const map = new Map<string, Meta>();
  for (const row of LASBI_ITEM_MAPPINGS) {
    const schema = SCHEMAS[row.variableId];
    if (!schema) throw new Error(`[LASBI] Unknown variableId '${row.variableId}' in mapping`);

    const canonicalId = `${row.variableId}.${row.questionNumber}` as CanonicalId;
    const meta: Meta = {
      variableId: row.variableId,
      clinicalSchemaId: schema.clinicalSchemaId,
      schemaLabel: schema.schemaLabel,
      questionNumber: row.questionNumber,
      // reverse, weight are optional; default applied in scorer
    };

    if (map.has(row.itemId)) throw new Error(`[LASBI] Duplicate itemId '${row.itemId}'`);
    map.set(row.itemId, meta);

    if (map.has(canonicalId)) throw new Error(`[LASBI] Duplicate canonicalId '${canonicalId}'`);
    map.set(canonicalId, meta);
  }

  _mapCache = map;
  return map;
}

// Canonical order of all 108 "d.s.q" ids (non-mutating)
export function loadCanonicalItemOrder(): CanonicalId[] {
  if (_canonCache) return _canonCache;

  _canonCache = LASBI_ITEM_MAPPINGS
    .slice() // do not mutate source
    .sort(
      (a, b) =>
        a.variableId.localeCompare(b.variableId, "en", { numeric: true }) ||
        a.questionNumber - b.questionNumber
    )
    .map(r => `${r.variableId}.${r.questionNumber}` as CanonicalId);

  return _canonCache;
}

// Convenience single-lookup (by itemId or canonicalId)
export function getItemMeta(key: { itemId?: string; canonicalId?: string }): Meta | undefined {
  const m = loadItemToSchema();
  if (key.itemId && isItemId(key.itemId)) return m.get(key.itemId);
  if (key.canonicalId && CANONICAL_ID_RE.test(key.canonicalId)) return m.get(key.canonicalId);
  return undefined;
}

// -------------------------------
// Legacy Compatibility Exports
// -------------------------------
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

// -------------------------------
// Validate mapping integrity on module load
// -------------------------------
(function validate() {
  const seenPerSchema = new Map<VariableId, number>();
  const seenItem = new Set<string>();

  for (const r of LASBI_ITEM_MAPPINGS) {
    if (!/^[1-5]\.[1-5]$/.test(r.variableId)) {
      throw new Error(`[LASBI] Bad variableId '${r.variableId}'`);
    }
    if (![1,2,3,4,5,6].includes(r.questionNumber)) {
      throw new Error(`[LASBI] Bad questionNumber for ${r.variableId}`);
    }
    if (seenItem.has(r.itemId)) {
      throw new Error(`[LASBI] Duplicate itemId '${r.itemId}'`);
    }
    seenItem.add(r.itemId);

    seenPerSchema.set(r.variableId, (seenPerSchema.get(r.variableId) ?? 0) + 1);
  }

  // exactly 18 schemas and 6 items per schema
  if (seenPerSchema.size !== 18) {
    throw new Error(`[LASBI] Expected 18 schemas, found ${seenPerSchema.size}`);
  }
  for (const [vid, n] of seenPerSchema) {
    if (n !== 6) throw new Error(`[LASBI] Schema ${vid} has ${n} items (expected 6)`);
  }

  const canonical = new Set(loadCanonicalItemOrder());
  if (canonical.size !== 108) {
    throw new Error(`[LASBI] Expected 108 canonical ids, got ${canonical.size}`);
  }
})();

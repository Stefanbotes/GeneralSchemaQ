

// ✅ CANONICAL SCHEMA MAPPING - MATCHES STUDIO
// Single source of truth for schema → persona → domain relationships
// This mapping ensures Clinical and Inner Personareports match Studio exactly

export type SchemaDomain = 
  | "Disconnection & Rejection"
  | "Impaired Autonomy & Performance" 
  | "Impaired Limits"
  | "Other-Directedness"
  | "Overvigilance & Inhibition";

export interface CanonicalSchemaMapping {
  persona: string;
  domain: SchemaDomain;
  clinicalName: string;
}

// ✅ CANONICAL MAPPING - MATCHES STUDIO EXACTLY
export const CANONICAL_SCHEMA_MAP: Record<string, CanonicalSchemaMapping> = {
  // DISCONNECTION & REJECTION DOMAIN
  "The Clinger": { 
    persona: "The Clinger", 
    domain: "Disconnection & Rejection",
    clinicalName: "Abandonment Schema"
  },
  "The Invisible Operator": { 
    persona: "The Invisible Operator", 
    domain: "Disconnection & Rejection",
    clinicalName: "Defectiveness/Shame Schema" 
  },
  "The Withholder": { 
    persona: "The Withholder", 
    domain: "Disconnection & Rejection",
    clinicalName: "Emotional Deprivation Schema"
  },
  "The Guarded Strategist": { 
    persona: "The Guarded Strategist", 
    domain: "Disconnection & Rejection",
    clinicalName: "Mistrust/Abuse Schema"
  },
  "The Outsider": { 
    persona: "The Outsider", 
    domain: "Disconnection & Rejection",
    clinicalName: "Social Isolation Schema"
  },

  // IMPAIRED AUTONOMY & PERFORMANCE DOMAIN
  "The Self-Doubter": { 
    persona: "The Self-Doubter", 
    domain: "Impaired Autonomy & Performance",
    clinicalName: "Dependence/Incompetence Schema"
  },
  "The Reluctant Rely-er": { 
    persona: "The Reluctant Rely-er", 
    domain: "Impaired Autonomy & Performance",
    clinicalName: "Vulnerability to Harm Schema"
  },
  "The Safety Strategist": { 
    persona: "The Safety Strategist", 
    domain: "Impaired Autonomy & Performance",
    clinicalName: "Enmeshment/Undeveloped Self Schema"
  },

  // IMPAIRED LIMITS DOMAIN
  "The Over-Adapter": { 
    persona: "The Over-Adapter", 
    domain: "Impaired Limits",
    clinicalName: "Subjugation Schema"
  },
  "The Suppressed Voice": { 
    persona: "The Suppressed Voice", 
    domain: "Impaired Limits",
    clinicalName: "Emotional Inhibition Schema"
  },

  // IMPAIRED LIMITS DOMAIN (continued)
  "The Power Broker": { 
    persona: "The Power Broker", 
    domain: "Impaired Limits",
    clinicalName: "Grandiosity/Entitlement Schema"
  },

  // OTHER-DIRECTEDNESS DOMAIN
  "The Overgiver": { 
    persona: "The Overgiver", 
    domain: "Other-Directedness",
    clinicalName: "Self-Sacrifice Schema"
  },
  "The Image Manager": { 
    persona: "The Image Manager", 
    domain: "Other-Directedness",
    clinicalName: "Approval-Seeking Schema"
  },

  // OVERVIGILANCE & INHIBITION DOMAIN
  "The Cautious Realist": { 
    persona: "The Cautious Realist", 
    domain: "Overvigilance & Inhibition",
    clinicalName: "Negativity/Pessimism Schema"
  },
  "The Stoic Mask": { 
    persona: "The Stoic Mask", 
    domain: "Overvigilance & Inhibition",
    clinicalName: "Emotional Inhibition Schema"
  },
  "The Perfectionist Driver": { 
    persona: "The Perfectionist Driver", 
    domain: "Overvigilance & Inhibition",
    clinicalName: "Unrelenting Standards Schema"
  },
  "The Harsh Enforcer": { 
    persona: "The Harsh Enforcer", 
    domain: "Overvigilance & Inhibition",
    clinicalName: "Punitiveness Schema"
  },
  "The Unfiltered Reactor": { 
    persona: "The Unfiltered Reactor", 
    domain: "Overvigilance & Inhibition",
    clinicalName: "Inhibition (Inverse Pattern)"
  }
};

// Helper function to get canonical schema info
export function getCanonicalSchemaInfo(personaName: string): CanonicalSchemaMapping | null {
  return CANONICAL_SCHEMA_MAP[personaName] || null;
}

// ✅ CANONICAL PUBLIC PERSONA MAPPING (Tier 1 reports)
// Schema ID → Public Name (client-friendly, strengths-focused)
export const PUBLIC_PERSONA_BY_SCHEMA: Record<string, string> = {
  // CANONICAL SCHEMA IDS
  "entitlement_grandiosity": "The Strategic Influencer",
  "subjugation": "The Assertive Advocate", 
  "mistrust_abuse": "The Protective Planner",
  "enmeshment_undeveloped_self": "The Differentiated Leader",
  "insufficient_self_control_discipline": "The Disciplined Finisher",
  "emotional_inhibition": "The Steady Anchor",
  "self_sacrifice": "The Service Leader", 
  "approval_seeking_recognition_seeking": "The Relationship Cultivator",
  "abandonment_instability": "The Relationship Champion",
  "defectiveness_shame": "The Thoughtful Strategist",
  "emotional_deprivation": "The Focus Leader",
  "social_isolation_alienation": "The Independent Innovator", 
  "dependence_incompetence": "The Careful Evaluator",
  "vulnerability_to_harm_illness": "The Self-Sufficient Achiever",
  "failure": "The Resilient Achiever",
  "negativity_pessimism": "The Balanced Assessor",
  "unrelenting_standards_hypercriticalness": "The Excellence Champion",
  "punitiveness": "The Fair-Standards Leader",

  // LEGACY PERSONA NAMES (backward compatibility)
  "The Clinger": "The Relationship Champion",
  "The Invisible Operator": "The Thoughtful Strategist", 
  "The Withholder": "The Focus Leader",
  "The Guarded Strategist": "The Protective Planner",
  "The Outsider": "The Independent Innovator",
  "The Self-Doubter": "The Careful Evaluator",
  "The Reluctant Rely-er": "The Self-Sufficient Achiever",
  "The Safety Strategist": "The Differentiated Leader", 
  "The Over-Adapter": "The Assertive Advocate", // Fixed: now consistent
  "The Suppressed Voice": "The Disciplined Finisher",
  "The Power Broker": "The Strategic Influencer",
  "The Overgiver": "The Service Leader", 
  "The Image Manager": "The Relationship Cultivator",
  "The Cautious Realist": "The Balanced Assessor",
  "The Stoic Mask": "The Steady Anchor",
  "The Perfectionist Driver": "The Excellence Champion",
  "The Harsh Enforcer": "The Fair-Standards Leader",
  "The Unfiltered Reactor": "The Disciplined Finisher"
};

// Legacy alias for backward compatibility
export const PERSONA_BY_SCHEMA = PUBLIC_PERSONA_BY_SCHEMA;

// Helper function to pick primary and secondary styles from lineage
export interface StyleView {
  schemaId: string;
  persona: string;
  domain: string;
  tScore: number;
  index: number;
  band: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
  isLowActivation?: boolean;
  isNearPrimary?: boolean;
}

// ✅ CANONICAL PRIMARY + SECONDARY PICKER (matches Studio exactly)
export function pickPrimaryAndSecondaries(lineage: Array<{schemaId: string; tScore: number; index?: number}>): {
  primary: StyleView | null;
  secondaries: StyleView[];
} {
  // 1) Sort exactly as Studio: T-score desc, tie-break by schemaId
  const ordered = lineage.slice().sort(
    (a, b) => b.tScore - a.tScore || a.schemaId.localeCompare(b.schemaId)
  );

  // 2) Pick primary + two secondaries
  const [p, s1, s2] = ordered;
  
  if (!p) {
    return { primary: null, secondaries: [] };
  }

  const toView = (x: {schemaId: string; tScore: number; index?: number}, isPrimary = false): StyleView => {
    const tScore = x.tScore;
    // ✅ EXACT SAME DISPLAY MATH AS STUDIO
    const index = x.index ?? tScoreToIndex(tScore); // Use Studio's exact rounding
    const band = tScoreToBand(tScore);
    
    // ✅ CANONICAL LABELS (single source of truth)
    const persona = PUBLIC_PERSONA_BY_SCHEMA[x.schemaId] ?? x.schemaId;
    const domain = DOMAIN_BY_SCHEMA[x.schemaId] ?? "—";
    
    return {
      schemaId: x.schemaId,
      persona,
      domain,
      tScore,
      index,
      band,
      isLowActivation: tScore < 45,
      isNearPrimary: !isPrimary && Math.abs(tScore - p.tScore) <= 2
    };
  };

  const primary = toView(p, true);
  const secondaries = [s1, s2].filter(Boolean).map(x => toView(x, false));

  // ✅ RUNTIME ASSERTIONS (catch swaps immediately)
  console.assert(primary.schemaId === ordered[0].schemaId, `Primary does not match lineage[0]: expected ${ordered[0].schemaId}, got ${primary.schemaId}`);
  if (secondaries[0]) {
    console.assert(secondaries[0].schemaId === ordered[1]?.schemaId, `Secondary #1 does not match lineage[1]: expected ${ordered[1]?.schemaId}, got ${secondaries[0].schemaId}`);
  }
  if (secondaries[1]) {
    console.assert(secondaries[1].schemaId === ordered[2]?.schemaId, `Secondary #2 does not match lineage[2]: expected ${ordered[2]?.schemaId}, got ${secondaries[1].schemaId}`);
  }

  return { primary, secondaries };
}

// ✅ CANONICAL SCHEMA ID → DOMAIN MAPPING (matches Studio exactly)
export const DOMAIN_BY_SCHEMA: Record<string, string> = {
  // DISCONNECTION & REJECTION
  "abandonment_instability": "Disconnection & Rejection",
  "mistrust_abuse": "Disconnection & Rejection", 
  "emotional_deprivation": "Disconnection & Rejection",
  "defectiveness_shame": "Disconnection & Rejection",
  "social_isolation_alienation": "Disconnection & Rejection",
  
  // IMPAIRED AUTONOMY & PERFORMANCE
  "dependence_incompetence": "Impaired Autonomy & Performance",
  "vulnerability_to_harm_illness": "Impaired Autonomy & Performance", 
  "enmeshment_undeveloped_self": "Impaired Autonomy & Performance",
  "failure": "Impaired Autonomy & Performance",
  
  // IMPAIRED LIMITS
  "entitlement_grandiosity": "Impaired Limits",
  "insufficient_self_control_discipline": "Impaired Limits",
  
  // OTHER-DIRECTEDNESS
  "subjugation": "Other-Directedness",
  "self_sacrifice": "Other-Directedness", 
  "approval_seeking_recognition_seeking": "Other-Directedness",
  
  // OVERVIGILANCE & INHIBITION
  "negativity_pessimism": "Overvigilance & Inhibition",
  "emotional_inhibition": "Overvigilance & Inhibition",
  "unrelenting_standards_hypercriticalness": "Overvigilance & Inhibition", 
  "punitiveness": "Overvigilance & Inhibition",

  // LEGACY PERSONA NAMES (backward compatibility)
  "The Clinger": "Disconnection & Rejection", 
  "The Invisible Operator": "Disconnection & Rejection",
  "The Withholder": "Disconnection & Rejection",
  "The Guarded Strategist": "Disconnection & Rejection", 
  "The Outsider": "Disconnection & Rejection",
  "The Self-Doubter": "Impaired Autonomy & Performance",
  "The Reluctant Rely-er": "Impaired Autonomy & Performance",
  "The Safety Strategist": "Impaired Autonomy & Performance",
  "The Power Broker": "Impaired Limits",
  "The Suppressed Voice": "Impaired Limits",
  "The Over-Adapter": "Other-Directedness", 
  "The Overgiver": "Other-Directedness",
  "The Image Manager": "Other-Directedness",
  "The Cautious Realist": "Overvigilance & Inhibition",
  "The Stoic Mask": "Overvigilance & Inhibition",
  "The Perfectionist Driver": "Overvigilance & Inhibition",
  "The Harsh Enforcer": "Overvigilance & Inhibition",
  "The Unfiltered Reactor": "Overvigilance & Inhibition"
};

// Convert T-score to activation index (same as Studio)
export function tScoreToIndex(tScore: number): number {
  return Math.max(0, Math.min(100, Math.round(((tScore - 30) / 40) * 100)));
}

// Convert T-score to activation band (same as Studio)  
export function tScoreToBand(tScore: number): 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High' {
  if (tScore >= 70) return 'Very High';
  if (tScore >= 60) return 'High'; 
  if (tScore >= 50) return 'Moderate';
  if (tScore >= 40) return 'Low';
  return 'Very Low';
}

// Helper function to get analysis version for proof stamp
export function getAnalysisVersion(): string {
  return `Bridge V2.1 @ ${new Date().toISOString().split('T')[0]}`;
}


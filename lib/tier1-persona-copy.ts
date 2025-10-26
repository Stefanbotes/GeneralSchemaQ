// app/lib/tier1-persona-copy.ts
// Canonical Tier-1 (leadership) copy deck, aligned to scorer schema labels.
// Keys MUST match the scorer's schemaLabel exactly.

import type { VariableId } from "@/app/lib/shared-lasbi-mapping";

export interface Tier1PersonaCopy {
  variableId: VariableId;          // "1.1" ..."5.4"
  domain: string;                  // "Disconnection/Rejection", etc.
  leadershipPersona: string;       // Tier-1 public name
  healthyPersona: string;          // Healthy expression label
  leadershipId?: string;           // Optional internal key
  clinicalId?: string;             // Optional canonical clinical id
  publicDescription: string;       // 1-liner blurb for Tier-1
  strengthFocus: string;           // short strength phrase
  developmentEdge: string;         // gentle growth nudge
}

export const TIER1_PERSONA_BY_SCHEMA: Record<string, Tier1PersonaCopy> = {
  // ------- Disconnection/Rejection (1.1 - 1.5)
  "Abandonment/Instability": {
    variableId: "1.1",
    domain: "Disconnection/Rejection",
    leadershipPersona: "The Relationship Champion",
    healthyPersona: "The Trust Builder",
    leadershipId: "the_clinger",
    clinicalId: "abandonment_instability",
    publicDescription: "You invest in dependable relationships and create stability for others.",
    strengthFocus: "Reliability & care",
    developmentEdge: "Keep boundaries clear while staying warmly consistent."
  },
  "Defectiveness/Shame": {
    variableId: "1.2",
    domain: "Disconnection/Rejection",
    leadershipPersona: "The Thoughtful Strategist",
    healthyPersona: "The Self-Accepting Influencer",
    leadershipId: "the_invisible_operator",
    clinicalId: "defectiveness_shame",
    publicDescription: "You practice self-acceptance and turn feedback into focused growth.",
    strengthFocus: "Humility & learning",
    developmentEdge: "Own wins out loud; model confident visibility for the team."
  },
  "Emotional Deprivation": {
    variableId: "1.3",
    domain: "Disconnection/Rejection",
    leadershipPersona: "The Empathic Leader",
    healthyPersona: "The Emotionally Available Leader",
    leadershipId: "the_withholder",
    clinicalId: "emotional_deprivation",
    publicDescription: "You notice emotional signals early and seek/offer support appropriately.",
    strengthFocus: "Empathy & support",
    developmentEdge: "Name needs sooner; invite support before strain builds."
  },
  "Mistrust/Abuse": {
    variableId: "1.4",
    domain: "Disconnection/Rejection",
    leadershipPersona: "The Empowering Delegator",
    healthyPersona: "The Empowering Delegator",
    leadershipId: "the_guarded_strategist",
    clinicalId: "mistrust_abuse",
    publicDescription: "You're intentional about boundaries and build trust at a sustainable pace.",
    strengthFocus: "Boundaries & clarity",
    developmentEdge: "Share rationale openly so prudent caution reads as partnership."
  },
  "Social Isolation/Alienation": {
    variableId: "1.5",
    domain: "Disconnection/Rejection",
    leadershipPersona: "The Inclusive Connector",
    healthyPersona: "The Inclusive Connector",
    leadershipId: "the_outsider",
    clinicalId: "social_isolation_alienation",
    publicDescription: "You invite participation and help people feel they belong.",
    strengthFocus: "Inclusion & access",
    developmentEdge: "Schedule intentional touchpoints; widen the circle early."
  },

  // ------- Impaired Autonomy/Performance (2.1 - 2.4)
  "Dependence/Incompetence": {
    variableId: "2.1",
    domain: "Impaired Autonomy/Performance",
    leadershipPersona: "The Empowered Decision-Maker",
    healthyPersona: "The Empowered Decision-Maker",
    leadershipId: "the_reluctant_relyer",
    clinicalId: "dependence_incompetence",
    publicDescription: "You build skills steadily and ask for help strategically.",
    strengthFocus: "Resourcefulness",
    developmentEdge: "Lock small wins; decide within clear guardrails."
  },
  "Vulnerability to Harm/Illness": {
    variableId: "2.2",
    domain: "Impaired Autonomy/Performance",
    leadershipPersona: "The Resilient Optimist",
    healthyPersona: "The Resilient Optimist",
    leadershipId: "the_safety_strategist",
    clinicalId: "vulnerability_to_harm_illness",
    publicDescription: "You surface risks early and prepare the team to handle them.",
    strengthFocus: "Foresight & readiness",
    developmentEdge: "Pair risk calls with crisp, confidence-building action steps."
  },
  "Enmeshment/Undeveloped Self": {
    variableId: "2.3",
    domain: "Impaired Autonomy/Performance",
    leadershipPersona: "The Differentiated Leader",
    healthyPersona: "The Differentiated Leader",
    leadershipId: "the_over_adapter",
    clinicalId: "enmeshment_undeveloped_self",
    publicDescription: "You maintain healthy autonomy and a distinct leadership voice.",
    strengthFocus: "Identity & clarity",
    developmentEdge: "Name your stance first; collaborate from clear ownership."
  },
  "Failure": {
    variableId: "2.4",
    domain: "Impaired Autonomy/Performance",
    leadershipPersona: "The Encouraging Achiever",
    healthyPersona: "The Encouraging Achiever",
    leadershipId: "the_self_doubter",
    clinicalId: "failure",
    publicDescription: "You learn quickly from setbacks and tend to bounce forward with clearer priorities.",
    strengthFocus: "Resilience",
    developmentEdge: "Celebrate progress; convert lessons into lightweight rituals."
  },

  // ------- Impaired Limits (3.1 - 3.2)
  "Entitlement/Grandiosity": {
    variableId: "3.1",
    domain: "Impaired Limits",
    leadershipPersona: "The Accountable Leader",
    healthyPersona: "The Accountable Leader",
    leadershipId: "the_power_broker",
    clinicalId: "entitlement_grandiosity",
    publicDescription: "You balance confidence with perspective-taking and empathy.",
    strengthFocus: "Ownership & perspective",
    developmentEdge: "Invite dissent explicitly; translate vision into shared wins."
  },
  "Insufficient Self-Control/Discipline": {
    variableId: "3.2",
    domain: "Impaired Limits",
    leadershipPersona: "The Grounded Executor",
    healthyPersona: "The Grounded Executor",
    leadershipId: "the_unfiltered_reactor",
    clinicalId: "insufficient_self_control_discipline",
    publicDescription: "You create focus and follow-through on what matters most.",
    strengthFocus: "Prioritization",
    developmentEdge: "Time-box impulses; codify 'definition of done' with the team."
  },

  // ------- Other-Directedness (4.1 - 4.3)
  "Subjugation": {
    variableId: "4.1",
    domain: "Other-Directedness",
    leadershipPersona: "The Assertive Advocate",
    healthyPersona: "The Assertive Advocate",
    leadershipId: "the_suppressed_voice",
    clinicalId: "subjugation",
    publicDescription: "You express needs clearly while keeping collaboration strong.",
    strengthFocus: "Assertiveness",
    developmentEdge: "Use 'ask + ask'—state your need, then invite theirs."
  },
  "Self-Sacrifice": {
    variableId: "4.2",
    domain: "Other-Directedness",
    leadershipPersona: "The Boundaried Supporter",
    healthyPersona: "The Boundaried Supporter",
    leadershipId: "the_overgiver",
    clinicalId: "self_sacrifice",
    publicDescription: "You serve generously and guard your energy to stay effective.",
    strengthFocus: "Service & balance",
    developmentEdge: "Say 'yes, if…' to protect capacity while helping."
  },
  "Approval-Seeking/Recognition-Seeking": {
    variableId: "4.3",
    domain: "Other-Directedness",
    leadershipPersona: "The Authentic Leader",
    healthyPersona: "The Authentic Leader",
    leadershipId: "the_image_manager",
    clinicalId: "approval_seeking_recognition_seeking",
    publicDescription: "You influence others while staying authentic.",
    strengthFocus: "Influence",
    developmentEdge: "Anchor messages in values; let outcomes speak for you."
  },

  // ------- Overvigilance/Inhibition (5.1 - 5.4)
  "Negativity/Pessimism": {
    variableId: "5.1",
    domain: "Overvigilance/Inhibition",
    leadershipPersona: "The Balanced Optimist",
    healthyPersona: "The Balanced Optimist",
    leadershipId: "the_cautious_realist",
    clinicalId: "negativity_pessimism",
    publicDescription: "You stress-test plans so the team is prepared, not surprised.",
    strengthFocus: "Risk realism",
    developmentEdge: "Pair every risk with a counter-move and an owner."
  },
  "Emotional Inhibition": {
    variableId: "5.2",
    domain: "Overvigilance/Inhibition",
    leadershipPersona: "The Expressive Anchor",
    healthyPersona: "The Expressive Anchor",
    leadershipId: "the_stoic_mask",
    clinicalId: "emotional_inhibition",
    publicDescription: "You bring calm, measured communication under pressure.",
    strengthFocus: "Composure",
    developmentEdge: "Label feelings briefly; model 'calm + clear + human'."
  },
  "Unrelenting Standards/Hypercriticalness": {
    variableId: "5.3",
    domain: "Overvigilance/Inhibition",
    leadershipPersona: "The Compassionate Achiever",
    healthyPersona: "The Compassionate Achiever",
    leadershipId: "the_perfectionist_driver",
    clinicalId: "unrelenting_standards_hypercriticalness",
    publicDescription: "You pursue excellence while keeping standards humane.",
    strengthFocus: "Excellence",
    developmentEdge: "Define 'good enough'; celebrate learning, not just finish lines."
  },
  "Punitiveness": {
    variableId: "5.4",
    domain: "Overvigilance/Inhibition",
    leadershipPersona: "The Fair-Minded Leader",
    healthyPersona: "The Fair-Minded Leader",
    leadershipId: "the_harsh_enforcer",
    clinicalId: "punitiveness",
    publicDescription: "You hold high accountability with fairness and context.",
    strengthFocus: "Fair standards",
    developmentEdge: "Lead with context first; turn errors into shared fixes."
  }
};

// ---------- Helpers (stable names) ----------------------

export function schemaToPublic(schema: string): string {
  return TIER1_PERSONA_BY_SCHEMA[schema]?.leadershipPersona ?? schema;
}

export function schemaToHealthy(schema: string): string {
  const m = TIER1_PERSONA_BY_SCHEMA[schema];
  return m?.healthyPersona ?? m?.leadershipPersona ?? schema;
}

export function schemaToDomain(schema: string): string {
  return TIER1_PERSONA_BY_SCHEMA[schema]?.domain ?? "";
}

export function schemaToVariableId(schema: string): string {
  return TIER1_PERSONA_BY_SCHEMA[schema]?.variableId ?? "";
}

export function personaCopy(schema: string): Tier1PersonaCopy | null {
  return TIER1_PERSONA_BY_SCHEMA[schema] ?? null;
}

/** Score-aware blurb: positive description + tone line (expects 0–100 index) */
export function narrativeFor(schema: string, index0to100: number): string {
  const base =
    TIER1_PERSONA_BY_SCHEMA[schema]?.publicDescription ??
    "You can leverage this tendency to lead more effectively.";
  const idx = Number(index0to100) || 0;
  const tone =
    idx >= 80 ? "This is a distinctive strength right now." :
    idx >= 60 ? "This is an active capability to keep cultivating." :
                "This is emerging and small investments will compound.";
  return `${base} ${tone}`;
}

// lib/narratives/counselling.ts

export type Narrative = {
  displayName: string;
  summary: string;
  strengths: string[];
  growth: string[];
};

export type NarrativePack = Record<string, Narrative>;

/**
 * Keys MUST match clinicalSchemaId from shared-lasbi-mapping.ts
 *  - abandonment_instability
 *  - defectiveness_shame
 *  - emotional_deprivation
 *  - mistrust_abuse
 *  - social_isolation_alienation
 *  - dependence_incompetence
 *  - vulnerability_to_harm_illness
 *  - enmeshment_undeveloped_self
 *  - failure
 *  - entitlement_grandiosity
 *  - insufficient_self_control_discipline
 *  - subjugation
 *  - self_sacrifice
 *  - approval_seeking_recognition_seeking
 *  - negativity_pessimism
 *  - emotional_inhibition
 *  - unrelenting_standards_hypercriticalness
 *  - punitiveness
 */
export const counsellingNarratives: NarrativePack = {
  abandonment_instability: {
    displayName: "Abandonment / Instability",
    summary:
      "You may brace for people to leave or become unreliable, which can heighten anxiety in close relationships.",
    strengths: ["Values closeness", "Sensitive to relational shifts"],
    growth: [
      "Reality-test fears with current evidence",
      "Ask for clear plans and check-ins",
    ],
  },

  defectiveness_shame: {
    displayName: "Defectiveness / Shame",
    summary:
      "A self-critical lens may over-focus on flaws and under-credit strengths, affecting self-worth.",
    strengths: ["High standards", "Capacity for honest self-reflection"],
    growth: [
      "Practice balanced-evidence statements daily",
      "Offer behaviour-specific self-praise",
    ],
  },

  emotional_deprivation: {
    displayName: "Emotional Deprivation",
    summary:
      "You may expect that care, warmth, or understanding will be unavailable or short-lived.",
    strengths: ["Self-reliant", "Attentive to others’ needs"],
    growth: [
      "Name one specific emotional need when it arises",
      "Make small, direct requests for support",
    ],
  },

  mistrust_abuse: {
    displayName: "Mistrust / Abuse",
    summary:
      "You may anticipate exploitation or harm, leading to guardedness and difficulty relaxing with others.",
    strengths: ["Protective instincts", "Good risk awareness"],
    growth: [
      "Differentiate past threats from present cues",
      "Experiment with graded trust in safe contexts",
    ],
  },

  social_isolation_alienation: {
    displayName: "Social Isolation / Alienation",
    summary:
      "You might feel on the outside of groups or different in ways that limit belonging.",
    strengths: ["Independent perspective", "Observant of group dynamics"],
    growth: [
      "Join one interest-based micro-community",
      "Track moments of acceptance each day",
    ],
  },

  dependence_incompetence: {
    displayName: "Dependence / Incompetence",
    summary:
      "You may doubt your ability to manage tasks alone, seeking frequent reassurance or guidance.",
    strengths: ["Collaborative", "Open to learning"],
    growth: [
      "Define ‘small, solo’ tasks with clear steps",
      "Delay reassurance-seeking by 10 minutes and try first",
    ],
  },

  vulnerability_to_harm_illness: {
    displayName: "Vulnerability to Harm / Illness",
    summary:
      "You may anticipate catastrophe (health, safety, finances), which can drive hypervigilance.",
    strengths: ["Preparedness", "Attention to risk management"],
    growth: [
      "Set a daily ‘risk-check’ time window",
      "Create proportionate prevention routines",
    ],
  },

  enmeshment_undeveloped_self: {
    displayName: "Enmeshment / Undeveloped Self",
    summary:
      "Strong focus on others’ needs may blur personal preferences, goals, and identity.",
    strengths: ["Loyalty", "Empathy and supportiveness"],
    growth: [
      "Name a personal preference in small decisions",
      "Schedule one independent activity weekly",
    ],
  },

  failure: {
    displayName: "Failure",
    summary:
      "You may expect to fall short or compare yourself unfavourably, which can limit initiative.",
    strengths: ["Humility", "Willingness to improve skills"],
    growth: [
      "Reframe errors as data points",
      "Track concrete wins at day’s end",
    ],
  },

  entitlement_grandiosity: {
    displayName: "Entitlement / Grandiosity",
    summary:
      "A sense of exceptionalism may lead to rule-bending or frustration with limits and feedback.",
    strengths: ["Bold vision", "Willingness to lead"],
    growth: [
      "Solicit and action one piece of feedback weekly",
      "Pair ambition with agreed role boundaries",
    ],
  },

  insufficient_self_control_discipline: {
    displayName: "Insufficient Self-Control / Discipline",
    summary:
      "Acting on urges or avoiding effortful tasks may disrupt long-term goals.",
    strengths: ["Spontaneity", "Creativity and energy"],
    growth: [
      "Use 10-minute ‘starter blocks’ to begin tasks",
      "Create friction for impulsive choices (one extra step)",
    ],
  },

  subjugation: {
    displayName: "Subjugation",
    summary:
      "You may suppress your needs to avoid conflict or disapproval, building resentment over time.",
    strengths: ["Cooperative", "Skilled at maintaining harmony"],
    growth: [
      "State one clear boundary in low-stakes contexts",
      "Replace ‘sorry’ with ‘thank you’ where appropriate",
    ],
  },

  self_sacrifice: {
    displayName: "Self-Sacrifice",
    summary:
      "You often prioritise others’ needs over your own, risking fatigue or quiet resentment.",
    strengths: ["Generous", "Reliable under pressure"],
    growth: [
      "Schedule non-negotiable recovery time",
      "Ask for small help twice per week",
    ],
  },

  approval_seeking_recognition_seeking: {
    displayName: "Approval-Seeking / Recognition-Seeking",
    summary:
      "You might track external approval closely, which can pull choices away from personal values.",
    strengths: ["Socially attuned", "Motivating to peers"],
    growth: [
      "Define 2–3 internal success criteria per task",
      "Limit checking for likes/views to set windows",
    ],
  },

  negativity_pessimism: {
    displayName: "Negativity / Pessimism",
    summary:
      "Attention may gravitate to risks and downsides, dampening motivation and mood.",
    strengths: ["Risk spotting", "Pragmatic planning"],
    growth: [
      "List two plausible upsides alongside each risk",
      "Capture one ‘unexpected good’ per day",
    ],
  },

  emotional_inhibition: {
    displayName: "Emotional Inhibition",
    summary:
      "You may hold feelings tightly, prioritising control and composure over expression.",
    strengths: ["Calm under pressure", "Thoughtful communicator"],
    growth: [
      "Label emotions in low-stakes moments",
      "Share a brief ‘impact statement’ daily",
    ],
  },

  unrelenting_standards_hypercriticalness: {
    displayName: "Unrelenting Standards / Hypercriticalness",
    summary:
      "Perfectionistic rules can drive achievement but also strain wellbeing and relationships.",
    strengths: ["High quality bar", "Strong work ethic"],
    growth: [
      "Define ‘good enough’ criteria in advance",
      "Intentionally leave 5% of tasks imperfect",
    ],
  },

  punitiveness: {
    displayName: "Punitiveness",
    summary:
      "Harsh self/other judgments when mistakes occur can block learning and connection.",
    strengths: ["Accountability", "Clarity about standards"],
    growth: [
      "Switch to ‘error→lesson→next step’ language",
      "Practice one act of repair over blame",
    ],
  },
};

/** Safe fallback if a schema id has no authored narrative yet */
export const defaultNarrative = (schemaId: string): Narrative => ({
  displayName: schemaId
    .split("_")
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(" "),
  summary:
    "This area scored relatively high and may benefit from focused reflection and small, repeatable experiments.",
  strengths: ["Personal insight", "Motivation to improve"],
  growth: ["Pick one tiny, daily behaviour to test", "Track mood/impact briefly"],
});

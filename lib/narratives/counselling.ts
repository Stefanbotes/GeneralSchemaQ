// lib/narratives/counselling.ts

export type Narrative = {
  displayName: string;
  summary: string;
  strengths: string[];
  growth: string[];
};

export type NarrativePack = Record<string, Narrative>;

/**
 * Keys should match your clinical schema ids from LASBI mapping
 * (e.g., "emotional_inhibition", "abandonment", etc.)
 *
 * Tip: start with your most common 8–10; fallback text below
 * ensures the renderer never crashes if a key is missing.
 */
export const counsellingNarratives: NarrativePack = {
  emotional_inhibition: {
    displayName: "Emotional Inhibition",
    summary:
      "You may keep feelings tightly held, prioritising control and composure over expression.",
    strengths: [
      "Calm under pressure",
      "Measured and thoughtful communicator",
    ],
    growth: [
      "Label emotions in low-stakes moments",
      "Share a brief ‘impact statement’ once per day",
    ],
  },
  abandonment: {
    displayName: "Abandonment",
    summary:
      "You may brace for people to leave or become unavailable, which can raise anxiety in relationships.",
    strengths: ["Attuned to connection", "Loyal, values closeness"],
    growth: [
      "Reality-testing: list objective signs of stability",
      "Ask for clarity on plans and follow-through",
    ],
  },
  defectiveness_shame: {
    displayName: "Defectiveness / Shame",
    summary:
      "A self-critical lens may over-focus on flaws and under-credit strengths.",
    strengths: ["High standards", "Capacity for self-reflection"],
    growth: [
      "Daily ‘balanced evidence’ check for self-judgments",
      "Practice specific, behaviour-based self-praise",
    ],
  },
  // …add the rest of your schemas here…
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

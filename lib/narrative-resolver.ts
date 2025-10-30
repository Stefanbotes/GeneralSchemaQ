// Narrative Resolver
// Central lookup for all persona narrative packs and versions

import { COUNSELLING_V2025_10 } from "@/lib/narratives/counselling";
import { LEADERSHIP_LITE_V2025_10 } from "@/lib/narratives/leadership-lite";
// import { LEADERSHIP_V2025_10 } from "@/lib/narratives/leadership"; // optional

// Registry of available packs by context + version
const PACKS = {
  counselling: {
    "2025.10": COUNSELLING_V2025_10,
  },
  "leadership-lite": {
    "2025.10": LEADERSHIP_LITE_V2025_10,
  },
  // leadership: { "2025.10": LEADERSHIP_V2025_10 },
} as const;

// Defaults can come from environment variables if you like
export const DEFAULT_AUDIENCE_CONTEXT =
  (process.env.NARRATIVE_CONTEXT as keyof typeof PACKS) || "counselling";
export const DEFAULT_NARRATIVE_VERSION = "2025.10";

export function resolvePersonaNarrative(
  personaKey: string,
  opts?: {
    context?: keyof typeof PACKS;
    version?: string;
  }
) {
  const context = opts?.context || DEFAULT_AUDIENCE_CONTEXT;
  const version = opts?.version || DEFAULT_NARRATIVE_VERSION;

  const pack = PACKS[context]?.[version];
  if (!pack) return null;

  return pack.personas?.[personaKey] || null;
}

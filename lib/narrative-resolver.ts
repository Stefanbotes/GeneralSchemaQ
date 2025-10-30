// Central resolver for counselling narratives → Prisma LeadershipPersona shape

import { Prisma } from "@prisma/client";
import { COUNSELLING_V2025_10 } from "@/lib/narratives/counselling";

// ---- Types expected from your counselling pack ----
type CounsellingPersona = {
  // keys are your canonical persona ids (e.g., "Caregiver", "BoundarySetter")
  title?: string;                 // optional display title
  publicName?: string;            // preferred display name (if present)
  subtitle?: string;              // optional
  description: string;            // main narrative description
  strengths?: string[];           // array of strengths
  growthAreas?: string[];         // array of coaching edges
  domain?: string;                // optional domain label
  // any other free-form details you keep in a pack:
  [k: string]: any;
};

type CounsellingPack = {
  version: string;                // e.g. "2025.10"
  context: "counselling";
  personas: Record<string, CounsellingPersona>;
};

const PACK: CounsellingPack = COUNSELLING_V2025_10;

// ---- Runtime resolver: get a normalized view for UI/report logic ----
export type ResolvedPersona = {
  key: string;                    // canonical key from the pack
  name: string;                   // chosen display name
  description: string;
  strengths: string[];
  growthAreas: string[];
  // “characteristics” is a flexible JSON blob for Prisma model
  characteristics: Record<string, any>;
  meta: { context: string; version: string };
};

/**
 * Resolve a persona by key from the counselling pack and normalize it.
 */
export function resolvePersona(key: string): ResolvedPersona | null {
  const p = PACK.personas[key];
  if (!p) return null;

  const name =
    p.publicName?.trim() ||
    p.title?.trim() ||
    key; // fall back to key if names missing

  return {
    key,
    name,
    description: p.description || "",
    strengths: Array.isArray(p.strengths) ? p.strengths : [],
    growthAreas: Array.isArray(p.growthAreas) ? p.growthAreas : [],
    characteristics: {
      domain: p.domain ?? null,
      subtitle: p.subtitle ?? null,
      // keep the original raw block for future-safe access
      raw: p,
    },
    meta: { context: PACK.context, version: PACK.version },
  };
}

// ---- Seeder helper: produce Prisma-ready inputs for LeadershipPersona ----

/**
 * Map all counselling personas to Prisma LeadershipPersonaCreateInput[]
 * You can upsert these in a seed script.
 */
export function toPrismaLeadershipPersonaSeed(): Prisma.LeadershipPersonaCreateInput[] {
  return Object.entries(PACK.personas).map(([key, p]) => {
    const name =
      p.publicName?.trim() ||
      p.title?.trim() ||
      key;

    const strengths = Array.isArray(p.strengths) ? p.strengths : [];
    const growthAreas = Array.isArray(p.growthAreas) ? p.growthAreas : [];

    return {
      // Prisma model fields
      name, // UNIQUE in your model
      description: p.description || "",
      characteristics: {
        domain: p.domain ?? null,
        subtitle: p.subtitle ?? null,
        sourceKey: key,
        context: PACK.context,
        version: PACK.version,
        // preserve full raw in case you need richer UI later
        raw: p,
      },
      strengths,
      growthAreas,
      isActive: true,
    };
  });
}

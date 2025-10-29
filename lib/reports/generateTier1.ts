// lib/reports/generateTier1.ts
export const TEMPLATE_VERSION = 'tier1-v1.0.0';

export async function buildTier1Report(opts: {
  userId?: string;
  assessmentId?: string;
  responses?: any;
  participantData?: any; // for name fallback
  db: typeof import('@/lib/db').db;
}): Promise<{ html: string; nameSafe: string; completedAt?: string | Date | null }> {
  // 1) load LASBI index
  // 2) resolve canonicalToValue (from lasbiResponse -> assessment JSON -> client payload)
  // 3) compute bySchemaMean, top3
  // 4) pull persona/narrative via mapper (schemaToPublic, schemaToHealthy, schemaToDomain, narrativeFor, personaCopy)
  // 5) renderHtml(...)
  // 6) return { html, nameSafe, completedAt }
}

// lib/reports/generateTier1.ts

import type { PrismaClient } from "@prisma/client";
import { counsellingNarratives, defaultNarrative, type Narrative } from "@/lib/narratives/counselling";
import { scoreAssessmentResponses } from "@/lib/shared-schema-scoring"; // your existing scorer
// If you have pickTop3, you can import it; we’ll do a local top-3 to avoid coupling

export const TEMPLATE_VERSION = "tier1/1.0.0";

type Audience = "counselling" | "leadership";

export interface BuildTier1Options {
  db: PrismaClient | any;          // keep wide to avoid type breakage during integration
  userId?: string;
  assessmentId?: string;
  responses?: any;                 // accepts the shapes your API allows
  participantData?: {
    name?: string | null;
    email?: string | null;
    [k: string]: any;
  };
  audience: Audience;              // 'counselling' for this app
}

export interface Tier1Result {
  html: string;
  nameSafe: string;
  artifact?: {
    id: string;
    templateVersion: string;
  };
}

/**
 * Build Tier-1 (fetch → score → resolve narratives → render HTML)
 * Returns { html, nameSafe, artifact? }
 */
export async function buildTier1Report(opts: BuildTier1Options): Promise<Tier1Result> {
  const {
    db,
    userId,
    assessmentId,
    responses: inlineResponses,
    participantData,
    audience,
  } = opts;

  // 1) Load responses
  const responses = inlineResponses ?? (await loadResponsesFromDB({ db, userId, assessmentId }));

  if (!responses) {
    throw new Error("No responses found. Provide responses or a valid assessmentId.");
  }

  // 2) Score → ranked schemas
  // Expected output (shape example):
  // [{ clinicalSchemaId: "emotional_inhibition", score: 0.78 }, ...]
  const scored = scoreAssessmentResponses(responses);

  if (!Array.isArray(scored) || scored.length === 0) {
    throw new Error("Scoring returned no results.");
  }

  const top3 = [...scored]
    .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  // 3) Resolve narrative pack by audience (extensible later)
  const pack = audience === "counselling" ? counsellingNarratives : counsellingNarratives;

  const resolved = top3.map((item: any) => {
    const id: string = item.clinicalSchemaId ?? String(item.id ?? "unknown_schema");
    const narrative: Narrative = pack[id] ?? defaultNarrative(id);
    return { id, ...item, narrative };
  });

  // 4) Participant meta + nameSafe
  const meta = await safeParticipantMeta({ db, userId, assessmentId, participantData });
  const nameSafe = toNameSafe(meta.name || meta.email || assessmentId || "participant");

  // 5) Render HTML (A4 printable, inline CSS, footer with version)
  const html = renderTier1HTML({
    participant: meta,
    topSchemas: resolved,
    audience,
    templateVersion: TEMPLATE_VERSION,
  });

  // 6) (Optional) If you later want to persist an artifact here, do it and return ids.
  // Keeping off by default so this stays pure and deterministic.
  // const artifact = await maybePersistArtifact(db, { ... });

  return { html, nameSafe };
}

/* ----------------------------- helpers ----------------------------- */

async function loadResponsesFromDB({
  db,
  userId,
  assessmentId,
}: {
  db: any;
  userId?: string;
  assessmentId?: string;
}) {
  if (!assessmentId) return null;

  // Try a few likely shapes to avoid tight coupling to your Prisma schema.
  // Adjust to your actual tables once confirmed.
  // 1) assessmentResults (JSON column: responses)
  try {
    const r1 =
      await db.assessmentResult?.findFirst?.({
        where: { assessmentId, ...(userId ? { userId } : {}) },
        select: { responses: true },
      });
    if (r1?.responses) return r1.responses;
  } catch {}

  // 2) assessment (JSON column: responses)
  try {
    const r2 =
      await db.assessment?.findUnique?.({
        where: { id: assessmentId },
        select: { responses: true, userId: true },
      });
    if (r2?.responses) return r2.responses;
  } catch {}

  // 3) assessmentResponses (flat table of answers)
  try {
    const r3 =
      await db.assessmentResponses?.findMany?.({
        where: { assessmentId, ...(userId ? { userId } : {}) },
        select: { itemCode: true, value: true, timestamp: true },
        orderBy: { itemCode: "asc" },
      });
    if (Array.isArray(r3) && r3.length) {
      // Convert rows → { "1.1.1": number, ... }
      const asRecord: Record<string, number> = {};
      for (const row of r3) {
        asRecord[row.itemCode] = Number(row.value);
      }
      return asRecord;
    }
  } catch {}

  return null;
}

async function safeParticipantMeta({
  db,
  userId,
  assessmentId,
  participantData,
}: {
  db: any;
  userId?: string;
  assessmentId?: string;
  participantData?: { name?: string | null; email?: string | null; [k: string]: any };
}): Promise<{ name?: string | null; email?: string | null; dateISO: string }> {
  const dateISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Priority: provided participantData → user record → assessment owner
  if (participantData?.name || participantData?.email) {
    return { name: participantData.name ?? undefined, email: participantData.email ?? undefined, dateISO };
  }

  // Try user by id
  if (userId) {
    try {
      const u = await db.user?.findUnique?.({ where: { id: userId }, select: { name: true, email: true } });
      if (u) return { name: u.name, email: u.email, dateISO };
    } catch {}
  }

  // Try owner via assessment
  if (assessmentId) {
    try {
      const a = await db.assessment?.findUnique?.({
        where: { id: assessmentId },
        select: { user: { select: { name: true, email: true } } },
      });
      if (a?.user) return { name: a.user.name, email: a.user.email, dateISO };
    } catch {}
  }

  return { dateISO };
}

function toNameSafe(s: string) {
  return s
    .trim()
    .replace(/[^\p{L}\p{N}\-_. ]/gu, "")
    .replace(/\s+/g, "_")
    .slice(0, 60) || "participant";
}

function renderTier1HTML({
  participant,
  topSchemas,
  audience,
  templateVersion,
}: {
  participant: { name?: string | null; email?: string | null; dateISO: string };
  topSchemas: Array<{ id: string; score: number; narrative: Narrative }>;
  audience: Audience;
  templateVersion: string;
}) {
  const title = "Tier-1 Counselling Report";
  const sub = audience === "counselling" ? "Client-facing summary" : "Summary";
  const headerName =
    participant.name || participant.email || "Participant";

  const styles = `
  :root { --ink:#0f172a; --muted:#475569; --card:#ffffff; --bg:#f8fafc; --brand:#4f46e5; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:var(--ink); background:var(--bg); }
  .page { max-width: 840px; margin: 24px auto; background: var(--card); padding: 32px 36px; border-radius: 16px; box-shadow: 0 10px 24px rgba(2,8,23,0.08); }
  h1 { margin: 0 0 6px; font-size: 28px; letter-spacing: -0.01em; }
  .sub { color: var(--muted); margin-bottom: 20px; }
  .meta { display:flex; gap:24px; flex-wrap: wrap; margin:16px 0 28px; color: var(--muted); }
  .chip { background:#eef2ff; color:#3730a3; padding:4px 10px; border-radius: 999px; font-size:12px; }
  .grid { display:grid; grid-template-columns: 1fr; gap:16px; }
  @media print { .page { box-shadow:none; border:1px solid #e5e7eb } .no-print { display:none } }
  @media (min-width: 720px) { .grid { grid-template-columns: 1fr 1fr; } }
  .card { border:1px solid #e5e7eb; border-radius:12px; padding:16px; }
  .schemaName { font-weight:600; margin: 0 0 6px; }
  .score { font-size:12px; color: var(--muted); margin-bottom:10px; }
  ul { margin:8px 0 0 18px; }
  footer { margin-top: 28px; color: var(--muted); font-size:12px; display:flex; justify-content:space-between; align-items:center; }
  .brand { color: var(--brand); font-weight: 600; }
  `;

  const schemaCards = topSchemas
    .map((s, idx) => {
      const pct = Math.round((s.score ?? 0) * 100);
      return `
      <section class="card">
        <div class="chip">Top ${idx + 1}</div>
        <h3 class="schemaName">${escapeHtml(s.narrative.displayName)}</h3>
        <div class="score">Relative score: ${isFinite(pct) ? pct : 0}%</div>
        <p>${escapeHtml(s.narrative.summary)}</p>
        <div class="grid">
          <div>
            <h4>Strengths</h4>
            <ul>${s.narrative.strengths.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          </div>
          <div>
            <h4>Growth Ideas</h4>
            <ul>${s.narrative.growth.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          </div>
        </div>
      </section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)} – ${escapeHtml(headerName)}</title>
  <style>${styles}</style>
</head>
<body>
  <main class="page">
    <h1>${escapeHtml(title)}</h1>
    <div class="sub">${escapeHtml(sub)}</div>
    <div class="meta">
      <div><strong>Participant:</strong> ${escapeHtml(headerName)}</div>
      <div><strong>Date:</strong> ${escapeHtml(participant.dateISO)}</div>
    </div>
    ${schemaCards}
    <footer>
      <div>Template <span class="brand">${escapeHtml(templateVersion)}</span></div>
      <div>Printable • A4 • Counselling</div>
    </footer>
  </main>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}


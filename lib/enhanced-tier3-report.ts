// app/lib/enhanced-tier3-report.ts
// Tier 3 Clinical Report (standalone, typed, no external imports)
// - Accepts analysis.tier3.canonicalTop5 OR falls back to analysis.rankedScores
// - Uses canonical schema labels and domains
// - 6-point Likert is already converted upstream; we display 0–100 indices.

type AnyRecord = Record<string, any>;

export interface EnhancedClinicalReportOptions {
  participantName: string;
  participantEmail?: string;
  participantTeam?: string;
  assessmentDate: string;   // ISO or human-readable
  assessmentId?: string;
}

interface CanonicalInfo {
  clinicalName: string;  // research/clinical name (same as label here)
  persona: string;       // display persona (same as label here)
  domain: "Disconnection/Rejection"
        | "Impaired Autonomy/Performance"
        | "Impaired Limits"
        | "Other-Directedness"
        | "Overvigilance/Inhibition";
}

// Canonical 18 schema labels → domain (aligned with your mapping)
const CANONICAL_BY_LABEL: Record<string, CanonicalInfo> = {
  "Abandonment/Instability":                { clinicalName: "Abandonment/Instability",                persona: "Abandonment/Instability",                domain: "Disconnection/Rejection" },
  "Defectiveness/Shame":                    { clinicalName: "Defectiveness/Shame",                    persona: "Defectiveness/Shame",                    domain: "Disconnection/Rejection" },
  "Emotional Deprivation":                  { clinicalName: "Emotional Deprivation",                  persona: "Emotional Deprivation",                  domain: "Disconnection/Rejection" },
  "Mistrust/Abuse":                         { clinicalName: "Mistrust/Abuse",                         persona: "Mistrust/Abuse",                         domain: "Disconnection/Rejection" },
  "Social Isolation/Alienation":            { clinicalName: "Social Isolation/Alienation",            persona: "Social Isolation/Alienation",            domain: "Disconnection/Rejection" },

  "Dependence/Incompetence":                { clinicalName: "Dependence/Incompetence",                persona: "Dependence/Incompetence",                domain: "Impaired Autonomy/Performance" },
  "Vulnerability to Harm/Illness":          { clinicalName: "Vulnerability to Harm/Illness",          persona: "Vulnerability to Harm/Illness",          domain: "Impaired Autonomy/Performance" },
  "Enmeshment/Undeveloped Self":            { clinicalName: "Enmeshment/Undeveloped Self",            persona: "Enmeshment/Undeveloped Self",            domain: "Impaired Autonomy/Performance" },
  "Failure":                                { clinicalName: "Failure",                                persona: "Failure",                                domain: "Impaired Autonomy/Performance" },

  "Entitlement/Grandiosity":                { clinicalName: "Entitlement/Grandiosity",                persona: "Entitlement/Grandiosity",                domain: "Impaired Limits" },
  "Insufficient Self-Control/Discipline":   { clinicalName: "Insufficient Self-Control/Discipline",   persona: "Insufficient Self-Control/Discipline",   domain: "Impaired Limits" },

  "Subjugation":                            { clinicalName: "Subjugation",                            persona: "Subjugation",                            domain: "Other-Directedness" },
  "Self-Sacrifice":                         { clinicalName: "Self-Sacrifice",                         persona: "Self-Sacrifice",                         domain: "Other-Directedness" },
  "Approval-Seeking/Recognition-Seeking":   { clinicalName: "Approval-Seeking/Recognition-Seeking",   persona: "Approval-Seeking/Recognition-Seeking",   domain: "Other-Directedness" },

  "Negativity/Pessimism":                   { clinicalName: "Negativity/Pessimism",                   persona: "Negativity/Pessimism",                   domain: "Overvigilance/Inhibition" },
  "Emotional Inhibition":                   { clinicalName: "Emotional Inhibition",                   persona: "Emotional Inhibition",                   domain: "Overvigilance/Inhibition" },
  "Unrelenting Standards/Hypercriticalness":{ clinicalName: "Unrelenting Standards/Hypercriticalness",persona: "Unrelenting Standards/Hypercriticalness",domain: "Overvigilance/Inhibition" },
  "Punitiveness":                           { clinicalName: "Punitiveness",                           persona: "Punitiveness",                           domain: "Overvigilance/Inhibition" }
};

function getCanonicalSchemaInfo(label: string): CanonicalInfo | undefined {
  return CANONICAL_BY_LABEL[label];
}

function getAnalysisVersion(): string {
  // Keep version string local to avoid imports. Update when you change scoring lineage.
  return "tier3-v1.0.0";
}

function safeDateString(input: string): string {
  try {
    const d = new Date(input);
    return isNaN(d.getTime())
      ? input
      : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return input;
  }
}

function toPercent(x: unknown): number {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

type CanonicalRow = { schemaId: string; score: number; rank: number };

/** Normalize Tier-3 inputs from analysis */
function normalizeTier3(analysis: AnyRecord): {
  canonicalTop5: CanonicalRow[];
  primaryLabel: string | undefined;
  primaryInfo: CanonicalInfo | undefined;
  supporting: { label: string; score: number; rank: number; info?: CanonicalInfo }[];
  therapeuticRecommendations: string[];
} {
  // Preferred source: analysis.tier3.canonicalTop5
  if (analysis?.tier3?.canonicalTop5 && Array.isArray(analysis.tier3.canonicalTop5)) {
    const rows: CanonicalRow[] = (analysis.tier3.canonicalTop5 as any[])
      .map((it: any, i: number): CanonicalRow => ({
        schemaId: String(it.schemaId ?? it.label ?? it.name ?? ""),
        score: toPercent(it.score ?? it.index0to100),
        rank: Number(it.rank ?? i + 1)
      }))
      .filter((row: CanonicalRow) => !!row.schemaId);

    const primaryLabel = rows[0]?.schemaId;
    const primaryInfo = primaryLabel ? getCanonicalSchemaInfo(primaryLabel) : undefined;

    const supporting = rows.slice(1, 3).map((r: CanonicalRow) => ({
      label: r.schemaId,
      score: r.score,
      rank: r.rank,
      info: getCanonicalSchemaInfo(r.schemaId)
    }));

    const therapeuticRecommendations: string[] =
      Array.isArray(analysis?.tier3?.therapeuticRecommendations) &&
      analysis.tier3.therapeuticRecommendations.length
        ? analysis.tier3.therapeuticRecommendations
        : [
            "Cognitive restructuring of schema-linked beliefs.",
            "Brief behavioral experiments to test alternative responses.",
            "Values-based action planning under stress.",
            "Mindfulness practices to widen response flexibility."
          ];

    return { canonicalTop5: rows.slice(0, 5), primaryLabel, primaryInfo, supporting, therapeuticRecommendations };
  }

  // Fallback: take from rankedScores (shared 6-point scorer output)
  const ranked = Array.isArray(analysis?.rankedScores) ? analysis.rankedScores : [];
  const rows: CanonicalRow[] = ranked.slice(0, 5).map((s: any, i: number): CanonicalRow => ({
    schemaId: String(s.schemaLabel ?? ""),
    score: toPercent(s.index0to100),
    rank: i + 1
  })).filter((row: CanonicalRow) => !!row.schemaId);

  const primaryLabel = rows[0]?.schemaId;
  const primaryInfo = primaryLabel ? getCanonicalSchemaInfo(primaryLabel) : undefined;

  const supporting = rows.slice(1, 3).map((r: CanonicalRow) => ({
    label: r.schemaId,
    score: r.score,
    rank: r.rank,
    info: getCanonicalSchemaInfo(r.schemaId)
  }));

  const therapeuticRecommendations: string[] = [
    "Identify a high-frequency trigger and pre-plan one alternative response.",
    "Use a brief pause (3 breaths) before key moments to widen choice.",
    "Schedule one weekly reflection to extract lessons and tweak the plan."
  ];

  return { canonicalTop5: rows, primaryLabel, primaryInfo, supporting, therapeuticRecommendations };
}

/** Public API: generate Tier-3 clinical HTML */
export function generateEnhancedTier3Report(analysis: AnyRecord, options: EnhancedClinicalReportOptions): string {
  const { canonicalTop5, primaryLabel, primaryInfo, supporting, therapeuticRecommendations } = normalizeTier3(analysis);

  const when = safeDateString(options.assessmentDate);
  const schemaCategory = primaryInfo?.domain ?? "Unknown Domain";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Clinical Schema Assessment — ${options.participantName}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; line-height:1.8; color:#1f2937; background:#f7fafc; max-width:1000px; margin:0 auto; padding:20px; }
    .report { background:#fff; padding:60px; border-radius:10px; border:1px solid #e5e7eb; box-shadow:0 20px 25px rgba(0,0,0,.08); }
    .banner { background:#dc2626; color:#fff; padding:12px 16px; text-align:center; font-weight:700; border-radius:6px; margin-bottom:28px; }
    .hdr { text-align:center; border-bottom:4px solid #dc2626; padding-bottom:24px; margin-bottom:36px; }
    .logo { font-size:32px; font-weight:800; color:#dc2626; margin-bottom:10px; }
    .meta p { margin:4px 0; color:#4b5563; }

    .panel { background:#fef2f2; border-left:5px solid #dc2626; padding:24px; border-radius:8px; margin:20px 0; }
    .category { background:#374151; color:#fff; padding:12px 18px; border-radius:6px; text-transform:uppercase; letter-spacing:.5px; text-align:center; margin:18px 0; font-weight:700; }

    .grid { display:flex; flex-direction:column; gap:12px; }
    .row { background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:12px; display:flex; gap:12px; align-items:center; }
    .row b { min-width:40px; display:inline-block; }

    .note { background:#fef3c7; border:1px solid #f59e0b; border-radius:6px; padding:16px; margin:18px 0; color:#78350f; }
    .therapy { background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left:5px solid #059669; padding:22px; border-radius:8px; margin:22px 0; }
    .footer { text-align:center; margin-top:40px; padding-top:20px; border-top:2px solid #e5e7eb; color:#6b7280; font-size:14px; }
    .mono { background:#f3f4f6; padding:12px; border-radius:4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; color:#374151; }
  </style>
</head>
<body>
  <div class="report">
    <div class="banner">CONFIDENTIAL CLINICAL ASSESSMENT — PROFESSIONAL USE ONLY</div>

    <div class="hdr">
      <div class="logo">Clinical Schema Assessment</div>
      <h1 style="margin:6px 0 0 0;">Schema-Based Pattern Analysis (Tier 3)</h1>
      <p style="margin:6px 0 0 0; color:#6b7280;">Consistent with your canonical (6-point) scoring pipeline</p>
    </div>

    <div class="meta" style="margin-bottom:18px;">
      <p><strong>Client:</strong> ${options.participantName}</p>
      <p><strong>Assessment Date:</strong> ${when}</p>
      ${options.assessmentId ? `<p><strong>Assessment ID:</strong> ${options.assessmentId}</p>` : ""}
      ${options.participantTeam ? `<p><strong>Team:</strong> ${options.participantTeam}</p>` : ""}
    </div>

    ${canonicalTop5.length ? `
    <div class="panel">
      <h3 style="margin:0 0 10px 0;">🔍 Canonical Activation (Top 5)</h3>
      <div class="grid">
        ${canonicalTop5.map((r: CanonicalRow) => `
        <div class="row" style="${r.rank === 1 ? 'background:#fff7ed; border-color:#fdba74;' : ''}">
          <b>#${r.rank}</b>
          <div style="flex:1;"><strong>${r.schemaId}</strong></div>
          <div><strong>${r.score}</strong>/100</div>
        </div>`).join("")}
      </div>
      <p style="margin:10px 0 0 0; font-size:13px; color:#6b7280;"><em>Index is 0–100 derived linearly from the 6-point Likert scores.</em></p>
    </div>
    ` : ""}

    <div class="panel" style="background:#fff; border:1px solid #e5e7eb;">
      <h3 style="margin-top:0;">Primary Schema Pattern</h3>
      <p style="margin-bottom:8px;"><strong>Schema:</strong> ${primaryLabel ?? "Unknown"}</p>
      <div class="category">${schemaCategory}</div>
      <div class="note">
        <strong>Clinical Context:</strong>
        ${primaryInfo
          ? `Pattern consistent with <em>${primaryInfo.clinicalName}</em> within the <em>${primaryInfo.domain}</em> domain.`
          : `Pattern label not recognized in canonical registry.`}
      </div>
      <p style="margin:0;">Activation of the primary schema is indicated by top ranking in the canonical list above. Consider how this pattern influences appraisal, affect, and behavior under pressure.</p>
    </div>

    ${supporting.length ? `
    <div class="panel">
      <h3 style="margin:0 0 10px 0;">Supporting Schema Patterns</h3>
      ${supporting.map(s => `
        <div class="row">
          <b>#${s.rank}</b>
          <div style="flex:1;">
            <strong>${s.label}</strong>
            ${s.info ? `<span style="color:#6b7280;"> — ${s.info.domain}</span>` : ""}
          </div>
          <div><strong>${s.score}</strong>/100</div>
        </div>
      `).join("")}
    </div>` : ""}

    <div class="therapy">
      <h3 style="margin-top:0;">🎯 Therapeutic Recommendations</h3>
      <ul style="margin:0; padding-left:20px;">
        ${therapeuticRecommendations.map((t: string) => `<li>${t}</li>`).join("")}
      </ul>
    </div>

    <div class="mono" style="margin-top:18px;">
      <p style="margin:0 0 6px 0;"><strong>Source Lineage (Top 5):</strong></p>
      <p style="margin:0;">${canonicalTop5.map((r: CanonicalRow) => `[${r.schemaId}, ${r.score}/100, rank-${r.rank}]`).join(", ")}</p>
      <p style="margin:8px 0 0 0;"><strong>Analysis Version:</strong> ${getAnalysisVersion()}</p>
    </div>

    <div class="footer">
      <p><strong>CONFIDENTIAL CLINICAL REPORT</strong></p>
      <p>For qualified professionals; not a substitute for diagnosis or treatment planning without appropriate clinical supervision.</p>
      <p>Generated on ${new Date().toLocaleDateString()} · Schema-Based Assessment © 2025</p>
    </div>
  </div>
</body>
</html>`;
}

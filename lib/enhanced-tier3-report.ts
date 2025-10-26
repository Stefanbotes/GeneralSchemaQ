// app/lib/tier3-report.ts
// Enhanced Tier 3 Clinical Report Generation (standalone, no external imports)
// - Domain-aligned with the 18-schema model
// - Accepts analysis.tier3.canonicalTop5 or falls back to analysis.rankedScores
// - Positive, development-oriented framing (not diagnostic language)
// - 6-point Likert → 0–100 index; 6 items per schema

type AnyRecord = Record<string, any>;

export interface EnhancedClinicalReportOptions {
  participantName: string;
  participantEmail: string;
  participantTeam?: string;
  assessmentDate: string;   // ISO or readable
  assessmentId: string;
}

// ----- Canonical registry (labels → domains + clinical ids) -----
const DOMAIN_BY_SCHEMA: Record<string, string> = {
  // Disconnection/Rejection (1.1–1.5)
  "Abandonment/Instability": "Disconnection/Rejection",
  "Defectiveness/Shame": "Disconnection/Rejection",
  "Emotional Deprivation": "Disconnection/Rejection",
  "Mistrust/Abuse": "Disconnection/Rejection",
  "Social Isolation/Alienation": "Disconnection/Rejection",
  // Impaired Autonomy/Performance (2.1–2.4)
  "Dependence/Incompetence": "Impaired Autonomy/Performance",
  "Vulnerability to Harm/Illness": "Impaired Autonomy/Performance",
  "Enmeshment/Undeveloped Self": "Impaired Autonomy/Performance",
  "Failure": "Impaired Autonomy/Performance",
  // Impaired Limits (3.1–3.2)
  "Entitlement/Grandiosity": "Impaired Limits",
  "Insufficient Self-Control/Discipline": "Impaired Limits",
  // Other-Directedness (4.1–4.3)
  "Subjugation": "Other-Directedness",
  "Self-Sacrifice": "Other-Directedness",
  "Approval-Seeking/Recognition-Seeking": "Other-Directedness",
  // Overvigilance/Inhibition (5.1–5.4)
  "Negativity/Pessimism": "Overvigilance/Inhibition",
  "Emotional Inhibition": "Overvigilance/Inhibition",
  "Unrelenting Standards/Hypercriticalness": "Overvigilance/Inhibition",
  "Punitiveness": "Overvigilance/Inhibition",
};

const CLINICAL_ID_BY_SCHEMA: Record<string, string> = {
  "Abandonment/Instability": "abandonment_instability",
  "Defectiveness/Shame": "defectiveness_shame",
  "Emotional Deprivation": "emotional_deprivation",
  "Mistrust/Abuse": "mistrust_abuse",
  "Social Isolation/Alienation": "social_isolation_alienation",
  "Dependence/Incompetence": "dependence_incompetence",
  "Vulnerability to Harm/Illness": "vulnerability_to_harm_illness",
  "Enmeshment/Undeveloped Self": "enmeshment_undeveloped_self",
  "Failure": "failure",
  "Entitlement/Grandiosity": "entitlement_grandiosity",
  "Insufficient Self-Control/Discipline": "insufficient_self_control_discipline",
  "Subjugation": "subjugation",
  "Self-Sacrifice": "self_sacrifice",
  "Approval-Seeking/Recognition-Seeking": "approval_recognition_seeking",
  "Negativity/Pessimism": "negativity_pessimism",
  "Emotional Inhibition": "emotional_inhibition",
  "Unrelenting Standards/Hypercriticalness": "unrelenting_standards_hypercriticalness",
  "Punitiveness": "punitiveness",
};

function getAnalysisVersion(): string {
  return "tier3-standalone-v1.0.0";
}

function getCanonicalSchemaInfo(schemaLabel: string) {
  if (!schemaLabel) return null;
  const domain = DOMAIN_BY_SCHEMA[schemaLabel];
  const clinicalId = CLINICAL_ID_BY_SCHEMA[schemaLabel];
  if (!domain || !clinicalId) return null;
  return {
    persona: schemaLabel,     // public-facing research label is the schema label
    clinicalName: schemaLabel,
    domain,
    clinicalId,
  };
}

function toPercent(x: unknown): number {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

type CanonicalItem = { schemaId: string; score: number; rank: number };

// Prefer analysis.tier3.canonicalTop5 if present; otherwise adapt rankedScores
function normalizeCanonicalTop(analysis: AnyRecord, take: number = 5): CanonicalItem[] {
  const t3 = analysis?.tier3;
  if (Array.isArray(t3?.canonicalTop5) && t3.canonicalTop5.length) {
    return t3.canonicalTop5
      .map((it: any, i: number) => ({
        schemaId: String(it.schemaId ?? it.schemaLabel ?? ""),
        score: toPercent(it.score ?? it.index0to100),
        rank: Number(it.rank ?? i + 1),
      }))
      .filter(x => x.schemaId);
  }

  // Fallback: rankedScores from shared scorer
  const ranked = Array.isArray(analysis?.rankedScores) ? analysis.rankedScores : [];
  return ranked.slice(0, take).map((s: any, i: number) => ({
    schemaId: String(s.schemaLabel ?? s.schemaId ?? ""),
    score: toPercent(s.index0to100 ?? s.score),
    rank: i + 1,
  })).filter(x => x.schemaId);
}

export function generateEnhancedTier3Report(analysis: AnyRecord, options: EnhancedClinicalReportOptions): string {
  const top = normalizeCanonicalTop(analysis, 5);
  const primaryRow = top[0];

  const primaryCanonical = primaryRow ? getCanonicalSchemaInfo(primaryRow.schemaId) : null;
  const supportingCanonical = top.slice(1, 3)
    .map(it => ({ ...it, canonical: getCanonicalSchemaInfo(it.schemaId) }))
    .filter(it => !!it.canonical);

  const schemaCategory = primaryCanonical?.domain ?? "—";
  const primaryName = primaryCanonical?.persona ?? primaryRow?.schemaId ?? "Primary Pattern";
  const primaryClinical = primaryCanonical?.clinicalName ?? primaryName;
  const primaryScore = primaryRow?.score ?? 0;

  // graceful options date formatting
  const safeDate = (() => {
    try {
      const d = new Date(options.assessmentDate);
      return isNaN(d.getTime())
        ? options.assessmentDate
        : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return options.assessmentDate;
    }
  })();

  // coaching-friendly copy
  const clinicalContext =
    "This section summarizes the strongest schema activations using a standardized 0–100 index derived from a 6-point Likert scale. Values above ~80 typically indicate a clearly prominent pattern. Use these results to guide development—not as fixed labels.";

  const integrationHint =
    "Consider how your strongest pattern shows up in high-stakes situations, and choose one real context to pilot a small, observable adjustment. Build on strengths while widening behavioral range.";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Clinical Schema-Oriented Report — ${options.participantName}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; line-height: 1.8; color: #1f2937; background:#f8fafc; max-width: 1000px; margin:0 auto; padding:20px; }
  .report { background:#fff; padding:56px; border-radius:10px; box-shadow:0 18px 30px rgba(0,0,0,.08); border:1px solid #e5e7eb; }
  .banner { background:#991b1b; color:#fff; text-align:center; padding:12px 16px; border-radius:6px; font-weight:700; letter-spacing:.3px; }
  .hdr { text-align:center; border-bottom:4px solid #dc2626; padding-bottom:24px; margin-bottom:36px; }
  .logo { font-size:30px; font-weight:800; color:#dc2626; margin-bottom:6px; }
  .meta p { margin:4px 0; color:#4b5563; }
  .block { background:#fef2f2; padding:22px; border-radius:8px; border-left:5px solid #dc2626; margin:18px 0; }
  .card { border:2px solid #6b7280; border-radius:10px; padding:24px; margin:24px 0; background:linear-gradient(135deg,#f3f4f6 0%, #e5e7eb 100%); }
  .schemaTag { background:#374151; color:#fff; display:inline-block; padding:8px 12px; border-radius:6px; text-transform:uppercase; letter-spacing:1px; margin:10px 0; }
  .supportGrid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:12px; }
  .supportItem { background:#f9fafb; border-left:4px solid #6b7280; padding:16px; border-radius:8px; }
  table { width:100%; border-collapse:collapse; }
  th, td { border:1px solid #d1d5db; padding:10px; text-align:left; font-size:14px; }
  thead tr { background:#e5e7eb; }
  .footer { text-align:center; margin-top:40px; padding-top:16px; border-top:2px solid #e5e7eb; color:#6b7280; font-size:14px; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:12px; color:#4b5563; }
</style>
</head>
<body>
  <div class="report">
    <div class="banner">CONFIDENTIAL — FOR PROFESSIONAL USE</div>

    <div class="hdr">
      <div class="logo">Clinical Schema-Oriented Report</div>
      <h1 style="margin:6px 0 0 0;">Schema-Based Pattern Analysis</h1>
      <p style="margin:4px 0 0 0; color:#6b7280;">Grounded in the 18-schema framework</p>
    </div>

    <div class="meta" style="margin-bottom:18px;">
      <p><strong>Client:</strong> ${options.participantName}</p>
      <p><strong>Assessment Date:</strong> ${safeDate}</p>
      <p><strong>Assessment ID:</strong> ${options.assessmentId}</p>
      <p><strong>Items/Schema:</strong> 6 items per schema (108 total)</p>
      <p><strong>Scale:</strong> 6-point Likert (1–6), reported as 0–100 indices</p>
    </div>

    ${top.length ? `
    <div class="card">
      <h3 style="margin-top:0;">🔍 Canonical Activation Snapshot (Top 5)</h3>
      <p class="mono" style="margin:10px 0 16px 0;">${clinicalContext}</p>
      <table>
        <thead>
          <tr>
            <th>Rank</th><th>Schema Pattern</th><th>Activation Index</th>
          </tr>
        </thead>
        <tbody>
          ${top.map(row => `
            <tr style="${row.rank === 1 ? 'background:#fef3c7;font-weight:600;' : ''}">
              <td>#${row.rank}</td>
              <td>${row.schemaId}</td>
              <td>${row.score}/100</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    ` : ""}

    <div class="block">
      <h3 style="margin-top:0;">Primary Schema Pattern</h3>
      <p style="margin:6px 0;"><strong>${primaryName}</strong> (${primaryScore}/100)</p>
      <div class="schemaTag">${schemaCategory}</div>
      <p style="margin-top:10px;">
        The primary pattern represents the clearest signal in your current profile. Use it as a starting point for
        targeted development—leveraging strengths while adding flexibility where helpful.
      </p>
      <p class="mono" style="margin:10px 0 0 0;">
        Clinical label: ${primaryClinical}${primaryCanonical?.clinicalId ? ` · ID: ${primaryCanonical.clinicalId}` : ""}
      </p>
    </div>

    ${supportingCanonical.length ? `
    <div class="block" style="background:#fff7ed;border-left-color:#f59e0b;">
      <h3 style="margin-top:0;">Supporting Schema Patterns</h3>
      <div class="supportGrid">
        ${supportingCanonical.map(it => `
          <div class="supportItem">
            <p style="margin:0 0 6px 0;"><strong>${it.canonical?.persona}</strong></p>
            <p style="margin:0 0 6px 0;">Domain: ${it.canonical?.domain}</p>
            <p style="margin:0 0 6px 0;">Activation: ${it.score}/100 (Rank #${it.rank})</p>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}

    <div class="card">
      <h3 style="margin-top:0;">📋 Working Formulation</h3>
      <p>
        Your strongest pattern (<strong>${primaryName}</strong>) likely shapes how you appraise situations,
        allocate attention, and respond under pressure. Rather than treating this as a fixed label, use it to
        guide experiments that keep your strengths while widening your repertoire.
      </p>
      <ul>
        <li><strong>Observation:</strong> Note 2–3 situations where this pattern shows up most.</li>
        <li><strong>Small shift:</strong> Choose one behavior to experiment with (e.g., timing, framing, or pacing).</li>
        <li><strong>Feedback:</strong> Invite brief, behavior-specific feedback from a trusted partner.</li>
      </ul>
    </div>

    <div class="block" style="background:#ecfdf5;border-left-color:#059669;">
      <h3 style="margin-top:0;">🎯 Development Focus</h3>
      <ul>
        <li>Translate insight into one concrete habit you can practice weekly.</li>
        <li>Pair strengths with a complementary behavior from a supporting pattern.</li>
        <li>Review progress every 2–3 weeks; keep what works, adjust what doesn’t.</li>
      </ul>
      <p class="mono" style="margin:10px 0 0 0;">${integrationHint}</p>
    </div>

    <div class="footer">
      <div class="mono" style="padding:10px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; margin-bottom:10px;">
        <div><strong>Source lineage (Top-5):</strong> ${top.map(it => `[${it.schemaId}, ${it.score}/100, rank-${it.rank}]`).join(", ")}</div>
        <div><strong>Analysis Version:</strong> ${getAnalysisVersion()}</div>
      </div>
      <p>Generated on ${new Date().toLocaleDateString()} · Schema-Based Framework © 2025</p>
    </div>
  </div>
</body>
</html>`;
}

// app/lib/tier2-report.ts
// Enhanced Tier 2 Report (Coaching Focus)
// - Standalone: no external imports
// - Compatible with analysis.tier2 OR analysis.rankedScores (fallback)
// - Positive, growth-oriented language
// - 6-point Likert -> 0–100 index supported (display only)

type AnyRecord = Record<string, any>;

export interface EnhancedReportOptions {
  participantName: string;
  participantEmail?: string;
  participantTeam?: string;
  assessmentDate: string;     // ISO string or readable date
  assessmentId?: string;
}

type Tier2Persona = {
  name: string;
  strengthFocus?: string;
  developmentEdge?: string;
  rank?: number;
  activationLevel?: number; // 0..100 if available
};

type Tier2Normalized = {
  primary: Tier2Persona;
  supporting: Tier2Persona[];
  detailedAnalysis: string;
  developmentRecommendations: string[];
};

/** Helpers */
function toPercent(x: unknown): number {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
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

/** Try to normalize Tier-2 data from either analysis.tier2 or rankedScores */
function normalizeTier2(analysis: AnyRecord): Tier2Normalized {
  const t2 = analysis?.tier2 ?? {};
  const hasTier2 =
    t2 &&
    typeof t2 === "object" &&
    t2.primaryPersona &&
    typeof t2.primaryPersona === "object";

  if (hasTier2) {
    const primaryRaw = t2.primaryPersona;
    const supportingRaw = Array.isArray(t2.supportingPersonas) ? t2.supportingPersonas : [];

    const primary: Tier2Persona = {
      name: String(primaryRaw.name ?? primaryRaw.personaName ?? primaryRaw.publicName ?? "Primary Pattern"),
      strengthFocus: primaryRaw.strengthFocus ?? "",
      developmentEdge: primaryRaw.developmentEdge ?? "",
      rank: primaryRaw.rank ?? 1,
      activationLevel: toPercent(primaryRaw.activationLevel ?? primaryRaw.index0to100),
    };

    const supporting: Tier2Persona[] = supportingRaw.map((p: any, i: number) => ({
      name: String(p.name ?? p.personaName ?? p.publicName ?? `Supporting Pattern #${i + 1}`),
      strengthFocus: p.strengthFocus ?? "",
      developmentEdge: p.developmentEdge ?? "",
      rank: p.rank ?? i + 2,
      activationLevel: toPercent(p.activationLevel ?? p.index0to100),
    }));

    const detailedAnalysis: string =
      typeof t2.detailedAnalysis === "string" && t2.detailedAnalysis.trim()
        ? t2.detailedAnalysis
        : `Your profile shows clear activation of "${primary.name}" with complementary supporting patterns that expand range.`;

    const developmentRecommendations: string[] = Array.isArray(t2.developmentRecommendations) && t2.developmentRecommendations.length
      ? t2.developmentRecommendations
      : [
          "Translate one strength into a weekly practice with a clear trigger.",
          "Pair your primary pattern with a complementary supporting behavior.",
          "Collect quick, behavior-specific feedback after key moments.",
        ];

    return { primary, supporting, detailedAnalysis, developmentRecommendations };
  }

  // ---- Fallback: build Tier-2 from rankedScores (shared 6-point scorer output) ----
  const ranked = Array.isArray(analysis?.rankedScores) ? analysis.rankedScores : [];
  const primaryRanked = ranked[0];
  const supportingRanked = ranked.slice(1, 3);

  const primary: Tier2Persona = primaryRanked
    ? {
        name: String(primaryRanked.schemaLabel ?? "Primary Pattern"),
        strengthFocus: "Leverage this pattern where it creates clarity and momentum.",
        developmentEdge: "Add one complementary behavior to widen your range.",
        rank: 1,
        activationLevel: toPercent(primaryRanked.index0to100),
      }
    : {
        name: "Primary Pattern",
        strengthFocus: "Identify contexts where this comes naturally.",
        developmentEdge: "Pick one situation to pilot a small adjustment.",
        rank: 1,
        activationLevel: 0,
      };

  const supporting: Tier2Persona[] = supportingRanked.map((s: any, i: number) => ({
    name: String(s.schemaLabel ?? `Supporting Pattern #${i + 1}`),
    strengthFocus: "Use this as a situational option when the context changes.",
    developmentEdge: "Practice small switches between patterns.",
    rank: i + 2,
    activationLevel: toPercent(s.index0to100),
  }));

  const detailedAnalysis =
    primaryRanked
      ? `Activation is highest on "${primary.name}" (${primary.activationLevel ?? 0}/100), with supporting patterns offering additional flexibility.`
      : "A clear primary pattern was not available; use overall tendencies to guide small, repeatable experiments.";

  const developmentRecommendations = [
    "Pick one high-leverage behavior to practice for two weeks.",
    "Link practice to a clear cue (meeting type, person, or time of day).",
    "Ask for short, behavior-specific feedback after the moment.",
  ];

  return { primary, supporting, detailedAnalysis, developmentRecommendations };
}

/** Public API: generate Tier-2 HTML */
export function generateEnhancedTier2Report(analysis: AnyRecord, options: EnhancedReportOptions): string {
  const { primary, supporting, detailedAnalysis, developmentRecommendations } = normalizeTier2(analysis);
  const when = safeDateString(options.assessmentDate);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Inner Persona Development Report — ${options.participantName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color:#1f2937; background:#f7fafc; max-width:920px; margin:0 auto; padding:20px; }
    .report { background:#fff; padding:50px; border-radius:12px; box-shadow:0 10px 15px rgba(0,0,0,.08); border:1px solid #e5e7eb; }
    .hdr { text-align:center; border-bottom:3px solid bg-primary; padding-bottom:24px; margin-bottom:36px; }
    .logo { font-size:28px; font-weight:800; color:bg-primary; margin-bottom:8px; }
    .meta p { margin:4px 0; color:#4b5563; }
    .card { border:2px solid bg-primary; border-radius:12px; padding:26px; margin:24px 0; background:linear-gradient(135deg,#ebf8ff 0%, #f0fff4 100%); }
    .row { display:flex; align-items:center; gap:16px; }
    .badge { background:bg-primary; color:#fff; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; }
    .title { font-size:22px; font-weight:700; color:#1f2937; }
    .subtle { font-size:14px; color:#6b7280; font-style:italic; }
    .section { background:#f8fafc; padding:20px; border-radius:8px; margin:18px 0; border-left:4px solid bg-primary; }
    .coach { background:linear-gradient(135deg,#fef5e7 0%, #f0fff4 100%); padding:20px; border-radius:8px; border-left:4px solid #f59e0b; margin:18px 0; }
    .dev { background:linear-gradient(135deg,#f0f9ff 0%, #fef3c7 100%); padding:20px; border-radius:8px; border-left:4px solid #0284c7; margin:18px 0; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:14px; }
    .support { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; }
    .footer { text-align:center; margin-top:34px; padding-top:18px; border-top:2px solid #e5e7eb; color:#64748b; font-size:14px; }
    .hl { background:#fef3c7; padding:2px 6px; border-radius:4px; font-weight:600; }
    @media (max-width: 720px) { .grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <div class="report">
    <div class="hdr">
      <div class="logo">Inner Persona Development Report</div>
      <h1 style="margin:6px 0 0 0;">Coaching-Focused Analysis (Tier 2)</h1>
      <p class="subtle" style="margin:4px 0 0 0;">Strengths + practical growth moves</p>
    </div>

    <div class="meta" style="margin-bottom:18px;">
      <p><strong>Name:</strong> ${options.participantName}</p>
      <p><strong>Assessment Date:</strong> ${when}</p>
      ${options.assessmentId ? `<p><strong>Assessment ID:</strong> ${options.assessmentId}</p>` : ""}
      ${options.participantTeam ? `<p><strong>Team:</strong> ${options.participantTeam}</p>` : ""}
    </div>

    <div class="card">
      <div class="row" style="margin-bottom:14px;">
        <div class="badge">1</div>
        <div>
          <div class="title">${primary.name}</div>
          <div class="subtle">Primary pattern ${typeof primary.activationLevel === "number" ? `· ${primary.activationLevel}/100` : ""}</div>
        </div>
      </div>

      <div class="coach">
        <h4 style="margin:0 0 6px 0;">🎯 Your Approach</h4>
        <p style="margin:0;">${detailedAnalysis}</p>
      </div>

      ${primary.strengthFocus ? `
      <div class="section">
        <h4 style="margin:0 0 6px 0;">💪 Core Strength Focus</h4>
        <p class="hl" style="margin:0;">${primary.strengthFocus}</p>
      </div>` : ""}

      ${primary.developmentEdge ? `
      <div class="dev">
        <h4 style="margin:0 0 6px 0;">🌱 Development Edge</h4>
        <p style="margin:0;">${primary.developmentEdge}</p>
      </div>` : ""}
    </div>

    ${supporting.length ? `
    <h3 style="margin-top:30px; margin-bottom:12px;">Supporting Patterns</h3>
    <div class="grid">
      ${supporting.map(p => `
        <div class="support">
          <h4 style="margin:0 0 8px 0; color:#1f2937;">${p.name}${typeof p.activationLevel === "number" ? ` · ${p.activationLevel}/100` : ""}</h4>
          ${p.strengthFocus ? `<p style="margin:0 0 6px 0;"><strong>Strength:</strong> ${p.strengthFocus}</p>` : ""}
          ${p.developmentEdge ? `<p style="margin:0;"><strong>Development:</strong> ${p.developmentEdge}</p>` : ""}
        </div>
      `).join("")}
    </div>` : ""}

    <div class="section">
      <h4 style="margin:0 0 8px 0;">🚀 Development Recommendations</h4>
      <ul style="margin:0; padding-left:18px;">
        ${developmentRecommendations.map((rec: string) => `<li>${rec}</li>`).join("")}
      </ul>
    </div>

    <div style="background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%); padding: 20px; border-radius: 8px; margin: 22px 0; border: 1px solid #0284c7;">
      <h4 style="margin-top:0;">💡 Integration & Next Steps</h4>
      <p style="margin:0 0 6px 0;">Your strongest pattern is a reliable engine—use it deliberately where it fits best.</p>
      <p style="margin:0;">Practice switching to a supporting pattern when the situation calls for a different tone or tactic.</p>
    </div>

    <div class="footer">
      <p><strong>Inner Persona Development Report</strong></p>
      <p>Coaching-focused insights intended for professional development.</p>
      <p>Generated on ${new Date().toLocaleDateString()} · Inner Personas Framework © 2025</p>
    </div>
  </div>
</body>
</html>`;
}


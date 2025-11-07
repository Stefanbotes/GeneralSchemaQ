// lib/tier1/generate-html.ts
// Small, safe HTML renderer for Tier 1 using precomputed persona results.
// This file MUST export `renderTier1HTML` so other modules can import it.

export type PersonaCard = {
  schema: string;        // internal id (e.g. "The Clinger")
  publicName: string;    // human title
  healthy?: string;      // optional "healthy expression" line
  score: number;         // 0..100
  emerging?: boolean;    // flag for "emerging pattern"
};

export type RenderArgs = {
  participantName: string;
  completedAt: string | Date;
  totalQuestions: number;
  primary: PersonaCard | null | undefined;
  secondary: PersonaCard | null | undefined;
  tertiary: PersonaCard | null | undefined;
  topDisplay?: Array<{ schemaLabel: string; displayIndex: number }>;
};

const escapeHtml = (s: string) =>
  String(s ?? "").replace(/[<>&"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;" }[c] as string));

const fmtDate = (d: string | Date) => {
  try { return new Date(d).toLocaleDateString(); }
  catch { return new Date().toLocaleDateString(); }
};

/**
 * Persona block with neutral classes so CSS controls all visuals.
 * (No inline colors; content + order unchanged.)
 */
function renderPersonaBlock(title: string, c: PersonaCard, variant: "primary" | "secondary") {
  const healthyLine = c.healthy
    ? `<div class="meta-line">Healthy expression: ${escapeHtml(c.healthy)}</div>`
    : "";

  const schemaLine = `<div class="schema-line">(${escapeHtml(c.schema)})</div>`;

  const emergingLine = c.emerging
    ? `<div class="emerging">⚠️ Emerging pattern${variant === "primary" ? " - may benefit from development focus" : ""}</div>`
    : "";

  if (variant === "primary") {
    return (
      `<div class="primary">` +
        `<div class="label">${escapeHtml(title)}</div>` +
        `<div class="score">${escapeHtml(c.publicName)}</div>` +
        healthyLine +
        schemaLine +
        `<div class="meta-line">Activation Index: ${Math.round(c.score)}/100</div>` +
        emergingLine +
      `</div>`
    );
  }

  return (
    `<div class="secondary">` +
      `<div class="label">${escapeHtml(title)}</div>` +
      `<div class="score">${escapeHtml(c.publicName)}</div>` +
      healthyLine +
      schemaLine +
      `<div class="meta-line">Activation Index: ${Math.round(c.score)}/100</div>` +
      emergingLine +
    `</div>`
  );
}

export function renderTier1HTML(args: RenderArgs): string {
  const {
    participantName,
    completedAt,
    totalQuestions,
    primary,
    secondary,
    tertiary,
    topDisplay = []
  } = args;

  const primaryBlock = primary ? renderPersonaBlock("Primary Leadership Persona", primary, "primary") : "";
  const secondaryBlock = secondary ? renderPersonaBlock("Secondary Leadership Persona", secondary, "secondary") : "";
  const tertiaryBlock = tertiary ? renderPersonaBlock("Tertiary Leadership Persona", tertiary, "secondary") : "";

  const topList = topDisplay.slice(0, 5).map(item => {
    const name = escapeHtml(item.schemaLabel);
    return (
      `<li>` +
        `<strong>${name}</strong>` +
        `<span class="muted"> (${name})</span>: ` +
        `${item.displayIndex}/100` +
      `</li>`
    );
  }).join("");

  const dateStr = fmtDate(completedAt);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Leadership Summary - ${escapeHtml(participantName)}</title>
  <style>
    /* ===============================
       Brand tokens (your palette)
       Light base: #FFF9F5
       Primary / Deep teal: #095A62 (HSL 188 83% 21%)
    =============================== */
    :root{
      --bg: hsl(24 60% 98%);             /* warm white */
      --ink: hsl(195 80% 10%);           /* deep teal text */
      --muted: hsl(195 20% 40%);         /* subdued teal */
      --muted-2: hsl(195 20% 45%);       /* slightly stronger muted */
      --card: hsl(24 60% 98%);           /* same as bg for airy cards */
      --line: hsl(188 30% 88%);          /* soft teal-tinted border */
      --brand: hsl(188 83% 21%);         /* deep teal */
      --brand-ink: hsl(188 83% 18%);     /* deeper teal for headings */
      --accent: hsl(24 65% 90%);         /* warm peach */
    }
    /* Optional monochrome mode: add class="mono" on <body> for grayscale print */
    .mono{
      --ink: hsl(220 30% 12%);
      --muted: hsl(220 10% 45%);
      --muted-2: hsl(220 10% 50%);
      --line: hsl(220 10% 86%);
      --brand: hsl(220 20% 20%);
      --brand-ink: hsl(220 20% 18%);
      --accent: hsl(0 0% 90%);
    }

    /* ===============================
       Base
    =============================== */
    *{ box-sizing: border-box; }
    html,body{ margin:0; padding:0; }
    body{
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color: var(--ink);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .muted{ color: var(--muted-2); }

    /* ===============================
       Page shell
    =============================== */
    .container{
      max-width: 860px;
      margin: 24px auto;
      background: var(--card);
      padding: 36px 40px;
      border-radius: 16px;
      border: 1px solid var(--line);
      box-shadow: 0 8px 24px rgba(9,90,98,0.08); /* subtle teal-tinted shadow */
    }

    /* ===============================
       Header
    =============================== */
    .header{
      text-align:center;
      padding-bottom: 18px;
      margin-bottom: 28px;
      border-bottom: 1px solid var(--line);
    }
    .header h1{
      margin:0 0 4px;
      font-size: 26px;
      letter-spacing: -0.01em;
      color: var(--brand-ink);
    }
    .header h2{
      margin:0 0 10px;
      font-size: 16px;
      font-weight: 600;
      color: var(--muted);
    }
    .header p{
      margin:4px 0;
      color: var(--muted);
    }

    /* ===============================
       Sections & text
    =============================== */
    .section{ margin: 28px 0; }
    .section h3{
      margin:0 0 8px;
      font-size: 16px;
      font-weight: 700;
      color: var(--brand-ink);
    }
    .section p{ color: var(--muted); margin: 6px 0 0; }
    ul{ padding-left: 20px; margin: 8px 0 0; }
    li{ margin: 6px 0; line-height: 1.6; color: var(--ink); }

    /* ===============================
       Persona cards
    =============================== */
    .primary, .secondary{
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      background: var(--card);
    }
    /* Primary: very subtle teal wash using HSLA of brand */
    .primary{
      background: linear-gradient(180deg, hsla(188,83%,21%,0.07), hsla(188,83%,21%,0.04));
      border-color: hsla(188,83%,21%,0.25);
    }
    /* Secondary: light neutral */
    .secondary{
      background: hsl(24 60% 98% / 0.9);
      border-color: var(--line);
    }

    /* Typography inside persona blocks */
    .label{
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .score{ /* persona public name */
      font-size: 20px;
      font-weight: 700;
      color: var(--ink);
    }
    .primary .score{ color: var(--brand-ink); }
    .primary .label{ color: hsla(188,83%,21%,0.85); }

    .meta-line{
      margin: 8px 0;
      font-size: 14px;
      color: var(--muted);
    }
    .schema-line{
      margin: 5px 0;
      font-size: 13px;
      color: var(--muted-2);
    }
    .emerging{
      margin-top: 10px;
      font-size: 13px;
      color: hsl(24 80% 35%); /* warm amber-ish note against your palette */
    }

    /* ===============================
       Footer
    =============================== */
    .footer{
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 13px;
      text-align:center;
    }

    /* ===============================
       Print polish
    =============================== */
    @media print{
      body{ background:#fff; }
      .container{ box-shadow:none; border-color: hsl(188 20% 85%); }
      .primary{ background: hsl(188 60% 96%); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a{ text-decoration: none; color: inherit; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Leadership Personas Assessment</h1>
      <h2>Summary Report</h2>
      <p><strong>${escapeHtml(participantName)}</strong></p>
      <p>Generated: ${escapeHtml(dateStr)}</p>
    </div>

    <div class="section">
      <h3>Assessment Results</h3>
      <p>Your leadership assessment reveals distinct patterns that define your natural approach to leadership and team dynamics.</p>
    </div>

    ${primaryBlock}
    ${secondaryBlock}
    ${tertiaryBlock}

    <div class="section">
      <h3>Complete Ranking</h3>
      <div class="muted" style="font-size: 14px; margin-bottom: 15px;">All leadership personas (Top 5):</div>
      <ol>${topList}</ol>
    </div>

    <div class="section">
      <div class="muted" style="font-size: 14px; margin-bottom: 15px;">
        Questions answered: <strong>${totalQuestions}</strong>
      </div>
    </div>

    <div class="footer">
      <p>This summary report uses the same canonical scoring methodology as Tier 2 and Tier 3 clinical reports.</p>
      <p>© ${new Date().getFullYear()} Leadership Personas Assessment. Confidential.</p>
    </div>
  </div>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Optional: Keep Tier 2 visuals in sync (same brand tokens)          */
/* ------------------------------------------------------------------ */

export function renderTier2HTML(args: RenderArgs): string {
  const {
    participantName,
    completedAt,
    totalQuestions,
    primary,
    secondary,
    tertiary,
    topDisplay = []
  } = args;

  const primaryBlock = primary ? renderPersonaBlock("Primary Leadership Persona", primary, "primary") : "";
  const secondaryBlock = secondary ? renderPersonaBlock("Secondary Leadership Persona", secondary, "secondary") : "";
  const tertiaryBlock = tertiary ? renderPersonaBlock("Tertiary Leadership Persona", tertiary, "secondary") : "";

  const topList = topDisplay.slice(0, 5).map(item => {
    const name = escapeHtml(item.schemaLabel);
    return (
      `<li>` +
        `<strong>${name}</strong>` +
        `<span class="muted"> (${name})</span>: ` +
        `${item.displayIndex}/100` +
      `</li>`
    );
  }).join("");

  const dateStr = fmtDate(completedAt);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Leadership Summary - ${escapeHtml(participantName)}</title>
  <style>
    :root{
      --bg: hsl(24 60% 98%);
      --ink: hsl(195 80% 10%);
      --muted: hsl(195 20% 40%);
      --muted-2: hsl(195 20% 45%);
      --card: hsl(24 60% 98%);
      --line: hsl(188 30% 88%);
      --brand: hsl(188 83% 21%);
      --brand-ink: hsl(188 83% 18%);
      --accent: hsl(24 65% 90%);
    }
    .mono{
      --ink: hsl(220 30% 12%);
      --muted: hsl(220 10% 45%);
      --muted-2: hsl(220 10% 50%);
      --line: hsl(220 10% 86%);
      --brand: hsl(220 20% 20%);
      --brand-ink: hsl(220 20% 18%);
      --accent: hsl(0 0% 90%);
    }

    *{ box-sizing: border-box; }
    html,body{ margin:0; padding:0; }
    body{
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color: var(--ink); background: var(--bg);
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
    }
    .muted{ color: var(--muted-2); }

    .container{ max-width: 860px; margin: 24px auto; background: var(--card); padding: 36px 40px;
      border-radius: 16px; border: 1px solid var(--line); box-shadow: 0 8px 24px rgba(9,90,98,0.08); }

    .header{ text-align:center; padding-bottom: 18px; margin-bottom: 28px; border-bottom: 1px solid var(--line); }
    .header h1{ margin:0 0 4px; font-size: 26px; letter-spacing: -0.01em; color: var(--brand-ink); }
    .header h2{ margin:0 0 10px; font-size: 16px; font-weight: 600; color: var(--muted); }
    .header p{ margin:4px 0; color: var(--muted); }

    .section{ margin: 28px 0; }
    .section h3{ margin:0 0 8px; font-size: 16px; font-weight: 700; color: var(--brand-ink); }
    .section p{ color: var(--muted); margin: 6px 0 0; }
    ul{ padding-left: 20px; margin: 8px 0 0; }
    li{ margin: 6px 0; line-height: 1.6; color: var(--ink); }

    .primary, .secondary{ border: 1px solid var(--line); border-radius: 12px; padding: 16px; margin: 16px 0; background: var(--card); }
    .primary{ background: linear-gradient(180deg, hsla(188,83%,21%,0.07), hsla(188,83%,21%,0.04)); border-color: hsla(188,83%,21%,0.25); }
    .secondary{ background: hsl(24 60% 98% / 0.9); border-color: var(--line); }

    .label{ font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 6px; }
    .score{ font-size: 20px; font-weight: 700; color: var(--ink); }
    .primary .score{ color: var(--brand-ink); }
    .primary .label{ color: hsla(188,83%,21%,0.85); }

    .meta-line{ margin: 8px 0; font-size: 14px; color: var(--muted); }
    .schema-line{ margin: 5px 0; font-size: 13px; color: var(--muted-2); }
    .emerging{ margin-top: 10px; font-size: 13px; color: hsl(24 80% 35%); }

    .footer{ margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; text-align:center; }

    @media print{
      body{ background:#fff; }
      .container{ box-shadow:none; border-color: hsl(188 20% 85%); }
      .primary{ background: hsl(188 60% 96%); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a{ text-decoration: none; color: inherit; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Leadership Personas Assessment</h1>
      <h2>Summary Report</h2>
      <p><strong>${escapeHtml(participantName)}</strong></p>
      <p>Generated: ${escapeHtml(dateStr)}</p>
    </div>

    <div class="section">
      <h3>Assessment Results</h3>
      <p>Your leadership assessment reveals distinct patterns that define your natural approach to leadership and team dynamics.</p>
    </div>

    ${primaryBlock}
    ${secondaryBlock}
    ${tertiaryBlock}

    <div class="section">
      <h3>Complete Ranking</h3>
      <div class="muted" style="font-size: 14px; margin-bottom: 15px;">All leadership personas (Top 5):</div>
      <ol>${topList}</ol>
    </div>

    <div class="section">
      <div class="muted" style="font-size: 14px; margin-bottom: 15px;">
        Questions answered: <strong>${totalQuestions}</strong>
      </div>
    </div>

    <div class="footer">
      <p>This summary report uses the same canonical scoring methodology as Tier 2 and Tier 3 clinical reports.</p>
      <p>© ${new Date().getFullYear()} Leadership Personas Assessment. Confidential.</p>
    </div>
  </div>
</body>
</html>`;
}

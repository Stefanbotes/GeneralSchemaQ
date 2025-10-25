// app/api/<your-tier1-path>/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';
import {
  schemaToPublic,
  schemaToHealthy,
  narrativeFor,
  personaCopy,
} from '@/lib/tier1-persona-copy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Accepts POST with either:
// 1) { responses: Record<string, {value, timestamp} | string | number>, participant?: {...} }
// 2) { assessmentId: string, userId?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const url = new URL(req.url);
    const format = url.searchParams.get('format');

    let responses: Record<string, string | number> | undefined;
    let participantName = 'User';

    console.log('🔍 Tier 1 API called with:', {
      hasResponses: !!body?.responses,
      hasAssessmentId: !!body?.assessmentId,
      hasUserId: !!body?.userId,
      bodyKeys: Object.keys(body || {}),
    });

    // -------- Pattern 1: direct responses payload --------
    if (body?.responses) {
      console.log('📝 Processing direct responses payload');
      const rawResponses = body.responses as Record<string, any>;
      const processed: Record<string, string | number> = {};

      for (const [key, val] of Object.entries(rawResponses)) {
        if (val && typeof val === 'object' && 'value' in val) {
          const v = (val as any).value;
          if (typeof v === 'number' || typeof v === 'string') processed[key] = v;
        } else if (typeof val === 'number' || typeof val === 'string') {
          processed[key] = val;
        }
      }

      responses = processed;
      participantName =
        body?.participantData?.name ||
        body?.participant?.name ||
        'User';

      console.log('✅ Direct responses processed:', {
        originalCount: Object.keys(rawResponses || {}).length,
        processedCount: Object.keys(processed).length,
        participantName,
      });
    }

    // -------- Pattern 2: lookup by assessmentId (userId optional) --------
    else if (body?.assessmentId) {
      console.log('🔎 Looking up assessment by ID');

      // Fetch the assessment first
      const assessment = await db.assessments.findUnique({
        where: { id: body.assessmentId },
      });

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      if (assessment.status !== 'COMPLETED') {
        return NextResponse.json({ error: 'Assessment not completed' }, { status: 400 });
      }

      // Try to enrich participantName:
      // 1) If userId provided, use that
      // 2) Else, use assessment.userId
      const userIdToLoad = body.userId || assessment.userId || null;
      if (userIdToLoad) {
        const user = await db.users.findUnique({ where: { id: userIdToLoad } });
        participantName =
          `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
          user?.email ||
          participantName;
      }

      // Prefer already-saved results.report.rawScores108 (fast path)
      let rawFromResults: Record<string, any> | undefined;
      try {
        const results = typeof assessment.results === 'string'
          ? JSON.parse(assessment.results)
          : (assessment.results as any);

        rawFromResults = results?.report?.rawScores108 as Record<string, any> | undefined;
      } catch {
        // ignore parse errors and fall back
      }

      if (rawFromResults && Object.keys(rawFromResults).length > 0) {
        responses = rawFromResults; // Ex: { "1.1.1": 4, ... }
        console.log('✅ Using results.report.rawScores108 from DB');
      } else {
        // Fallback: derive from assessment.responses
        let rawResponses: Record<string, any>;
        try {
          rawResponses = typeof assessment.responses === 'string'
            ? JSON.parse(assessment.responses)
            : (assessment.responses as Record<string, any>);
        } catch (parseError) {
          return NextResponse.json({ error: 'Invalid response format in assessment' }, { status: 400 });
        }

        const processed: Record<string, string | number> = {};
        for (const [key, val] of Object.entries(rawResponses)) {
          if (val && typeof val === 'object' && 'value' in val) {
            const v = (val as any).value;
            if (typeof v === 'number' || typeof v === 'string') processed[key] = v;
          } else if (typeof val === 'number' || typeof val === 'string') {
            processed[key] = val;
          }
        }

        responses = processed;
        console.log('✅ Derived responses from assessment.responses');
      }
    }

    // -------- Pattern 3: missing required input --------
    else {
      console.log('❌ Missing required parameters (need responses OR assessmentId)');
      return NextResponse.json(
        { error: 'Either responses or assessmentId is required for Tier 1 report generation' },
        { status: 400 }
      );
    }

    // Basic guard
    if (!responses || !Object.keys(responses).length) {
      return NextResponse.json({ error: 'No responses available for scoring' }, { status: 400 });
    }

    // -------- Canonical scoring (shared with Tier 2/3) --------
    const { rankedScores, display } = await scoreAssessmentResponses(responses);
    if (!rankedScores.length) {
      return NextResponse.json(
        { error: 'No scores computed (check item IDs vs mapping)' },
        { status: 400 }
      );
    }

    const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);

    console.log('🎯 Tier 1 Results: ', {
      primary: primary?.schemaLabel,
      primaryIdx: Math.round(primary?.index0to100 || 0),
      secondary: secondary?.schemaLabel,
      secondaryIdx: Math.round(secondary?.index0to100 || 0),
      tertiary: tertiary?.schemaLabel,
      tertiaryIdx: Math.round(tertiary?.index0to100 || 0),
    });

    const pName = primary ? schemaToPublic(primary.schemaLabel) : '—';
    const sName = secondary ? schemaToPublic(secondary.schemaLabel) : null;
    const tName = tertiary ? schemaToPublic(tertiary.schemaLabel) : null;

    const pHealthy = primary ? schemaToHealthy(primary.schemaLabel) : null;
    const sHealthy = secondary ? schemaToHealthy(secondary.schemaLabel) : null;
    const tHealthy = tertiary ? schemaToHealthy(tertiary.schemaLabel) : null;

    // -------- Debug JSON if requested --------
    if (format === 'json') {
      return NextResponse.json({
        ok: true,
        counts: { ranked: rankedScores.length, display: display.length },
        primary: primary && {
          schema: primary.schemaLabel,
          publicName: pName,
          idx: Math.round(primary.index0to100),
        },
        secondary: secondary && {
          schema: secondary.schemaLabel,
          publicName: sName,
          idx: Math.round(secondary.index0to100),
          emerging: (secondary as any).caution || false,
        },
        tertiary: tertiary && {
          schema: tertiary.schemaLabel,
          publicName: tName,
          idx: Math.round(tertiary.index0to100),
          emerging: (tertiary as any).caution || false,
        },
        top5: display.slice(0, 5).map((d) => ({
          schemaLabel: d.schemaLabel,
          publicName: schemaToPublic(d.schemaLabel),
          displayIndex: d.displayIndex,
          n: d.n,
        })),
        participantName,
      });
    }

    // -------- HTML report (download as .html) --------
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Leadership Summary - ${escapeHtml(participantName)}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; background: #f8fafc; }
    .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .section { margin: 30px 0; }
    .primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .secondary { background: #f1f5f9; padding: 15px; border-left: 4px solid #64748b; margin: 15px 0; }
    .score { font-size: 24px; font-weight: bold; color: #4f46e5; }
    .label { font-size: 18px; margin-bottom: 10px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; line-height: 1.6; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Leadership Personas Assessment</h1>
      <h2>Summary Report</h2>
      <p><strong>${escapeHtml(participantName)}</strong></p>
      <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
      <h3>Assessment Results</h3>
      <p>Your leadership assessment reveals distinct patterns that define your natural approach to leadership and team dynamics.</p>
    </div>

    <div class="primary">
      <div class="label">Primary Leadership Persona</div>
      <div class="score">${escapeHtml(pName)}</div>
      ${pHealthy ? `<div style="margin: 10px 0; font-size: 16px; opacity: 0.9;">Healthy expression: ${escapeHtml(pHealthy)}</div>` : ''}
      <div style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 5px 0;">(${escapeHtml(primary?.schemaLabel || '')})</div>
      <div>Activation Index: ${Math.round(primary?.index0to100 || 0)}/100</div>
      ${(primary?.index0to100 ?? 0) < 60 ? '<div style="margin-top: 10px; font-size: 14px; opacity: 0.9;">⚠️ Emerging pattern - may benefit from development focus</div>' : ''}
    </div>

    ${secondary ? `
    <div class="secondary">
      <div class="label">Secondary Leadership Persona</div>
      <div style="font-size: 18px; font-weight: bold; color: #374151;">${escapeHtml(sName || '')}</div>
      ${sHealthy ? `<div style="margin: 8px 0; font-size: 14px; color: #6b7280;">Healthy expression: ${escapeHtml(sHealthy)}</div>` : ''}
      <div style="color: #9CA3AF; font-size: 13px; margin: 5px 0;">(${escapeHtml(secondary.schemaLabel)})</div>
      <div>Activation Index: ${Math.round(secondary.index0to100)}/100</div>
      ${secondary.index0to100 < 60 ? '<div style="margin-top: 8px; font-size: 14px; color: #6b7280;">⚠️ Emerging pattern</div>' : ''}
    </div>` : ''}

    ${tertiary ? `
    <div class="secondary">
      <div class="label">Tertiary Leadership Persona</div>
      <div style="font-size: 18px; font-weight: bold; color: #374151;">${escapeHtml(tName || '')}</div>
      ${tHealthy ? `<div style="margin: 8px 0; font-size: 14px; color: #6b7280;">Healthy expression: ${escapeHtml(tHealthy)}</div>` : ''}
      <div style="color: #9CA3AF; font-size: 13px; margin: 5px 0;">(${escapeHtml(tertiary.schemaLabel)})</div>
      <div>Activation Index: ${Math.round(tertiary.index0to100)}/100</div>
      ${tertiary.index0to100 < 60 ? '<div style="margin-top: 8px; font-size: 14px; color: #6b7280;">⚠️ Emerging pattern</div>' : ''}
    </div>` : ''}

    <div class="section">
      <h3>Complete Ranking</h3>
      <div style="font-size: 14px; color: #64748b; margin-bottom: 15px;">All leadership personas (Top 5):</div>
      <ol>
        ${display.slice(0, 5).map(item => `
          <li>
            <strong>${escapeHtml(schemaToPublic(item.schemaLabel))}</strong>
            <span style="color:#9CA3AF">(${escapeHtml(item.schemaLabel)})</span>:
            ${item.displayIndex}/100
          </li>
        `).join('')}
      </ol>
    </div>

    <div class="footer">
      <p>This summary report uses the same canonical scoring methodology as Tier 2 and Tier 3 clinical reports.</p>
      <p>© ${new Date().getFullYear()} Leadership Personas Assessment. Confidential.</p>
    </div>
  </div>
</body>
</html>`.trim();

    console.log('✅ Generated Tier 1 report successfully');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="Leadership_Summary_${safeFilename(participantName)}_${new Date().toISOString().slice(0,10)}.html"`,
      },
    });
  } catch (e: any) {
    console.error('❌ Tier1 error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to generate report' }, { status: 500 });
  }
}

// ---------- small helpers ----------
function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function safeFilename(s: string) {
  return String(s).replace(/[^a-zA-Z0-9_-]/g, '_');
}

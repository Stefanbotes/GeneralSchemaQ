
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SCHEMA_TO_DOMAIN: Record<string, string> = {
  'Abandonment/Instability': 'Disconnection & Rejection',
  'Mistrust/Abuse': 'Disconnection & Rejection',
  'Emotional Deprivation': 'Disconnection & Rejection',
  'Defectiveness/Shame': 'Disconnection & Rejection',
  'Social Isolation/Alienation': 'Disconnection & Rejection',

  'Dependence/Incompetence': 'Impaired Autonomy & Performance',
  'Vulnerability to Harm/Illness': 'Impaired Autonomy & Performance',
  'Enmeshment/Undeveloped Self': 'Impaired Autonomy & Performance',
  'Failure': 'Impaired Autonomy & Performance',

  'Entitlement/Grandiosity': 'Impaired Limits',
  'Insufficient Self-Control/Discipline': 'Impaired Limits',

  'Subjugation': 'Other-Directedness',
  'Self-Sacrifice': 'Other-Directedness',
  'Approval-Seeking/Recognition-Seeking': 'Other-Directedness',

  'Negativity/Pessimism': 'Overvigilance & Inhibition',
  'Emotional Inhibition': 'Overvigilance & Inhibition',
  'Unrelenting Standards/Hypercriticalness': 'Overvigilance & Inhibition',
  'Punitiveness': 'Overvigilance & Inhibition'
};

const pill = (s: string) =>
  `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#f3f3f3;margin-right:8px">${s}</span>`;
const r = (x?: number | null) => (x == null ? '—' : String(Math.round(x)));

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication (admin-only for Tier 3)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Administrative access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({} as any));
    
    // Handle both direct responses and userId/assessmentId patterns
    let responses: Record<string, string | number> | undefined;
    let userName = 'Unknown_User';
    
    if (body?.responses) {
      // Direct responses provided (for testing/direct API calls)
      responses = body.responses;
      userName = body?.userName || 'Test_User';
    } else if (body?.userId && body?.assessmentId) {
      // Look up assessment from database (admin interface pattern)
      const assessment = await db.assessments.findFirst({
        where: {
          id: body.assessmentId,
          userId: body.userId,
          status: 'COMPLETED'
        }
      });

      if (!assessment?.responses) {
        return NextResponse.json({ error: 'Assessment not found or incomplete' }, { status: 404 });
      }

      // Get user data for filename
      const user = await db.user.findUnique({
        where: { id: body.userId },
        select: {
          firstName: true,
          lastName: true
        }
      });

      // Parse and process responses (same logic as Tier 2)
      let rawResponses: Record<string, any>;
      try {
        rawResponses = typeof assessment.responses === 'string' 
          ? JSON.parse(assessment.responses) 
          : assessment.responses as Record<string, any>;
      } catch (parseError) {
        return NextResponse.json({ error: 'Invalid response format in assessment' }, { status: 400 });
      }

      // Transform responses from {value, timestamp} format to simple values  
      const processedResponses: Record<string, string | number> = {};
      for (const [key, response] of Object.entries(rawResponses)) {
        if (typeof response === 'object' && response !== null && 'value' in response) {
          const value = (response as any).value;
          if (typeof value === 'string' || typeof value === 'number') {
            processedResponses[key] = value;
          }
        } else if (typeof response === 'string' || typeof response === 'number') {
          processedResponses[key] = response;
        }
      }

      responses = processedResponses;
      userName = user ? `${user.firstName || 'Unknown'}_${user.lastName || 'User'}` : 'Unknown_User';
    } else {
      return NextResponse.json({ error: 'Either responses or userId/assessmentId required' }, { status: 400 });
    }

    if (!responses || !Object.keys(responses).length) {
      return NextResponse.json({ error: 'No responses available for scoring' }, { status: 400 });
    }

    console.log('[Tier3-Download] Processing assessment with', Object.keys(responses).length, 'responses');
    console.log('[Tier3-Download] Response key samples:', Object.keys(responses).slice(0, 5));
    console.log('[Tier3-Download] Response value samples:', Object.entries(responses).slice(0, 3).map(([k, v]) => `${k}=${v}`));

    const { rankedScores, display } = await scoreAssessmentResponses(responses);
    if (!rankedScores.length) {
      console.error('[Tier3-Download] No scores computed. Response keys:', Object.keys(responses));
      return NextResponse.json({ 
        error: 'No scores computed (check item IDs vs mapping). Check server logs for details.',
        debug: {
          responseKeyCount: Object.keys(responses).length,
          sampleKeys: Object.keys(responses).slice(0, 10)
        }
      }, { status: 400 });
    }
    const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);

    const top5Rows = display.slice(0, 5).map(d =>
      `<tr><td>${d.schemaLabel}</td><td style="text-align:right">${r(d.displayIndex)}</td><td>${SCHEMA_TO_DOMAIN[d.schemaLabel] ?? '—'}</td></tr>`
    ).join('');

    const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Tier 3 — Coach Brief</title>
<style>
  body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;padding:24px;max-width:860px;margin:auto}
  h1{margin:0 0 6px} h3{margin:14px 0 6px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  td,th{border-bottom:1px solid #eee;padding:8px}
  .stack{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
</style>
</head><body>
  <h1>Tier 3 — Coach Brief</h1>
  <div class="stack">
    ${pill(`Primary: ${primary?.schemaLabel ?? '—'} ${primary ? `(${r(primary.index0to100)})` : ''}`)}
    ${pill(`Secondary: ${secondary?.schemaLabel ?? '—'} ${secondary ? `(${r(secondary.index0to100)})` : ''}${secondary && (secondary as any).caution ? ' ⚠︎ emerging' : ''}`)}
    ${pill(`Tertiary: ${tertiary?.schemaLabel ?? '—'} ${tertiary ? `(${r(tertiary.index0to100)})` : ''}${tertiary && (tertiary as any).caution ? ' ⚠︎ emerging' : ''}`)}
  </div>

  <h3>Top 5 (canonical)</h3>
  <table>
    <thead><tr><th>Schema</th><th style="text-align:right">Index</th><th>Domain</th></tr></thead>
    <tbody>${top5Rows}</tbody>
  </table>

  <p style="margin-top:16px;color:#666">
    Ranking uses <b>unrounded</b> indices with Studio tie-breakers; values shown are rounded for display.
    Secondary/tertiary below 60 are shown as <i>emerging</i> (not hidden).
  </p>
</body></html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="Tier3_${userName}_${new Date().toISOString().slice(0,10)}.html"`
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to generate Tier 3 (download)' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';
import { 
  schemaToPublic, 
  schemaToHealthy, 
  narrativeFor,
  personaCopy,
  schemaToDomain 
} from '@/lib/tier1-persona-copy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // ensures loader eval works

// Accepts POST with either:
// 1. { responses: Record<string, {value, timestamp} | string | number>, participant?: {...} } - Direct from assessment
// 2. { userId: string, assessmentId: string } - Admin lookup pattern (matches Tier 2/3)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    
    // Check for format parameter (for debugging)
    const url = new URL(req.url);
    const format = url.searchParams.get('format');
    
    let responses: Record<string, string | number> | undefined;
    let participantName = 'User';
    
    console.log('🔍 Tier 1 API called with:', { 
      hasResponses: !!body?.responses, 
      hasUserIdAssessmentId: !!(body?.userId && body?.assessmentId),
      bodyKeys: Object.keys(body || {})
    });

    // Pattern 1: Direct responses from assessment completion
    if (body?.responses) {
      console.log('📝 Processing direct responses...');
      
      // Process responses from assessment format: {value: number, timestamp: string} -> simple values
      const rawResponses = body.responses;
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
      participantName = body?.participantData?.name || body?.participant?.name || 'User';
      
      console.log('✅ Processed direct responses:', { 
        originalCount: Object.keys(rawResponses).length,
        processedCount: Object.keys(processedResponses).length,
        participantName
      });
    }
    // Pattern 2: Admin lookup by userId + assessmentId (matches Tier 2/3)
    else if (body?.userId && body?.assessmentId) {
      console.log('🔍 Looking up assessment from database...');
      
      // Fetch user and specific assessment (same pattern as Tier 2)
      const user = await db.users.findUnique({
        where: { id: body.userId },
        include: {
          assessments: {
            where: { id: body.assessmentId },
            take: 1
          }
        }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const assessment = user.assessments?.[0];
      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      if (assessment.status !== 'COMPLETED' || !assessment.responses) {
        return NextResponse.json({ error: 'Assessment not completed or has no responses' }, { status: 400 });
      }

      // Parse and process responses (same logic as Tier 2/3)
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
      participantName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
      
      console.log('✅ Retrieved assessment data:', {
        assessmentId: assessment.id,
        userId: assessment.userId,
        participantName,
        responseCount: Object.keys(processedResponses).length
      });
    }
    // Pattern 3: No valid input - return error (no more fallback mock data)
    else {
      console.log('❌ Missing required parameters');
      return NextResponse.json({ 
        error: 'Either responses or userId/assessmentId required for Tier 1 report generation' 
      }, { status: 400 });
    }

    if (!responses || !Object.keys(responses).length) {
      return NextResponse.json({ error: 'No responses available for scoring' }, { status: 400 });
    }

    // ✅ USE CANONICAL SCORING (matches Tier 2/3 exactly)
    const { rankedScores, display } = await scoreAssessmentResponses(responses);
    if (!rankedScores.length) {
      return NextResponse.json({ error: 'No scores computed (check item IDs vs mapping)' }, { status: 400 });
    }

    const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);

    console.log('🎯 Canonical Tier 1 Results (should match Tier 2/3):');
    console.log(`Primary: ${primary?.schemaLabel} (${Math.round(primary?.index0to100 || 0)})`);
    console.log(`Secondary: ${secondary?.schemaLabel} (${Math.round(secondary?.index0to100 || 0)})`);
    console.log(`Tertiary: ${tertiary?.schemaLabel} (${Math.round(tertiary?.index0to100 || 0)})`);

    // Apply Tier 1 persona copy deck
    const pName = primary ? schemaToPublic(primary.schemaLabel) : '—';
    const sName = secondary ? schemaToPublic(secondary.schemaLabel) : null;
    const tName = tertiary ? schemaToPublic(tertiary.schemaLabel) : null;

    const pHealthy = primary ? schemaToHealthy(primary.schemaLabel) : null;
    const sHealthy = secondary ? schemaToHealthy(secondary.schemaLabel) : null;
    const tHealthy = tertiary ? schemaToHealthy(tertiary.schemaLabel) : null;

    // Return JSON for debugging if ?format=json
    if (format === 'json') {
      return NextResponse.json({
        ok: true,
        counts: { ranked: rankedScores.length, display: display.length },
        primary: primary && { schema: primary.schemaLabel, publicName: pName, idx: Math.round(primary.index0to100) },
        secondary: secondary && { schema: secondary.schemaLabel, publicName: sName, idx: Math.round(secondary.index0to100), emerging: (secondary as any).caution || false },
        tertiary: tertiary && { schema: tertiary.schemaLabel, publicName: tName, idx: Math.round(tertiary.index0to100), emerging: (tertiary as any).caution || false },
        top5: display.slice(0,5).map(d => ({
          schemaLabel: d.schemaLabel,
          publicName: schemaToPublic(d.schemaLabel),
          displayIndex: d.displayIndex,
          n: d.n
        })),
        participantName
      });
    }

    // Generate canonical Tier 1 HTML report (simple format, same scoring)
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Leadership Summary - ${participantName}</title>
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
            <p><strong>${participantName}</strong></p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
            <h3>Assessment Results</h3>
            <p>Your leadership assessment reveals distinct patterns that define your natural approach to leadership and team dynamics.</p>
        </div>

        <div class="primary">
            <div class="label">Primary Leadership Persona</div>
            <div class="score">${pName}</div>
            ${pHealthy ? `<div style="margin: 10px 0; font-size: 16px; opacity: 0.9;">Healthy expression: ${pHealthy}</div>` : ''}
            <div style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 5px 0;">(${primary?.schemaLabel})</div>
            <div>Activation Index: ${Math.round(primary?.index0to100 || 0)}/100</div>
            ${(primary?.index0to100 ?? 0) < 60 ? '<div style="margin-top: 10px; font-size: 14px; opacity: 0.9;">⚠️ Emerging pattern - may benefit from development focus</div>' : ''}
        </div>

        ${secondary ? `
        <div class="secondary">
            <div class="label">Secondary Leadership Persona</div>
            <div style="font-size: 18px; font-weight: bold; color: #374151;">${sName}</div>
            ${sHealthy ? `<div style="margin: 8px 0; font-size: 14px; color: #6b7280;">Healthy expression: ${sHealthy}</div>` : ''}
            <div style="color: #9CA3AF; font-size: 13px; margin: 5px 0;">(${secondary.schemaLabel})</div>
            <div>Activation Index: ${Math.round(secondary.index0to100)}/100</div>
            ${secondary.index0to100 < 60 ? '<div style="margin-top: 8px; font-size: 14px; color: #6b7280;">⚠️ Emerging pattern</div>' : ''}
        </div>
        ` : ''}

        ${tertiary ? `
        <div class="secondary">
            <div class="label">Tertiary Leadership Persona</div>
            <div style="font-size: 18px; font-weight: bold; color: #374151;">${tName}</div>
            ${tHealthy ? `<div style="margin: 8px 0; font-size: 14px; color: #6b7280;">Healthy expression: ${tHealthy}</div>` : ''}
            <div style="color: #9CA3AF; font-size: 13px; margin: 5px 0;">(${tertiary.schemaLabel})</div>
            <div>Activation Index: ${Math.round(tertiary.index0to100)}/100</div>
            ${tertiary.index0to100 < 60 ? '<div style="margin-top: 8px; font-size: 14px; color: #6b7280;">⚠️ Emerging pattern</div>' : ''}
        </div>
        ` : ''}

        <div class="section">
            <h3>Leadership Development Insights</h3>
            
            <div style="margin: 20px 0; padding: 15px; background: #fafafa; border-left: 4px solid #4f46e5; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #4f46e5;">${pName} (Primary)</h4>
                <p style="margin: 5px 0; line-height: 1.6;">${narrativeFor(primary?.schemaLabel || '', primary?.index0to100 || 0)}</p>
                ${personaCopy(primary?.schemaLabel || '') ? `
                <div style="margin: 10px 0; font-size: 14px;">
                    <span style="font-weight: 600; color: #065f46;">Strength Focus:</span> ${personaCopy(primary?.schemaLabel || '')?.strengthFocus}<br>
                    <span style="font-weight: 600; color: #7c2d12;">Development Edge:</span> ${personaCopy(primary?.schemaLabel || '')?.developmentEdge}
                </div>
                ` : ''}
            </div>

            ${secondary ? `
            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #64748b; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #64748b;">${sName} (Secondary)</h4>
                <p style="margin: 5px 0; line-height: 1.6;">${narrativeFor(secondary?.schemaLabel || '', secondary?.index0to100 || 0)}</p>
                ${personaCopy(secondary?.schemaLabel || '') ? `
                <div style="margin: 10px 0; font-size: 14px;">
                    <span style="font-weight: 600; color: #065f46;">Strength Focus:</span> ${personaCopy(secondary?.schemaLabel || '')?.strengthFocus}<br>
                    <span style="font-weight: 600; color: #7c2d12;">Development Edge:</span> ${personaCopy(secondary?.schemaLabel || '')?.developmentEdge}
                </div>
                ` : ''}
            </div>
            ` : ''}

            ${tertiary ? `
            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #94a3b8; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #94a3b8;">${tName} (Tertiary)</h4>
                <p style="margin: 5px 0; line-height: 1.6;">${narrativeFor(tertiary?.schemaLabel || '', tertiary?.index0to100 || 0)}</p>
                ${personaCopy(tertiary?.schemaLabel || '') ? `
                <div style="margin: 10px 0; font-size: 14px;">
                    <span style="font-weight: 600; color: #065f46;">Strength Focus:</span> ${personaCopy(tertiary?.schemaLabel || '')?.strengthFocus}<br>
                    <span style="font-weight: 600; color: #7c2d12;">Development Edge:</span> ${personaCopy(tertiary?.schemaLabel || '')?.developmentEdge}
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>

        <div class="section">
            <h3>Complete Ranking</h3>
            <div style="font-size: 14px; color: #64748b; margin-bottom: 15px;">All leadership personas (Top 5):</div>
            <ol>
                ${display.slice(0, 5).map(item => `
                <li>
                    <strong>${schemaToPublic(item.schemaLabel)}</strong>
                    <span style="color:#9CA3AF">(${item.schemaLabel})</span>:
                    ${item.displayIndex}/100
                </li>`).join('')}
            </ol>
        </div>

        <div class="footer">
            <p>This summary report uses the same canonical scoring methodology as Tier 2 and Tier 3 clinical reports.</p>
            <p>© 2025 Leadership Personas Assessment. Confidential.</p>
        </div>
    </div>
</body>
</html>`;

    console.log('✅ Generated canonical Tier 1 report successfully');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="Leadership_Summary_${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.html"`
      }
    });
  } catch (e: any) {
    console.error('❌ Tier1 error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to generate report' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // ensures loader eval works

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
    
    if (body?.responses) {
      // Direct responses provided (for testing/direct API calls)
      responses = body.responses;
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
    } else {
      return NextResponse.json({ error: 'Either responses or userId/assessmentId required' }, { status: 400 });
    }

    if (!responses || !Object.keys(responses).length) {
      return NextResponse.json({ error: 'No responses available for scoring' }, { status: 400 });
    }

    console.log('[Tier3] Processing assessment with', Object.keys(responses).length, 'responses');
    console.log('[Tier3] Response key samples:', Object.keys(responses).slice(0, 5));
    console.log('[Tier3] Response value samples:', Object.entries(responses).slice(0, 3).map(([k, v]) => `${k}=${v}`));

    const { rankedScores, display } = await scoreAssessmentResponses(responses);
    if (!rankedScores.length) {
      console.error('[Tier3] No scores computed. Response keys:', Object.keys(responses));
      return NextResponse.json({ 
        error: 'No scores computed (check item IDs vs mapping). Check server logs for details.',
        debug: {
          responseKeyCount: Object.keys(responses).length,
          sampleKeys: Object.keys(responses).slice(0, 10)
        }
      }, { status: 400 });
    }
    const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);

    // ✅ JSON that your UI/agent can keep using
    return NextResponse.json({
      ok: true,
      counts: { ranked: rankedScores.length, display: display.length },
      primary: primary && { schema: primary.schemaLabel, idx: Math.round(primary.index0to100) },
      secondary: secondary && { schema: secondary.schemaLabel, idx: Math.round(secondary.index0to100), emerging: (secondary as any).caution || false },
      tertiary: tertiary && { schema: tertiary.schemaLabel, idx: Math.round(tertiary.index0to100), emerging: (tertiary as any).caution || false },
      top5: display.slice(0, 5)
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to generate Tier 3' }, { status: 500 });
  }
}

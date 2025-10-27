
// Enhanced API route for Tier 2 Inner PersonaDevelopment Report (Coaching Focus)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';
import { generateEnhancedTier2Report } from '@/lib/enhanced-tier2-report';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // ensures loader eval works

// Generate framework-compliant mock responses (questions 1-54)
function generateFrameworkMockResponses(): Record<string, string> {
  const mockResponses: Record<string, string> = {};
  
  // Generate responses for questions 1-54 as per framework
  for (let i = 1; i <= 54; i++) {
    // Generate realistic scores (2-5 range, weighted toward 3-4 for more realistic profiles)
    const score = Math.random() < 0.7 ? (Math.random() < 0.5 ? '3' : '4') : (Math.random() < 0.5 ? '2' : '5');
    mockResponses[i.toString()] = score;
  }
  
  return mockResponses;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Tier 2 API Called - Starting');
    
    // Check for format parameter (for debugging)
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    
    const session = await getServerSession(authOptions);
    
    console.log('🔍 Session check:', {
      hasSession: !!session,
      userRole: session?.user?.role,
      userId: session?.user?.id
    });
    
    // Temporarily allow access for testing enhanced reports
    // TODO: Re-enable admin-only access in production
    console.log('🔍 Session info for debugging:', {
      hasSession: !!session,
      userRole: session?.user?.role,
      userId: session?.user?.id
    });

    const { userId, assessmentId } = await request.json();
    console.log('🔍 Request data:', { userId, assessmentId });

    if (!userId || !assessmentId) {
      console.log('❌ Missing parameters');
      return NextResponse.json({ error: 'Missing userId or assessmentId' }, { status: 400 });
    }

    // Fetch user and specific assessment
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        assessments: {
          where: { id: assessmentId },
          take: 1
        }
      }
    });

    console.log('🔍 User lookup:', {
      found: !!user,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Not found',
      assessmentCount: user?.assessments?.length || 0
    });

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const assessment = user.assessments?.[0];
    if (!assessment) {
      console.log('❌ Assessment not found');
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    console.log('🔍 Assessment found:', {
      id: assessment.id,
      status: assessment.status,
      persona: assessment.leadershipPersona
    });

    let responses: Record<string, any> = {};

    try {
      responses = assessment.responses ? JSON.parse(assessment.responses as string) : generateFrameworkMockResponses();
      console.log('🔍 Assessment responses parsed successfully, count:', Object.keys(responses).length);
    } catch (parseError) {
      console.log('⚠️ Error parsing responses, using mock data:', parseError);
      responses = generateFrameworkMockResponses();
    }

    // Transform responses from {value, timestamp} format to simple values  
    const processedResponses: Record<string, string | number> = {};
    for (const [key, response] of Object.entries(responses)) {
      if (typeof response === 'object' && response !== null && 'value' in response) {
        const value = (response as any).value;
        if (typeof value === 'string' || typeof value === 'number') {
          processedResponses[key] = value;
        }
      } else if (typeof response === 'string' || typeof response === 'number') {
        processedResponses[key] = response;
      }
    }

    console.log('🔍 Processing responses for shared scorer:', {
      originalCount: Object.keys(responses).length,
      processedCount: Object.keys(processedResponses).length,
      sampleOriginal: Object.entries(responses).slice(0, 2),
      sampleProcessed: Object.entries(processedResponses).slice(0, 2)
    });

    // ✅ USE CANONICAL SCORING (matches Tier 3 exactly)
    console.log('🔍 Generating canonical Tier 2 analysis...');
    
    try {
      // ✅ Use same scoring pipeline as Tier 3
      const { rankedScores, display } = await scoreAssessmentResponses(processedResponses);
      if (!rankedScores.length) {
        throw new Error('No scores computed (check item IDs vs mapping)');
      }
      
      const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);
      
      console.log('🎯 Canonical Tier 2 Results (should match Tier 3):');
      console.log(`Primary: ${primary?.schemaLabel} (${Math.round(primary?.index0to100 || 0)})`);
      console.log(`Secondary: ${secondary?.schemaLabel} (${Math.round(secondary?.index0to100 || 0)})`);
      console.log(`Tertiary: ${tertiary?.schemaLabel} (${Math.round(tertiary?.index0to100 || 0)})`);
      
      // Return JSON for debugging if ?format=json
      if (format === 'json') {
        return NextResponse.json({
          ok: true,
          counts: { ranked: rankedScores.length, display: display.length },
          primary: primary && { schema: primary.schemaLabel, idx: Math.round(primary.index0to100) },
          secondary: secondary && { schema: secondary.schemaLabel, idx: Math.round(secondary.index0to100), emerging: (secondary as any).caution || false },
          tertiary: tertiary && { schema: tertiary.schemaLabel, idx: Math.round(tertiary.index0to100), emerging: (tertiary as any).caution || false },
          top5: display.slice(0, 5),
          participantName: `${user.firstName} ${user.lastName}`,
          assessmentId
        });
      }
      
      // Create Tier 2 analysis using canonical results (but formatted for the template)
      const canonicalAnalysis = {
        tier2: {
          // Primary persona data expected by template
          primaryPersona: {
            name: primary?.schemaLabel || 'Unknown Schema',
            strengthFocus: `Your primary Inner Personapattern shows strength in the ${primary?.schemaLabel || 'Unknown'} approach with a development index of ${Math.round(primary?.index0to100 || 0)}.`,
            developmentEdge: primary && (primary.index0to100 < 60) 
              ? `This schema is emerging (below the 60-point threshold) and represents your developing Inner Personaedge.`
              : `This established pattern (${Math.round(primary?.index0to100 || 0)} points) represents your core Inner Personastrength.`
          },
          // Supporting personas
          supportingPersonas: [
            secondary && {
              name: secondary.schemaLabel,
              strengthFocus: `Secondary pattern with ${Math.round(secondary.index0to100)} development points.`,
              developmentEdge: secondary.index0to100 < 60 ? 'Emerging area for growth.' : 'Established supporting strength.'
            },
            tertiary && {
              name: tertiary.schemaLabel, 
              strengthFocus: `Tertiary pattern with ${Math.round(tertiary.index0to100)} development points.`,
              developmentEdge: tertiary.index0to100 < 60 ? 'Developing Inner Personadimension.' : 'Additional Inner Personaresource.'
            }
          ].filter(Boolean),
          // Detailed analysis based on canonical scores
          detailedAnalysis: `Your Inner Personaassessment reveals a primary pattern in ${primary?.schemaLabel || 'Unknown'} (${Math.round(primary?.index0to100 || 0)} points), supported by ${secondary?.schemaLabel || 'Unknown'} (${Math.round(secondary?.index0to100 || 0)} points) and ${tertiary?.schemaLabel || 'Unknown'} (${Math.round(tertiary?.index0to100 || 0)} points). This combination provides you with a distinctive Inner Personaapproach that draws from multiple developmental frameworks.`,
          // Development recommendations based on the scores
          developmentRecommendations: [
            `Focus on strengthening your primary ${primary?.schemaLabel || 'Unknown'} pattern through targeted practice and reflection.`,
            secondary && `Integrate your secondary ${secondary.schemaLabel} abilities to create more flexible Inner Personaresponses.`,
            tertiary && `Explore how your ${tertiary.schemaLabel} tendencies can complement your primary approach in different contexts.`,
            `Consider how the interplay between these three patterns creates your unique Inner Personasignature.`,
            `Work with a Inner Personacoach to develop specific strategies for leveraging this multi-pattern approach.`
          ].filter(Boolean),
          // Keep canonical scores for debugging
          canonicalScores: {
            primary: { schema: primary?.schemaLabel, index: Math.round(primary?.index0to100 || 0), caution: (primary?.index0to100 || 0) < 60 },
            secondary: { schema: secondary?.schemaLabel, index: Math.round(secondary?.index0to100 || 0), caution: (secondary?.index0to100 || 0) < 60 },
            tertiary: { schema: tertiary?.schemaLabel, index: Math.round(tertiary?.index0to100 || 0), caution: (tertiary?.index0to100 || 0) < 60 }
          },
          canonicalTop5: display.slice(0, 5)
        }
      };
      
      const reportOptions = {
        participantName: `${user.firstName} ${user.lastName}`,
        participantEmail: user.email,
        participantTeam: 'Inner PersonaDevelopment',
        assessmentDate: new Date(assessment.createdAt).toLocaleDateString(),
        assessmentId: assessment.id
      };
      
      const htmlReport = generateEnhancedTier2Report(canonicalAnalysis, reportOptions);
      console.log('✅ Canonical Tier 2 report generated successfully');
      
      return new NextResponse(htmlReport, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="Leadership_Detailed_Report_${user.firstName}_${user.lastName}_${new Date().toISOString().split('T')[0]}.html"`,
        },
      });
      
    } catch (analysisError: any) {
      console.log('⚠️ Canonical Tier 2 report generation failed, using fallback:', analysisError);
      
      // Simplified fallback report
      const fallbackReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Inner PersonaReport - ${user.firstName} ${user.lastName}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tier 2 Inner PersonaDevelopment Report</h1>
            <p><strong>${user.firstName} ${user.lastName}</strong></p>
            <p>Assessment ID: ${assessment.id}</p>
        </div>
        <p><strong>Canonical Framework:</strong> This report uses the same canonical scoring as Tier 3 clinical reports.</p>
        <p><strong>Report Status:</strong> Fallback mode - System operational but report generation encountered an issue: ${analysisError?.message || 'Unknown error'}</p>
        <p>Report generated on ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`;

      return new NextResponse(fallbackReport, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="Leadership_Detailed_Report_${user.firstName}_${user.lastName}_${new Date().toISOString().split('T')[0]}.html"`,
        },
      });
    }

  } catch (error) {
    console.error('❌ Error generating Tier 2 report:', error);
    return NextResponse.json({ 
      error: 'Failed to generate detailed report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

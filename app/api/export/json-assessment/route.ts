
// API endpoint for JSON assessment data export
// Generates structured JSON export following v1.0.0 specification

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { generateAssessmentExport, generateExportFilename, validateAssessmentExport } from '@/lib/json-export';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 JSON Export API Called - Starting');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, assessmentId } = await request.json();
    console.log('🔍 Request data:', { userId, assessmentId });

    if (!userId || !assessmentId) {
      console.log('❌ Missing parameters');
      return NextResponse.json({ error: 'Missing userId or assessmentId' }, { status: 400 });
    }

    // For user export, ensure they can only export their own data
    if (session.user.role !== 'ADMIN' && session.user.id !== userId) {
      console.log('❌ Unauthorized access attempt - user can only export own data');
      return NextResponse.json({ error: 'Unauthorized - Can only export your own assessment data' }, { status: 403 });
    }

    // Fetch user and specific assessment
    const user = await db.users.findUnique({
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

    if (assessment.status !== 'COMPLETED') {
      console.log('❌ Assessment not completed');
      return NextResponse.json({ error: 'Assessment must be completed before export' }, { status: 400 });
    }

    console.log('🔍 Assessment found:', {
      id: assessment.id,
      status: assessment.status,
      persona: assessment.leadershipPersona
    });

    // ===================================================================
    // NEW: Read responses from lasbi_responses table (canonical IDs)
    // This replaces reading from legacy assessment.responses field
    // ===================================================================
    console.log('🔍 Fetching canonical responses from lasbi_responses table...');
    
    const canonicalResponses = await db.lasbi_responses.findMany({
      where: { assessment_id: assessment.id },
      select: {
        canonical_id: true,
        value: true,
        created_at: true
      },
      orderBy: { canonical_id: 'asc' }
    });

    console.log('🔍 Canonical responses fetched:', {
      count: canonicalResponses.length,
      sampleIds: canonicalResponses.slice(0, 5).map((r: any) => r.canonical_id),
      sampleValues: canonicalResponses.slice(0, 3).map((r: any) => ({ id: r.canonical_id, value: r.value }))
    });

    // Convert responses to the format expected by generateAssessmentExport
    // Format: { "canonical_id": value, ... }
    let responses: Record<string, number> = {};
    
    if (canonicalResponses.length === 0) {
      console.log('⚠️ No canonical responses found, attempting legacy fallback...');
      
      // Fallback to legacy responses field if canonical responses don't exist
      let legacyResponses: Record<string, any> = {};
      
      try {
        if (assessment.responses) {
          if (typeof assessment.responses === 'string') {
            legacyResponses = JSON.parse(assessment.responses);
          } else {
            legacyResponses = assessment.responses as Record<string, any>;
          }
          
          if (Object.keys(legacyResponses).length > 0) {
            console.log('✅ Using legacy responses:', Object.keys(legacyResponses).length);
            
            // Convert legacy responses to simple format
            // Legacy format: { "1.1.1": { value: 6, timestamp: "..." }, ... }
            // Target format: { "1.1.1": 6, ... }
            for (const [questionId, responseData] of Object.entries(legacyResponses)) {
              if (typeof responseData === 'object' && responseData !== null && 'value' in responseData) {
                responses[questionId] = Number(responseData.value);
              } else if (typeof responseData === 'number') {
                responses[questionId] = responseData;
              }
            }
            
            console.log('✅ Converted legacy responses:', Object.keys(responses).length);
          } else {
            console.log('❌ No responses found in either canonical or legacy format');
            return NextResponse.json({ error: 'No assessment responses found' }, { status: 404 });
          }
        } else {
          console.log('❌ No responses found');
          return NextResponse.json({ error: 'No assessment responses found' }, { status: 404 });
        }
      } catch (parseError) {
        console.log('❌ Error parsing legacy responses:', parseError);
        return NextResponse.json({ error: 'Invalid assessment data format' }, { status: 500 });
      }
    } else {
      // Convert canonical responses from lasbi_responses table
      for (const response of canonicalResponses) {
        responses[response.canonical_id] = response.value;
      }
    }

    console.log('✅ Responses prepared for export:', {
      count: Object.keys(responses).length,
      format: 'canonical',
      sampleKeys: Object.keys(responses).slice(0, 5),
      sampleData: Object.entries(responses).slice(0, 3).map(([k, v]) => `${k}: ${v}`)
    });

    // Prepare participant data
    const participantData = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      organization: '', // Not tracked in current schema
      assessmentDate: new Date(assessment.completedAt || assessment.createdAt).toISOString(),
      assessmentId: assessment.id
    };

    console.log('🔍 Generating JSON export...');

    console.log('🔍 About to generate export with:');
    console.log('🔍 Responses count:', Object.keys(responses).length);
    console.log('🔍 Sample response keys:', Object.keys(responses).slice(0, 5));
    console.log('🔍 Sample response data:', Object.keys(responses).slice(0, 3).map(k => `${k}: ${JSON.stringify(responses[k])}`));
    console.log('🔍 Participant data:', participantData);
    console.log('🔍 Assessment ID:', assessment.id);
    console.log('🔍 User ID:', user.id);
    
    // Generate JSON export using the specification
    const exportData = generateAssessmentExport(
      responses,
      participantData,
      assessment.id,
      user.id
    );

    // Validate the generated export
    const validation = validateAssessmentExport(exportData);
    if (validation) {
      console.error('❌ Export validation failed:', validation.details);
      console.error('❌ Export data preview:', {
        schemaVersion: exportData.schemaVersion,
        analysisVersion: exportData.analysisVersion,
        instrumentName: exportData.assessment.instrument?.name,
        instrumentForm: exportData.assessment.instrument?.form,
        itemCount: exportData.assessment.instrument?.items?.length || 0,
        responsesPreview: Object.keys(responses).slice(0, 5),
        note: "v1.0.0 - no derived data allowed"
      });
      
      return NextResponse.json({ 
        error: validation.error,
        details: validation.details,
        debug: {
          responsesCount: Object.keys(responses).length,
          itemsGenerated: exportData.assessment.instrument?.items?.length || 0,
          sampleResponseKeys: Object.keys(responses).slice(0, 10),
          sampleResponseValues: Object.keys(responses).slice(0, 3).map(k => ({
            key: k,
            value: responses[k],
            type: typeof responses[k]
          })),
          exportStructure: {
            schemaVersion: exportData.schemaVersion,
            analysisVersion: exportData.analysisVersion,
            respondentId: exportData.respondent?.id,
            assessmentId: exportData.assessment?.assessmentId,
            completedAt: exportData.assessment?.completedAt,
            instrumentName: exportData.assessment.instrument?.name,
            instrumentForm: exportData.assessment.instrument?.form,
            hasProvenance: !!(exportData.provenance?.sourceApp && exportData.provenance?.checksumSha256),
            note: "v1.0.0 compliance - no derived analytics"
          }
        }
      }, { status: 400 });
    }

    // Generate Studio-compatible filename
    const filename = generateExportFilename(
      user.id,
      assessment.id,
      assessment.completedAt?.toISOString() || new Date().toISOString()
    );

    console.log('✅ JSON export generated successfully:', filename);

    // Return JSON as downloadable response
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('❌ Error generating JSON export:', error);
    return NextResponse.json({ 
      error: 'Failed to generate JSON export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

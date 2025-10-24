
/**
 * API endpoint for LASBI v1.3.0 Surgical JSON Assessment Export
 * 
 * Generates structured JSON export with:
 * - itemId (modern cmf... LASBI id) - primary join key
 * - canonicalId (d.s.q format like "2.4.3") - human-readable guard
 * - value (1..6 response)
 * - index (1..54 UI order - display only)
 * 
 * This is order-independent and Studio-compatible.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { generateAssessmentExportV2, validateSurgicalExport } from '@/lib/json-export';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 LASBI v1.3.0 Surgical Export API Called');
    
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

    // Authorization check
    if (session.user.role !== 'ADMIN' && session.user.id !== userId) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ 
        error: 'Unauthorized - Can only export your own assessment data' 
      }, { status: 403 });
    }

    // Fetch user and assessment
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const assessment = user.assessments?.[0];
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (assessment.status !== 'COMPLETED') {
      return NextResponse.json({ 
        error: 'Assessment must be completed before export' 
      }, { status: 400 });
    }

    console.log('🔍 Assessment found:', {
      id: assessment.id,
      status: assessment.status,
      persona: assessment.leadershipPersona
    });

    // Parse responses
    let responses: Record<string, any> = {};
    
    try {
      if (assessment.responses) {
        if (typeof assessment.responses === 'string') {
          responses = JSON.parse(assessment.responses);
        } else {
          responses = assessment.responses as Record<string, any>;
        }
        
        console.log('🔍 Responses parsed:', {
          count: Object.keys(responses).length,
          sampleKeys: Object.keys(responses).slice(0, 3)
        });
      } else {
        return NextResponse.json({ error: 'No assessment responses found' }, { status: 404 });
      }
    } catch (parseError) {
      console.error('❌ Error parsing responses:', parseError);
      return NextResponse.json({ error: 'Invalid assessment data format' }, { status: 500 });
    }

    if (Object.keys(responses).length === 0) {
      return NextResponse.json({ error: 'No assessment responses found' }, { status: 404 });
    }

    // Prepare participant data
    const participantData = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      organization: '',
      assessmentDate: new Date(assessment.completedAt || assessment.createdAt).toISOString(),
      assessmentId: assessment.id
    };

    console.log('🔄 Generating LASBI v1.3.0 surgical export...');

    // Generate surgical export
    const exportData = await generateAssessmentExportV2(
      responses,
      participantData,
      assessment.id,
      user.id
    );

    // Validate the export
    const validation = validateSurgicalExport(exportData);
    if (validation) {
      console.error('❌ Export validation failed:', validation.details);
      return NextResponse.json({ 
        error: validation.error,
        details: validation.details
      }, { status: 400 });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `LASBI_Export_${user.firstName}_${user.lastName}_${timestamp}_v1.3.0.json`
      .replace(/\s+/g, '_')
      .replace(/[^A-Za-z0-9_\-\.]/g, '');

    console.log('✅ Surgical export generated successfully:', filename);

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
    console.error('❌ Error generating surgical export:', error);
    return NextResponse.json({ 
      error: 'Failed to generate surgical export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

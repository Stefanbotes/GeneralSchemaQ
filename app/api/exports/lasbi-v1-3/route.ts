// app/api/exports/lasbi-v1-3/route.ts
/**
 * API endpoint for LASBI v1.3.0 Surgical JSON Assessment Export
 *
 * Emits Studio-compatible JSON with:
 * - itemId (modern cmf... LASBI id)  — primary join key
 * - canonicalId ("d.s.q" like "2.4.3") — human-readable guard
 * - value (1..6)
 * - index (1..108) — display only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import {
  generateAssessmentExportV2,
  validateSurgicalExport,
} from '@/lib/json-export';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 LASBI v1.3.0 Surgical Export API Called');

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, assessmentId } = await request.json().catch(() => ({}));
    console.log('🔍 Request data:', { userId, assessmentId });

    if (!userId || !assessmentId) {
      return NextResponse.json(
        { error: 'Missing userId or assessmentId' },
        { status: 400 }
      );
    }

    // Authorization: admins or the owner only
    if (session.user.role !== 'ADMIN' && session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Can only export your own assessment data' },
        { status: 403 }
      );
    }

    // Fetch user and the specific assessment
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        assessments: {
          where: { id: assessmentId },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const assessment = user.assessments?.[0];
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    if (assessment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Assessment must be completed before export' },
        { status: 400 }
      );
    }

    // Parse responses (supports object or stringified JSON)
    let responses: Record<string, any> = {};
    try {
      if (assessment.responses) {
        responses =
          typeof assessment.responses === 'string'
            ? JSON.parse(assessment.responses)
            : (assessment.responses as Record<string, any>);
      }
    } catch (e) {
      console.error('❌ Error parsing responses:', e);
      return NextResponse.json(
        { error: 'Invalid assessment data format' },
        { status: 500 }
      );
    }

    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json(
        { error: 'No assessment responses found' },
        { status: 404 }
      );
    }

    // Participant context (no PII is emitted in the payload)
    const participantData = {
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      email: user.email, // not embedded in payload; just here if needed for provenance later
      organization: '',
      assessmentDate: new Date(
        assessment.completedAt || assessment.createdAt
      ).toISOString(),
      assessmentId: assessment.id,
    };

    console.log('🔄 Generating LASBI v1.3.0 surgical export…');

    // Build payload via the golden lib
    const exportData = await generateAssessmentExportV2(
      responses, // expects canonical 1.1.1 keys (or {value})
      participantData,
      assessment.id,
      user.id
    );

    // Validate payload
    const validation = validateSurgicalExport(exportData);
    if (validation) {
      console.error('❌ Export validation failed:', validation.details);
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }

    // Download filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safeFirst = (user.firstName ?? '').replace(/\s+/g, '_');
    const safeLast = (user.lastName ?? '').replace(/\s+/g, '_');
    const filename = `LASBI_Export_${safeFirst}_${safeLast}_${timestamp}_v1.3.0.json`
      .replace(/[^A-Za-z0-9_\-\.]/g, '') || `LASBI_Export_${timestamp}_v1.3.0.json`;

    console.log('✅ Surgical export generated successfully:', filename);

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('❌ Error generating surgical export:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate surgical export',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

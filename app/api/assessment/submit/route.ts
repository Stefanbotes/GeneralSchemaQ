
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { validateResponses, isLegacyFormat } from '@/lib/response-validator';
import { loadMappingArray } from '@/lib/shared-lasbi-mapping';

export const dynamic = 'force-dynamic';

interface SubmissionData {
  bioData?: {
    name: string;
    email: string;
    team: string;
    uniqueCode: string;
  };
  responses: any; // Can be array (new format) or object (legacy format)
  topPersonas?: Array<{
    persona: string;
    score: number;
    percentage: number;
    healthyPersona: string;
    domain: string;
  }>;
  completedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissionData: SubmissionData = await request.json();
    
    // Validate required data
    if (!submissionData.responses) {
      return NextResponse.json({ error: 'No assessment responses provided' }, { status: 400 });
    }

    // Check format and handle accordingly
    const isLegacy = isLegacyFormat(submissionData);
    
    if (isLegacy) {
      // Handle legacy format (backward compatibility)
      return handleLegacySubmission(session.user.id, submissionData);
    }

    // New format: validate stable identifiers
    const validation = validateResponses(submissionData);
    
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return NextResponse.json({
        error: 'Invalid response data',
        details: validation.errors
      }, { status: 400 });
    }

    // Load LASBI mapping for itemId resolution
    const lasbiMapping = await loadMappingArray();
    const canonicalToItemMap = new Map(
      lasbiMapping.map(item => [
        `${item.variableId}.${item.questionNumber}`,
        item.itemId
      ])
    );

    // Determine primary leadership persona
    const primaryPersona = submissionData.topPersonas?.[0];
    const leadershipPersona = primaryPersona ? 
      `${primaryPersona.healthyPersona} (${primaryPersona.percentage}%)` : 
      'Assessment Complete';

    // Start transaction
    const result = await db.$transaction(async (tx: any) => {
      // Create or update assessment
      const existingAssessment = await tx.assessments.findFirst({
        where: {
          userId: session.user.id,
          status: { not: 'COMPLETED' }
        },
        orderBy: { createdAt: 'desc' }
      });

      let assessment;
      
      if (existingAssessment) {
        // Update existing
        assessment = await tx.assessments.update({
          where: { id: existingAssessment.id },
          data: {
            status: 'COMPLETED',
            responses: submissionData.responses, // Keep legacy JSON for compatibility
            results: submissionData.topPersonas ? {
              topPersonas: submissionData.topPersonas,
              bioData: submissionData.bioData,
              completionData: {
                totalQuestions: validation.responses?.length || 54,
                completedAt: submissionData.completedAt || new Date().toISOString(),
                uniqueCode: submissionData.bioData?.uniqueCode
              }
            } : undefined,
            leadershipPersona,
            completedAt: new Date(submissionData.completedAt || Date.now()),
            agreedToTerms: true,
            agreedAt: new Date()
          }
        });
      } else {
        // Create new
        assessment = await tx.assessments.create({
          data: {
            userId: session.user.id,
            status: 'COMPLETED',
            responses: submissionData.responses, // Keep legacy JSON for compatibility
            results: submissionData.topPersonas ? {
              topPersonas: submissionData.topPersonas,
              bioData: submissionData.bioData,
              completionData: {
                totalQuestions: validation.responses?.length || 54,
                completedAt: submissionData.completedAt || new Date().toISOString(),
                uniqueCode: submissionData.bioData?.uniqueCode
              }
            } : undefined,
            leadershipPersona,
            startedAt: new Date(),
            completedAt: new Date(submissionData.completedAt || Date.now()),
            agreedToTerms: true,
            agreedAt: new Date()
          }
        });
      }

      // Store individual responses with stable identifiers
      for (const response of validation.responses!) {
        // Resolve itemId if not provided
        let itemId = response.itemId;
        if (!itemId && response.canonicalId) {
          itemId = canonicalToItemMap.get(response.canonicalId) || '';
        }

        if (!itemId) {
          console.warn(`Could not resolve itemId for canonical ${response.canonicalId}`);
          continue;
        }

        // Upsert response
        await tx.lasbi_responses.upsert({
          where: {
            assessment_id_item_id: {
              assessment_id: assessment.id,
              item_id: itemId
            }
          },
          update: {
            value: response.value,
            canonical_id: response.canonicalId,
            variable_id: response.variableId
          },
          create: {
            assessment_id: assessment.id,
            item_id: itemId,
            canonical_id: response.canonicalId,
            variable_id: response.variableId,
            value: response.value
          }
        });
      }

      return assessment;
    });

    console.log('Assessment saved successfully:', {
      userId: session.user.id,
      assessmentId: result.id,
      status: result.status,
      persona: result.leadershipPersona,
      responseCount: validation.responses?.length
    });

    return NextResponse.json({
      success: true,
      assessmentId: result.id,
      leadershipPersona: result.leadershipPersona,
      responseCount: validation.responses?.length || 0
    });

  } catch (error: any) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment data', details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Handle legacy format submissions (backward compatibility)
 */
async function handleLegacySubmission(userId: string, submissionData: SubmissionData) {
  const primaryPersona = submissionData.topPersonas?.[0];
  const leadershipPersona = primaryPersona ? 
    `${primaryPersona.healthyPersona} (${primaryPersona.percentage}%)` : 
    'Assessment Complete';

  const existingAssessment = await db.assessments.findFirst({
    where: { userId, status: { not: 'COMPLETED' } },
    orderBy: { createdAt: 'desc' }
  });

  let assessment;
  
  if (existingAssessment) {
    assessment = await db.assessments.update({
      where: { id: existingAssessment.id },
      data: {
        status: 'COMPLETED',
        responses: submissionData.responses,
        results: submissionData.topPersonas ? {
          topPersonas: submissionData.topPersonas,
          bioData: submissionData.bioData,
          completionData: {
            totalQuestions: Object.keys(submissionData.responses || {}).length,
            completedAt: submissionData.completedAt || new Date().toISOString(),
            uniqueCode: submissionData.bioData?.uniqueCode
          }
        } : undefined,
        leadershipPersona,
        completedAt: new Date(submissionData.completedAt || Date.now()),
        agreedToTerms: true,
        agreedAt: new Date()
      }
    });
  } else {
    assessment = await db.assessments.create({
      data: {
        userId,
        status: 'COMPLETED',
        responses: submissionData.responses,
        results: submissionData.topPersonas ? {
          topPersonas: submissionData.topPersonas,
          bioData: submissionData.bioData,
          completionData: {
            totalQuestions: Object.keys(submissionData.responses || {}).length,
            completedAt: submissionData.completedAt || new Date().toISOString(),
            uniqueCode: submissionData.bioData?.uniqueCode
          }
        } : undefined,
        leadershipPersona,
        startedAt: new Date(),
        completedAt: new Date(submissionData.completedAt || Date.now()),
        agreedToTerms: true,
        agreedAt: new Date()
      }
    });
  }

  console.log('Legacy assessment saved (not migrated to stable identifiers):', {
    userId,
    assessmentId: assessment.id
  });

  return NextResponse.json({
    success: true,
    assessmentId: assessment.id,
    leadershipPersona: assessment.leadershipPersona,
    legacy: true,
    message: 'Legacy format accepted but not converted to stable identifiers'
  });
}

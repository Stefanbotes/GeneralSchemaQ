export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { validateResponses, isLegacyFormat } from '@/lib/response-validator';
import { loadMappingArray } from '@/lib/shared-lasbi-mapping';

interface SubmissionData {
  bioData?: {
    name: string;
    email: string;
    team: string;
    uniqueCode: string;
  };
  // Can be array (new format) or object (legacy format)
  responses: any;
  topPersonas?: Array<{
    persona: string;
    score: number;
    percentage: number;
    healthyPersona: string;
    domain: string;
  }>;
  completedAt?: string;
}

// ---------- Helpers ----------
function toTripleKey(r: any): string | undefined {
  // Prefer explicit triple fields, then common aliases, then fallbacks.
  return (
    r.tripleIndex ||
    r.indexTriple ||
    r.id ||
    r.canonicalId ||
    (r.section != null && r.questionNumber != null && r.itemNumber != null
      ? `${r.section}.${r.questionNumber}.${r.itemNumber}`
      : undefined)
  );
}

function buildReport(submissionData: SubmissionData, rawScores108: Record<string, number | string>) {
  const primary = submissionData.topPersonas?.[0];
  const leadershipPersona = primary
    ? `${primary.healthyPersona} (${primary.percentage}%)`
    : 'Assessment Complete';

  return {
    leadershipPersona,
    report: {
      summary: leadershipPersona,
      rawScores108,
      topPersonas: submissionData.topPersonas ?? [],
      completedAt: submissionData.completedAt || new Date().toISOString(),
      bioData: submissionData.bioData ?? null
    }
  };
}

async function buildTripleToItemId(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const arr = await loadMappingArray();
    for (const it of arr as any[]) {
      const triple =
        it.tripleIndex ||
        it.id ||
        (it.section != null && it.questionNumber != null && it.itemNumber != null
          ? `${it.section}.${it.questionNumber}.${it.itemNumber}`
          : it.canonicalId);
      if (triple && it.itemId) map.set(triple, it.itemId);
    }
  } catch (e) {
    console.warn('LASBI mapping load failed; per-item upserts may be skipped:', e);
  }
  return map;
}

// ---------- Route ----------
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissionData: SubmissionData = await request.json();

    // Basic guard
    if (!submissionData?.responses) {
      return NextResponse.json({ error: 'No assessment responses provided' }, { status: 400 });
    }

    // Legacy path
    if (isLegacyFormat(submissionData)) {
      return handleLegacySubmission(session.user.id, submissionData);
    }

    // Validate new-format responses
    const validation = validateResponses(submissionData);
    if (!validation?.valid || !Array.isArray(validation.responses)) {
      console.error('Validation errors:', validation?.errors);
      return NextResponse.json(
        { error: 'Invalid response data', details: validation?.errors ?? [] },
        { status: 400 }
      );
    }

    // Build NLPQV2-style raw map: { "1.1.1": value, ... }
    const rawScores108: Record<string, number | string> = {};
    for (const r of validation.responses) {
      const triple = toTripleKey(r);
      if (triple != null) rawScores108[triple] = r.value;
    }

    // Summary + report (always present)
    const { leadershipPersona, report } = buildReport(submissionData, rawScores108);

    // Build mapping for per-item upsert (triple -> itemId)
    const tripleToItemId = await buildTripleToItemId();

    // Transaction: create/update assessment + upserts
    const result = await db.$transaction(async (tx: any) => {
      const existingAssessment = await tx.assessments.findFirst({
        where: {
          userId: session.user.id,
          status: { not: 'COMPLETED' }
        },
        orderBy: { createdAt: 'desc' }
      });

      const totalQuestions =
        Object.keys(rawScores108).length || (validation.responses?.length ?? 0) || 108;

      const dataCommon = {
        userId: session.user.id,
        status: 'COMPLETED' as const,
        // Keep original payload for compatibility
        responses: submissionData.responses,
        // Always store a report; add personas metadata when provided
        results: submissionData.topPersonas
          ? {
              topPersonas: submissionData.topPersonas,
              bioData: submissionData.bioData,
              completionData: {
                totalQuestions,
                completedAt: report.completedAt,
                uniqueCode: submissionData.bioData?.uniqueCode
              },
              report
            }
          : { report },
        leadershipPersona,
        completedAt: new Date(submissionData.completedAt || Date.now()),
        agreedToTerms: true,
        agreedAt: new Date()
      };

      const assessment = existingAssessment
        ? await tx.assessments.update({ where: { id: existingAssessment.id }, data: dataCommon })
        : await tx.assessments.create({ data: { ...dataCommon, startedAt: new Date() } });

      // Per-item upserts (skip silently if mapping missing)
      if (validation.responses?.length && tripleToItemId.size > 0) {
        for (const r of validation.responses) {
          const triple = toTripleKey(r);
          if (!triple) continue;

          const itemId = r.itemId || tripleToItemId.get(triple);
          if (!itemId) {
            console.warn(`Could not resolve itemId for triple ${triple}`);
            continue;
          }

          await tx.lasbi_responses.upsert({
            where: {
              assessment_id_item_id: {
                assessment_id: assessment.id,
                item_id: itemId
              }
            },
            update: {
              value: r.value,
              canonical_id: triple,
              variable_id: r.variableId ?? null
            },
            create: {
              assessment_id: assessment.id,
              item_id: itemId,
              canonical_id: triple,
              variable_id: r.variableId ?? null,
              value: r.value
            }
          });
        }
      }

      return assessment;
    });

    console.log('Assessment saved successfully:', {
      userId: session.user.id,
      assessmentId: result.id,
      status: result.status,
      persona: leadershipPersona,
      responseCount: Object.keys(rawScores108).length || (validation.responses?.length ?? 0)
    });

    return NextResponse.json(
      {
        success: true,
        assessmentId: result.id,
        leadershipPersona,
        responseCount: Object.keys(rawScores108).length || (validation.responses?.length ?? 0),
        report // return full raw 108 JSON to the client
      },
      { status: 201 }
    );
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
 * Accepts object maps like { "1.1.1": value, ... } or similar.
 */
async function handleLegacySubmission(userId: string, submissionData: SubmissionData) {
  // Build raw map from legacy payload if it's an object
  const rawScores108: Record<string, number | string> = {};
  if (submissionData.responses && typeof submissionData.responses === 'object' && !Array.isArray(submissionData.responses)) {
    for (const [k, v] of Object.entries(submissionData.responses)) {
      rawScores108[k] = v as any;
    }
  }

  const { leadershipPersona, report } = buildReport(submissionData, rawScores108);

  const existingAssessment = await db.assessments.findFirst({
    where: { userId, status: { not: 'COMPLETED' } },
    orderBy: { createdAt: 'desc' }
  });

  const dataCommon = {
    userId,
    status: 'COMPLETED' as const,
    responses: submissionData.responses,
    results: submissionData.topPersonas
      ? {
          topPersonas: submissionData.topPersonas,
          bioData: submissionData.bioData,
          completionData: {
            totalQuestions: Object.keys(rawScores108).length || Object.keys(submissionData.responses || {}).length,
            completedAt: report.completedAt,
            uniqueCode: submissionData.bioData?.uniqueCode
          },
          report
        }
      : { report },
    leadershipPersona,
    completedAt: new Date(submissionData.completedAt || Date.now()),
    agreedToTerms: true,
    agreedAt: new Date()
  };

  const assessment = existingAssessment
    ? await db.assessments.update({ where: { id: existingAssessment.id }, data: dataCommon })
    : await db.assessments.create({ data: { ...dataCommon, startedAt: new Date() } });

  console.log('Legacy assessment saved:', {
    userId,
    assessmentId: assessment.id
  });

  return NextResponse.json({
    success: true,
    assessmentId: assessment.id,
    leadershipPersona,
    legacy: true,
    report
  });
}

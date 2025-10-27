// app/api/admin/diagnose-assessment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // AuthN + AuthZ
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Administrative access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({} as any));
    const { userId, assessmentId } = body;

    if (!userId || !assessmentId) {
      return NextResponse.json({ error: 'userId and assessmentId required' }, { status: 400 });
    }

    // User
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Assessment
    const assessment = await db.assessments.findFirst({
      where: { id: assessmentId, userId },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Parse responses (Json? in Prisma, but handle legacy string)
    let responses: Record<string, any> | null = null;
    try {
      if (assessment.responses == null) {
        responses = {};
      } else if (typeof assessment.responses === 'string') {
        responses = JSON.parse(assessment.responses);
      } else {
        responses = assessment.responses as Record<string, any>;
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid response format',
          user,
          assessment: {
            id: assessment.id,
            status: assessment.status,
            completedAt: assessment.completedAt,
          },
          diagnostics: {
            responseType: typeof assessment.responses,
            responseLength: assessment.responses ? String(assessment.responses).length : 0,
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          },
        },
        { status: 400 }
      );
    }

    const keys = Object.keys(responses ?? {});
    const keyTypes = {
      itemIds: keys.filter((k) => /^cmf[a-z0-9]{20,}$/i.test(k)).length,
      numeric: keys.filter((k) => /^\d+$/.test(k)).length,
      other: keys.filter((k) => !/^(cmf[a-z0-9]{20,}|\d+)$/i.test(k)).length,
    };

    const sampleKeys = keys.slice(0, 10);
    const sampleValues = sampleKeys.map((k) => ({
      key: k,
      value: (responses as any)[k],
      type: typeof (responses as any)[k],
    }));

    // Flatten { value } shapes
    const processedResponses: Record<string, any> = {};
    for (const [key, response] of Object.entries(responses ?? {})) {
      if (response && typeof response === 'object' && 'value' in response) {
        processedResponses[key] = (response as any).value;
      } else {
        processedResponses[key] = response;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
      assessment: {
        id: assessment.id,
        status: assessment.status,
        startedAt: assessment.startedAt,
        completedAt: assessment.completedAt,
      },
      diagnostics: {
        totalResponseKeys: keys.length,
        keyTypes,
        sampleValues,
        allKeysValid: keyTypes.other === 0,
        expectedCount: 54,
        matchesExpected: keys.length === 54,
      },
      recommendation:
        keyTypes.other > 0
          ? `⚠️ Found ${keyTypes.other} response keys with unexpected format. This may cause scoring issues.`
          : keys.length !== 54
          ? `⚠️ Found ${keys.length} responses but expected 54. Assessment may be incomplete.`
          : '✅ Response format looks correct. If scoring fails, check server logs for detailed diagnostics.',
      processedResponsesPreview: Object.fromEntries(Object.entries(processedResponses).slice(0, 10)),
    });
  } catch (error: any) {
    console.error('[DiagnoseAssessment] Error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Diagnosis failed',
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}

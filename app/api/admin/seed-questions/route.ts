// Protected API endpoint to seed assessment questions and LASBI items
// Call ONCE after deployment (or use ?force=true to wipe & reseed)
// Requires ADMIN_SECRET_KEY env var

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import questionnaireData from '@/data/questionnaireData'; // <-- default import to match your module

type Questionnaire = {
  version?: string;
  sections: Array<{
    name: string; // domain
    variables: Array<{
      variableId: string;
      name: string; // schema label
      persona?: string | null;
      healthyPersona?: string | null;
      questions: Array<{
        id: string;        // "1.1.1"
        order: number;     // 1..108
        dimension?: string;
        text: string;
      }>;
    }>;
  }>;
};

function validate(data: any): asserts data is Questionnaire {
  if (!data || !Array.isArray(data.sections)) {
    throw new Error('Invalid questionnaire data: sections missing');
  }
}

export async function POST(req: NextRequest) {
  try {
    // --- Auth guard ---
    const expected = process.env.ADMIN_SECRET_KEY;
    const provided =
      req.headers.get('x-admin-secret') ??
      new URL(req.url).searchParams.get('admin_secret');

    if (!expected) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_SECRET_KEY not set on server' },
        { status: 500 }
      );
    }
    if (provided !== expected) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: invalid admin secret' },
        { status: 401 }
      );
    }

    // --- Flags ---
    const force =
      new URL(req.url).searchParams.get('force')?.toLowerCase() === 'true';

    // --- Existing status ---
    const [existingQ, existingL] = await Promise.all([
      db.assessment_questions.count(),
      db.lasbi_items.count(),
    ]);

    if (!force && (existingQ > 0 || existingL > 0)) {
      return NextResponse.json({
        success: true,
        message:
          'Questions already exist. Pass ?force=true to wipe and reseed.',
        data: {
          existingQuestions: existingQ,
          existingLasbiItems: existingL,
        },
      });
    }

    // --- Load + validate data ---
    const data = questionnaireData as Questionnaire;
    validate(data);

    // --- Build payloads (use simple any[] to avoid prisma generic gymnastics) ---
    const aq: any[] = [];
    const li: any[] = [];

    for (const section of data.sections) {
      const domain = section.name;

      for (const variable of section.variables) {
        const schemaLabel = variable.name;
        const persona = variable.persona ?? null;
        const healthyPersona = variable.healthyPersona ?? null;
        const variableId = variable.variableId ?? schemaLabel; // safe fallback

        for (const q of variable.questions) {
          aq.push({
            id: q.id, // e.g., "1.1.1"
            order: q.order,
            domain,
            schema: schemaLabel,
            persona,
            healthyPersona,
            statement: q.text,
            isActive: true,
          });

          const parts = String(q.id).split('.');
          const questionNumber = Number(parts[2] ?? 0); // "1.1.[N]"
          const modernItemId = `cmf${q.id.replace(/\./g, '_')}`; // "cmf1_1_1"

          li.push({
            item_id: modernItemId,
            canonical_id: q.id,
            variable_id: variableId,
            question_number: questionNumber,
            schema_label: schemaLabel,
          });
        }
      }
    }

    // --- Transaction: wipe (if needed) then bulk insert ---
    await db.$transaction(async (tx) => {
      if (force || existingQ > 0 || existingL > 0) {
        await tx.lasbi_items.deleteMany({});
        await tx.assessment_questions.deleteMany({});
      }

      if (aq.length) {
        await tx.assessment_questions.createMany({
          data: aq,
          skipDuplicates: true,
        });
      }
      if (li.length) {
        await tx.lasbi_items.createMany({
          data: li,
          skipDuplicates: true,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Questions and LASBI items seeded successfully',
      data: {
        questionsCreated: aq.length,
        lasbiItemsCreated: li.length,
        version: data.version ?? null,
        domains: data.sections.length,
      },
    });
  } catch (err: any) {
    console.error('Seeding error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed questions',
        details: err?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health/status
export async function GET() {
  try {
    const [qCount, lCount] = await Promise.all([
      db.assessment_questions.count(),
      db.lasbi_items.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        questionsInDatabase: qCount,
        lasbiItemsInDatabase: lCount,
        isSeeded: qCount > 0 && lCount > 0,
        status: qCount > 0 ? 'seeded' : 'empty',
      },
    });
  } catch (err: any) {
    console.error('Seed status error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to check seed status' },
      { status: 500 }
    );
  }
}

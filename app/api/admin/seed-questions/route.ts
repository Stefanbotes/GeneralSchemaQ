// ✅ app/api/admin/seed-questions/route.ts
// Updated to use new Instrument (domains/schemas/items) format

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import instrument from '@/data/questionnaireData'; // default export = GENERAL_REFLECTIVE_V2

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

    // --- Parse flags ---
    const force =
      new URL(req.url).searchParams.get('force')?.toLowerCase() === 'true';

    // --- Check existing data ---
    const [existingQ, existingL] = await Promise.all([
      db.assessment_questions.count(),
      db.lasbi_items.count(),
    ]);

    if (!force && (existingQ > 0 || existingL > 0)) {
      return NextResponse.json({
        success: true,
        message:
          'Questions already exist. Use ?force=true to wipe and reseed.',
        data: { existingQuestions: existingQ, existingLasbiItems: existingL },
      });
    }

    // --- Validate instrument structure ---
    const data: any = instrument;
    if (!data?.domains || !Array.isArray(data.domains)) {
      throw new Error('Invalid instrument: domains missing');
    }

    // --- Build payloads ---
    const aq: any[] = [];
    const li: any[] = [];
    let order = 0;

    for (const d of data.domains) {
      const domainName = d.domain;

      for (const s of d.schemas) {
        const schemaLabel = s.name;
        const variableId = s.code;

        for (const item of s.items) {
          order += 1;
          aq.push({
            id: item.id,
            order,
            domain: domainName,
            schema: schemaLabel,
            persona: null,
            healthyPersona: null,
            statement: item.text,
            isActive: true,
          });

          const question_number = Number(String(item.id).split('.')[2] ?? 0);
          const modernItemId = `cmf${item.id.replace(/\./g, '_')}`;

          li.push({
            item_id: modernItemId,
            canonical_id: item.id,
            variable_id: variableId,
            question_number,
            schema_label: schemaLabel,
          });
        }
      }
    }

    // --- Transaction: wipe + insert ---
    await db.$transaction(async (tx) => {
      if (force || existingQ > 0 || existingL > 0) {
        await tx.lasbi_items.deleteMany({});
        await tx.assessment_questions.deleteMany({});
      }
      if (aq.length) await tx.assessment_questions.createMany({ data: aq });
      if (li.length) await tx.lasbi_items.createMany({ data: li });
    });

    return NextResponse.json({
      success: true,
      message: '✅ Seeding complete',
      data: {
        questionsCreated: aq.length,
        lasbiItemsCreated: li.length,
        version: data.version,
        domains: data.domains.length,
      },
    });
  } catch (err: any) {
    console.error('❌ Seeding error:', err);
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

// --- Health check ---
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
    console.error('GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}

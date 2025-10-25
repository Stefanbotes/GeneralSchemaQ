// Protected API endpoint to seed assessment questions and LASBI items
// Call ONCE after deployment (or use ?force=true to wipe & reseed)
// Requires ADMIN_SECRET_KEY env var

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 👇 IMPORTANT: default import from your general instrument
import instrument from '@/data/questionnaireData';

type ItemType = 'cognitive' | 'emotional' | 'belief';

type Instrument = {
  version: string;
  instrument: string;
  lastUpdated: string;
  structureNotes: string;
  domains: Array<{
    domain: string;
    description: string;
    schemas: Array<{
      code: string;           // e.g., "1.1"
      name: string;           // e.g., "Abandonment / Instability"
      coreTheme: string;
      items: Array<{
        id: string;           // e.g., "1.1.1"
        type: ItemType;
        text: string;
      }>;
    }>;
  }>;
};

function assertInstrument(x: any): asserts x is Instrument {
  if (!x?.domains || !Array.isArray(x.domains)) {
    throw new Error('Invalid instrument: missing domains[]');
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

    // --- Parse flags ---
    const force =
      new URL(req.url).searchParams.get('force')?.toLowerCase() === 'true';

    // --- Existing counts ---
    const [existingQ, existingL] = await Promise.all([
      db.assessment_questions.count(),
      db.lasbi_items.count(),
    ]);

    if (!force && (existingQ > 0 || existingL > 0)) {
      return NextResponse.json({
        success: true,
        message: 'Questions already exist. Pass ?force=true to wipe and reseed.',
        data: { existingQuestions: existingQ, existingLasbiItems: existingL },
      });
    }

    // --- Validate instrument ---
    const data = instrument as Instrument;
    assertInstrument(data);

    // --- Build rows from instrument (GENERAL wording) ---
    let order = 0;
    const aq: any[] = [];
    const li: any[] = [];

    for (const dom of data.domains) {
      // Optional: strip "1. " prefix and any parentheses suffix for a clean domain label
      const cleanDomain = dom.domain
        .replace(/^\s*\d+\.\s*/, '')
        .replace(/\s*\(.*?\)\s*$/, '')
        .trim();

      for (const sch of dom.schemas) {
        for (const it of sch.items) {
          order += 1;

          aq.push({
            id: it.id,              // "1.1.1"
            order,                  // 1..108
            domain: cleanDomain,    // "DISCONNECTION & REJECTION"
            schema: sch.name,       // "Abandonment / Instability"
            persona: null,          // general set -> no leadership personas
            healthyPersona: null,
            statement: it.text,     // <-- general wording
            isActive: true,
          });

          const qNum = Number(it.id.split('.')[2]);                // 1..6
          const modernItemId = `cmf${it.id.replace(/\./g, '_')}`;  // "cmf1_1_1"

          li.push({
            item_id: modernItemId,
            canonical_id: it.id,
            variable_id: sch.code,      // "1.1"
            question_number: qNum,
            schema_label: sch.name,
          });
        }
      }
    }

    // --- Transaction: wipe (if force) + insert ---
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
      message: 'Seeded GENERAL reflective v2 successfully',
      data: {
        questionsCreated: aq.length,
        lasbiItemsCreated: li.length,
        version: data.version,
        domains: data.domains.length,
      },
    });
  } catch (err: any) {
    console.error('Seeding error:', err);
    return NextResponse.json(
      { success: false, error: err?.message ?? 'Failed to seed questions' },
      { status: 500 }
    );
  }
}

// Health check
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
    return NextResponse.json(
      { success: false, error: 'Failed to check seed status' },
      { status: 500 }
    );
  }
}

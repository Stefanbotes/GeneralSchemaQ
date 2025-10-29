// scripts/seed.ts
import { PrismaClient } from '@prisma/client';

// Import your instrument (default export)
import instrument from '../data/questionnaireData';

const prisma = new PrismaClient();

/**
 * Your schema expects:
 * - AssessmentQuestion:
 *   id: String (e.g., "1.1.1"), order: Int (UNIQUE), domain: String?, schema: String?, statement: String, isActive: Boolean
 * - LasbiItem:
 *   item_id: String (e.g., "cmf1_1_1") @id
 *   canonical_id: String (unique) -> "1.1.1"
 *   variable_id: String (we'll use schema.code, e.g., "1.1")
 *   question_number: Int (we’ll take the last number from "1.1.1" => 1)
 *   schema_label: String (we’ll also use schema.code to keep everything consistent)
 */

function questionNumberFromId(id: string, fallback: number) {
  // "1.1.6" -> 6
  const parts = id.split('.');
  const last = parts[parts.length - 1];
  const n = Number(last);
  return Number.isFinite(n) ? n : fallback;
}

async function main() {
  console.log('🌱 Seeding from data/questionnaireData.ts');

  // Basic validation of the instrument shape
  if (!instrument?.domains?.length) {
    throw new Error('Instrument has no domains. Check data/questionnaireData.ts default export.');
  }

  // Prepare flat arrays for bulk insert
  const questions: Parameters<typeof prisma.assessmentQuestion.createMany>[0]['data'] = [];
  const lasbiItems: Parameters<typeof prisma.lasbiItem.createMany>[0]['data'] = [];

  let globalOrder = 1; // must be globally unique because of @unique on "order"

  for (const d of instrument.domains) {
    const domainLabel = d.domain; // a human-friendly label, OK to store as text

    for (const s of d.schemas) {
      const schemaCode = s.code;      // e.g., "1.1"
      const schemaName = s.name;      // e.g., "Abandonment / Instability"

      for (const it of s.items) {
        // AssessmentQuestion
        questions.push({
          id: it.id,                   // "1.1.1" — String @id
          order: globalOrder,          // global unique order
          domain: domainLabel,         // nice to have for grouping
          schema: schemaCode,          // store CODE for consistency (UI can map to name if needed)
          persona: null,               // not used by this instrument
          healthyPersona: null,        // not used by this instrument
          statement: it.text,
          isActive: true,
        });

        // LasbiItem
        const qNum = questionNumberFromId(it.id, globalOrder);
        const modernItemId = `cmf${it.id.replace(/\./g, '_')}`; // "1.1.1" -> "cmf1_1_1"

        lasbiItems.push({
          item_id: modernItemId,       // PK
          canonical_id: it.id,         // unique
          variable_id: schemaCode,     // use the schema CODE (easier for joins)
          question_number: qNum,       // Int
          schema_label: schemaCode,    // keep consistent; if you prefer names, change to schemaName
        });

        globalOrder++;
      }
    }
  }

  console.log(`🧮 Prepared ${questions.length} questions and ${lasbiItems.length} LASBI items`);

  // FK-safe clearing order:
  // LasbiResponse -> LasbiItem (Restrict) -> AssessmentQuestion
  await prisma.$transaction(async (tx) => {
    console.log('🧽 Clearing existing response/item/question tables…');
    await tx.lasbiResponse.deleteMany({});
    await tx.lasbiItem.deleteMany({});
    await tx.assessmentQuestion.deleteMany({});

    console.log('📥 Inserting questions…');
    await tx.assessmentQuestion.createMany({ data: questions });

    console.log('📥 Inserting LASBI items…');
    await tx.lasbiItem.createMany({ data: lasbiItems });
  });

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

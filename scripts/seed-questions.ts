// scripts/seed-questions.ts
// Seeds AssessmentQuestion + LasbiItem from data/questionnaireData.ts

import { PrismaClient } from '@prisma/client';
import instrument from '../data/questionnaireData'; // default export (TypeScript)

const prisma = new PrismaClient();

/**
 * Prisma expectations from your schema:
 * - AssessmentQuestion:
 *   id: String @id               // e.g., "1.1.1"
 *   order: Int @unique           // must be globally unique
 *   domain: String?              // store the human-readable domain label
 *   schema: String?              // we'll store schema code, e.g., "1.1"
 *   statement: String
 *   isActive: Boolean
 *
 * - LasbiItem:
 *   item_id: String @id          // e.g., "cmf1_1_1"
 *   canonical_id: String @unique // "1.1.1"
 *   variable_id: String          // we'll use schema code, e.g., "1.1"
 *   question_number: Int         // last number of the id, or fallback
 *   schema_label: String         // also schema code for consistency
 */

function extractQuestionNumber(canonicalId: string, fallback: number): number {
  // Works for "1.1.6" (=> 6) and also "1.1.R1" (=> 1) if ever needed
  const m = canonicalId.match(/(\d+)\s*$/);
  return m ? Number(m[1]) : fallback;
}

async function main() {
  console.log('🌱 Seeding from data/questionnaireData.ts');

  if (!instrument?.domains?.length) {
    throw new Error('Instrument has no domains. Check data/questionnaireData.ts default export.');
  }

  // Prepare flat arrays for bulk insert
  const questions: Parameters<typeof prisma.assessmentQuestion.createMany>[0]['data'] = [];
  const lasbiItems: Parameters<typeof prisma.lasbiItem.createMany>[0]['data'] = [];

  let globalOrder = 1; // must be globally unique (your model has @unique on order)

  for (const d of instrument.domains) {
    const domainLabel = d.domain; // human readable

    for (const s of d.schemas) {
      const schemaCode = s.code; // "1.1"
      // const schemaName = s.name; // available if you need it later

      for (const it of s.items) {
        // === AssessmentQuestion ===========
        questions.push({
          id: it.id,                 // "1.1.1"
          order: globalOrder,        // unique across all items
          domain: domainLabel,
          schema: schemaCode,        // store code (stable for joins/grouping)
          persona: null,
          healthyPersona: null,
          statement: it.text,
          isActive: true,
        });

        // === LasbiItem ====================
        const qNum = extractQuestionNumber(it.id, globalOrder);
        const modernItemId = `cmf${it.id.replace(/\./g, '_')}`; // "cmf1_1_1"

        lasbiItems.push({
          item_id: modernItemId,     // PK
          canonical_id: it.id,       // unique
          variable_id: schemaCode,   // schema code
          question_number: qNum,     // Int
          schema_label: schemaCode,  // keep consistent
        });

        globalOrder++;
      }
    }
  }

  console.log(`🧮 Prepared ${questions.length} questions and ${lasbiItems.length} LASBI items`);

  // FK-safe delete order: LasbiResponse -> LasbiItem -> AssessmentQuestion
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

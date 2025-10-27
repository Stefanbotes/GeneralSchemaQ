// Seed script for assessment questions and LASBI items
// Dynamically imports from the canonical questionnaireData source

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Dynamically import the questionnaire data
function loadQuestionnaireData() {
  const dataPath = path.join(process.cwd(), 'data', 'questionnaireData.js');
  const content = fs.readFileSync(dataPath, 'utf8');
  
  // Extract the questionnaireData object using a simple regex
  const match = content.match(/export const questionnaireData = ({[\s\S]*?});/);
  if (!match) {
    throw new Error('Could not parse questionnaireData from file');
  }
  
  // Use eval to parse the object (safe in this controlled context)
  const data = eval('(' + match[1] + ')');
  return data;
}

async function main() {
  console.log('🌱 Starting assessment questions and LASBI items seeding...');
  
  // Load questionnaire data
  const questionnaireData = loadQuestionnaireData();
  
  console.log(`📚 Loaded questionnaire data:`);
  console.log(`   Version: ${questionnaireData.version || 'N/A'}`);
  console.log(`   Domains: ${questionnaireData.sections.length}`);
  
  // Count total items
  let totalItems = 0;
  questionnaireData.sections.forEach((section: any) => {
    section.variables.forEach((variable: any) => {
      totalItems += variable.questions.length;
    });
  });
  console.log(`   Total Questions: ${totalItems}`);
  
  // Clear existing data
  console.log('\n🧹 Clearing existing questions and LASBI items...');
  await prisma.lasbiResponse.deleteMany({});
  await prisma.lasbiItem.deleteMany({});
  await prisma.assessmentQuestion.deleteMany({});

  console.log('📝 Creating assessment questions and LASBI items...');
  
  let itemCount = 0;
  let lasbiCount = 0;

  for (const section of questionnaireData.sections) {
    const domain = section.name;
    
    for (const variable of section.variables) {
      const schemaLabel = variable.name;
      const persona = variable.persona;
      const healthyPersona = variable.healthyPersona;
      const variableId = variable.variableId;
      
      for (const question of variable.questions) {
        // Create assessment question
        await prisma.assessmentQuestion.create({
          data: {
            id: question.id,  // e.g., "1.1.1"
            order: question.order,
            domain: domain,
            schema: schemaLabel,
            persona: persona,
            healthyPersona: healthyPersona,
            statement: question.text,
            isActive: true
          }
        });
        itemCount++;
        
        // Extract question number from canonical ID (e.g., "1.1.1" -> 1)
        const questionNumber = parseInt(question.id.split('.')[2]);
        
        // Create LASBI item with a modern item_id format
        const modernItemId = `cmf${question.id.replace(/\./g, '_')}`; // e.g., "cmf1_1_1"
        
        await prisma.lasbiItem.create({
          data: {
            item_id: modernItemId,
            canonical_id: question.id,
            variable_id: variableId,
            question_number: questionNumber,
            schema_label: schemaLabel
          }
        });
        lasbiCount++;
      }
    }
  }

  console.log('\n✅ Assessment questions and LASBI items seeding completed!');
  console.log(`📊 Summary:`);
  console.log(`   - ${itemCount} assessment questions created`);
  console.log(`   - ${lasbiCount} LASBI items created`);
  console.log(`\n💾 Database updated with ${totalItems}-item questionnaire`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

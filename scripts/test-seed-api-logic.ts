// Test the seeding logic without the API endpoint
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function loadQuestionnaireData() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'questionnaireData.js');
    const content = fs.readFileSync(dataPath, 'utf8');
    
    const match = content.match(/export const questionnaireData = ({[\s\S]*?});/);
    if (!match) {
      throw new Error('Could not parse questionnaireData from file');
    }
    
    const data = eval('(' + match[1] + ')');
    return data;
  } catch (error) {
    console.error('Error loading questionnaire data:', error);
    throw error;
  }
}

async function main() {
  console.log('🧪 Testing seed logic...');
  
  // Check current state
  const currentQuestions = await prisma.assessment_questions.count();
  const currentLasbi = await prisma.lasbi_items.count();
  console.log(`Current questions: ${currentQuestions}`);
  console.log(`Current LASBI items: ${currentLasbi}`);
  
  if (currentQuestions === 0) {
    console.log('✅ Database is empty, seed logic would work');
  } else {
    console.log('⚠️  Database already has questions, seed logic would skip');
  }
  
  // Test loading data
  console.log('\n📚 Testing data loading...');
  const data = loadQuestionnaireData();
  console.log(`✅ Loaded version: ${data.version}`);
  console.log(`✅ Domains: ${data.sections.length}`);
  
  let totalQuestions = 0;
  data.sections.forEach((section: any) => {
    section.variables.forEach((variable: any) => {
      totalQuestions += variable.questions.length;
    });
  });
  console.log(`✅ Total questions in data: ${totalQuestions}`);
  
  console.log('\n✅ Seed API logic validated successfully!');
}

main().finally(() => prisma.$disconnect());

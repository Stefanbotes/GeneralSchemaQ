import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all questions
  const questions = await prisma.assessment_questions.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
  
  console.log(`Found ${questions.length} questions`);
  
  // Create responses object with all questions answered as 5
  const responses: Record<string, { value: number; timestamp: string }> = {};
  questions.forEach(q => {
    responses[q.id] = {
      value: 5,
      timestamp: new Date().toISOString()
    };
  });
  
  console.log(`Created ${Object.keys(responses).length} responses`);
  console.log('Sample response keys:', Object.keys(responses).slice(0, 5));
  
  // Test submission data structure
  const submissionData = {
    bioData: {
      name: 'Test User',
      email: 'testuser@example.com',
      team: 'Test Team',
      uniqueCode: 'test-' + Date.now()
    },
    responses: responses,
    completedAt: new Date().toISOString()
  };
  
  // Make API call to submit
  const testUrl = 'http://localhost:3000/api/assessment/submit';
  console.log('\nTesting submission to:', testUrl);
  console.log('Response format is legacy (object-based):', !Array.isArray(responses));
  
  // Note: Would need valid session cookie to actually submit
  console.log('\n✅ Test data prepared successfully!');
  console.log('Total responses:', Object.keys(responses).length);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

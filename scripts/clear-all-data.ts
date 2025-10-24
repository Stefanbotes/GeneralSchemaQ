// Script to clear all user data and questions from the database
// This prepares the database for a fresh start with new questions

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Starting database clear operation...');
  console.log('⚠️  WARNING: This will delete ALL data including users, assessments, and questions!\n');

  try {
    // Clear in order respecting foreign key constraints
    
    // 1. Clear response data first
    console.log('Clearing LASBI responses...');
    const deletedLasbiResponses = await prisma.lasbi_responses.deleteMany({});
    console.log(`✓ Deleted ${deletedLasbiResponses.count} LASBI responses`);

    // 2. Clear assessments
    console.log('Clearing assessments...');
    const deletedAssessments = await prisma.assessments.deleteMany({});
    console.log(`✓ Deleted ${deletedAssessments.count} assessments`);

    // 3. Clear LASBI items
    console.log('Clearing LASBI items...');
    const deletedLasbiItems = await prisma.lasbi_items.deleteMany({});
    console.log(`✓ Deleted ${deletedLasbiItems.count} LASBI items`);

    // 4. Clear assessment questions
    console.log('Clearing assessment questions...');
    const deletedQuestions = await prisma.assessment_questions.deleteMany({});
    console.log(`✓ Deleted ${deletedQuestions.count} assessment questions`);

    // 5. Clear rate limit records
    console.log('Clearing rate limit records...');
    const deletedRateLimits = await prisma.rate_limit_records.deleteMany({});
    console.log(`✓ Deleted ${deletedRateLimits.count} rate limit records`);

    // 6. Clear sessions
    console.log('Clearing sessions...');
    const deletedSessions = await prisma.sessions.deleteMany({});
    console.log(`✓ Deleted ${deletedSessions.count} sessions`);

    // 7. Clear password reset tokens
    console.log('Clearing password reset tokens...');
    const deletedPasswordResets = await prisma.password_reset_tokens.deleteMany({});
    console.log(`✓ Deleted ${deletedPasswordResets.count} password reset tokens`);

    // 8. Clear verification tokens
    console.log('Clearing verification tokens...');
    const deletedVerificationTokens = await prisma.verification_tokens.deleteMany({});
    console.log(`✓ Deleted ${deletedVerificationTokens.count} verification tokens`);

    // 9. Clear accounts
    console.log('Clearing accounts...');
    const deletedAccounts = await prisma.accounts.deleteMany({});
    console.log(`✓ Deleted ${deletedAccounts.count} accounts`);

    // 10. Clear users (this should cascade delete related records)
    console.log('Clearing users...');
    const deletedUsers = await prisma.users.deleteMany({});
    console.log(`✓ Deleted ${deletedUsers.count} users`);

    // 11. Clear leadership personas (optional)
    console.log('Clearing leadership personas...');
    const deletedPersonas = await prisma.leadership_personas.deleteMany({});
    console.log(`✓ Deleted ${deletedPersonas.count} leadership personas`);

    console.log('\n✅ Database cleared successfully!');
    console.log('📝 Ready for fresh seeding with new questions.');

  } catch (error) {
    console.error('❌ Error during database clear:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

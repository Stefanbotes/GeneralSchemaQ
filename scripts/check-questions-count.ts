import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.assessmentQuestion.count();
    const lasbiCount = await prisma.lasbiItem.count();
    console.log(`✅ Questions in database: ${count}`);
    console.log(`✅ LASBI items in database: ${lasbiCount}`);
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

main().finally(() => prisma.$disconnect());

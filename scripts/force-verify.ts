import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Force verify the email
  const result = await prisma.users.update({
    where: { email: 'testuser@example.com' },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date()
    }
  });
  console.log('User email verified:', result.email, 'Verified:', result.emailVerified, 'at:', result.emailVerifiedAt);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

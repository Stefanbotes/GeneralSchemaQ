import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.findUnique({
    where: { email: 'testuser@example.com' }
  });
  
  if (user && !user.emailVerified) {
    // Verify the email
    await prisma.users.update({
      where: { email: 'testuser@example.com' },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
    console.log('Email verified successfully!');
  } else if (user) {
    console.log('User already verified');
  } else {
    console.log('User not found');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

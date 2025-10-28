// scripts/promote-admin.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
const email = 'stefan@talentconnection.co.za';
  const normalized = email.toLowerCase();

  const user = await prisma.user.update({
    where: { email: normalized },
    data: {
      role: 'ADMIN',
      tokenVersion: { increment: 1 },  // invalidate old JWTs
      emailVerified: new Date(),       // optional
    },
    select: { id: true, email: true, role: true, tokenVersion: true },
  });

  await prisma.session.deleteMany({ where: { userId: user.id } }); // nuke old sessions

  console.log('✅ Promoted', user.email, 'to', user.role, '(tokenVersion:', user.tokenVersion, ')');
}

main()
  .catch((e) => (console.error(e), process.exit(1)))
  .finally(() => prisma.$disconnect());

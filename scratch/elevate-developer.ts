import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@puspa.org.my';
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'developer' }
  });
  console.log(`Updated user ${email} to role: ${user.role}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

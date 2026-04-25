import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@puspa.org.my' }
  })
  console.log('User found:', user ? { 
    ...user, 
    passwordPrefix: user.password.split('$')[0],
    password: '[REDACTED]' 
  } : 'Not found')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
